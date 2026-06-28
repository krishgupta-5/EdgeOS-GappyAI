import { getNotionClient } from './client';
import { markdownToBlocks } from './converter';
import type { ProjectState, ArtifactType } from '@/lib/pipeline/types';
import { parse } from 'yaml';
import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';

// ─────────────────────────────────────────────
// Retry Helper
// ─────────────────────────────────────────────

async function retryNotionCall<T>(apiCall: () => Promise<T>, maxRetries = 5): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (err: unknown) {
      const error = err as { status?: number, headers?: { get?: (key: string) => string | null } | Record<string, string | string[]> };
      if (error?.status === 429 && attempt < maxRetries - 1) {
        let retryAfter: string | null = null;
        const headers = error.headers;
        if (headers) {
          if ('get' in headers && typeof headers.get === 'function') {
            retryAfter = headers.get('retry-after');
          } else if ('retry-after' in headers && typeof (headers as Record<string, string>)['retry-after'] === 'string') {
            retryAfter = (headers as Record<string, string>)['retry-after'];
          }
        }
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

// ─────────────────────────────────────────────
// Artifact Content Formatters
// Pre-process raw Firebase data into well-structured
// markdown before passing to the Notion converter.
// ─────────────────────────────────────────────

/**
 * Format YAML config artifact into readable markdown with a parsed summary header.
 */
function formatConfigContent(rawYaml: string): string {
  const lines: string[] = [];
  lines.push('## System Configuration\n');

  try {
    const parsed = parse(rawYaml);
    if (parsed) {
      // Extract key summary fields
      if (parsed.systemName || parsed.name || parsed.projectName) {
        lines.push(`**Project Name:** ${parsed.systemName || parsed.name || parsed.projectName}\n`);
      }
      if (parsed.description || parsed.systemDescription) {
        lines.push(`**Description:** ${parsed.description || parsed.systemDescription}\n`);
      }

      // Tech stack summary
      const techStack = parsed.techStack || parsed.technologies || parsed.stack;
      if (techStack) {
        lines.push('### Technology Stack\n');
        if (Array.isArray(techStack)) {
          techStack.forEach((t: string) => lines.push(`- ${t}`));
        } else if (typeof techStack === 'object') {
          for (const [category, items] of Object.entries(techStack)) {
            lines.push(`**${category}:**`);
            if (Array.isArray(items)) {
              (items as string[]).forEach(item => lines.push(`- ${item}`));
            } else if (typeof items === 'string') {
              lines.push(`- ${items}`);
            }
          }
        }
        lines.push('');
      }

      // Database info
      if (parsed.database || parsed.db) {
        const db = parsed.database || parsed.db;
        lines.push('### Database\n');
        if (typeof db === 'string') {
          lines.push(`- **Type:** ${db}`);
        } else if (typeof db === 'object') {
          if (db.type) lines.push(`- **Type:** ${db.type}`);
          if (db.name) lines.push(`- **Name:** ${db.name}`);
          if (db.orm) lines.push(`- **ORM:** ${db.orm}`);
        }
        lines.push('');
      }

      // Architecture / deployment
      if (parsed.architecture) {
        lines.push(`### Architecture\n`);
        if (typeof parsed.architecture === 'string') {
          lines.push(parsed.architecture);
        } else if (typeof parsed.architecture === 'object') {
          for (const [key, value] of Object.entries(parsed.architecture)) {
            lines.push(`- **${key}:** ${value}`);
          }
        }
        lines.push('');
      }
    }
  } catch {
    // YAML parse failed — still show the raw content below
  }

  lines.push('### Full Configuration\n');
  lines.push('```yaml');
  lines.push(rawYaml.trim());
  lines.push('```');

  return lines.join('\n');
}

/**
 * Format Docker Compose YAML into readable markdown.
 */
function formatDockerContent(rawYaml: string): string {
  const lines: string[] = [];
  lines.push('## Docker Compose Configuration\n');

  try {
    const parsed = parse(rawYaml);
    if (parsed?.services) {
      const serviceNames = Object.keys(parsed.services);
      lines.push(`**Services:** ${serviceNames.join(', ')}\n`);

      lines.push('| Service | Image | Ports |');
      lines.push('| --- | --- | --- |');
      for (const [name, config] of Object.entries(parsed.services)) {
        const svc = config as Record<string, any>;
        const image = svc.image || svc.build || '—';
        const ports = Array.isArray(svc.ports) ? svc.ports.join(', ') : '—';
        lines.push(`| ${name} | \`${image}\` | ${ports} |`);
      }
      lines.push('');
    }
  } catch {
    // Parse failed — show raw content below
  }

  lines.push('### docker-compose.yaml\n');
  lines.push('```yaml');
  lines.push(rawYaml.trim());
  lines.push('```');

  return lines.join('\n');
}

/**
 * Format folder structure ASCII tree into a code block.
 */
function formatFolderStructureContent(rawTree: string): string {
  const lines: string[] = [];
  lines.push('## Project Directory Structure\n');
  lines.push('```');
  lines.push(rawTree.trim());
  lines.push('```');

  return lines.join('\n');
}

/**
 * Parse a Mermaid erDiagram string into structured entity & relationship data,
 * then format as Notion-friendly markdown (tables + lists).
 * Notion does NOT render mermaid code blocks, so we convert to native blocks.
 */
function parseMermaidErDiagram(mermaidStr: string): { entities: { name: string; attrs: { type: string; name: string; key: string }[] }[]; relationships: { from: string; to: string; label: string; cardinality: string }[] } {
  const entities: { name: string; attrs: { type: string; name: string; key: string }[] }[] = [];
  const relationships: { from: string; to: string; label: string; cardinality: string }[] = [];

  const rawLines = mermaidStr.replace(/\\n/g, '\n').split('\n');

  // Sanitize: merge split type/name lines (LLM puts type and name on separate lines)
  const KNOWN_TYPES = new Set(['int','integer','string','varchar','text','boolean','bool','float','double','decimal','datetime','date','timestamp','uuid','bigint','smallint','char','blob','json','enum','array','number','serial','bytea']);
  const lines: string[] = [];
  let sanitizeInEntity = false;
  for (let si = 0; si < rawLines.length; si++) {
    const st = rawLines[si].trim();
    if (st.match(/^\w+\s*\{$/)) { sanitizeInEntity = true; lines.push(rawLines[si]); continue; }
    if (st === '}') { sanitizeInEntity = false; lines.push(rawLines[si]); continue; }
    if (sanitizeInEntity && KNOWN_TYPES.has(st.toLowerCase())) {
      const nt = si + 1 < rawLines.length ? rawLines[si + 1].trim() : '';
      if (nt && nt !== '}' && !KNOWN_TYPES.has(nt.toLowerCase()) && !nt.match(/^\w+\s*\{$/)) {
        lines.push(`    ${st} ${nt}`);
        si++;
        continue;
      }
    }
    lines.push(rawLines[si]);
  }

  let currentEntity: { name: string; attrs: { type: string; name: string; key: string }[] } | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines, erDiagram keyword, direction directives, comments
    if (!line || line === 'erDiagram' || line.startsWith('direction') || line.startsWith('%%') || line.startsWith('#')) {
      continue;
    }

    // Entity opening: "ENTITY_NAME {"
    const entityOpen = line.match(/^(\w+)\s*\{$/);
    if (entityOpen) {
      currentEntity = { name: entityOpen[1], attrs: [] };
      continue;
    }

    // Entity closing: "}"
    if (line === '}') {
      if (currentEntity) {
        entities.push(currentEntity);
        currentEntity = null;
      }
      continue;
    }

    // Attribute line inside entity: "type name" or "type name PK/FK"
    if (currentEntity) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const type = parts[0];
        const name = parts[1];
        const key = parts.length >= 3 ? parts[2].toUpperCase() : '';
        currentEntity.attrs.push({ type, name, key: (key === 'PK' || key === 'FK') ? key : '' });
      }
      continue;
    }

    // Inline entity definition (single-line): "ENTITY { type1 name1 type2 name2 ... }"
    const inlineEntity = line.match(/^(\w+)\s*\{([^}]+)\}$/);
    if (inlineEntity) {
      const entName = inlineEntity[1];
      const body = inlineEntity[2].trim();
      const tokens = body.split(/\s+/);
      const attrs: { type: string; name: string; key: string }[] = [];
      let ti = 0;
      while (ti < tokens.length - 1) {
        const t = tokens[ti];
        const n = tokens[ti + 1];
        let k = '';
        if (ti + 2 < tokens.length && (tokens[ti + 2].toUpperCase() === 'PK' || tokens[ti + 2].toUpperCase() === 'FK')) {
          k = tokens[ti + 2].toUpperCase();
          ti += 3;
        } else {
          ti += 2;
        }
        attrs.push({ type: t, name: n, key: k });
      }
      entities.push({ name: entName, attrs });
      continue;
    }

    // Relationship line: "ENTITY1 ||--o{ ENTITY2 : "label""
    // Pattern: word  cardinality_symbols  word  :  label
    const relMatch = line.match(/^(\w+)\s+([|{}o\-\.]+)\s+(\w+)\s*:\s*["']?(.+?)["']?\s*$/);
    if (relMatch) {
      relationships.push({
        from: relMatch[1],
        cardinality: relMatch[2],
        to: relMatch[3],
        label: relMatch[4].replace(/"/g, ''),
      });
      continue;
    }
  }

  // If there was an unclosed entity, push it
  if (currentEntity) {
    entities.push(currentEntity);
  }

  return { entities, relationships };
}

/**
 * Regenerate clean, valid Mermaid ER code from parsed entities and relationships.
 */
function regenerateCleanMermaid(
  entities: { name: string; attrs: { type: string; name: string; key: string }[] }[],
  relationships: { from: string; to: string; label: string; cardinality: string }[]
): string {
  let code = 'erDiagram\n';
  for (const entity of entities) {
    code += `  ${entity.name} {\n`;
    for (const attr of entity.attrs) {
      code += `    ${attr.type} ${attr.name}`;
      if (attr.key) code += ` ${attr.key}`;
      code += '\n';
    }
    code += '  }\n';
  }
  for (const rel of relationships) {
    const card = /[|{}o]/.test(rel.cardinality) ? rel.cardinality : '||--o{';
    code += `  ${rel.from} ${card} ${rel.to} : "${rel.label}"\n`;
  }
  return code;
}

/**
 * Generate a mermaid.ink image URL from parsed ER data.
 * Returns null if entities are empty or URL would be too long.
 */
function getMermaidImageUrl(
  entities: { name: string; attrs: { type: string; name: string; key: string }[] }[],
  relationships: { from: string; to: string; label: string; cardinality: string }[]
): string | null {
  if (entities.length === 0) return null;
  const code = regenerateCleanMermaid(entities, relationships);
  const encoded = Buffer.from(code).toString('base64');
  const url = `https://mermaid.ink/img/${encoded}?bgColor=!18181B`;
  // URL length safety check (2000 char limit for some clients)
  if (url.length > 4000) return null;
  return url;
}

/**
 * Convert cardinality symbols to human-readable text.
 */
function describeCardinality(card: string): string {
  // Common patterns
  if (card.includes('||') && card.includes('o{')) return 'one-to-many';
  if (card.includes('}o') && card.includes('||')) return 'many-to-one';
  if (card.includes('}o') && card.includes('o{')) return 'many-to-many';
  if (card.includes('||') && card.includes('||')) return 'one-to-one';
  if (card.includes('|{')) return 'one-to-many';
  if (card.includes('}|')) return 'many-to-one';
  return card;
}

/**
 * Format database schema artifact. Handles both JSON with mermaid
 * and raw mermaid/SQL content.
 * Converts Mermaid ER diagrams into Notion-native tables & lists
 * since Notion does NOT render mermaid code blocks.
 */
function formatDbContent(rawContent: string): string {
  const lines: string[] = [];
  lines.push('## Database Schema\n');

  // Strip markdown code block wrapper if present
  let cleanContent = rawContent.trim();
  if (cleanContent.startsWith('```')) {
    const firstNewline = cleanContent.indexOf('\n');
    const lastBackticks = cleanContent.lastIndexOf('```');
    if (firstNewline !== -1 && lastBackticks > firstNewline) {
      cleanContent = cleanContent.substring(firstNewline + 1, lastBackticks).trim();
    }
  }

  // Helper to unescape newlines
  const unescapeNewlines = (str: string) => str.replace(/\\n/g, '\n').trim();

  /**
   * Given a raw mermaid ER string, produce formatted markdown with
   * tables for entities and a relationships section.
   */
  const formatErToNativeMarkdown = (mermaid: string): string => {
    const md: string[] = [];
    const { entities, relationships } = parseMermaidErDiagram(mermaid);

    if (entities.length === 0 && relationships.length === 0) {
      // Couldn't parse — fall back to plain text code block
      md.push('```');
      md.push(mermaid);
      md.push('```');
      return md.join('\n');
    }

    // Summary line
    md.push(`> **${entities.length}** tables · **${relationships.length}** relationships\n`);

    // ── ER Diagram Image via mermaid.ink ──
    const imageUrl = getMermaidImageUrl(entities, relationships);
    if (imageUrl) {
      md.push(`![Database ER Diagram](${imageUrl})\n`);
    }

    // ── Entity Tables ──
    if (entities.length > 0) {
      md.push('### 📋 Entity Definitions\n');

      for (const entity of entities) {
        md.push(`#### 🗂️ ${entity.name}\n`);

        if (entity.attrs.length > 0) {
          md.push('| Key | Field | Type |');
          md.push('| --- | --- | --- |');
          for (const attr of entity.attrs) {
            const keyBadge = attr.key === 'PK' ? '🔑 PK' : attr.key === 'FK' ? '🔗 FK' : '—';
            md.push(`| ${keyBadge} | **${attr.name}** | \`${attr.type}\` |`);
          }
        } else {
          md.push('*No attributes defined*');
        }
        md.push('');
      }
    }

    // ── Relationships ──
    if (relationships.length > 0) {
      md.push('---\n');
      md.push('### 🔗 Relationships\n');

      for (const rel of relationships) {
        const cardinality = describeCardinality(rel.cardinality);
        md.push(`- **${rel.from}** → **${rel.to}** : *${rel.label}* (${cardinality})`);
      }
      md.push('');
    }

    return md.join('\n');
  };

  // Try to parse as JSON first (the db artifact might contain { mermaid, diagram })
  try {
    const parsed = JSON.parse(cleanContent);
    if (parsed.mermaid || parsed.diagram) {
      if (parsed.mermaid) {
        const mermaid = unescapeNewlines(parsed.mermaid);
        lines.push(formatErToNativeMarkdown(mermaid));
      }
      if (parsed.diagram && parsed.diagram !== parsed.mermaid) {
        lines.push('### Schema Definition\n');
        lines.push('```sql');
        lines.push(unescapeNewlines(parsed.diagram));
        lines.push('```');
      }
      return lines.join('\n');
    }
  } catch {
    // If JSON parsing fails, try to extract via regex as a fallback
    const mermaidMatch = cleanContent.match(/"mermaid"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (mermaidMatch && mermaidMatch[1]) {
      const mermaid = unescapeNewlines(mermaidMatch[1]);
      lines.push(formatErToNativeMarkdown(mermaid));
      return lines.join('\n');
    }
  }

  // Check if content starts with mermaid syntax directly
  if (cleanContent.startsWith('erDiagram') || cleanContent.startsWith('classDiagram') || cleanContent.startsWith('graph ')) {
    lines.push(formatErToNativeMarkdown(cleanContent));
  } else if (cleanContent.toUpperCase().includes('CREATE TABLE') || cleanContent.toUpperCase().includes('ALTER TABLE')) {
    lines.push('### SQL Schema\n');
    lines.push('```sql');
    lines.push(cleanContent);
    lines.push('```');
  } else {
    // Fallback: wrap in a code block
    lines.push('```');
    lines.push(cleanContent);
    lines.push('```');
  }

  return lines.join('\n');
}


/**
 * Format artifact content based on its type.
 * Non-markdown artifacts get pre-processed into proper markdown
 * before being converted to Notion blocks.
 */
function formatArtifactContent(type: string, content: string): string {
  switch (type) {
    case 'config':
      return formatConfigContent(content);
    case 'docker':
      return formatDockerContent(content);
    case 'folderStructure':
      return formatFolderStructureContent(content);
    case 'db':
      return formatDbContent(content);
    default:
      // Markdown-based artifacts (README, API Design, User Stories, etc.)
      // pass through directly — the converter handles their markdown
      return content;
  }
}

// ─────────────────────────────────────────────
// Main Export Function
// ─────────────────────────────────────────────

export async function exportToNotion(
  state: ProjectState, 
  title: string, 
  accessToken: string, 
  rootPageId: string, 
  logSummary: any = {},
  onProgress?: (msg: string) => void
) {
  const startTime = Date.now();
  console.log(`[NOTION] Export Started`);
  onProgress?.('Initializing Notion export...');
  if (!rootPageId || !accessToken) {
    console.error('Notion credentials or root page ID missing.');
    return null;
  }

  const notion = getNotionClient(accessToken);

  try {
    const parentChildren: BlockObjectRequest[] = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: '📁 Project Overview' } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: `🏷️ Project Name: ${title || 'New Project'}` } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: `⏱️ Generation Timestamp: ${new Date().toISOString()}` } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: '🚀 Generated by EdgeOS' } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: `📄 Artifacts Count: ${Object.keys(state.artifacts).length}` } }] }
      }
    ];

    let hasTechStack = false;
    const configContent = state.artifacts.config?.content;
    if (configContent) {
      try {
        const parsed = parse(configContent);
        let techStackList: string[] = [];
        if (Array.isArray(parsed?.techStack)) techStackList = parsed.techStack;
        else if (Array.isArray(parsed?.technologies)) techStackList = parsed.technologies;
        else if (Array.isArray(parsed?.stack)) techStackList = parsed.stack;
        else if (parsed?.techStack && typeof parsed.techStack === 'object') {
           techStackList = Object.values(parsed.techStack).flat().filter(x => typeof x === 'string') as string[];
        }

        if (techStackList.length > 0) {
          parentChildren.push({
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ type: 'text', text: { content: '💻 Detected Tech Stack:' } }] }
          });
          techStackList.forEach((item: string) => {
            parentChildren.push({
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: { rich_text: [{ type: 'text', text: { content: String(item) } }] }
            });
          });
          hasTechStack = true;
        }
      } catch (err) {
        console.error("YAML Parse error", err);
      }
    }

    if (!hasTechStack) {
      parentChildren.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: '💻 Detected Tech Stack: Based on generated configuration.' } }] }
      });
    }

    parentChildren.push({
      object: 'block',
      type: 'divider',
      divider: {}
    });

    onProgress?.('Creating parent page...');
    let parentPage;
    try {
      parentPage = await retryNotionCall(() => notion.pages.create({
        parent: { page_id: rootPageId },
        properties: {
          title: {
            title: [
              {
                text: { content: `✨ ${title || 'New Project'}` }
              }
            ]
          }
        },
        children: parentChildren
      }));
    } catch (e: any) {
      if (e.code === 'object_not_found') {
        throw new Error('PARENT_PAGE_NOT_FOUND');
      }
      throw e;
    }

    const parentId = parentPage.id;
    const parentUrl = ('url' in parentPage && typeof parentPage.url === 'string') ? parentPage.url : `https://notion.so/${parentId.replace(/-/g, '')}`;

    const orderedTypes: ArtifactType[] = [
      'markdown', 'config', 'db', 'apiDesign', 'docker', 'folderStructure', 
      'testingPlan', 'userStories', 'roadmap', 'deploymentGuide', 
      'costEstimation', 'projectTimeline', 'riskAnalysis', 'finalMarkdown'
    ];

    const artifactMeta: Record<string, { name: string, emoji: string }> = {
      markdown: { name: 'README', emoji: '📘' },
      config: { name: 'Config', emoji: '⚙️' },
      db: { name: 'Database Schema', emoji: '🗄️' },
      apiDesign: { name: 'API Design', emoji: '🌐' },
      docker: { name: 'Docker', emoji: '🐳' },
      folderStructure: { name: 'Folder Structure', emoji: '📁' },
      testingPlan: { name: 'Testing Plan', emoji: '🧪' },
      userStories: { name: 'User Stories', emoji: '👥' },
      roadmap: { name: 'Roadmap', emoji: '🛣️' },
      deploymentGuide: { name: 'Deployment Guide', emoji: '🚀' },
      costEstimation: { name: 'Cost Estimation', emoji: '💰' },
      projectTimeline: { name: 'Timeline', emoji: '📅' },
      riskAnalysis: { name: 'Risk Analysis', emoji: '⚠️' },
      finalMarkdown: { name: 'Final Documentation', emoji: '📄' }
    };

    const artifactsToExport: { type: string; content: string }[] = [];
    
    for (const type of orderedTypes) {
      if (state.artifacts[type]?.content) {
        artifactsToExport.push({ type, content: state.artifacts[type].content });
      }
    }
    
    const exportedTypes = new Set(artifactsToExport.map(a => a.type));
    for (const [type, artifact] of Object.entries(state.artifacts)) {
      if (!exportedTypes.has(type) && artifact?.content) {
        artifactsToExport.push({ type, content: artifact.content });
      }
    }

    for (const { type, content } of artifactsToExport) {
      // Pre-process raw Firebase content into formatted markdown
      const formattedContent = formatArtifactContent(type, content);
      const allBlocks = markdownToBlocks(formattedContent);
      const firstChunk = allBlocks.slice(0, 100);

      const meta = artifactMeta[type] || { name: type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(), emoji: '📄' };
      onProgress?.(`Uploading ${meta.name}...`);

      try {
        const childPage = await retryNotionCall(() => notion.pages.create({
          parent: { page_id: parentId },
          properties: {
            title: {
              title: [{ text: { content: `${meta.emoji} ${meta.name}` } }]
            }
          },
          children: firstChunk
        }));

        let remaining = allBlocks.slice(100);
        while (remaining.length > 0) {
          const chunk = remaining.slice(0, 100);
          await retryNotionCall(() => notion.blocks.children.append({
            block_id: childPage.id,
            children: chunk
          }));
          remaining = remaining.slice(100);
        }
      } catch (err) {
        console.error(`Failed to export artifact ${type} to Notion:`, err);
      }
    }

    console.log(`[NOTION] Pages Created`);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[NOTION] Export Completed (${duration}s)`);
    logSummary.Notion = 'SUCCESS';
    onProgress?.('Documentation exported.');

    return { notionPageId: parentId, notionUrl: parentUrl };
  } catch (err) {
    console.error(`[NOTION] Export Failed:`, err);
    logSummary.Notion = 'FAILED';
    return null;
  }
}
