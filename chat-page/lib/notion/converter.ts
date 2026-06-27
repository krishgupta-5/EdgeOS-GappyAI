import { BlockObjectRequest, RichTextItemRequest } from '@notionhq/client/build/src/api-endpoints';

type TextBlockType = 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3' | 'quote' | 'bulleted_list_item' | 'numbered_list_item';

function createTextBlocks(text: string, type: TextBlockType): BlockObjectRequest[] {
  if (!text) {
    return [{
      object: 'block',
      type: type,
      [type]: { rich_text: [{ type: 'text', text: { content: '' } }] }
    } as unknown as BlockObjectRequest];
  }
  
  const blocks: BlockObjectRequest[] = [];
  for (let i = 0; i < text.length; i += 2000) {
    blocks.push({
      object: 'block',
      type: type,
      [type]: { rich_text: [{ type: 'text', text: { content: text.substring(i, i + 2000) } }] }
    } as unknown as BlockObjectRequest);
  }
  return blocks;
}

function createCodeBlocks(text: string, language: string): BlockObjectRequest[] {
  if (!text) {
    return [{
      object: 'block',
      type: 'code',
      code: { rich_text: [{ type: 'text', text: { content: '' } }], language: language as 'plain text' }
    }];
  }
  
  const blocks: BlockObjectRequest[] = [];
  for (let i = 0; i < text.length; i += 2000) {
    blocks.push({
      object: 'block',
      type: 'code',
      code: { rich_text: [{ type: 'text', text: { content: text.substring(i, i + 2000) } }], language: language as 'plain text' }
    });
  }
  return blocks;
}

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

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n');
      blocks.push(...createTextBlocks(text, 'paragraph'));
      currentParagraph = [];
    }
  };

  const validLangs = [
    'abap', 'arduino', 'bash', 'basic', 'c', 'c++', 'c#', 'css', 'dart', 'docker', 'elixir', 'elm', 'erlang', 'flow', 'fortran', 'f#', 'gherkin', 'glsl', 'go', 'graphql', 'groovy', 'haskell', 'html', 'java', 'javascript', 'json', 'julia', 'kotlin', 'latex', 'less', 'lisp', 'livescript', 'lua', 'makefile', 'markdown', 'markup', 'matlab', 'mermaid', 'nix', 'objective-c', 'ocaml', 'pascal', 'perl', 'php', 'plain text', 'powershell', 'prolog', 'protobuf', 'python', 'r', 'reason', 'ruby', 'rust', 'sass', 'scala', 'scheme', 'scss', 'shell', 'sql', 'swift', 'typescript', 'vb.net', 'verilog', 'vhdl', 'visual basic', 'webassembly', 'xml', 'yaml'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

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
      inCodeBlock = true;
      let lang = trimmed.substring(3).trim().toLowerCase();
      if (!validLangs.includes(lang)) {
        lang = 'plain text';
      }
      codeLang = lang;
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      flushParagraph();
      blocks.push({ object: 'block', type: 'divider', divider: {} });
      continue;
    }

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

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      blocks.push(...createTextBlocks(trimmed.substring(4), 'heading_3'));
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph();
      blocks.push(...createTextBlocks(trimmed.substring(2), 'quote'));
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      blocks.push(...createTextBlocks(trimmed.substring(2), 'bulleted_list_item'));
      continue;
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      flushParagraph();
      blocks.push(...createTextBlocks(numberedMatch[2], 'numbered_list_item'));
      continue;
    }

    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    currentParagraph.push(trimmed);
  }

  flushParagraph();
  
  if (inCodeBlock) {
     blocks.push(...createCodeBlocks(codeContent.join('\n'), codeLang));
  }

  return blocks;
}
