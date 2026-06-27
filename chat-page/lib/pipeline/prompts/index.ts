/**
 * lib/pipeline/prompts/index.ts
 * Prompt registry — single import point for all artifact prompts.
 *
 * Usage:
 *   import { getArtifactPrompt } from '@/lib/pipeline/prompts';
 *   const prompt = getArtifactPrompt('docker');
 */

import type { ArtifactType } from '../types';

// ─────────────────────────────────────────────
// Import all artifact prompts
// ─────────────────────────────────────────────

import { CONFIG_PROMPT } from './config';
import { DOCKER_PROMPT } from './docker';
import { MARKDOWN_PROMPT } from './markdown';
import { FOLDER_STRUCTURE_PROMPT } from './folderStructure';
import { API_DESIGN_PROMPT } from './apiDesign';
import { TESTING_PLAN_PROMPT } from './testingPlan';
import { USER_STORIES_PROMPT } from './userStories';
import { ROADMAP_PROMPT } from './roadmap';
import { DEPLOYMENT_GUIDE_PROMPT } from './deploymentGuide';
import { COST_ESTIMATION_PROMPT } from './costEstimation';
import { PROJECT_TIMELINE_PROMPT } from './projectTimeline';
import { RISK_ANALYSIS_PROMPT } from './riskAnalysis';
import { FINAL_MARKDOWN_PROMPT } from './finalMarkdown';

// Re-export master prompt
export { MASTER_PROMPT, getTemperature } from './master';

// ─────────────────────────────────────────────
// Prompt Registry
// ─────────────────────────────────────────────

const PROMPT_REGISTRY: Record<ArtifactType, string> = {
  config: CONFIG_PROMPT,
  docker: DOCKER_PROMPT,
  markdown: MARKDOWN_PROMPT,
  folderStructure: FOLDER_STRUCTURE_PROMPT,
  apiDesign: API_DESIGN_PROMPT,
  testingPlan: TESTING_PLAN_PROMPT,
  userStories: USER_STORIES_PROMPT,
  roadmap: ROADMAP_PROMPT,
  deploymentGuide: DEPLOYMENT_GUIDE_PROMPT,
  costEstimation: COST_ESTIMATION_PROMPT,
  projectTimeline: PROJECT_TIMELINE_PROMPT,
  riskAnalysis: RISK_ANALYSIS_PROMPT,
  finalMarkdown: FINAL_MARKDOWN_PROMPT,
  db: '', // DB uses external webhook, not Groq prompts
};

/**
 * Returns the artifact-specific prompt for a given artifact type.
 * This prompt is combined with the master prompt by the PromptBuilder.
 *
 * @throws Error if artifact type has no registered prompt
 */
export function getArtifactPrompt(artifactType: ArtifactType): string {
  const prompt = PROMPT_REGISTRY[artifactType];
  if (prompt === undefined) {
    throw new Error(`No prompt registered for artifact type: ${artifactType}`);
  }
  return prompt;
}

/**
 * Returns whether an artifact type uses "raw" output mode.
 * Raw mode means the response should NOT go through YAML extraction/processing.
 *
 * - YAML artifacts (config, docker, testingPlan) use extractYamlBlock + stripFences
 * - Markdown/text artifacts use the raw response directly
 */
export function isRawOutputArtifact(artifactType: ArtifactType): boolean {
  const yamlArtifacts: ArtifactType[] = ['config', 'docker', 'folderStructure', 'testingPlan'];
  return !yamlArtifacts.includes(artifactType);
}

/**
 * Returns whether an artifact should use stop tokens to prevent code fences.
 */
export function usesStopTokens(artifactType: ArtifactType): boolean {
  return artifactType === 'config' || artifactType === 'docker';
}

// ─────────────────────────────────────────────
// Title prompt (special — not an artifact)
// ─────────────────────────────────────────────

export const TITLE_PROMPT = `Summarize the user's prompt into a concise 3-4 word title. Respond ONLY with the title. No quotes, no preamble.`;

// ─────────────────────────────────────────────
// Re-export individual prompts for direct access
// ─────────────────────────────────────────────

export {
  CONFIG_PROMPT,
  DOCKER_PROMPT,
  MARKDOWN_PROMPT,
  FOLDER_STRUCTURE_PROMPT,
  API_DESIGN_PROMPT,
  TESTING_PLAN_PROMPT,
  USER_STORIES_PROMPT,
  ROADMAP_PROMPT,
  DEPLOYMENT_GUIDE_PROMPT,
  COST_ESTIMATION_PROMPT,
  PROJECT_TIMELINE_PROMPT,
  RISK_ANALYSIS_PROMPT,
  FINAL_MARKDOWN_PROMPT,
};
