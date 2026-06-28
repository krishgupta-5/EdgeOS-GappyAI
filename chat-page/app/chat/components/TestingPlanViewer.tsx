"use client";

import React from "react";

interface TestingPlanViewerProps {
  content: string;
}

export default function TestingPlanViewer({ content }: TestingPlanViewerProps) {
  // Robust parsing logic
  const lines = (content ?? "").split("\n");
  const sections: Array<{ key: string; items: string[] }> = [];
  let currentSection = "";
  let currentItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section headers
    const secMatch = trimmed.match(/^(unit|integration|e2e|ci):/i);
    if (secMatch) {
      if (currentSection && currentItems.length > 0) {
        sections.push({ key: currentSection, items: currentItems });
      }
      currentSection = secMatch[1].toLowerCase();
      currentItems = [];
    } else if (currentSection && trimmed.startsWith("-")) {
      // Clean up bullet points
      let cleanItem = trimmed.replace(/^-\s*/, "");
      cleanItem = cleanItem.replace(/^(focus|scenarios|tools|environment):\s*/i, "");
      if (cleanItem) currentItems.push(cleanItem);
    }
  }
  if (currentSection && currentItems.length > 0) {
    sections.push({ key: currentSection, items: currentItems });
  }

  // Extract top-level metadata safely using regex
  const strategyMatch = content.match(/strategy:\s*(.+)/i);
  const coverageMatch = content.match(/coverage_target:\s*(.+)/i);
  const strategy = strategyMatch ? strategyMatch[1].trim() : "";
  const coverage = coverageMatch ? coverageMatch[1].trim() : "";

  // Fallback for raw/unparseable text
  if (sections.length === 0) {
    return (
      <div style={{ padding: "16px 0", color: "#D4D4D8", fontFamily: '"Geist Mono", monospace', fontSize: "14px", lineHeight: "1.6" }}>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {content}
        </pre>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: '"Geist Mono", monospace',
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#D4D4D8",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        padding: "16px 0",
        width: "100%",
      }}
    >
      {/* ─── METADATA ──────────────────────────────────────── */}
      {(strategy || coverage) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {strategy && (
            <div>
              <span style={{ color: "#71717A", marginRight: "8px" }}>Strategy:</span>
              <span style={{ color: "#FAFAFA" }}>{strategy}</span>
            </div>
          )}
          {coverage && (
            <div>
              <span style={{ color: "#71717A", marginRight: "8px" }}>Coverage:</span>
              <span style={{ color: "#FAFAFA" }}>{coverage}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── SECTIONS ──────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {sections.map((sec, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                color: "#FAFAFA",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {sec.key}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "16px" }}>
              {sec.items.map((item, j) => (
                <div key={j} style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#52525B" }}>-</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
