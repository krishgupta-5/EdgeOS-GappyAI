"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  /**
   * Robust inline parser for **bold** and `code` tags.
   * Works inside headers, lists, and paragraphs.
   */
  const renderInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={index} style={{ color: "#FAFAFA", fontWeight: 600 }}>
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
              background: "#18181B",
              color: "#38BDF8",
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid #27272A",
              fontFamily: '"Geist Mono", monospace',
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

  return (
    <div style={{ fontFamily: '"Geist", sans-serif', width: "100%" }}>
      {lines.map((line, i) => {
        const tLine = line.trim();
        const isFirstElement = i === 0;

        // ─── REMOVE HORIZONTAL RULES ───────
        if (tLine === "---" || tLine === "***" || tLine === "___") {
          return null;
        }

        // ─── H1 ────────────────────────────
        if (tLine.startsWith("# ")) {
          return (
            <div
              key={i}
              style={{
                color: "#FAFAFA",
                fontSize: "20px",
                fontWeight: 600,
                marginTop: isFirstElement ? "0px" : "32px",
                marginBottom: "16px",
                letterSpacing: "-0.5px",
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
                color: "#F4F4F5",
                fontSize: "16px",
                fontWeight: 600,
                marginTop: isFirstElement ? "0px" : "28px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "3px",
                  height: "16px",
                  background: "#3B82F6",
                  borderRadius: "2px",
                }}
              />
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
                color: "#10B981",
                fontSize: "11px",
                fontWeight: 700,
                marginTop: isFirstElement ? "0px" : "24px",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontFamily: '"Geist Mono", monospace',
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
                padding: "12px 16px",
                borderLeft: "3px solid #F59E0B",
                background: "rgba(245, 158, 11, 0.05)",
                color: "#A1A1AA",
                fontStyle: "italic",
                marginTop: isFirstElement ? "0px" : "4px",
                marginBottom: "12px",
                borderRadius: "0 4px 4px 0",
                fontSize: "14px",
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
                color: "#D4D4D8",
                marginLeft: "4px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                lineHeight: "1.6",
                fontSize: "14px",
              }}
            >
              <span
                style={{
                  marginTop: "8px",
                  display: "inline-block",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#3B82F6",
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
                color: "#D4D4D8",
                marginLeft: "4px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                lineHeight: "1.6",
                fontSize: "14px",
              }}
            >
              <span
                style={{
                  color: "#71717A",
                  fontFamily: '"Geist Mono", monospace',
                  fontSize: "12px",
                  fontWeight: 600,
                  marginTop: "2px",
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
              color: "#D4D4D8",
              marginTop: isFirstElement ? "0px" : "0px",
              marginBottom: tLine ? "12px" : "0px",
              lineHeight: "1.7",
              minHeight: tLine ? "auto" : "12px",
              fontSize: "14px",
            }}
          >
            {tLine ? renderInlineText(tLine) : null}
          </div>
        );
      })}
    </div>
  );
}
