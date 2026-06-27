/**
 * lib/pipeline/types.ts
 * Shared TypeScript interfaces for the EdgeOS artifact generation pipeline.
 */

// ─────────────────────────────────────────────
// Artifact Types
// ─────────────────────────────────────────────

export type ArtifactType =
  | 'config'
  | 'markdown'
  | 'db'
  | 'apiDesign'
  | 'folderStructure'
  | 'docker'
  | 'testingPlan'
  | 'userStories'
  | 'roadmap'
  | 'deploymentGuide'
  | 'costEstimation'
  | 'projectTimeline'
  | 'riskAnalysis'
  | 'finalMarkdown';

/** Frontend-facing artifact type includes "initial" (config+markdown combo) */
export type RequestArtifactType = ArtifactType | 'initial';

export type GenerationMode = 'generate' | 'modify';

// ─────────────────────────────────────────────
// Groq Client Types
// ─────────────────────────────────────────────

export interface GroqCallConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  stopTokens?: string[];
  timeoutMs: number;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  retryCount: number;
}

// ─────────────────────────────────────────────
// Artifact Metadata
// ─────────────────────────────────────────────

export interface ArtifactMetadata {
  /** Unique artifact generation ID */
  generationId: string;
  /** Artifact type identifier */
  artifactType: ArtifactType;
  /** LLM model used */
  model: string;
  /** Generation timestamp (ISO 8601) */
  generatedAt: string;
  /** Generation duration in milliseconds */
  durationMs: number;
  /** Token usage breakdown */
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  /** Dependencies that were available during generation */
  dependenciesUsed: ArtifactType[];
  /** Dependencies that were declared but missing */
  dependenciesMissing: ArtifactType[];
  /** Generation mode */
  mode: GenerationMode;
  /** Version number (increments on modify) */
  version: number;
  /** SHA-256 hash of the content (for change detection) */
  contentHash: string;
  /** Whether the artifact passed validation */
  validationPassed: boolean;
  /** Validation warnings (if any) */
  validationWarnings: string[];
  /** Estimated context token cost for this generation */
  contextTokens: number;
  /** Number of retry attempts before success */
  retryCount: number;
}

// ─────────────────────────────────────────────
// Generated Artifact
// ─────────────────────────────────────────────

export interface GeneratedArtifact {
  /** Full content of the artifact */
  content: string;
  /** Compressed summary (100-250 words) */
  summary: string;
  /** Generation metadata */
  metadata: ArtifactMetadata;
}

// ─────────────────────────────────────────────
// Project State
// ─────────────────────────────────────────────

export interface ProjectState {
  /** Session identifier */
  sessionId: string;
  /** User identifier */
  userId: string;
  /** Session title (auto-generated) */
  title?: string;
  /** User's original project description */
  projectDescription: string;
  /** All generated artifacts, keyed by type */
  artifacts: Partial<Record<ArtifactType, GeneratedArtifact>>;
  /** Summaries indexed separately for fast access */
  summaries: Partial<Record<ArtifactType, string>>;
  /** Overall generation status */
  status: 'idle' | 'generating' | 'complete' | 'error';
  /** Which artifact is currently being generated */
  currentArtifact?: ArtifactType;
  /** Timestamp of creation */
  createdAt: string;
  /** Timestamp of last update */
  updatedAt: string;
  /** Total tokens consumed across all artifacts */
  totalTokensUsed: number;
  /** Generation errors encountered */
  errors: Array<{
    artifactType: ArtifactType;
    error: string;
    timestamp: string;
  }>;
}

// ─────────────────────────────────────────────
// Context Builder Types
// ─────────────────────────────────────────────

export interface ContextPayload {
  /** Master system prompt (universal rules) */
  masterPrompt: string;
  /** User's original project description */
  projectSummary: string;
  /** Compressed config summary */
  configSummary: string;
  /** Summaries of declared dependencies */
  dependencySummaries: Map<ArtifactType, string>;
  /** User's modification request (modify mode only) */
  userModification?: string;
  /** Estimated token count of the context */
  estimatedTokens: number;

  // Debug logging fields
  dependenciesRequested?: string[];
  dependenciesLoaded?: string[];
  dependenciesSkipped?: string[];
}
// ─────────────────────────────────────────────
// Validation Types
// ─────────────────────────────────────────────

export interface ValidationRule {
  /** Human-readable description */
  description: string;
  /** Validation function — returns true if valid */
  check: (content: string) => boolean;
  /** Severity: 'error' triggers retry, 'warning' logs only */
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  /** Whether validation passed (no errors) */
  passed: boolean;
  /** Critical errors that should trigger retry */
  errors: string[];
  /** Non-critical warnings */
  warnings: string[];
  /** Auto-fixes applied */
  autoFixes: string[];
  /** Content after auto-fixes */
  fixedContent: string;
}

// ─────────────────────────────────────────────
// Pipeline Result Types
// ─────────────────────────────────────────────

export interface GenerationResult {
  /** The generated artifact */
  artifact: GeneratedArtifact;
  /** Artifact type */
  artifactType: ArtifactType;
  /** Validation result */
  validation: ValidationResult;
}

export interface ModifyResult {
  /** The updated artifact */
  updatedArtifact: GeneratedArtifact;
  /** Artifact type that was modified */
  artifactType: ArtifactType;
  /** Downstream artifacts that are now potentially stale */
  staleArtifacts: ArtifactType[];
  /** Whether config was also regenerated */
  configChanged: boolean;
  /** Validation result */
  validation: ValidationResult;
}

// ─────────────────────────────────────────────
// DB Schema (Activepieces/n8n)
// ─────────────────────────────────────────────

export interface DbSchema {
  mermaid: string;
  diagram: string;
}

// ─────────────────────────────────────────────
// Legacy Compatibility Types
// ─────────────────────────────────────────────

/**
 * Matches the existing GenerateResult shape used by the frontend.
 * Used during migration to maintain API compatibility.
 */
export interface LegacyGenerateResult {
  yaml: string;
  markdown: string;
  docker: string;
  folderStructure?: string;
  apiDesign?: string;
  testingPlan?: string;
  userStories?: string;
  roadmap?: string;
  deploymentGuide?: string;
  costEstimation?: string;
  projectTimeline?: string;
  riskAnalysis?: string;
  finalMarkdown?: string;
  dbSchema?: DbSchema;
}

// ─────────────────────────────────────────────
// Token Budget
// ─────────────────────────────────────────────

export const TOKEN_BUDGET: Record<ArtifactType, number> = {
  config: 6000,
  docker: 6000,
  markdown: 6000,
  folderStructure: 6000,
  apiDesign: 6000,
  testingPlan: 6000,
  userStories: 6000,
  roadmap: 6000,
  deploymentGuide: 6000,
  costEstimation: 6000,
  projectTimeline: 6000,
  riskAnalysis: 6000,
  finalMarkdown: 6000,
  db: 0, // DB uses external webhook, not Groq
} as const;

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const DEFAULT_MODEL = 'llama-3.1-8b-instant';
export const MAX_RETRIES = 3;
export const REQUEST_TIMEOUT_MS = 30_000;
export const ACTIVEPIECES_TIMEOUT_MS = 45_000;
export const PROMPT_MAX_LEN = 2000;
export const PROMPT_MIN_LEN = 5;
