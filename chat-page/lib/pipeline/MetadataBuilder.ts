/**
 * lib/pipeline/MetadataBuilder.ts
 * Attaches generation metadata to every artifact.
 *
 * Metadata includes: generation time, model, token usage, dependencies,
 * version, content hash, validation status, and retry count.
 */

import type {
  ArtifactType,
  ArtifactMetadata,
  GroqResponse,
  ContextPayload,
  ValidationResult,
} from './types';
import { getDependencies } from './DependencyResolver';

// ─────────────────────────────────────────────
// Simple SHA-256 hash (works in Node.js / Edge Runtime)
// ─────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  // Use Web Crypto API (available in Edge Runtime and Node.js 18+)
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous fallback hash for when crypto.subtle is unavailable.
 * Uses a simple djb2-style hash — not cryptographic, but good enough
 * for change detection.
 */
function quickHash(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Build metadata for a generated artifact.
 *
 * @param artifactType - The type of artifact generated
 * @param groqResponse - Response from the Groq API
 * @param context - Context payload used for generation
 * @param validation - Validation result
 * @param startTime - Timestamp when generation started (Date.now())
 * @param version - Version number (1 for first generation, increments on modify)
 * @param mode - 'generate' or 'modify'
 * @returns Complete artifact metadata
 */
export async function buildMetadata(
  artifactType: ArtifactType,
  groqResponse: GroqResponse,
  context: ContextPayload,
  validation: ValidationResult,
  startTime: number,
  version: number,
  mode: 'generate' | 'modify',
): Promise<ArtifactMetadata> {
  // Compute content hash
  let contentHash: string;
  try {
    contentHash = await sha256(groqResponse.content);
  } catch {
    contentHash = quickHash(groqResponse.content);
  }

  // Determine which dependencies were used vs. missing
  const declaredDeps = getDependencies(artifactType);
  const usedDeps = [...context.dependencySummaries.keys()];
  const missingDeps = declaredDeps.filter(
    (d) => !context.dependencySummaries.has(d),
  );

  return {
    generationId: generateId(),
    artifactType,
    model: groqResponse.model,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    tokens: {
      prompt: groqResponse.usage.promptTokens,
      completion: groqResponse.usage.completionTokens,
      total: groqResponse.usage.totalTokens,
    },
    dependenciesUsed: usedDeps,
    dependenciesMissing: missingDeps,
    mode,
    version,
    contentHash,
    validationPassed: validation.passed,
    validationWarnings: validation.warnings,
    contextTokens: context.estimatedTokens,
    retryCount: groqResponse.retryCount,
  };
}

/**
 * Build minimal metadata for externally-generated artifacts (e.g., DB schema from n8n).
 */
export function buildExternalMetadata(
  artifactType: ArtifactType,
  content: string,
  startTime: number,
  version: number,
): ArtifactMetadata {
  return {
    generationId: generateId(),
    artifactType,
    model: 'external',
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    tokens: { prompt: 0, completion: 0, total: 0 },
    dependenciesUsed: [],
    dependenciesMissing: [],
    mode: 'generate',
    version,
    contentHash: quickHash(content),
    validationPassed: true,
    validationWarnings: [],
    contextTokens: 0,
    retryCount: 0,
  };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function generateId(): string {
  // Use crypto.randomUUID if available (Node 18+, Edge Runtime)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
