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
      // Automatic exports have been removed. Exports are now triggered manually via the /api/export endpoint.
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
