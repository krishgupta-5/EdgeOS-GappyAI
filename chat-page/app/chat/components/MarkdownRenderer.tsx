"use client";

import React, { useEffect, useState, useRef } from "react";

// ── EdgeOS Design Tokens (Onyx Minimal Palette) ──────────
const T = {
  bg: "#09090b",
  surface: "#121214",
  surfaceHover: "#18181b",
  border: "#27272a",
  borderHover: "#3f3f46",
  text: "#ededed",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  accent: "#ffffff",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
  mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

const MermaidRenderer = ({ source }: { source: string }) => {
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const id = `mermaid-md-${Math.random().toString(36).substring(2, 11)}`;
    
    import("mermaid").then((mermaidModule) => {
      const mermaid = mermaidModule.default;
      mermaid.initialize({ startOnLoad: false, theme: "dark" });
      mermaid.render(id, source)
        .then(({ svg }) => {
          if (isMounted) setSvgHtml(svg);
        })
        .catch((err) => {
          if (isMounted) setError(String(err));
          // Clean up leaked error elements
          const el = document.getElementById('d' + id);
          if (el) el.remove();
        });
    });
    
    return () => {
      isMounted = false;
    };
  }, [source]);

  if (error) {
    return (
      <div style={{ background: "#2e0f0f", border: "1px solid #7a2626", color: "#fca5a5", padding: "12px", borderRadius: "8px", fontSize: "12px", fontFamily: T.mono, overflowX: "auto" }}>
        Failed to render diagram: {error}
        <pre style={{ marginTop: "8px", opacity: 0.8 }}>{source}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svgHtml }} 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        margin: '24px 0',
        padding: '16px',
        background: T.surfaceHover,
        borderRadius: '8px',
        border: `1px solid ${T.border}`
      }} 
    />
  );
};

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  /**
   * Robust inline parser for **bold** and `code` tags.
   */
  const renderInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={index} style={{ color: T.accent, fontWeight: 600 }}>
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            style={{
              fontSize: "12px",
              background: T.surfaceHover,
              color: T.text,
              padding: "2px 6px",
              borderRadius: "4px",
              border: `1px solid ${T.border}`,
              fontFamily: T.mono,
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // 1. Split content into lines (normalize all line endings first)
  const rawLines = (content ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  // 2. Find first non-empty line to kill top whitespace
  let firstNonEmptyIndex = rawLines.findIndex((line) => line.trim() !== "");
  if (firstNonEmptyIndex === -1) firstNonEmptyIndex = 0;

  const lines = rawLines.slice(firstNonEmptyIndex);

  // 3. Pre-process blocks to group tables, code blocks, and raw mermaid diagrams
  const blocks: { type: string; content?: string; lines?: string[]; language?: string; isFirst?: boolean; originalIndex?: number }[] = [];
  let currentTable: string[] | null = null;
  let currentCode: { language: string; lines: string[]; startIdx: number } | null = null;
  let currentMermaid: string[] | null = null;
  let firstElementSet = false;

  // Helper: check if a trimmed line is a real code fence (``` optionally followed by a language tag, nothing else)
  const isCodeFence = (trimmed: string) => /^```\s*[a-zA-Z0-9]*\s*$/.test(trimmed);

  // Helper: check if a trimmed line is a table row (starts and ends with |)
  const isTableRow = (trimmed: string) => {
    const t = trimmed.replace(/\s+$/g, ''); // extra safety: strip trailing whitespace
    return t.length > 2 && t.charAt(0) === '|' && t.charAt(t.length - 1) === '|';
  };

  // Helper: check if a line looks like raw mermaid flowchart/sequence syntax
  const isMermaidStart = (trimmed: string) => /^(flowchart|sequenceDiagram|graph)\b/i.test(trimmed);
  const isMermaidContinuation = (trimmed: string) => /^(-->|---|\||subgraph|end\b|A\[|B\[|C\[|D\[|E\[|F\[|G\[|H\[|[A-Z]\[|[a-z]\[)/.test(trimmed) || /^\w+\s*-->/.test(trimmed) || /^\w+\s*---/.test(trimmed);

  lines.forEach((line, i) => {
    const tLine = line.trim();

    // Inside a code block — look for closing fence
    if (currentCode) {
      if (tLine === "```") {
        blocks.push({ type: "code", language: currentCode.language, lines: currentCode.lines, isFirst: !firstElementSet });
        firstElementSet = true;
        currentCode = null;
      } else {
        currentCode.lines.push(line);
      }
      return;
    }

    // Inside a raw mermaid block
    if (currentMermaid) {
      if (tLine === "" || (!isMermaidContinuation(tLine) && !tLine.startsWith("-->") && !/^\w+\[/.test(tLine))) {
        // End of mermaid block
        blocks.push({ type: "code", language: "mermaid", lines: currentMermaid, isFirst: !firstElementSet });
        firstElementSet = true;
        currentMermaid = null;
        // Process current line normally (don't skip it)
        if (tLine) {
          blocks.push({ type: "line", content: tLine, isFirst: !firstElementSet, originalIndex: i });
          firstElementSet = true;
        } else {
          blocks.push({ type: "empty" });
        }
      } else {
        currentMermaid.push(line);
      }
      return;
    }

    // Opening fence: must be a standalone ``` line (possibly with language tag)
    if (isCodeFence(tLine)) {
      if (currentTable) {
        blocks.push({ type: "table", lines: currentTable, isFirst: !firstElementSet });
        firstElementSet = true;
        currentTable = null;
      }
      currentCode = { language: tLine.slice(3).trim(), lines: [], startIdx: i };
      return;
    }

    // Detect raw mermaid flowchart/graph/sequence lines (not inside code fences)
    if (isMermaidStart(tLine)) {
      if (currentTable) {
        blocks.push({ type: "table", lines: currentTable, isFirst: !firstElementSet });
        firstElementSet = true;
        currentTable = null;
      }
      currentMermaid = [line];
      return;
    }

    if (isTableRow(tLine)) {
      if (!currentTable) currentTable = [];
      currentTable.push(tLine);
    } else {
      if (currentTable) {
        blocks.push({ type: "table", lines: currentTable, isFirst: !firstElementSet });
        firstElementSet = true;
        currentTable = null;
      }

      if (tLine) {
        blocks.push({ type: "line", content: tLine, isFirst: !firstElementSet, originalIndex: i });
        firstElementSet = true;
      } else {
        blocks.push({ type: "empty" });
      }
    }
  });

  if (currentTable) {
    blocks.push({ type: "table", lines: currentTable, isFirst: !firstElementSet });
  }
  if (currentMermaid) {
    blocks.push({ type: "code", language: "mermaid", lines: currentMermaid, isFirst: !firstElementSet });
  }
  // If a code block was never closed, flush its lines back as regular text (don't try to render as code/mermaid)
  if (currentCode) {
    const code = currentCode as { language: string; lines: string[]; startIdx: number };
    // Push the opening fence line as regular text
    blocks.push({ type: "line", content: "```" + code.language, isFirst: !firstElementSet, originalIndex: code.startIdx });
    firstElementSet = true;
    for (const cl of code.lines) {
      const t = cl.trim();
      if (t) {
        blocks.push({ type: "line", content: t, isFirst: false });
      } else {
        blocks.push({ type: "empty" });
      }
    }
  }

  // 4. Helper to determine if a table row is just the structural markdown separator (e.g. |---|---|)
  const isTableSeparator = (line: string) => {
    const chars = line.replace(/[\s\|]/g, '');
    return chars.length > 0 && chars.split('').every(c => c === '-' || c === ':');
  };

  return (
    <div style={{ fontFamily: T.font, width: "100%" }}>
      {blocks.map((block, i) => {
        const isFirstElement = !!block.isFirst;

        // ─── EMPTY LINES ───────────────────
        if (block.type === "empty") {
          return <div key={i} style={{ height: "12px" }} />;
        }

        // ─── CODE BLOCKS ────────
        if (block.type === "code") {
          const source = (block.lines || []).join("\n");
          if (block.language === "mermaid") {
            return <MermaidRenderer key={`mermaid-${i}`} source={source} />;
          }
          if (block.language === "json" && source.includes("erDiagram")) {
            // Usually we hide raw JSON blocks if they are internal state, but if they want to see it:
            return null;
          }
          return (
            <div key={`code-${i}`} style={{
              margin: isFirstElement ? "0px 0 16px" : "16px 0",
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: "8px",
              padding: "16px",
              overflowX: "auto",
            }}>
              <pre style={{ margin: 0, fontFamily: T.mono, fontSize: "13px", color: T.text, lineHeight: "1.5" }}>
                <code>{source}</code>
              </pre>
            </div>
          );
        }

        // ─── TABLES ────────────────────────
        if (block.type === "table" && block.lines) {
          const rows = block.lines.filter(l => !isTableSeparator(l));
          if (rows.length === 0) return null;

          return (
            <div key={`table-${i}`} style={{
              marginTop: isFirstElement ? "0px" : "16px",
              marginBottom: "16px",
              overflowX: "auto",
              border: `1px solid ${T.border}`,
              borderRadius: "8px",
              background: T.bg
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr>
                    {rows[0].split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1).map((cell, idx) => (
                      <th key={idx} style={{
                        padding: "12px 16px",
                        background: T.surfaceHover,
                        borderBottom: `1px solid ${T.border}`,
                        color: T.accent,
                        fontWeight: 500,
                        fontFamily: T.font
                      }}>
                        {renderInlineText(cell.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: rIdx === rows.length - 2 ? "none" : `1px solid ${T.borderHover}` }}>
                      {row.split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1).map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: "12px 16px", color: T.textMuted, lineHeight: "1.5" }}>
                          {renderInlineText(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        const tLine = block.content!;

        // ─── HORIZONTAL RULES ───────
        if (tLine === "---" || tLine === "***" || tLine === "___") {
          return <div key={i} style={{ height: "1px", background: T.borderHover, margin: "24px 0" }} />;
        }

        // ─── H1 ────────────────────────────
        if (tLine.startsWith("# ")) {
          return (
            <div
              key={i}
              style={{
                color: T.accent,
                fontSize: "20px",
                fontWeight: 500,
                marginTop: isFirstElement ? "0px" : "24px",
                marginBottom: "16px",
                letterSpacing: "-0.01em",
              }}
            >
              {renderInlineText(tLine.substring(2))}
            </div>
          );
        }

        // ─── H2 (Clean White Bullet) ───────
        if (tLine.startsWith("## ")) {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: isFirstElement ? "0px" : "20px",
                marginBottom: "12px",
              }}
            >
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: T.accent, flexShrink: 0 }} />
              <span
                style={{
                  color: T.text,
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                {renderInlineText(tLine.substring(3))}
              </span>
            </div>
          );
        }

        // ─── H3 (Italic with Muted Bullet) ─
        if (tLine.startsWith("### ")) {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: isFirstElement ? "0px" : "16px",
                marginBottom: "8px",
              }}
            >
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: T.textHint, flexShrink: 0 }} />
              <span
                style={{
                  color: T.textMuted,
                  fontSize: "13px",
                  fontWeight: 500,
                  fontStyle: "italic",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {renderInlineText(tLine.substring(4))}
              </span>
            </div>
          );
        }

        // ─── API SPECIFIC HEADER (####) ────
        if (tLine.startsWith("#### ")) {
          return (
            <div
              key={i}
              style={{
                color: T.textHint,
                fontSize: "11px",
                fontWeight: 600,
                marginTop: isFirstElement ? "0px" : "12px",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {renderInlineText(tLine.substring(5))}
            </div>
          );
        }

        // ─── BLOCKQUOTE ────────────────────
        if (tLine.startsWith("> ")) {
          return (
            <div
              key={i}
              style={{
                padding: "8px 14px",
                borderLeft: `2px solid ${T.borderHover}`,
                background: T.surfaceHover,
                color: T.textMuted,
                fontStyle: "italic",
                marginTop: isFirstElement ? "0px" : "8px",
                marginBottom: "12px",
                fontSize: "13px",
                lineHeight: "1.6",
                borderRadius: "0 6px 6px 0",
              }}
            >
              {renderInlineText(tLine.substring(2))}
            </div>
          );
        }

        // ─── BULLET LIST (White Bullets) ───
        if (tLine.startsWith("- ") || tLine.startsWith("* ")) {
          return (
            <div
              key={i}
              style={{
                color: T.text,
                marginLeft: "4px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                lineHeight: "1.65",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  marginTop: "8px",
                  display: "inline-block",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: T.accent, // Pure white bullet
                  flexShrink: 0,
                }}
              />
              <div style={{ color: "rgba(255,255,255,0.8)" }}>{renderInlineText(tLine.substring(2))}</div>
            </div>
          );
        }

        // ─── NUMBERED LIST ─────────────────
        if (/^\d+\./.test(tLine)) {
          const dotIdx = tLine.indexOf(".");
          return (
            <div
              key={i}
              style={{
                color: T.text,
                marginLeft: "4px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                lineHeight: "1.65",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  color: T.textMuted,
                  fontSize: "12px",
                  fontWeight: 600,
                  marginTop: "1px",
                  flexShrink: 0,
                }}
              >
                {tLine.substring(0, dotIdx)}.
              </span>
              <div style={{ color: "rgba(255,255,255,0.8)" }}>{renderInlineText(tLine.substring(dotIdx + 1).trim())}</div>
            </div>
          );
        }

        // ─── CODE BLOCK HIDER ──────────────
        if (tLine.startsWith("```")) {
          return null;
        }

        // ─── STANDARD PARAGRAPHS ────────────
        return (
          <div
            key={i}
            style={{
              color: "rgba(255,255,255,0.75)",
              marginTop: isFirstElement ? "0px" : "0px",
              marginBottom: "12px",
              lineHeight: "1.65",
              fontSize: "13px",
            }}
          >
            {renderInlineText(tLine)}
          </div>
        );
      })}
    </div>
  );
}