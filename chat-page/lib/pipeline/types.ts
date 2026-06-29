/**
 * lib/pipeline/types.ts
 * Shared TypeScript interfaces for the ProdMate artifact generation pipeline.
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

export const INTEGRATION_DEPENDENCY_MAP: Record<string, ArtifactType[]> = {
  github: ['config', 'markdown', 'db', 'apiDesign', 'folderStructure', 'docker', 'testingPlan', 'userStories', 'roadmap', 'deploymentGuide', 'costEstimation', 'projectTimeline', 'riskAnalysis', 'finalMarkdown'],
  jira: ['userStories'],
  notion: ['config', 'markdown', 'db', 'apiDesign', 'folderStructure', 'docker', 'testingPlan', 'userStories', 'roadmap', 'deploymentGuide', 'costEstimation', 'projectTimeline', 'riskAnalysis', 'finalMarkdown'],
};

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
  /** Structured internal JSON data extracted from the LLM response */
  structuredData?: any;
  /** Current version number */
  currentVersion?: number;
  /** Previous version number */
  previousVersion?: number;
  /** Reason for the most recent change */
  reasonForChange?: string;
}

// ─────────────────────────────────────────────
// Artifact History
// ─────────────────────────────────────────────

export interface ArtifactHistory {
  /** Version number */
  version: number;
  /** Agent or system that generated it (e.g., 'Gemini', 'Groq') */
  generatedBy: string;
  /** Timestamp of update */
  updatedAt: string;
  /** Why it was changed */
  reasonForChange: string;
  /** Content of the old artifact */
  content: string;
  /** Summary of the old artifact */
  summary: string;
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
  /** Is conversation mode active? */
  conversationMode?: boolean;
  /** High-level summary of the whole project */
  projectSummary?: string;
  /** Summary of all artifacts */
  artifactSummary?: string;
  /** Running summary of the follow-up conversation */
  conversationSummary?: string;
  /** Timestamp of the last conversation interaction */
  lastConversationAt?: string;
  /** Integrations that need updating */
  pendingIntegrationUpdates?: {
    github: boolean;
    notion: boolean;
    jira: boolean;
  };
  githubUrl?: string;
  githubRepository?: string;
  githubExportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

  notionUrl?: string;
  notionPageId?: string;
  exportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'; // Used for notion

  jiraUrl?: string;
  jiraProjectKey?: string;
  jiraExportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

  // Synchronization System States
  githubExported?: boolean;
  githubDirty?: boolean;
  lastGitHubSync?: string;
  githubDirtyArtifacts?: string[];

  jiraExported?: boolean;
  jiraDirty?: boolean;
  lastJiraSync?: string;
  jiraDirtyArtifacts?: string[];

  notionExported?: boolean;
  notionDirty?: boolean;
  lastNotionSync?: string;
  notionDirtyArtifacts?: string[];

  calendarExportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  calendarEventsCreated?: number;
  
  gmailExportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
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

export interface ProgressEvent {
  type: 'GENERATION_STARTED' | 'ARTIFACT_GENERATED' | 'EXPORT_STARTED' | 'EXPORT_PROGRESS' | 'EXPORT_COMPLETED' | 'EXPORT_FAILED';
  source: 'pipeline' | 'github' | 'notion' | 'jira' | 'calendar' | 'gmail';
  message: string;
  metadata?: any;
  durationMs?: number;
  timestamp: string;
}

/**
 * Matches the existing GenerateResult shape used by the frontend.
 * Used during migration to maintain API compatibility.
 */
export interface LegacyGenerateResult {
  exportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

  // GitHub Export Metadata
  githubUrl?: string;
  githubRepository?: string;
  githubExportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

  // Jira Export Metadata
  jiraUrl?: string;
  jiraProjectKey?: string;
  jiraExportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  
  // Notion Export Metadata
  notionUrl?: string;
  notionPageId?: string;

  // Google Calendar Export Metadata
  calendarExportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  calendarEventsCreated?: number;

  // Gmail Export Metadata
  gmailExportStatus?: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

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

// ─────────────────────────────────────────────
// Conversational AI Assistant Types
// ─────────────────────────────────────────────

export interface EmailPreview {
  recipient: string;
  subject: string;
  body: string;
  status: 'preview' | 'sending' | 'sent' | 'cancelled';
  sentAt?: string;
  messageId?: string;
}

export interface MeetingPreview {
  title: string;
  date: string;
  time: string;
  duration: number; // in minutes
  guests: string[];
  agenda: string;
  description: string;
  status: 'preview' | 'scheduling' | 'scheduled' | 'cancelled';
  eventId?: string;
  meetLink?: string;
  scheduledAt?: string;
}
