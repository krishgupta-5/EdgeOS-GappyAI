/**
 * lib/pipeline/ArtifactSummarizer.ts
 * Generates compressed summaries of artifacts for context reuse.
 *
 * Two strategies:
 * - Deterministic: Parse structured output (YAML, folder trees) programmatically.
 *   No LLM cost. Used for config, docker, db, folderStructure, testingPlan.
 * - LLM-based: Use a lightweight Groq call to compress narrative content.
 *   Used for markdown, apiDesign, userStories, roadmap, etc.
 *
 * Summaries are 100-250 words, optimized for consumption by future artifact
 * generation calls. They capture KEY DECISIONS, not full content.
 */

import YAML from 'yaml';
import type { ArtifactType, GroqCallConfig } from './types';
import { callGroqRaw, createCallConfig } from './GroqClient';

// ─────────────────────────────────────────────
// Strategy classification
// ─────────────────────────────────────────────

type SummaryStrategy = 'deterministic' | 'llm';

const STRATEGY_MAP: Record<ArtifactType, SummaryStrategy> = {
  config:          'deterministic',
  docker:          'deterministic',
  db:              'deterministic',
  folderStructure: 'deterministic',
  testingPlan:     'deterministic',
  markdown:        'llm',
  apiDesign:       'llm',
  userStories:     'llm',
  roadmap:         'llm',
  deploymentGuide: 'llm',
  costEstimation:  'llm',
  projectTimeline: 'llm',
  riskAnalysis:    'llm',
  finalMarkdown:   'llm',
};

// ─────────────────────────────────────────────
// Deterministic summarizers
// ─────────────────────────────────────────────

/**
 * Enhanced version of the existing summarizeYaml().
 * Extracts key technology decisions into a structured summary.
 */
export function summarizeConfig(yamlText: string): string {
  const get = (key: string) =>
    new RegExp(`${key}:\\s*(.+)`).exec(yamlText)?.[1]?.trim() ?? 'unknown';

  const parts = [
    `System: ${get('name')} (${get('application_type')})`,
    `Domain: ${get('business_domain')}`,
    `Architecture: ${get('architecture')}`,
    `Frontend: ${get('language')}/${get('framework')} with ${get('rendering')} rendering`,
    `Backend: ${get('language')}/${get('framework')} (${get('api_style')})`,
    `Database: ${get('primary')}`,
    `Cache: ${get('cache')}`,
    `Auth: ${get('authentication')} (strategy: ${get('strategy')})`,
    `Deployment: ${get('deployment')}`,
    `CI/CD: ${get('ci_cd') !== 'unknown' ? get('ci_cd') : get('provider')}`,
    `Containerization: ${get('containerization')}`,
    `Scale: ${get('estimated_scale')}`,
  ];

  return parts.filter(p => !p.includes('unknown/unknown')).join('. ') + '.';
}

/**
 * Legacy-compatible one-line config summary.
 * Used where the old summarizeYaml() was called.
 */
export function summarizeYamlCompact(yamlText: string): string {
  const get = (key: string) =>
    new RegExp(`${key}:\\s*(.+)`).exec(yamlText)?.[1]?.trim() ?? 'unknown';
  return [
    `name:${get('name')}`,
    `type:${get('type') !== 'unknown' ? get('type') : get('application_type')}`,
    `arch:${get('architecture')}`,
    `lang:${get('language')}`,
    `framework:${get('framework')}`,
    `api:${get('api_style') !== 'unknown' ? get('api_style') : get('api')}`,
    `db:${get('primary')}`,
    `cache:${get('cache')}`,
    `auth:${get('strategy') !== 'unknown' ? get('strategy') : get('authentication')}`,
    `deploy:${get('deployment')}`,
    `ci:${get('ci_cd') !== 'unknown' ? get('ci_cd') : get('provider')}`,
  ].join(', ');
}

function summarizeDocker(content: string): string {
  try {
    const parsed = YAML.parse(content);
    const services = parsed?.services ?? {};
    const serviceEntries = Object.entries(services).map(([name, svc]: [string, any]) => {
      const image = svc?.image ?? 'custom';
      const ports = (svc?.ports ?? []).join(', ');
      return `${name} (${image}${ports ? `, ports: ${ports}` : ''})`;
    });
    const volumes = parsed?.volumes ? Object.keys(parsed.volumes).join(', ') : 'none';
    return `Docker Compose services: ${serviceEntries.join('; ')}. Named volumes: ${volumes}. Version: ${parsed?.version ?? 'unspecified'}.`;
  } catch {
    // Fallback to simple extraction
    const serviceMatches = content.match(/^\s{2}\w[\w-]*:/gm) ?? [];
    const imageMatches = content.match(/image:\s*(.+)/g) ?? [];
    return `Docker Compose with ${serviceMatches.length} services. Images: ${imageMatches.map(m => m.replace('image:', '').trim()).join(', ')}.`;
  }
}

function summarizeDb(content: string): string {
  // DB schema content is JSON with mermaid + diagram fields
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    const mermaid = parsed?.mermaid ?? '';
    // Extract entity names from mermaid ER diagram
    const entities = [...new Set(
      (mermaid.match(/\b([A-Z][A-Z_]+)\b/g) ?? [])
        .filter((e: string) => !['ER', 'DIAGRAM', 'PK', 'FK', 'UK', 'NULL'].includes(e)),
    )];
    return `Database schema with ${entities.length} entities: ${entities.join(', ')}. Defined via Mermaid ER diagram.`;
  } catch {
    return `Database schema defined. Mermaid ER diagram available.`;
  }
}

function summarizeFolderStructure(content: string): string {
  const lines = content.split('\n').filter(l => l.trim());
  const topLevel = lines
    .filter(l => {
      const depth = l.search(/\S/);
      return depth <= 2 && (l.includes('/') || l.includes('.'));
    })
    .map(l => l.trim().replace(/[├└│──\s]/g, '').replace(/\/$/, ''))
    .filter(Boolean)
    .slice(0, 12);
  return `Project structure with ${lines.length} entries. Top-level: ${topLevel.join(', ')}.`;
}

function summarizeTestingPlan(content: string): string {
  try {
    const parsed = YAML.parse(content);
    const testing = parsed?.testing ?? parsed;
    const parts = [
      `Strategy: ${testing?.strategy ?? 'standard'}`,
      `Coverage target: ${testing?.coverage_target ?? 'unspecified'}`,
      `Unit: ${testing?.unit?.framework ?? 'unspecified'}`,
      `Integration: ${testing?.integration?.framework ?? 'unspecified'}`,
      `E2E: ${testing?.e2e?.framework ?? 'none'}`,
      `CI: runs on ${testing?.ci?.run_on ?? 'every PR'}`,
    ];
    return parts.join('. ') + '.';
  } catch {
    return `Testing plan defined with unit, integration, and E2E strategies.`;
  }
}

// ─────────────────────────────────────────────
// LLM-based summarizer
// ─────────────────────────────────────────────

const SUMMARIZE_SYSTEM_PROMPT = `You are a technical documentation summarizer.
Summarize the following artifact in 100-200 words.
Focus on: key decisions, technologies chosen, architecture patterns, business entities, 
constraints, and dependencies.
This summary will be used as context for generating other software documentation artifacts,
so prioritize information that other artifacts need for consistency.
Do not include formatting instructions or meta-commentary.
Output only the summary text.`;

/**
 * Summarize an artifact using a lightweight LLM call.
 * Uses temperature 0.0 for deterministic output.
 * Max 300 completion tokens (~200 words).
 */
async function summarizeWithLLM(
  content: string,
  artifactType: ArtifactType,
  apiKey: string,
): Promise<string> {
  const config = createCallConfig(apiKey, 300, 0.0);
  const result = await callGroqRaw(
    config,
    [
      { role: 'system', content: SUMMARIZE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Artifact type: ${artifactType}\n\nContent:\n${content.slice(0, 4000)}`,
      },
    ],
    `summarize-${artifactType}`,
  );
  return result?.content?.trim() ?? `${artifactType} artifact generated.`;
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Generate a summary for an artifact.
 *
 * @param artifactType - The type of artifact being summarized
 * @param content - The full artifact content
 * @param apiKey - Groq API key (only needed for LLM-based summaries)
 * @returns Summary string (100-250 words)
 */
export async function summarizeArtifact(
  artifactType: ArtifactType,
  content: string,
  apiKey: string,
): Promise<string> {
  const strategy = STRATEGY_MAP[artifactType];

  if (strategy === 'deterministic') {
    switch (artifactType) {
      case 'config':
        return summarizeConfig(content);
      case 'docker':
        return summarizeDocker(content);
      case 'db':
        return summarizeDb(content);
      case 'folderStructure':
        return summarizeFolderStructure(content);
      case 'testingPlan':
        return summarizeTestingPlan(content);
      default:
        return `${artifactType} artifact generated.`;
    }
  }

  // LLM-based summarization
  return summarizeWithLLM(content, artifactType, apiKey);
}

/**
 * Check if an artifact type uses deterministic (free) summarization.
 */
export function isDeterministicSummary(artifactType: ArtifactType): boolean {
  return STRATEGY_MAP[artifactType] === 'deterministic';
}
