/**
 * /api/generate/route.ts
 * Edge-OS — Thin API controller for artifact generation.
 *
 * This is the SLIM controller that replaced the original 3,614-line monolith.
 * All business logic lives in lib/pipeline/*.ts modules.
 *
 * Responsibilities:
 * - Auth (Clerk)
 * - Request validation
 * - Dispatch to ArtifactController
 * - Response formatting
 * - Token quota management
 *
 * The original route.ts is preserved as route.legacy.ts for reference.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getFullUserData } from '@/lib/auth';
import { createOrUpdateUser, db } from '@/lib/firebase-admin';
import { getOrCreateQuota, deductTokens } from '@/lib/token-quota';

// Pipeline imports
import type { ArtifactType, RequestArtifactType } from '@/lib/pipeline/types';
import { PROMPT_MIN_LEN, PROMPT_MAX_LEN } from '@/lib/pipeline/types';
import {
  getOrCreateProjectState,
  generateTitle,
  generateArtifact,
  generateInitial,
  modifyArtifact,
  generateDbSchema,
  buildLegacyResult,
} from '@/lib/pipeline/ArtifactController';
import * as firestoreService from '@/lib/pipeline/FirestoreService';
import { exportToNotion } from '@/lib/notion/exporter';
import { exportToGithub } from '@/lib/github/exporter';
import { exportToJira } from '@/lib/jira/exporter';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function sanitisePrompt(raw: string): string {
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\bPREV_[A-Z]+:/g, '')
    .trim()
    .slice(0, PROMPT_MAX_LEN);
}

function secureHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

function errorResponse(
  error: string,
  code: string,
  status: number,
): NextResponse {
  return secureHeaders(NextResponse.json({ error, code }, { status }));
}

const log = {
  info: (msg: string, meta?: object) =>
    console.log(JSON.stringify({ level: 'info', msg, ...meta, ts: Date.now() })),
  error: (msg: string, meta?: object) =>
    console.error(JSON.stringify({ level: 'error', msg, ...meta, ts: Date.now() })),
};

// ─────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const fullUserData = await getFullUserData();
    await createOrUpdateUser(userId, fullUserData);

    const quota = await getOrCreateQuota(userId);
    if (quota.exhausted || quota.tokensUsed >= quota.tokensLimit)
      return errorResponse('Daily token limit reached.', 'TOKEN_EXHAUSTED', 429);

    // ── Parse body ───────────────────────────────────────────────────────────
    let body: {
      prompt?: unknown;
      mode?: unknown;
      sessionId?: unknown;
      artifact?: unknown;
    };
    try {
      body = await req.json();
    } catch (error) {
      return errorResponse('Invalid JSON body', 'BAD_REQUEST', 400);
    }

    const rawPrompt = typeof body.prompt === 'string' ? body.prompt : '';
    const mode = typeof body.mode === 'string' ? body.mode : 'generate';
    const rawSid = typeof body.sessionId === 'string' ? body.sessionId : '';
    const artifact = (
      typeof body.artifact === 'string' ? body.artifact : 'initial'
    ) as RequestArtifactType;

    const sessionId = rawSid.trim() || `anon-${Date.now()}`;
    const prompt = sanitisePrompt(rawPrompt);

    if (!prompt || prompt.length < PROMPT_MIN_LEN) {
      return errorResponse(
        prompt ? 'Prompt too short (min 5 chars)' : 'Prompt is required',
        prompt ? 'PROMPT_TOO_SHORT' : 'MISSING_PROMPT',
        400,
      );
    }

    // ── API key ──────────────────────────────────────────────────────────────
    const fallbackApiKey = process.env.GROQ_API_KEY;
    if (!fallbackApiKey)
      return errorResponse('Server misconfiguration', 'MISSING_API_KEY', 500);

    // ── Project state ────────────────────────────────────────────────────────
    const state = await getOrCreateProjectState(sessionId, userId, prompt);

    // Store the project description if this is the first message
    const isFirstMessage = Object.keys(state.artifacts).length === 0;
    if (isFirstMessage) {
      state.projectDescription = prompt;
    }

    // ── Save user message ────────────────────────────────────────────────────
    await firestoreService.saveUserMessage(sessionId, userId, prompt);

    // ── Session title (first message only) ───────────────────────────────────
    let generatedTitle: string | undefined;
    if (isFirstMessage) {
      generatedTitle = await generateTitle(prompt, fallbackApiKey);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MODIFY MODE
    // ══════════════════════════════════════════════════════════════════════════

    if (mode === 'modify' && artifact !== 'initial' && state.artifacts.config) {
      const artifactType = artifact as ArtifactType;

      const result = await modifyArtifact(
        artifactType,
        state,
        prompt,
        fallbackApiKey,
      );

      if (!result)
        return errorResponse('Modification failed', 'LLM_ERROR', 500);

      await deductTokens(userId, result.tokensUsed);
      await firestoreService.saveAssistantMessage(
        sessionId,
        userId,
        `Modified ${artifactType}`,
        artifactType,
      );
      await firestoreService.saveSessionMetadata(sessionId, userId, {
        title: generatedTitle,
        totalTokensUsed: state.totalTokensUsed,
      });

      return secureHeaders(
        NextResponse.json({
          artifact: artifactType,
          yaml: result.yaml,
          content: result.content,
          staleArtifacts: result.staleArtifacts,
        }),
      );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GENERATE MODE
    // ══════════════════════════════════════════════════════════════════════════

    // ── "initial" — Config (YAML) + Markdown (Project Brief) ─────────────────
    if (artifact === 'initial') {
      // CLEAR in-memory ProjectState, artifact cache, summaries, and metadata for a fresh pipeline
      state.artifacts = {};
      state.summaries = {};
      state.projectDescription = prompt;
      state.totalTokensUsed = 0;
      
      const result = await generateInitial(state, prompt, fallbackApiKey);
      if (!result)
        return errorResponse('Initial generation failed', 'LLM_ERROR', 500);

      await deductTokens(userId, result.tokensUsed);
      await firestoreService.saveAssistantMessage(
        sessionId,
        userId,
        'Project brief and configuration generated.',
        'initial',
      );
      await firestoreService.saveSessionMetadata(sessionId, userId, {
        title: generatedTitle,
        projectDescription: prompt,
        status: 'generating',
        totalTokensUsed: state.totalTokensUsed,
      });

      return secureHeaders(
        NextResponse.json({
          artifact: 'initial',
          yaml: result.yaml,
          markdown: result.markdown,
        }),
      );
    }

    // ── DB Schema (external webhook) ─────────────────────────────────────────
    if (artifact === 'db') {
      if (!state.artifacts.config?.content)
        return errorResponse(
          'No config in session. Generate initial result first.',
          'NO_SESSION_CONFIG',
          400,
        );

      const dbSchema = await generateDbSchema(state, prompt);
      if (!dbSchema)
        return errorResponse('DB schema generation failed', 'N8N_ERROR', 500);

      await firestoreService.saveAssistantMessage(
        sessionId,
        userId,
        'Database schema generated.',
        'db',
      );
      await firestoreService.saveSessionMetadata(sessionId, userId, {
        title: generatedTitle,
        totalTokensUsed: state.totalTokensUsed,
      });

      return secureHeaders(
        NextResponse.json({ artifact: 'db', dbSchema }),
      );
    }

    // ── Single artifact generation ───────────────────────────────────────────
    const artifactType = artifact as ArtifactType;

    if (artifactType !== 'config' && !state.artifacts.config?.content) {
      // Auto-regenerate config if missing
      const configResult = await generateArtifact(
        'config',
        state,
        prompt,
        fallbackApiKey,
        'generate',
      );
      if (!configResult)
        return errorResponse(
          'No config in session. Generate initial result first.',
          'NO_SESSION_CONFIG',
          400,
        );
      await deductTokens(userId, configResult.tokensUsed);
    }

    const result = await generateArtifact(
      artifactType,
      state,
      prompt,
      fallbackApiKey,
      'generate',
    );

    if (!result)
      return errorResponse(
        `${artifactType} generation failed`,
        'LLM_ERROR',
        500,
      );

    await deductTokens(userId, result.tokensUsed);
    await firestoreService.saveAssistantMessage(
      sessionId,
      userId,
      `${artifactType} generated.`,
      artifactType,
    );
    if (artifactType === 'finalMarkdown') {
      const userRef = db.collection('user_integrations').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();
      const notionData = userData?.notion;
      const githubData = userData?.github;
      const jiraData = userData?.jira;
      
      const updatePayload: any = {};
      const logSummary: any = { GitHub: 'SKIPPED', Notion: 'SKIPPED', Jira: 'SKIPPED', Sprint: 'SKIPPED' };
      const exportPromises: Promise<any>[] = [];
      const exportStartTime = Date.now();

      if (!notionData || !notionData.accessToken || !notionData.defaultParentPageId) {
        log.info('Skipping Notion export, not connected or no parent page selected.');
        updatePayload.exportStatus = 'NOT_CONNECTED';
      } else {
        updatePayload.exportStatus = 'PENDING';

        firestoreService.saveEvent(sessionId, { type: 'EXPORT_STARTED', source: 'notion', message: 'Exporting to Notion...' });
        const notionStartT = Date.now();

        // Background Export Notion
        const notionPromise = exportToNotion(
          state, 
          state.title || generatedTitle || 'New Project', 
          notionData.accessToken, 
          notionData.defaultParentPageId, 
          logSummary,
          (msg: string) => firestoreService.saveEvent(sessionId, { type: 'EXPORT_PROGRESS', source: 'notion', message: msg })
        )
          .then(async (notionExportData) => {
            if (notionExportData) {
              await firestoreService.saveEvent(sessionId, { type: 'EXPORT_COMPLETED', source: 'notion', message: 'Notion export complete', durationMs: Date.now() - notionStartT });
              await firestoreService.saveSessionMetadata(sessionId, userId, {
                notionUrl: notionExportData.notionUrl,
                notionPageId: notionExportData.notionPageId,
                exportStatus: 'SUCCESS'
              });
            } else {
              await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'notion', message: 'Notion export failed', durationMs: Date.now() - notionStartT });
            }
          })
          .catch(async (err) => {
            await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'notion', message: 'Notion export failed', durationMs: Date.now() - notionStartT });
            log.error('Notion export failed', { err: String(err) });
            await firestoreService.saveSessionMetadata(sessionId, userId, { exportStatus: 'FAILED' });
            
            if (err.message === 'PARENT_PAGE_NOT_FOUND') {
              await userRef.set({
                notion: { defaultParentPageId: null, updatedAt: new Date().toISOString() }
              }, { merge: true });
            }
          });
        exportPromises.push(notionPromise);
      }

      if (!githubData || !githubData.accessToken) {
        log.info('Skipping GitHub export, not connected.');
        updatePayload.githubExportStatus = 'NOT_CONNECTED';
      } else {
        updatePayload.githubExportStatus = 'PENDING';

        firestoreService.saveEvent(sessionId, { type: 'EXPORT_STARTED', source: 'github', message: 'Creating GitHub repository...' });
        const githubStartT = Date.now();

        // Background Export GitHub
        const githubPromise = exportToGithub(
          state, 
          state.title || generatedTitle || 'New Project', 
          githubData.accessToken, 
          githubData.repoVisibility === 'private', 
          logSummary,
          (msg: string) => firestoreService.saveEvent(sessionId, { type: 'EXPORT_PROGRESS', source: 'github', message: msg })
        )
          .then(async (githubExportData) => {
            if (githubExportData) {
              await firestoreService.saveEvent(sessionId, { type: 'EXPORT_COMPLETED', source: 'github', message: 'GitHub export complete', durationMs: Date.now() - githubStartT });
              await firestoreService.saveSessionMetadata(sessionId, userId, {
                githubUrl: githubExportData.githubUrl,
                githubRepository: githubExportData.githubRepository,
                githubExportStatus: 'SUCCESS'
              });
            } else {
              await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'github', message: 'GitHub export failed', durationMs: Date.now() - githubStartT });
            }
          })
          .catch(async (err) => {
            await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'github', message: 'GitHub export failed', durationMs: Date.now() - githubStartT });
            log.error('GitHub export failed', { err: String(err) });
            await firestoreService.saveSessionMetadata(sessionId, userId, { githubExportStatus: 'FAILED' });
          });
        exportPromises.push(githubPromise);
      }

      if (!jiraData || !jiraData.accessToken) {
        log.info('Skipping Jira export, not connected.');
        updatePayload.jiraExportStatus = 'NOT_CONNECTED';
      } else {
        updatePayload.jiraExportStatus = 'PENDING';

        firestoreService.saveEvent(sessionId, { type: 'EXPORT_STARTED', source: 'jira', message: 'Creating Jira project...' });
        const jiraStartT = Date.now();

        // Background Export Jira
        const jiraPromise = exportToJira(
          state, 
          state.title || generatedTitle || 'New Project', 
          userId, 
          logSummary,
          (msg: string) => firestoreService.saveEvent(sessionId, { type: 'EXPORT_PROGRESS', source: 'jira', message: msg })
        )
          .then(async (jiraExportData) => {
            if (jiraExportData) {
              await firestoreService.saveEvent(sessionId, { type: 'EXPORT_COMPLETED', source: 'jira', message: 'Jira export complete', durationMs: Date.now() - jiraStartT });
              await firestoreService.saveSessionMetadata(sessionId, userId, {
                jiraUrl: jiraExportData.jiraUrl,
                jiraProjectKey: jiraExportData.jiraProjectKey,
                jiraExportStatus: 'SUCCESS'
              });
            } else {
              await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'jira', message: 'Jira export failed', durationMs: Date.now() - jiraStartT });
            }
          })
          .catch(async (err) => {
            await firestoreService.saveEvent(sessionId, { type: 'EXPORT_FAILED', source: 'jira', message: 'Jira export failed', durationMs: Date.now() - jiraStartT });
            log.error('Jira export failed', { err: String(err) });
            await firestoreService.saveSessionMetadata(sessionId, userId, { jiraExportStatus: 'FAILED' });
          });
        exportPromises.push(jiraPromise);
      }
      
      await firestoreService.saveSessionMetadata(sessionId, userId, updatePayload);

      // Print Export Summary once all background exports finish
      Promise.allSettled(exportPromises).then(() => {
        const totalDuration = ((Date.now() - exportStartTime) / 1000).toFixed(1);
        console.log(`\nExport Summary:
GitHub:
${logSummary.GitHub}

Notion:
${logSummary.Notion}

Jira:
${logSummary.Jira}

Sprint:
${logSummary.Sprint}

Duration:
${totalDuration}s\n`);
      });
    }

    await firestoreService.saveSessionMetadata(sessionId, userId, {
      title: generatedTitle,
      totalTokensUsed: state.totalTokensUsed,
    });

    return secureHeaders(
      NextResponse.json({
        artifact: artifactType,
        content: result.artifact.content,
      }),
    );
  } catch (err) {
    log.error('Unhandled error', { err: String(err) });
    return errorResponse('Internal server error', 'SERVER_ERROR', 500);
  }
}
