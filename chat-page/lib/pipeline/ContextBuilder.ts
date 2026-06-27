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

  // Filter out missing summaries and calculate total weight
  const validDeps = availableDeps.filter(dep => state.summaries[dep]);
  for (const dep of availableDeps) {
    if (!state.summaries[dep]) {
      dependenciesSkipped.push(`${dep} (missing summary)`);
    }
  }

  const totalWeight = validDeps.reduce((sum, dep) => sum + (ARTIFACT_WEIGHTS[dep] || 2), 0);

  let currentRemainingTokens = remainingTokens;
  let currentTotalWeight = totalWeight;

  // Sort by token demand relative to weight (smallest demand first)
  // This ensures that summaries that don't need their full budget free up tokens for those that do
  const sortedDeps = [...validDeps].sort((a, b) => {
    const demandA = Math.ceil(state.summaries[a].length / 4) / (ARTIFACT_WEIGHTS[a] || 2);
    const demandB = Math.ceil(state.summaries[b].length / 4) / (ARTIFACT_WEIGHTS[b] || 2);
    return demandA - demandB;
  });

  for (const dep of sortedDeps) {
    const summary = state.summaries[dep];
    const weight = ARTIFACT_WEIGHTS[dep] || 2;
    
    // Allocate proportional to remaining weight and tokens
    const tokenBudget = Math.floor((weight / currentTotalWeight) * currentRemainingTokens);
    const charBudget = tokenBudget * 4;
    
    let tokensUsed = 0;
    if (summary.length <= charBudget) {
      dependencySummaries.set(dep, summary);
      dependenciesLoaded.push(dep);
      tokensUsed = Math.ceil(summary.length / 4);
    } else {
      dependencySummaries.set(dep, summary.slice(0, charBudget) + '\n...[TRUNCATED]');
      dependenciesLoaded.push(`${dep} (truncated)`);
      tokensUsed = tokenBudget;
    }

    currentRemainingTokens -= tokensUsed;
    currentTotalWeight -= weight;
    tokenEstimate += tokensUsed;
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
 * Build a minimal context for the config artifact (first artifact generated).
 * Config has no dependencies, so context is just the master prompt + user prompt.
 */
export function buildConfigContext(userPrompt: string): ContextPayload {
  const slicedPrompt = userPrompt.slice(0, 600);

  console.log(
    JSON.stringify({
      level: 'info',
      msg: 'Config Context Generation',
      originalPromptLength: userPrompt.length,
      slicedPromptLength: slicedPrompt.length,
      promptTruncated: userPrompt.length > 600,
      ts: Date.now(),
    }),
  );

  return {
    masterPrompt: MASTER_PROMPT,
    projectSummary: slicedPrompt,
    configSummary: '',
    dependencySummaries: new Map(),
    estimatedTokens: CONTEXT_BUDGET.masterPrompt + CONTEXT_BUDGET.projectSummary,
    dependenciesRequested: [],
    dependenciesLoaded: [],
    dependenciesSkipped: [],
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
