/**
 * lib/pipeline/GroqClient.ts
 * Groq API client with retry, rate-limiting, timeout, and truncation detection.
 *
 * Extracted from route.ts callGroq() and callGroqRaw().
 * This is the ONLY module that communicates with the Groq API.
 */

import {
  type ArtifactType,
  type GroqMessage,
  type GroqResponse,
  type GroqCallConfig,
  DEFAULT_MODEL,
  MAX_RETRIES,
  REQUEST_TIMEOUT_MS,
} from './types';

// ─────────────────────────────────────────────
// Logger (matches existing log format)
// ─────────────────────────────────────────────

const log = {
  info: (msg: string, meta?: object, key?: string) =>
    console.log(
      JSON.stringify({
        level: 'info',
        msg,
        ...meta,
        key: key?.slice(0, 8),
        ts: Date.now(),
      }),
    ),
  warn: (msg: string, meta?: object, key?: string) =>
    console.warn(
      JSON.stringify({
        level: 'warn',
        msg,
        ...meta,
        key: key?.slice(0, 8),
        ts: Date.now(),
      }),
    ),
  error: (msg: string, meta?: object, key?: string) =>
    console.error(
      JSON.stringify({
        level: 'error',
        msg,
        ...meta,
        key: key?.slice(0, 8),
        ts: Date.now(),
      }),
    ),
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`Timeout ${ms}ms`)), ms),
    ),
  ]);
}

// ─────────────────────────────────────────────
// Output cleaning
// ─────────────────────────────────────────────

/**
 * Strip code fences from LLM output.
 */
export function stripFences(text: string): string {
  return text
    .replace(/^```(?:yaml|yml|json|markdown|md|dockerfile)?\s*/gim, '')
    .replace(/^```\s*/gim, '')
    .replace(/```\s*$/gim, '')
    .trim();
}

/**
 * Extract the YAML block from a response that may contain preamble.
 */
export function extractYamlBlock(text: string): string {
  const lines = text.split('\n');
  const keys =
    /^(system|backend|frontend|database|auth|infra|version|services|api_design|testing):/;
  const start = lines.findIndex((l) => keys.test(l.trim()));
  return start >= 0 ? lines.slice(start).join('\n').trim() : text.trim();
}

/**
 * Detect if output was truncated mid-generation.
 */
export function isTruncated(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const lines = trimmed.split('\n');
  if (lines.length < 5) return true;
  const last = lines[lines.length - 1].trim();
  const safe = [
    /^[a-z_]+:$/,
    /^\s*retries:\s*\d+$/,
    /^\s*timeout:\s*\S+$/,
    /^\s*interval:\s*\S+$/,
    /^\s*- \S+/,
    /^\s*volumes:$/,
    /^\s*depends_on:$/,
  ];
  if (safe.some((re) => re.test(last))) return false;
  if (/^[a-zA-Z_-]+:$/.test(last) && lines.length < 20) return true;
  if (last === '-') return true;
  return false;
}

// ─────────────────────────────────────────────
// API Key Resolution
// ─────────────────────────────────────────────

/**
 * Resolve the API key for a given artifact type.
 * Falls back to the default GROQ_API_KEY if no specific key is set.
 */
export function getApiKey(artifact: ArtifactType | 'initial', fallback: string): string {
  const map: Partial<Record<ArtifactType | 'initial', string | undefined>> = {
    config: process.env.GROQ_API_KEY_CONFIG,
    docker: process.env.GROQ_API_KEY_DOCKER,
    markdown: process.env.GROQ_API_KEY_MARKDOWN,
    folderStructure: process.env.GROQ_API_KEY_FOLDERSTRUCTURE,
    apiDesign: process.env.GROQ_API_KEY_APIDESIGN,
    testingPlan: process.env.GROQ_API_KEY_TESTINGPLAN,
    userStories: process.env.GROQ_API_KEY_USERSTORIES,
    roadmap: process.env.GROQ_API_KEY_ROADMAP,
    deploymentGuide: process.env.GROQ_API_KEY_DEPLOYMENTGUIDE,
    costEstimation: process.env.GROQ_API_KEY_COSTESTIMATION,
    projectTimeline: process.env.GROQ_API_KEY_PROJECTTIMELINE,
    riskAnalysis: process.env.GROQ_API_KEY_RISKANALYSIS,
    finalMarkdown: process.env.GROQ_API_KEY_FINALMARKDOWN,
    initial: process.env.GROQ_API_KEY_CONFIG,
  };
  return map[artifact] || fallback;
}

// ─────────────────────────────────────────────
// Groq API Client
// ─────────────────────────────────────────────

/**
 * Call the Groq API with retry, rate-limit handling, and truncation detection.
 *
 * For YAML artifacts (config, docker, testingPlan), the response is processed
 * through extractYamlBlock + stripFences.
 *
 * For raw artifacts (markdown, apiDesign, etc.), the response is returned as-is.
 *
 * @param config - API call configuration
 * @param messages - Chat messages to send
 * @param label - Human-readable label for logging
 * @param processOutput - Whether to process output through YAML extraction
 * @returns GroqResponse with content and usage, or null on failure
 */
export async function callGroq(
  config: GroqCallConfig,
  messages: GroqMessage[],
  label: string,
  processOutput: boolean = true,
): Promise<GroqResponse | null> {
  return callGroqInternal(config, messages, label, processOutput, 0);
}

/**
 * Call the Groq API without output processing (raw mode).
 * Convenience wrapper around callGroq with processOutput=false.
 */
export async function callGroqRaw(
  config: GroqCallConfig,
  messages: GroqMessage[],
  label: string,
): Promise<GroqResponse | null> {
  return callGroq(config, messages, label, false);
}

/**
 * Create a GroqCallConfig with sensible defaults.
 */
export function createCallConfig(
  apiKey: string,
  maxTokens: number,
  temperature: number = 0.1,
  options?: {
    model?: string;
    stopTokens?: string[];
    timeoutMs?: number;
    topP?: number;
  },
): GroqCallConfig {
  return {
    apiKey,
    model: options?.model ?? DEFAULT_MODEL,
    // Cap maxTokens to 4096 to prevent 413 Payload Too Large errors (8192 context - 3500 input)
    maxTokens: Math.min(maxTokens, 4096),
    temperature,
    topP: options?.topP ?? 0.9,
    stopTokens: options?.stopTokens,
    timeoutMs: options?.timeoutMs ?? REQUEST_TIMEOUT_MS,
  };
}

// ─────────────────────────────────────────────
// Internal implementation
// ─────────────────────────────────────────────

async function callGroqInternal(
  config: GroqCallConfig,
  messages: GroqMessage[],
  label: string,
  processOutput: boolean,
  attempt: number,
): Promise<GroqResponse | null> {
  for (let i = attempt; i <= MAX_RETRIES; i++) {
    try {
      // Estimate prompt tokens (approx 3.5 chars per token)
      const estimatedPromptTokens = messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 3.5), 0);
      // Hard cap to prevent 413 Payload Too Large on Dev Tier (6000 TPM limit)
      // The API rejects any request where (promptTokens + max_tokens) > 6000 TPM
      const safeMaxTokens = Math.max(200, 5900 - estimatedPromptTokens);
      const finalMaxTokens = Math.min(config.maxTokens, safeMaxTokens);

      const res = await withTimeout(
        fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            messages,
            temperature: config.temperature,
            max_tokens: finalMaxTokens,
            top_p: config.topP,
            ...(config.stopTokens?.length ? { stop: config.stopTokens } : {}),
          }),
        }),
        config.timeoutMs,
      );

      // Rate limited
      if (res.status === 429) {
        const wait =
          parseFloat(res.headers.get('retry-after') ?? '') * 1000 ||
          Math.pow(2, i) * 3000;
        log.warn('Rate limited', { label, attempt: i, wait }, config.apiKey);
        if (i < MAX_RETRIES) {
          await sleep(wait);
          continue;
        }
        return null;
      }

      // Other errors
      if (!res.ok) {
        log.error('Groq error', { label, status: res.status }, config.apiKey);
        return null;
      }

      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content ?? '';
      const usage = data?.usage ?? {};

      // Process output
      const content = processOutput
        ? extractYamlBlock(stripFences(raw))
        : raw;

      // Check for truncation (only for processed outputs)
      if (processOutput && isTruncated(content) && i < MAX_RETRIES) {
        log.warn('Truncated, retrying', { label, attempt: i }, config.apiKey);
        return callGroqInternal(
          { ...config, maxTokens: Math.ceil(config.maxTokens * 1.25) },
          messages,
          label,
          processOutput,
          i + 1,
        );
      }

      log.info('Groq OK', { label, tokens: usage.total_tokens ?? 0 }, config.apiKey);

      return {
        content,
        usage: {
          promptTokens: usage.prompt_tokens ?? 0,
          completionTokens: usage.completion_tokens ?? 0,
          totalTokens: usage.total_tokens ?? 0,
        },
        model: data?.model ?? config.model,
        retryCount: i,
      };
    } catch (err) {
      log.error(
        'Groq fetch error',
        { label, attempt: i, err: String(err) },
        config.apiKey,
      );
      if (i < MAX_RETRIES) {
        await sleep(Math.pow(2, i) * 2000);
        continue;
      }
      return null;
    }
  }
  return null;
}
