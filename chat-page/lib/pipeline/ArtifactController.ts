/**
 * lib/pipeline/ArtifactController.ts
 * The central orchestrator for the artifact generation pipeline.
 *
 * Pipeline flow:
 *   DependencyResolver → ContextBuilder → PromptBuilder → GroqClient
 *   → ArtifactValidator → ArtifactSummarizer → MetadataBuilder → FirestoreService
 *
 * This controller replaces the massive switch statements in route.ts
 * with a unified, data-driven pipeline.
 */

import type {
  ArtifactType,
  RequestArtifactType,
  GeneratedArtifact,
  ProjectState,
  GroqCallConfig,
  DbSchema,
  LegacyGenerateResult,
  TOKEN_BUDGET as TokenBudgetType,
} from './types';
import { TOKEN_BUDGET, DEFAULT_MODEL, REQUEST_TIMEOUT_MS, ACTIVEPIECES_TIMEOUT_MS } from './types';
import { getDownstreamDependents, getMissingDependencies } from './DependencyResolver';
import { buildContext, getStackSummary } from './ContextBuilder';
import {
  buildPromptMessages,
  buildTitlePromptMessages,
  buildInitialMarkdownMessages,
} from './PromptBuilder';
import { getTemperature, MASTER_PROMPT } from './prompts/master';
import { isRawOutputArtifact, usesStopTokens, getArtifactPrompt } from './prompts';
import {
  callGroq,
  callGroqRaw,
  createCallConfig,
  getApiKey,
  stripFences,
  extractYamlBlock,
} from './GroqClient';
import {
  validateArtifact,
  buildValidationRetryInstructions,
  MAX_VALIDATION_RETRIES,
} from './ArtifactValidator';
import { summarizeArtifact, summarizeYamlCompact } from './ArtifactSummarizer';
import { buildMetadata, buildExternalMetadata } from './MetadataBuilder';
import * as firestoreService from './FirestoreService';

import YAML from 'yaml';

// ─────────────────────────────────────────────
// Logger
// ─────────────────────────────────────────────

const log = {
  info: (msg: string, meta?: object) =>
    console.log(JSON.stringify({ level: 'info', msg, ...meta, ts: Date.now() })),
  warn: (msg: string, meta?: object) =>
    console.warn(JSON.stringify({ level: 'warn', msg, ...meta, ts: Date.now() })),
  error: (msg: string, meta?: object) =>
    console.error(JSON.stringify({ level: 'error', msg, ...meta, ts: Date.now() })),
};

// ─────────────────────────────────────────────
// YAML helpers (preserved from original)
// ─────────────────────────────────────────────

function safeYaml(text: string): string {
  try {
    YAML.parse(text);
  } catch {
    log.warn('YAML parse warning');
  }
  return text;
}

// ─────────────────────────────────────────────
// Project State Management
// ─────────────────────────────────────────────

/**
 * Load or create project state for a session.
 * Handles rehydration from Firestore when session is cold.
 */
export async function getOrCreateProjectState(
  sessionId: string,
  userId: string,
  prompt: string,
): Promise<ProjectState> {
  // Try loading from Firestore
  const existing = await firestoreService.loadProjectState(sessionId);
  if (existing && Object.keys(existing.artifacts).length > 0) {
    log.info('Project state loaded from Firestore', {
      sessionId,
      artifactCount: Object.keys(existing.artifacts).length,
    });
    return existing;
  }

  // Try loading just the config for rehydration
  const configContent = await firestoreService.loadConfigArtifact(sessionId);
  if (configContent) {
    const state: ProjectState = {
      sessionId,
      userId,
      projectDescription: prompt,
      artifacts: {
        config: {
          content: configContent,
          summary: summarizeYamlCompact(configContent),
          metadata: {
            generationId: `rehydrated-${Date.now()}`,
            artifactType: 'config',
            model: DEFAULT_MODEL,
            generatedAt: new Date().toISOString(),
            durationMs: 0,
            tokens: { prompt: 0, completion: 0, total: 0 },
            dependenciesUsed: [],
            dependenciesMissing: [],
            mode: 'generate',
            version: 1,
            contentHash: '',
            validationPassed: true,
            validationWarnings: [],
            contextTokens: 0,
            retryCount: 0,
          },
        },
      },
      summaries: {
        config: summarizeYamlCompact(configContent),
      },
      status: 'idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalTokensUsed: 0,
      errors: [],
    };
    log.info('Project state rehydrated from config artifact', { sessionId });
    return state;
  }

  // Fresh session
  return {
    sessionId,
    userId,
    projectDescription: prompt,
    artifacts: {},
    summaries: {},
    status: 'idle',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalTokensUsed: 0,
    errors: [],
  };
}

// ─────────────────────────────────────────────
// Title Generation
// ─────────────────────────────────────────────

export async function generateTitle(
  prompt: string,
  fallbackApiKey: string,
): Promise<string | undefined> {
  const config = createCallConfig(
    getApiKey('config', fallbackApiKey),
    15,
    0.1,
  );
  const messages = buildTitlePromptMessages(prompt);
  const result = await callGroqRaw(config, messages, 'title');
  return result?.content?.replace(/["']/g, '').trim() || undefined;
}

// ─────────────────────────────────────────────
// Core Generation Pipeline
// ─────────────────────────────────────────────

/**
 * Generate a single artifact through the full pipeline.
 *
 * Pipeline: Context → Prompt → Groq → Validate → Summarize → Metadata → Store
 */
export async function generateArtifact(
  artifactType: ArtifactType,
  state: ProjectState,
  userPrompt: string,
  fallbackApiKey: string,
  mode: 'generate' | 'modify' = 'generate',
): Promise<{
  artifact: GeneratedArtifact;
  tokensUsed: number;
} | null> {
  let tokensUsedTotal = 0;
  const startTime = Date.now();

  // Explicitly generate missing dependencies before continuing
  if (mode === 'generate' && artifactType !== 'config') {
    const generatedSet = new Set(Object.keys(state.artifacts) as ArtifactType[]);
    const missingDeps = getMissingDependencies(artifactType, generatedSet);
    
    if (missingDeps.length > 0) {
      log.info(`Detected missing dependencies for ${artifactType}, explicitly generating them`, { missingDeps });
      for (const dep of missingDeps) {
        log.info(`Explicitly generating missing dependency: ${dep}`);
        if (dep === 'db') {
          await generateDbSchema(state, userPrompt);
        } else {
          const result = await generateArtifact(dep, state, userPrompt, fallbackApiKey, 'generate');
          if (result) {
            tokensUsedTotal += result.tokensUsed;
          }
        }
      }
    }
  }

  const apiKey = getApiKey(artifactType, fallbackApiKey);
  const temperature = getTemperature(artifactType);
  const maxTokens = TOKEN_BUDGET[artifactType] || 2000;
  const isRaw = isRawOutputArtifact(artifactType);
  const stopTokens = usesStopTokens(artifactType) ? ['```'] : undefined;

  // 1. Build context (dependency-aware)
  const context = buildContext(artifactType, state, userPrompt, mode);

  // 2. Build prompt messages
  const existingContent = mode === 'modify'
    ? state.artifacts[artifactType]?.content
    : undefined;

  const messages = buildPromptMessages(
    artifactType,
    context,
    userPrompt,
    mode,
    existingContent,
  );

  // 3. Call Groq
  const callConfig = createCallConfig(apiKey, maxTokens, temperature, {
    stopTokens,
  });

  const groqCall = isRaw ? callGroqRaw : callGroq;
  let groqResult = await groqCall(callConfig, messages, artifactType);

  if (!groqResult) {
    log.error('Groq call failed', { artifactType, mode });
    return null;
  }

  // 4. Validate output
  let validation = validateArtifact(artifactType, groqResult.content, state);

  // Apply auto-fixes
  if (validation.autoFixes.length > 0) {
    groqResult = { ...groqResult, content: validation.fixedContent };
  }

  // Retry on validation errors (up to MAX_VALIDATION_RETRIES times)
  if (!validation.passed) {
    log.warn('Validation failed, retrying', {
      artifactType,
      errors: validation.errors,
    });

    for (let retry = 0; retry < MAX_VALIDATION_RETRIES; retry++) {
      const retryInstructions = buildValidationRetryInstructions(validation.errors);
      const artifactPrompt = getArtifactPrompt(artifactType);
      
      const retryContent = [
        `[INSTRUCTIONS]\n${artifactPrompt}`,
        `[PREVIOUS OUTPUT]\n${groqResult.content}`,
        retryInstructions
      ].filter(Boolean).join('\n\n---\n\n');

      const retryMessages = [
        { role: 'system' as const, content: MASTER_PROMPT },
        { role: 'user' as const, content: retryContent }
      ];

      const retryConfig = createCallConfig(
        apiKey,
        Math.ceil(maxTokens * 1.25),
        temperature,
        { stopTokens },
      );

      const retryResult = await groqCall(retryConfig, retryMessages, `${artifactType}-retry`);

      if (retryResult) {
        validation = validateArtifact(artifactType, retryResult.content, state);
        groqResult = {
          ...retryResult,
          content: validation.fixedContent,
          retryCount: groqResult.retryCount + retry + 1,
        };

        if (validation.passed) break;
      }
    }
  }

  // 5. Generate summary
  const summary = await summarizeArtifact(
    artifactType,
    groqResult.content,
    fallbackApiKey,
  );

  // 6. Build metadata
  const version = mode === 'modify'
    ? (state.artifacts[artifactType]?.metadata?.version ?? 0) + 1
    : 1;

  const metadata = await buildMetadata(
    artifactType,
    groqResult,
    context,
    validation,
    startTime,
    version,
    mode,
  );

  const generatedArtifact: GeneratedArtifact = {
    content: groqResult.content,
    summary,
    metadata,
  };

  // 7. Update project state
  state.artifacts[artifactType] = generatedArtifact;
  state.summaries[artifactType] = summary;
  state.totalTokensUsed += groqResult.usage.totalTokens;
  state.updatedAt = new Date().toISOString();

  // 8. Persist to Firestore
  let firestoreSaveStatus = 'success';
  try {
    await firestoreService.saveArtifact(
      state.sessionId,
      state.userId,
      artifactType,
      groqResult.content,
      summary,
      metadata,
    );
  } catch (error) {
    firestoreSaveStatus = `failed: ${(error as Error).message}`;
  }

  const promptStr = JSON.stringify(messages, null, 2);

  const debugLog = `
---------------------------------------
Artifact Name: ${artifactType}
Dependencies Requested: ${context.dependenciesRequested?.join(', ') || 'none'}
Dependencies Loaded: ${context.dependenciesLoaded?.join(', ') || 'none'}
Dependencies Skipped: ${context.dependenciesSkipped?.join(', ') || 'none'}
Summary Length (characters): ${summary.length}
Summary Token Estimate: ${Math.ceil(summary.length / 4)}
Prompt Length: ${promptStr.length}
Prompt Token Estimate: ${Math.ceil(promptStr.length / 4)}
Completion Length: ${groqResult.content.length}
Completion Token Estimate: ${groqResult.usage.completionTokens}
Generation Duration: ${Date.now() - startTime}ms
Validation Result: ${validation.passed ? 'PASSED' : 'FAILED'} (${validation.errors.length} errors, ${validation.warnings.length} warnings)
Firestore Save Status: ${firestoreSaveStatus}
---------------------------------------
FINAL PROMPT SENT TO GROQ:
${promptStr}
---------------------------------------`;

  console.log(debugLog);

  tokensUsedTotal += groqResult.usage.totalTokens;
  return {
    artifact: generatedArtifact,
    tokensUsed: tokensUsedTotal,
  };
}

// ─────────────────────────────────────────────
// Initial Generation (Config + Markdown combo)
// ─────────────────────────────────────────────

/**
 * Handle the "initial" artifact request.
 * Generates config (YAML) silently + markdown (Project Brief) shown in UI.
 */
export async function generateInitial(
  state: ProjectState,
  userPrompt: string,
  fallbackApiKey: string,
): Promise<{
  yaml: string;
  markdown: string;
  tokensUsed: number;
} | null> {
  // 1. Generate markdown
  const markdownResult = await generateArtifact(
    'markdown',
    state,
    userPrompt,
    fallbackApiKey,
    'generate',
  );

  if (!markdownResult) return null;

  // 2. Generate config with markdown context
  const configResult = await generateArtifact(
    'config',
    state,
    userPrompt,
    fallbackApiKey,
    'generate',
  );

  if (!configResult) return null;

  const yaml = safeYaml(configResult.artifact.content);

  return {
    yaml,
    markdown: markdownResult.artifact.content,
    tokensUsed: configResult.tokensUsed + markdownResult.tokensUsed,
  };
}

// ─────────────────────────────────────────────
// Modify Workflow
// ─────────────────────────────────────────────

/**
 * Handle artifact modification with intelligent dependency tracking.
 *
 * Returns the updated artifact plus a list of downstream artifacts
 * that are now potentially stale.
 */
export async function modifyArtifact(
  artifactType: ArtifactType,
  state: ProjectState,
  modificationRequest: string,
  fallbackApiKey: string,
): Promise<{
  content: string;
  yaml: string;
  tokensUsed: number;
  staleArtifacts: ArtifactType[];
} | null> {
  let tokensUsed = 0;

  // 1. Determine if config needs regeneration
  const configChangeDetected = detectConfigImpact(modificationRequest);

  if (configChangeDetected || artifactType === 'config') {
    // Regenerate config first
    const configResult = await generateArtifact(
      'config',
      state,
      modificationRequest,
      fallbackApiKey,
      'modify',
    );
    if (!configResult) return null;
    tokensUsed += configResult.tokensUsed;
  }

  // 2. Generate the target artifact (unless it WAS config)
  let content = state.artifacts.config?.content ?? '';
  if (artifactType !== 'config') {
    const result = await generateArtifact(
      artifactType,
      state,
      modificationRequest,
      fallbackApiKey,
      'modify',
    );
    if (!result) return null;
    content = result.artifact.content;
    tokensUsed += result.tokensUsed;
  }

  // 3. Determine stale downstream artifacts
  const staleArtifacts = getDownstreamDependents(artifactType)
    .filter(dep => state.artifacts[dep] !== undefined);

  return {
    content,
    yaml: state.artifacts.config?.content ?? '',
    tokensUsed,
    staleArtifacts,
  };
}

// ─────────────────────────────────────────────
// DB Schema (External webhook)
// ─────────────────────────────────────────────

/**
 * Generate DB schema via external webhook (n8n/Activepieces).
 */
export async function generateDbSchema(
  state: ProjectState,
  userPrompt: string,
): Promise<DbSchema | null> {
  const webhookUrl = process.env.ACTIVEPIECES_WEBHOOK_URL;
  if (!webhookUrl) {
    log.warn('ACTIVEPIECES_WEBHOOK_URL not set');
    return null;
  }

  const markdownSummary = state.summaries.markdown || state.projectDescription;
  const startTime = Date.now();

  try {
    const res = await Promise.race([
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, stackSummary: markdownSummary }),
      }),
      new Promise<Response>((_, rej) =>
        setTimeout(() => rej(new Error('Webhook timeout')), ACTIVEPIECES_TIMEOUT_MS),
      ),
    ]);

    if (!res.ok) {
      log.error('Activepieces error', { status: res.status });
      return null;
    }

    const text = await res.text();
    const clean = text.trimStart().startsWith('=')
      ? text.trimStart().slice(1)
      : text;

    let data: any;
    try {
      data = JSON.parse(clean);
    } catch {
      log.error('Activepieces response not JSON', {
        responsePreview: clean.slice(0, 500),
        contentLength: text.length,
      });
      return null;
    }

    const p = Array.isArray(data) ? data[0] : data;
    let mermaid = p?.mermaid ?? p?.schema ?? p?.erd ?? p?.text ?? '';
    const diagram = p?.diagram ?? p?.svg ?? p?.image ?? p?.url ?? p?.output ?? '';

    mermaid = stripFences(mermaid);
    
    if (mermaid && !mermaid.includes('erDiagram') && !mermaid.includes('classDiagram')) {
      log.warn('Mermaid diagram missing erDiagram declaration, attempting sanitization', { preview: mermaid.slice(0, 100) });
      mermaid = `erDiagram\n${mermaid}`;
    }
    if (!mermaid && !diagram) {
      log.warn('Activepieces empty payload');
      return null;
    }

    const dbSchema: DbSchema = { mermaid, diagram };

    // Store with metadata
    const metadata = buildExternalMetadata('db', JSON.stringify(dbSchema), startTime, 1);
    await firestoreService.saveArtifact(
      state.sessionId,
      state.userId,
      'dbSchema',
      JSON.stringify(dbSchema),
      `Database schema with entities defined via Mermaid ER diagram.`,
      metadata,
    );

    return dbSchema;
  } catch (err) {
    log.error('Activepieces call failed', { err: String(err) });
    return null;
  }
}

// ─────────────────────────────────────────────
// Config impact detection
// ─────────────────────────────────────────────

/**
 * Simple heuristic: does the modification mention technology changes?
 */
function detectConfigImpact(modification: string): boolean {
  const techKeywords = [
    'change framework', 'switch to', 'replace', 'use postgres', 'use mongo',
    'add redis', 'remove', 'change database', 'change language', 'microservices',
    'monolith', 'kubernetes', 'docker', 'serverless', 'change stack',
    'use react', 'use vue', 'use angular', 'use express', 'use fastapi',
    'change auth', 'change deployment',
  ];
  const lower = modification.toLowerCase();
  return techKeywords.some(kw => lower.includes(kw));
}

// ─────────────────────────────────────────────
// Legacy result builder
// ─────────────────────────────────────────────

/**
 * Build a LegacyGenerateResult from ProjectState.
 * Used during migration to maintain the old response format.
 */
export function buildLegacyResult(state: ProjectState): LegacyGenerateResult {
  return {
    yaml: state.artifacts.config?.content ?? '',
    markdown: state.artifacts.markdown?.content ?? '',
    docker: state.artifacts.docker?.content ?? '',
    folderStructure: state.artifacts.folderStructure?.content,
    apiDesign: state.artifacts.apiDesign?.content,
    testingPlan: state.artifacts.testingPlan?.content,
    userStories: state.artifacts.userStories?.content,
    roadmap: state.artifacts.roadmap?.content,
    deploymentGuide: state.artifacts.deploymentGuide?.content,
    costEstimation: state.artifacts.costEstimation?.content,
    projectTimeline: state.artifacts.projectTimeline?.content,
    riskAnalysis: state.artifacts.riskAnalysis?.content,
    finalMarkdown: state.artifacts.finalMarkdown?.content,
  };
}
