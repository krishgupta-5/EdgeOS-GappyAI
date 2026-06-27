/**
 * lib/pipeline/ArtifactValidator.ts
 * Validates generated artifact output before saving.
 *
 * Each artifact type has specific validation rules:
 * - Required sections/headings
 * - Required formatting (valid YAML, Markdown structure)
 * - Minimum content length
 * - No truncation
 *
 * Auto-fixes are applied where possible (stripping code fences, removing emoji).
 * Errors trigger retry with validation feedback appended to the prompt.
 */

import YAML from 'yaml';
import type { ArtifactType, ValidationRule, ValidationResult, ProjectState } from './types';

// ─────────────────────────────────────────────
// Common rules (applied to ALL artifacts)
// ─────────────────────────────────────────────

const COMMON_RULES: ValidationRule[] = [
  {
    description: 'Content is not empty',
    check: (c) => c.trim().length > 50,
    severity: 'error',
  },
  {
    description: 'No code fence wrappers',
    check: (c) => !c.trim().startsWith('```'),
    severity: 'warning', // Auto-fixed by stripping
  },
  {
    description: 'No emoji characters',
    check: (c) =>
      !/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(
        c,
      ),
    severity: 'warning', // Auto-fixed by removing
  },
];

// ─────────────────────────────────────────────
// Artifact-specific rules
// ─────────────────────────────────────────────

const ARTIFACT_RULES: Record<ArtifactType, ValidationRule[]> = {
  config: [
    {
      description: 'Contains required YAML root keys',
      check: (c) =>
        ['system:', 'backend:', 'database:', 'frontend:'].every((k) =>
          c.includes(k),
        ),
      severity: 'error',
    },
    {
      description: 'Valid YAML syntax',
      check: (c) => {
        try {
          YAML.parse(c);
          return true;
        } catch {
          return false;
        }
      },
      severity: 'error',
    },
  ],

  markdown: [
    {
      description: 'Contains H1 heading',
      check: (c) => /^#\s+\S/m.test(c),
      severity: 'error',
    },
    {
      description: 'Contains Project Summary section',
      check: (c) => /##\s+project\s+summary/i.test(c),
      severity: 'warning',
    },
    {
      description: 'Contains Core Features section',
      check: (c) => /##\s+core\s+features/i.test(c),
      severity: 'warning',
    },
    {
      description: 'Minimum word count (250)',
      check: (c) => c.split(/\s+/).length >= 250,
      severity: 'warning',
    },
  ],

  docker: [
    {
      description: 'Contains services key',
      check: (c) => c.includes('services:'),
      severity: 'error',
    },
    {
      description: 'Valid YAML syntax',
      check: (c) => {
        try {
          YAML.parse(c);
          return true;
        } catch {
          return false;
        }
      },
      severity: 'error',
    },
    {
      description: 'Contains at least one image declaration',
      check: (c) => /image:\s*\S+/i.test(c),
      severity: 'warning',
    },
  ],

  folderStructure: [
    {
      description: 'Contains directory-like entries',
      check: (c) => c.includes('/') || c.includes('├') || c.includes('└'),
      severity: 'error',
    },
    {
      description: 'Minimum 5 lines',
      check: (c) => c.split('\n').filter((l) => l.trim()).length >= 5,
      severity: 'warning',
    },
  ],

  apiDesign: [
    {
      description: 'Contains API overview section',
      check: (c) => /##\s+overview/i.test(c),
      severity: 'warning',
    },
    {
      description: 'Contains endpoint tables',
      check: (c) => /\|\s*Method\s*\|/i.test(c),
      severity: 'warning',
    },
    {
      description: 'Minimum word count (400)',
      check: (c) => c.split(/\s+/).length >= 400,
      severity: 'warning',
    },
  ],

  testingPlan: [
    {
      description: 'Contains testing root key',
      check: (c) => c.includes('testing:'),
      severity: 'error',
    },
    {
      description: 'Contains unit testing section',
      check: (c) => c.includes('unit:'),
      severity: 'warning',
    },
  ],

  userStories: [
    {
      description: 'Contains "As a" story format',
      check: (c) => /As a /i.test(c),
      severity: 'error',
    },
    {
      description: 'Contains at least 3 module headings',
      check: (c) => (c.match(/^##\s+/gm) ?? []).length >= 3,
      severity: 'warning',
    },
    {
      description: 'Minimum word count (300)',
      check: (c) => c.split(/\s+/).length >= 300,
      severity: 'warning',
    },
  ],

  roadmap: [
    {
      description: 'Contains Phase 1',
      check: (c) => /Phase\s+1/i.test(c),
      severity: 'error',
    },
    {
      description: 'Contains at least 3 phases',
      check: (c) => (c.match(/Phase\s+\d/gi) ?? []).length >= 3,
      severity: 'warning',
    },
    {
      description: 'Minimum word count (400)',
      check: (c) => c.split(/\s+/).length >= 400,
      severity: 'warning',
    },
  ],

  deploymentGuide: [
    {
      description: 'Contains Deployment heading',
      check: (c) => /deployment/i.test(c),
      severity: 'error',
    },
    {
      description: 'Contains Environment Variables section',
      check: (c) => /environment\s+variables/i.test(c),
      severity: 'warning',
    },
    {
      description: 'Minimum word count (500)',
      check: (c) => c.split(/\s+/).length >= 500,
      severity: 'warning',
    },
  ],

  costEstimation: [
    {
      description: 'Contains cost-related content',
      check: (c) => /\$|cost|budget|pricing/i.test(c),
      severity: 'error',
    },
    {
      description: 'Contains scaling section',
      check: (c) => /scaling|MVP|growth/i.test(c),
      severity: 'warning',
    },
    {
      description: 'Minimum word count (400)',
      check: (c) => c.split(/\s+/).length >= 400,
      severity: 'warning',
    },
  ],

  projectTimeline: [
    {
      description: 'Contains timeline phases',
      check: (c) => /Phase\s+\d/i.test(c),
      severity: 'error',
    },
    {
      description: 'Contains duration estimates',
      check: (c) => /week|month|day/i.test(c),
      severity: 'warning',
    },
    {
      description: 'Minimum word count (400)',
      check: (c) => c.split(/\s+/).length >= 400,
      severity: 'warning',
    },
  ],

  riskAnalysis: [
    {
      description: 'Contains risk categories',
      check: (c) => /risk/i.test(c),
      severity: 'error',
    },
    {
      description: 'Contains Risk Severity Matrix',
      check: (c) => /severity\s+matrix|priority/i.test(c),
      severity: 'warning',
    },
    {
      description: 'Minimum word count (400)',
      check: (c) => c.split(/\s+/).length >= 400,
      severity: 'warning',
    },
  ],

  finalMarkdown: [
    {
      description: 'Contains major specification sections',
      check: (c) => {
        const required = [
          'Executive Summary',
          'Technology Stack',
          'Architecture',
          'API Design',
        ];
        return (
          required.filter((s) =>
            c.toLowerCase().includes(s.toLowerCase()),
          ).length >= 3
        );
      },
      severity: 'warning',
    },
    {
      description: 'Minimum word count (800)',
      check: (c) => c.split(/\s+/).length >= 800,
      severity: 'warning',
    },
  ],

  db: [], // DB uses external webhook — no LLM validation needed
};

// ─────────────────────────────────────────────
// Auto-fix functions
// ─────────────────────────────────────────────

function stripCodeFences(content: string): string {
  return content
    .replace(/^```(?:yaml|yml|json|markdown|md|dockerfile)?\s*/gim, '')
    .replace(/^```\s*/gim, '')
    .replace(/```\s*$/gim, '')
    .trim();
}

function removeEmoji(content: string): string {
  return content.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    '',
  );
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Validate an artifact's output and apply auto-fixes.
 *
 * @param artifactType - The type of artifact being validated
 * @param content - Raw content from Groq
 * @returns ValidationResult with pass/fail, errors, warnings, and fixed content
 */
export function validateArtifact(
  artifactType: ArtifactType,
  content: string,
  state?: ProjectState,
): ValidationResult {
  const rules = [...COMMON_RULES, ...(ARTIFACT_RULES[artifactType] ?? [])];
  const errors: string[] = [];
  const warnings: string[] = [];
  const autoFixes: string[] = [];

  // Apply auto-fixes first
  let fixedContent = content;

  if (fixedContent.trim().startsWith('```')) {
    fixedContent = stripCodeFences(fixedContent);
    autoFixes.push('Stripped code fences');
  }

  if (
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(
      fixedContent,
    )
  ) {
    fixedContent = removeEmoji(fixedContent);
    autoFixes.push('Removed emoji characters');
  }

  // Run validation rules on the fixed content
  for (const rule of rules) {
    if (!rule.check(fixedContent)) {
      if (rule.severity === 'error') {
        errors.push(rule.description);
      } else {
        warnings.push(rule.description);
      }
    }
  }

  // Programmatic Cross-Artifact Consistency Checks
  if (state && state.artifacts.config?.content) {
    const configRaw = state.artifacts.config.content.toLowerCase();
    const contentLower = fixedContent.toLowerCase();

    // 1. Database Consistency
    if (artifactType === 'docker' || artifactType === 'deploymentGuide') {
      if (configRaw.includes('postgres') && !contentLower.includes('postgres')) {
        errors.push('Database consistency mismatch: config specifies PostgreSQL but it is missing here.');
      }
      if (configRaw.includes('mongo') && !contentLower.includes('mongo')) {
        errors.push('Database consistency mismatch: config specifies MongoDB but it is missing here.');
      }
    }

    // 2. Authentication Consistency
    if (artifactType === 'apiDesign' || artifactType === 'deploymentGuide') {
      if (configRaw.includes('authentication: none') || configRaw.includes('strategy: none')) {
        if (contentLower.includes('jwt') || contentLower.includes('oauth') || contentLower.includes('bearer')) {
          errors.push('Authentication consistency mismatch: config specifies no authentication, but auth headers/logic were found.');
        }
      }
    }

    // 3. Cloud Infrastructure Consistency
    if (artifactType === 'deploymentGuide') {
      const deployLine = configRaw.split('\n').find(l => l.includes('deployment:')) || '';
      if (!deployLine.includes('aws') && !deployLine.includes('amazon')) {
        if (contentLower.includes('route53') || contentLower.includes('cloudwatch') || contentLower.includes('elastic beanstalk')) {
          errors.push('Infrastructure mismatch: Do not invent AWS infrastructure unless specified in config.');
        }
      }
      
      // Semantic validation for Deployment Contradictions
      if ((configRaw.includes('frontend: none') || contentLower.includes('frontend not applicable')) &&
          (contentLower.includes('npm run') || contentLower.includes('localhost:3000') || contentLower.includes('yarn start'))) {
        errors.push('Semantic contradiction: Config specifies no frontend, but frontend-specific commands (e.g. npm run, localhost:3000) are present in the Deployment Guide.');
      }
    }

    // 4. Timeline Consistency
    if (artifactType === 'projectTimeline' && state.artifacts.roadmap?.content) {
      const getPhaseTotal = (text: string) => {
        const phaseLines = text.split('\n').filter(l => /phase/i.test(l));
        let total = 0;
        for (const line of phaseLines) {
          const match = line.match(/(\d+)\s+weeks?/i);
          if (match) total += parseInt(match[1], 10);
        }
        return total;
      };

      const roadmapTotal = getPhaseTotal(state.artifacts.roadmap.content);
      const timelineTotal = getPhaseTotal(fixedContent);
      
      if (roadmapTotal > 0 && timelineTotal > 0 && roadmapTotal > timelineTotal) {
        warnings.push(`Timeline consistency mismatch: Roadmap phases total ${roadmapTotal} weeks, which exceeds the Timeline estimate of ${timelineTotal} weeks.`);
      }
    }

    // 5. Final Markdown Compiler Validation
    if (artifactType === 'finalMarkdown') {
      const techKeywords = ['redis', 'kafka', 'graphql', 'grpc', 'mysql', 'rabbitmq', 'mongodb', 'kubernetes', 'elasticsearch'];
      for (const tech of techKeywords) {
        if (contentLower.includes(tech) && !configRaw.includes(tech)) {
          errors.push(`Compiler error: Final Markdown invents technology '${tech}' that was not specified in the system configuration.`);
        }
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    autoFixes,
    fixedContent,
  };
}

/**
 * Build a retry prompt that includes validation failure feedback.
 * Appended to the original user message on retry.
 *
 * @param validationErrors - List of error descriptions from the failed validation
 * @returns Additional instruction text for the retry attempt
 */
export function buildValidationRetryInstructions(
  validationErrors: string[],
): string {
  return `\n\nIMPORTANT: Your previous response failed validation with these errors:\n${validationErrors.map((e) => `- ${e}`).join('\n')}\n\nPlease regenerate the complete artifact addressing these issues. Ensure all required sections are present and the output is complete.`;
}

/**
 * Maximum number of retry attempts for validation failures.
 */
export const MAX_VALIDATION_RETRIES = 1;
