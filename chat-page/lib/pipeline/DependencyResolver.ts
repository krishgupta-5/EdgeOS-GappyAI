/**
 * lib/pipeline/DependencyResolver.ts
 * Artifact dependency graph and resolution logic.
 *
 * Every artifact declares which other artifacts it depends on.
 * The ContextBuilder uses this graph to determine which summaries
 * to include when generating a given artifact.
 *
 * The modification workflow uses getDownstreamDependents() to identify
 * which artifacts become stale when one is modified.
 */

import { ArtifactType } from './types';

// ─────────────────────────────────────────────
// Static Dependency Declarations
// ─────────────────────────────────────────────

/**
 * Key: artifact being generated.
 * Value: artifacts whose SUMMARIES should be included in context.
 *
 * Rules:
 * - Config is the root — it depends on nothing.
 * - Every artifact depends on config (technology decisions).
 * - Beyond config, only declare direct logical dependencies.
 * - finalMarkdown depends on everything (it's the consolidation artifact).
 */
export const ARTIFACT_DEPENDENCIES: Record<ArtifactType, ArtifactType[]> = {
  config:          ['markdown'],
  markdown:        [],
  db:              ['config'],
  docker:          ['config'],
  folderStructure: ['config'],
  apiDesign:       ['config', 'markdown', 'db'],
  testingPlan:     ['config', 'apiDesign', 'folderStructure'],
  userStories:     ['config', 'markdown', 'apiDesign'],
  roadmap:         ['config', 'markdown', 'userStories'],
  deploymentGuide: ['config', 'docker', 'folderStructure'],
  costEstimation:  ['config', 'deploymentGuide'],
  projectTimeline: ['config', 'roadmap'],
  riskAnalysis:    ['config', 'deploymentGuide', 'costEstimation'],
  finalMarkdown:   [
    'config', 'markdown', 'apiDesign', 'docker', 'folderStructure',
    'testingPlan', 'userStories', 'roadmap', 'deploymentGuide',
    'costEstimation', 'projectTimeline', 'riskAnalysis',
  ],
};

// ─────────────────────────────────────────────
// Resolution Functions
// ─────────────────────────────────────────────

/**
 * Returns the declared dependencies for an artifact type.
 */
export function getDependencies(artifact: ArtifactType): ArtifactType[] {
  return ARTIFACT_DEPENDENCIES[artifact] ?? [];
}

/**
 * Returns the context-providing artifacts for a given artifact,
 * filtered to only those that have been generated.
 *
 * @param artifact - The artifact being generated
 * @param generatedArtifacts - Set of artifact types that have already been generated
 * @returns Ordered list of artifacts whose summaries should be included
 */
export function resolveContext(
  artifact: ArtifactType,
  generatedArtifacts: Set<ArtifactType>,
): ArtifactType[] {
  return ARTIFACT_DEPENDENCIES[artifact].filter(dep =>
    generatedArtifacts.has(dep),
  );
}

/**
 * Returns the missing dependencies for a given artifact.
 * Useful for logging and metadata: "these dependencies were declared but not available."
 *
 * @param artifact - The artifact being generated
 * @param generatedArtifacts - Set of artifact types that have already been generated
 * @returns List of declared dependencies that are not yet generated
 */
export function getMissingDependencies(
  artifact: ArtifactType,
  generatedArtifacts: Set<ArtifactType>,
): ArtifactType[] {
  return ARTIFACT_DEPENDENCIES[artifact].filter(dep =>
    !generatedArtifacts.has(dep),
  );
}

// ─────────────────────────────────────────────
// Modification Impact Analysis
// ─────────────────────────────────────────────

/**
 * Returns which artifacts are invalidated (become stale) when `modifiedArtifact` changes.
 * This is the REVERSE lookup of ARTIFACT_DEPENDENCIES.
 *
 * Used by the modification workflow to determine what needs regeneration
 * or what should be marked as "potentially outdated" in the UI.
 *
 * @param modified - The artifact that was just modified
 * @returns List of artifact types that depend on the modified artifact
 */
export function getDownstreamDependents(modified: ArtifactType): ArtifactType[] {
  const dependents: ArtifactType[] = [];
  for (const [artifact, deps] of Object.entries(ARTIFACT_DEPENDENCIES)) {
    if (deps.includes(modified)) {
      dependents.push(artifact as ArtifactType);
    }
  }
  return dependents;
}

/**
 * Returns the FULL transitive set of downstream dependents.
 * If config changes, everything downstream is stale.
 * If apiDesign changes, testingPlan + userStories + finalMarkdown are stale.
 *
 * @param modified - The artifact that was just modified
 * @returns Complete set of transitively dependent artifacts
 */
export function getTransitiveDependents(modified: ArtifactType): ArtifactType[] {
  const visited = new Set<ArtifactType>();
  const queue: ArtifactType[] = [modified];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const directDeps = getDownstreamDependents(current);
    for (const dep of directDeps) {
      if (!visited.has(dep)) {
        visited.add(dep);
        queue.push(dep);
      }
    }
  }

  return [...visited];
}

/**
 * Returns the topological generation order.
 * Useful if batch-generating all artifacts to ensure dependencies are met.
 */
export function getGenerationOrder(): ArtifactType[] {
  return [
    'markdown',
    'config',
    'db',
    'docker',
    'folderStructure',
    'apiDesign',
    'testingPlan',
    'userStories',
    'roadmap',
    'deploymentGuide',
    'costEstimation',
    'projectTimeline',
    'riskAnalysis',
    'finalMarkdown',
  ];
}
