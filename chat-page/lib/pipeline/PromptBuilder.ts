/**
 * lib/pipeline/PromptBuilder.ts
 * Composes the final message array sent to Groq.
 *
 * Combines:
 * 1. Master prompt (system message)
 * 2. Structured context sections (user message)
 * 3. Artifact-specific instructions
 * 4. User's request
 *
 * Replaces the ad-hoc string concatenation in route.ts with
 * a structured, section-delimited message format.
 */

import type { ArtifactType, ContextPayload, GroqMessage } from './types';
import { getArtifactPrompt } from './prompts';

// ─────────────────────────────────────────────
// Prompt Builder
// ─────────────────────────────────────────────

/**
 * Build the complete message array for a Groq API call.
 *
 * Message structure:
 *
 *   SYSTEM: Master prompt (universal rules)
 *
 *   USER: [PROJECT DESCRIPTION]
 *         [CONFIG SUMMARY]
 *         [SUMMARY:dep1] ...
 *         [SUMMARY:dep2] ...
 *         [EXISTING artifact] (modify mode only)
 *         [MODIFICATION REQUEST] (modify mode only)
 *         [INSTRUCTIONS] (artifact-specific prompt)
 *         [USER REQUEST]
 *
 * @param artifactType - The artifact being generated
 * @param context - Assembled context from ContextBuilder
 * @param userPrompt - User's original prompt or modification request
 * @param mode - 'generate' or 'modify'
 * @param existingContent - Current artifact content (modify mode only)
 * @returns Array of chat messages ready for Groq
 */
export function buildPromptMessages(
  artifactType: ArtifactType,
  context: ContextPayload,
  userPrompt: string,
  mode: 'generate' | 'modify',
  existingContent?: string,
): GroqMessage[] {
  const messages: GroqMessage[] = [];

  // 1. System message = Master Prompt (universal rules)
  messages.push({
    role: 'system',
    content: context.masterPrompt,
  });

  // 2. User message = assembled context + artifact instructions
  const userParts: string[] = [];

  // 2a. Project description (always included)
  if (context.projectSummary) {
    userParts.push(`[PROJECT DESCRIPTION]\n${context.projectSummary}`);
  }

  // 2b. Config summary (always included when available)
  if (context.configSummary) {
    userParts.push(`[CONFIG SUMMARY]\n${context.configSummary}`);
  }

  // 2c. Dependency summaries (from ContextBuilder via dependency graph)
  for (const [depType, summary] of context.dependencySummaries) {
    userParts.push(`[SUMMARY:${depType}]\n${summary}`);
  }

  // 2d. Existing content (modify mode only — so model knows what to update)
  if (mode === 'modify' && existingContent) {
    // Send up to 2000 chars of existing content for reference
    userParts.push(
      `[EXISTING ${artifactType.toUpperCase()}]\n${existingContent.slice(0, 2000)}`,
    );
  }

  // 2e. Modification request (modify mode only)
  if (mode === 'modify' && context.userModification) {
    userParts.push(`[MODIFICATION REQUEST]\n${context.userModification}`);
  }

  // 2f. Artifact-specific prompt (the actual instructions)
  const artifactPrompt = getArtifactPrompt(artifactType);
  if (artifactPrompt) {
    userParts.push(`[INSTRUCTIONS]\n${artifactPrompt}`);
  }

  // 2g. User's original prompt (generate mode)
  if (mode === 'generate') {
    userParts.push(`[USER REQUEST]\n${userPrompt}`);
  }

  messages.push({
    role: 'user',
    content: userParts.join('\n\n---\n\n'),
  });

  return messages;
}

/**
 * Build a simple prompt for the config artifact.
 * Config is special — it has no dependencies and needs the full config prompt.
 * The master prompt handles universal rules.
 */
export function buildConfigPromptMessages(
  context: ContextPayload,
  userPrompt: string,
  mode: 'generate' | 'modify',
  existingYaml?: string,
): GroqMessage[] {
  return buildPromptMessages('config', context, userPrompt, mode, existingYaml);
}

/**
 * Build a lightweight prompt for title generation.
 * Does not use the master prompt — just a simple instruction.
 */
export function buildTitlePromptMessages(userPrompt: string): GroqMessage[] {
  return [
    {
      role: 'system',
      content:
        'Summarize the user\'s prompt into a concise 3-4 word title. Respond ONLY with the title. No quotes, no preamble.',
    },
    {
      role: 'user',
      content: userPrompt,
    },
  ];
}

/**
 * Build a prompt for the legacy "initial" flow (config + markdown combo).
 * This generates the markdown using the config summary as context.
 */
export function buildInitialMarkdownMessages(
  context: ContextPayload,
  userPrompt: string,
  configSummary: string,
): GroqMessage[] {
  // Override config summary with the freshly-generated one
  const updatedContext: ContextPayload = {
    ...context,
    configSummary,
  };
  return buildPromptMessages('markdown', updatedContext, userPrompt, 'generate');
}
