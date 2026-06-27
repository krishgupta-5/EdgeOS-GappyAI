/**
 * lib/pipeline/ContextBuilder.ts
 * Selects and compresses context for each artifact generation call.
 *
 * Uses the DependencyResolver to determine which summaries to include,
 * then assembles them within a token budget.
 *
 * Replaces the ad-hoc `stackSummary` + chat history approach with
 * dependency-aware, token-budgeted context assembly.
 */

import type { ArtifactType, ContextPayload, ProjectState } from './types';
import { resolveContext, getMissingDependencies } from './DependencyResolver';
import { MASTER_PROMPT } from './prompts/master';
import { summarizeYamlCompact } from './ArtifactSummarizer';

// ─────────────────────────────────────────────
// Token budget constants
// ─────────────────────────────────────────────

const ARTIFACT_WEIGHTS: Record<ArtifactType, number> = {
  config: 10,
  roadmap: 9,
  apiDesign: 8,
  db: 7,
  projectTimeline: 6,
  deploymentGuide: 5,
  testingPlan: 4,
  riskAnalysis: 3,
  markdown: 2,
  docker: 2,
  folderStructure: 2,
  userStories: 2,
  costEstimation: 2,
  finalMarkdown: 2,
};

const CONTEXT_BUDGET = {
  /** Fixed cost — master system instructions */
  masterPrompt: 800,
  /** User's original description (compressed) */
  projectSummary: 300,
  /** YAML config summary (always included) */
  configSummary: 200,
  /** Budget per dependency summary */
  perDependency: 350,
  /** User's modification request (if modify mode) */
  userModification: 200,
} as const;

/** Hard cap on total context token estimate */
const MAX_CONTEXT_TOKENS = 3500;

// ─────────────────────────────────────────────
// Context Builder
// ─────────────────────────────────────────────

/**
 * Build the context payload for generating a specific artifact.
 *
 * The context includes:
 * 1. Master prompt (universal rules) — always included
 * 2. Project description (user's original prompt) — always included
 * 3. Config summary (technology decisions) — always included if available
 * 4. Dependency summaries (from the dependency graph) — included per budget
 * 5. User modification request (modify mode only)
 *
 * @param artifact - The artifact type being generated
 * @param state - Current project state with all generated artifacts and summaries
 * @param userPrompt - User's input prompt
 * @param mode - 'generate' or 'modify'
 * @returns Assembled context payload with token estimate
 */
export function buildContext(
  artifact: ArtifactType,
  state: ProjectState,
  userPrompt: string,
  mode: 'generate' | 'modify',
): ContextPayload {
  const generatedSet = new Set(
    Object.keys(state.artifacts) as ArtifactType[],
  );

  // Resolve which dependencies are available
  const availableDeps = resolveContext(artifact, generatedSet);
  const missingDeps = getMissingDependencies(artifact, generatedSet);

  if (missingDeps.length > 0) {
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'Missing dependencies for context',
        artifact,
        missing: missingDeps,
        ts: Date.now(),
      }),
    );
  }

  // Build dependency summaries within budget
  const dependencySummaries = new Map<ArtifactType, string>();
  const dependenciesLoaded: string[] = [];
  const dependenciesSkipped: string[] = [];

  let tokenEstimate =
    CONTEXT_BUDGET.masterPrompt +
    CONTEXT_BUDGET.projectSummary +
    CONTEXT_BUDGET.configSummary;

  // Add dependency summaries based on weighted prioritization
  let remainingTokens = MAX_CONTEXT_TOKENS - tokenEstimate;
  if (remainingTokens < 0) remainingTokens = 0;

  // Filter out missing summaries
  const validDeps = availableDeps.filter(dep => state.summaries[dep]);
  for (const dep of availableDeps) {
    if (!state.summaries[dep]) {
      dependenciesSkipped.push(`${dep} (missing summary)`);
    }
  }

  const MUST_INCLUDE: ArtifactType[] = ['config', 'markdown', 'apiDesign', 'roadmap'];
  const mustIncludeDeps = validDeps.filter(dep => MUST_INCLUDE.includes(dep));
  const flexibleDeps = validDeps.filter(dep => !MUST_INCLUDE.includes(dep));

  let mustIncludeTokens = 0;
  for (const dep of mustIncludeDeps) {
    mustIncludeTokens += Math.ceil(state.summaries[dep]!.length / 4);
  }

  let currentRemainingTokens = remainingTokens - mustIncludeTokens;
  if (currentRemainingTokens < 0) currentRemainingTokens = 0;

  const totalFlexibleWeight = flexibleDeps.reduce((sum, dep) => sum + (ARTIFACT_WEIGHTS[dep] || 2), 0);

  const processedSummaries = new Map<ArtifactType, { content: string, status: string, tokens: number }>();

  // First allocate must-include deps
  for (const dep of mustIncludeDeps) {
    const summary = state.summaries[dep]!;
    const tokens = Math.ceil(summary.length / 4);
    processedSummaries.set(dep, { content: summary, status: dep, tokens });
  }

  // Then allocate flexible deps proportionally
  for (const dep of flexibleDeps) {
    const summary = state.summaries[dep]!;
    const weight = ARTIFACT_WEIGHTS[dep] || 2;
    
    // Allocate proportional to remaining weight and tokens, but guarantee a minimum floor (e.g. 25 tokens / ~100 chars)
    let tokenBudget = totalFlexibleWeight > 0 ? Math.floor((weight / totalFlexibleWeight) * currentRemainingTokens) : 0;
    tokenBudget = Math.max(tokenBudget, 25);
    const charBudget = tokenBudget * 4;
    
    let tokensUsed = 0;
    if (summary.length <= charBudget) {
      processedSummaries.set(dep, { content: summary, status: dep, tokens: Math.ceil(summary.length / 4) });
      tokensUsed = Math.ceil(summary.length / 4);
    } else {
      const cutoff = summary.lastIndexOf('\n', charBudget);
      const cleanSlice = cutoff > 0 ? summary.slice(0, cutoff) : summary.slice(0, charBudget);
      processedSummaries.set(dep, { content: cleanSlice + '\n...[TRUNCATED]', status: `${dep} (compressed)`, tokens: Math.ceil(cleanSlice.length / 4) + 2 });
      tokensUsed = tokenBudget;
    }

    currentRemainingTokens -= tokensUsed;
  }

  // Restore original logical order for prompt injection
  for (const dep of validDeps) {
    const processed = processedSummaries.get(dep);
    if (processed) {
      dependencySummaries.set(dep, processed.content);
      dependenciesLoaded.push(processed.status);
      tokenEstimate += processed.tokens;
    }
  }
  // Add modification budget if in modify mode
  if (mode === 'modify') {
    tokenEstimate += CONTEXT_BUDGET.userModification;
  }

  // Build config summary
  const configContent = state.artifacts.config?.content ?? '';
  const configSummary = configContent
    ? summarizeYamlCompact(configContent)
    : '';

  return {
    masterPrompt: MASTER_PROMPT,
    projectSummary: state.projectDescription.slice(0, 600),
    configSummary,
    dependencySummaries,
    userModification: mode === 'modify' ? userPrompt : undefined,
    estimatedTokens: tokenEstimate,
    dependenciesRequested: availableDeps,
    dependenciesLoaded,
    dependenciesSkipped,
  };
}



/**
 * Get the stack summary string for legacy compatibility.
 * Used during migration to maintain the same interface as the old code.
 */
export function getStackSummary(state: ProjectState): string {
  const configContent = state.artifacts.config?.content ?? '';
  return configContent ? summarizeYamlCompact(configContent) : '';
}
