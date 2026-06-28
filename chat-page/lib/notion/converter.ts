import { BlockObjectRequest, RichTextItemRequest } from '@notionhq/client/build/src/api-endpoints';

// ─────────────────────────────────────────────
// Rich Text Parsing — inline markdown → Notion annotations
// ─────────────────────────────────────────────

/**
 * Parse inline markdown formatting into Notion rich_text items.
 * Supports: **bold**, *italic*, `code`, [links](url), ~~strikethrough~~
 */
function parseInlineMarkdown(text: string): RichTextItemRequest[] {
  if (!text) return [{ type: 'text', text: { content: '' } }];

  const items: RichTextItemRequest[] = [];

  // Regex to match inline formatting tokens
  // Order matters: longer/greedy patterns first
  const inlineRegex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|~~(.+?)~~|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Push plain text before this match
    if (match.index > lastIndex) {
      const plain = text.substring(lastIndex, match.index);
      if (plain) {
        items.push(...splitRichText(plain, {}));
      }
    }

    if (match[2]) {
      // ***bold italic***
      items.push(...splitRichText(match[2], { bold: true, italic: true }));
    } else if (match[3]) {
      // **bold**
      items.push(...splitRichText(match[3], { bold: true }));
    } else if (match[4]) {
      // *italic*
      items.push(...splitRichText(match[4], { italic: true }));
    } else if (match[5]) {
      // _italic_
      items.push(...splitRichText(match[5], { italic: true }));
    } else if (match[6]) {
      // ~~strikethrough~~
      items.push(...splitRichText(match[6], { strikethrough: true }));
    } else if (match[7]) {
      // `inline code`
      items.push(...splitRichText(match[7], { code: true }));
    } else if (match[8] && match[9]) {
      // [link text](url)
      items.push(...splitRichText(match[8], {}, match[9]));
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining) {
      items.push(...splitRichText(remaining, {}));
    }
  }

  return items.length > 0 ? items : [{ type: 'text', text: { content: text } }];
}

/**
 * Split text into chunks of max 2000 chars (Notion limit) with annotations.
 */
function splitRichText(
  text: string,
  annotations: { bold?: boolean; italic?: boolean; strikethrough?: boolean; code?: boolean },
  linkUrl?: string
): RichTextItemRequest[] {
  const items: RichTextItemRequest[] = [];
  for (let i = 0; i < text.length; i += 2000) {
    const chunk = text.substring(i, i + 2000);
    const item: RichTextItemRequest = {
      type: 'text',
      text: {
        content: chunk,
        ...(linkUrl ? { link: { url: linkUrl } } : {}),
      },
      ...(Object.keys(annotations).length > 0 ? { annotations } : {}),
    } as RichTextItemRequest;
    items.push(item);
  }
  return items;
}

// ─────────────────────────────────────────────
// Block Creation Helpers
// ─────────────────────────────────────────────

type TextBlockType = 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3' | 'quote' | 'bulleted_list_item' | 'numbered_list_item';

function createRichTextBlock(richText: RichTextItemRequest[], type: TextBlockType): BlockObjectRequest {
  return {
    object: 'block',
    type: type,
    [type]: { rich_text: richText },
  } as unknown as BlockObjectRequest;
}

function createTextBlocks(text: string, type: TextBlockType): BlockObjectRequest[] {
  if (!text) {
    return [{
      object: 'block',
      type: type,
      [type]: { rich_text: [{ type: 'text', text: { content: '' } }] }
    } as unknown as BlockObjectRequest];
  }

  // Parse inline markdown for rich formatting
  const richText = parseInlineMarkdown(text);

  // Split into chunks if rich text array is very large
  // Each block can have at most ~100 rich_text items
  const blocks: BlockObjectRequest[] = [];
  for (let i = 0; i < richText.length; i += 90) {
    const chunk = richText.slice(i, i + 90);
    blocks.push(createRichTextBlock(chunk, type));
  }

  return blocks.length > 0 ? blocks : [createRichTextBlock(richText, type)];
}

function createCodeBlocks(text: string, language: string): BlockObjectRequest[] {
  if (!text) {
    return [{
      object: 'block',
      type: 'code',
      code: { rich_text: [{ type: 'text', text: { content: '' } }], language: language as 'plain text' }
    }];
  }

  const richTextItems: RichTextItemRequest[] = [];
  for (let i = 0; i < text.length; i += 2000) {
    richTextItems.push({
      type: 'text',
      text: { content: text.substring(i, i + 2000) }
    });
  }

  const blocks: BlockObjectRequest[] = [];
  for (let i = 0; i < richTextItems.length; i += 100) {
    blocks.push({
      object: 'block',
      type: 'code',
      code: {
        rich_text: richTextItems.slice(i, i + 100),
        language: language as 'plain text'
      }
    });
  }
  return blocks;
}

function createTodoBlock(text: string, checked: boolean): BlockObjectRequest {
  const richText = parseInlineMarkdown(text);
  return {
    object: 'block',
    type: 'to_do',
    to_do: {
      rich_text: richText,
      checked: checked,
    },
  } as unknown as BlockObjectRequest;
}

function createCalloutBlock(text: string, emoji: string = '💡'): BlockObjectRequest {
  const richText = parseInlineMarkdown(text);
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: richText,
      icon: { type: 'emoji', emoji: emoji as any },
    },
  } as unknown as BlockObjectRequest;
}

// ─────────────────────────────────────────────
// Table Parsing
// ─────────────────────────────────────────────

function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  // Matches: |---|---|---| or | --- | --- | or |:---:|:---|---:|
  return /^\|[\s\-:]+(\|[\s\-:]+)+\|?\s*$/.test(trimmed);
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim();
  // Remove leading and trailing pipes
  const inner = trimmed.startsWith('|') ? trimmed.substring(1) : trimmed;
  const final = inner.endsWith('|') ? inner.substring(0, inner.length - 1) : inner;
  return final.split('|').map(cell => cell.trim());
}

function createTableBlock(rows: string[][]): BlockObjectRequest[] {
  if (rows.length === 0) return [];

  const columnCount = Math.max(...rows.map(r => r.length));

  // Normalize all rows to have the same column count
  const normalizedRows = rows.map(row => {
    while (row.length < columnCount) row.push('');
    return row.slice(0, columnCount);
  });

  const tableRows = normalizedRows.map(row => ({
    type: 'table_row' as const,
    table_row: {
      cells: row.map(cell => parseInlineMarkdown(cell)),
    },
  }));

  return [{
    object: 'block',
    type: 'table',
    table: {
      table_width: columnCount,
      has_column_header: true,
      has_row_header: false,
      children: tableRows,
    },
  } as unknown as BlockObjectRequest];
}

// ─────────────────────────────────────────────
// Main Converter
// ─────────────────────────────────────────────

const VALID_CODE_LANGS = [
  'abap', 'arduino', 'bash', 'basic', 'c', 'c++', 'c#', 'css', 'dart', 'docker',
  'elixir', 'elm', 'erlang', 'flow', 'fortran', 'f#', 'gherkin', 'glsl', 'go',
  'graphql', 'groovy', 'haskell', 'html', 'java', 'javascript', 'json', 'julia',
  'kotlin', 'latex', 'less', 'lisp', 'livescript', 'lua', 'makefile', 'markdown',
  'markup', 'matlab', 'mermaid', 'nix', 'objective-c', 'ocaml', 'pascal', 'perl',
  'php', 'plain text', 'powershell', 'prolog', 'protobuf', 'python', 'r', 'reason',
  'ruby', 'rust', 'sass', 'scala', 'scheme', 'scss', 'shell', 'sql', 'swift',
  'typescript', 'vb.net', 'verilog', 'vhdl', 'visual basic', 'webassembly', 'xml', 'yaml',
];

export function markdownToBlocks(markdown: string): BlockObjectRequest[] {
  if (!markdown) return [];

  // Strip outer ```markdown ... ``` wrapper if the LLM wrapped the entire response
  let processedMarkdown = markdown.trim();
  if (processedMarkdown.startsWith('```')) {
    const firstLineEnd = processedMarkdown.indexOf('\n');
    if (firstLineEnd !== -1) {
      const firstLine = processedMarkdown.substring(0, firstLineEnd).trim();
      // If it starts with a codeblock marker and ends with one
      if (firstLine.match(/^```[a-zA-Z]*$/) && processedMarkdown.endsWith('```')) {
        processedMarkdown = processedMarkdown.substring(firstLineEnd + 1, processedMarkdown.length - 3).trim();
      }
    }
  }

  const blocks: BlockObjectRequest[] = [];
  const lines = processedMarkdown.split('\n');

  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLang = 'plain text';
  let currentParagraph: string[] = [];

  // Table accumulator
  let tableRows: string[][] = [];
  let inTable = false;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n');
      blocks.push(...createTextBlocks(text, 'paragraph'));
      currentParagraph = [];
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      blocks.push(...createTableBlock(tableRows));
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── Code Block Handling ──
    if (inCodeBlock) {
      if (trimmed.startsWith('```')) {
        blocks.push(...createCodeBlocks(codeContent.join('\n'), codeLang));
        inCodeBlock = false;
        codeContent = [];
      } else {
        codeContent.push(line);
      }
      continue;
    }

    if (trimmed.startsWith('```')) {
      flushParagraph();
      flushTable();
      inCodeBlock = true;
      let lang = trimmed.substring(3).trim().toLowerCase();
      if (!VALID_CODE_LANGS.includes(lang)) {
        lang = 'plain text';
      }
      codeLang = lang;
      continue;
    }

    // ── Table Handling ──
    if (trimmed.startsWith('|') && trimmed.includes('|', 1)) {
      if (isTableSeparatorRow(trimmed)) {
        // This is the separator row (| --- | --- |), skip it but mark we're in a table
        inTable = true;
        continue;
      }

      if (!inTable && tableRows.length === 0) {
        // This could be the header row — start accumulating
        flushParagraph();
      }
      inTable = true;
      tableRows.push(parseTableRow(trimmed));
      continue;
    } else if (inTable) {
      // We were in a table but this line isn't a table row — flush
      flushTable();
    }

    // ── Dividers ──
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      blocks.push({ object: 'block', type: 'divider', divider: {} });
      continue;
    }

    // ── Headings ──
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      blocks.push(...createTextBlocks(trimmed.substring(2), 'heading_1'));
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      blocks.push(...createTextBlocks(trimmed.substring(3), 'heading_2'));
      continue;
    }

    if (trimmed.startsWith('### ') || trimmed.startsWith('#### ') || trimmed.startsWith('##### ') || trimmed.startsWith('###### ')) {
      flushParagraph();
      const content = trimmed.replace(/^#+\s+/, '');
      blocks.push(...createTextBlocks(content, 'heading_3'));
      continue;
    }

    // ── Blockquotes ──
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      const quoteContent = trimmed.substring(2);

      // Check for callout syntax: > [!NOTE], > [!TIP], > [!WARNING], etc.
      const calloutMatch = quoteContent.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i);
      if (calloutMatch) {
        const calloutType = calloutMatch[1].toUpperCase();
        const calloutText = calloutMatch[2] || '';
        const emojiMap: Record<string, string> = {
          'NOTE': 'ℹ️', 'TIP': '💡', 'IMPORTANT': '❗',
          'WARNING': '⚠️', 'CAUTION': '🔴',
        };
        // Collect subsequent quote lines
        let fullText = calloutText;
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
          i++;
          fullText += '\n' + lines[i].trim().substring(2);
        }
        blocks.push(createCalloutBlock(
          fullText || calloutType,
          emojiMap[calloutType] || '💡'
        ));
      } else {
        blocks.push(...createTextBlocks(quoteContent, 'quote'));
      }
      continue;
    }

    // ── Checkboxes / Todos ──
    if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
      flushParagraph();
      blocks.push(createTodoBlock(trimmed.substring(6), true));
      continue;
    }

    if (trimmed.startsWith('- [ ] ')) {
      flushParagraph();
      blocks.push(createTodoBlock(trimmed.substring(6), false));
      continue;
    }

    // ── Bulleted Lists ──
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      blocks.push(...createTextBlocks(trimmed.substring(2), 'bulleted_list_item'));
      continue;
    }

    // ── Indented list items (sub-bullets) — render as regular bulleted items
    if (/^\s+([-*])\s+/.test(line)) {
      flushParagraph();
      const content = line.replace(/^\s+[-*]\s+/, '');
      blocks.push(...createTextBlocks(content, 'bulleted_list_item'));
      continue;
    }

    // ── Numbered Lists ──
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      flushParagraph();
      blocks.push(...createTextBlocks(numberedMatch[2], 'numbered_list_item'));
      continue;
    }

    // ── Image references → Notion image blocks ──
    if (trimmed.startsWith('![')) {
      flushParagraph();
      const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        blocks.push({
          object: 'block',
          type: 'image',
          image: {
            type: 'external',
            external: { url: imgMatch[2] },
            ...(imgMatch[1] ? { caption: parseInlineMarkdown(imgMatch[1]) } : {}),
          },
        } as unknown as BlockObjectRequest);
      }
      continue;
    }

    // ── Blank lines ──
    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    // ── Regular paragraph text ──
    currentParagraph.push(trimmed);
  }

  // Flush any remaining state
  flushParagraph();
  flushTable();

  if (inCodeBlock) {
    blocks.push(...createCodeBlocks(codeContent.join('\n'), codeLang));
  }

  return blocks;
}
