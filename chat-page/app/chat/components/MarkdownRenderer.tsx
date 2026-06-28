"use client";

import React from "react";

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
};

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  /**
   * Robust inline parser for **bold** and `code` tags.
   * Works inside headers, lists, paragraphs, and tables.
   */
  const renderInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={index} style={{ color: T.text, fontWeight: 600 }}>
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            style={{
              fontSize: "13px",
              background: T.surfaceHover,
              color: T.text,
              padding: "4px 8px",
              borderRadius: "6px",
              border: `1px solid ${T.border}`,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // 1. Split content into lines
  const rawLines = (content ?? "").split("\n");

  // 2. Find first non-empty line to kill top whitespace
  let firstNonEmptyIndex = rawLines.findIndex((line) => line.trim() !== "");
  if (firstNonEmptyIndex === -1) firstNonEmptyIndex = 0;

  const lines = rawLines.slice(firstNonEmptyIndex);

  // 3. Pre-process blocks to group tables together
  const blocks: { type: string; content?: string; lines?: string[]; isFirst?: boolean; originalIndex?: number }[] = [];
  let currentTable: string[] | null = null;
  let firstElementSet = false;

  lines.forEach((line, i) => {
    const tLine = line.trim();

    if (tLine.startsWith("|") && tLine.endsWith("|")) {
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

  // 4. Helper to determine if a table row is just the structural markdown separator (e.g. |---|---|)
  const isTableSeparator = (line: string) => {
    const chars = line.replace(/[\s\|]/g, '');
    return chars.length > 0 && chars.split('').every(c => c === '-' || c === ':');
  };

  return (
    <div style={{ fontFamily: T.font, width: "100%", letterSpacing: "0.01em" }}>
      {blocks.map((block, i) => {
        const isFirstElement = !!block.isFirst;

        // ─── EMPTY LINES ───────────────────
        if (block.type === "empty") {
          return <div key={i} style={{ height: "16px" }} />;
        }

        // ─── TABLES ────────────────────────
        if (block.type === "table" && block.lines) {
          const rows = block.lines.filter(l => !isTableSeparator(l));
          if (rows.length === 0) return null;

          return (
            <div key={`table-${i}`} style={{
              marginTop: isFirstElement ? "0px" : "24px",
              marginBottom: "24px",
              overflowX: "auto",
              border: `1px solid ${T.border}`,
              borderRadius: "8px",
              background: T.bg
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                <thead>
                  <tr>
                    {rows[0].split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1).map((cell, idx) => (
                      <th key={idx} style={{
                        padding: "12px 16px",
                        background: T.surfaceHover,
                        borderBottom: `1px solid ${T.border}`,
                        color: T.text,
                        fontWeight: 600
                      }}>
                        {renderInlineText(cell.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: rIdx === rows.length - 2 ? "none" : `1px solid ${T.border}` }}>
                      {row.split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1).map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: "10px 16px", color: T.textMuted, lineHeight: "1.6" }}>
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

        // ─── REMOVE HORIZONTAL RULES ───────
        if (tLine === "---" || tLine === "***" || tLine === "___") {
          return <div key={i} style={{ height: "1px", background: T.border, margin: "24px 0" }} />;
        }

        // ─── H1 ────────────────────────────
        if (tLine.startsWith("# ")) {
          return (
            <div
              key={i}
              style={{
                color: T.text,
                fontSize: "22px",
                fontWeight: 600,
                marginTop: isFirstElement ? "0px" : "32px",
                marginBottom: "16px",
                letterSpacing: "-0.01em",
              }}
            >
              {renderInlineText(tLine.substring(2))}
            </div>
          );
        }

        // ─── H2 ────────────────────────────
        if (tLine.startsWith("## ")) {
          return (
            <div
              key={i}
              style={{
                color: T.text,
                fontSize: "18px",
                fontWeight: 600,
                marginTop: isFirstElement ? "0px" : "24px",
                marginBottom: "12px",
              }}
            >
              {renderInlineText(tLine.substring(3))}
            </div>
          );
        }

        // ─── H3 ────────────────────────────
        if (tLine.startsWith("### ")) {
          return (
            <div
              key={i}
              style={{
                color: T.textMuted,
                fontSize: "14px",
                fontWeight: 600,
                marginTop: isFirstElement ? "0px" : "20px",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {renderInlineText(tLine.substring(4))}
            </div>
          );
        }

        // ─── BLOCKQUOTE ────────────────────
        if (tLine.startsWith("> ")) {
          return (
            <div
              key={i}
              style={{
                padding: "10px 16px",
                borderLeft: `2px solid ${T.borderHover}`,
                color: T.textMuted,
                fontStyle: "italic",
                marginTop: isFirstElement ? "0px" : "12px",
                marginBottom: "16px",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            >
              {renderInlineText(tLine.substring(2))}
            </div>
          );
        }

        // ─── BULLET LIST ───────────────────
        if (tLine.startsWith("- ") || tLine.startsWith("* ")) {
          return (
            <div
              key={i}
              style={{
                color: "rgba(255,255,255,0.85)",
                marginLeft: "4px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                lineHeight: "1.6",
                fontSize: "15px",
              }}
            >
              <span
                style={{
                  marginTop: "8px",
                  display: "inline-block",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: T.textHint,
                  flexShrink: 0,
                }}
              />
              <div>{renderInlineText(tLine.substring(2))}</div>
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
                color: "rgba(255,255,255,0.85)",
                marginLeft: "4px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                lineHeight: "1.6",
                fontSize: "15px",
              }}
            >
              <span
                style={{
                  color: T.textHint,
                  fontSize: "14px",
                  fontWeight: 500,
                  marginTop: "0px",
                  flexShrink: 0,
                }}
              >
                {tLine.substring(0, dotIdx)}.
              </span>
              <div>{renderInlineText(tLine.substring(dotIdx + 1).trim())}</div>
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
              color: "rgba(255,255,255,0.85)",
              marginTop: isFirstElement ? "0px" : "0px",
              marginBottom: "4px",
              lineHeight: "1.6",
              fontSize: "15px",
            }}
          >
            {renderInlineText(tLine)}
          </div>
        );
      })}
    </div>
  );
}