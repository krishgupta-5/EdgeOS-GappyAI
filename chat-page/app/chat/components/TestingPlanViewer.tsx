"use client";

import React from "react";

interface TestingPlanViewerProps {
  content: string;
}

export default function TestingPlanViewer({ content }: TestingPlanViewerProps) {
  // Premium, vivid color palette
  const sectionColors: Record<string, string> = {
    unit: "#10B981", // Emerald
    integration: "#3B82F6", // Blue
    e2e: "#8B5CF6", // Purple
    ci: "#F59E0B", // Amber
  };

  const sectionLabels: Record<string, string> = {
    unit: "Unit Testing",
    integration: "Integration Testing",
    e2e: "End-to-End (E2E)",
    ci: "CI/CD Pipeline",
  };

  // Robust parsing logic
  const lines = content.split("\n");
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
      // Clean up bullet points and remove unnecessary YAML keys (like "focus:", "scenarios:")
      let cleanItem = trimmed.replace(/^-\s*/, "");
      cleanItem = cleanItem.replace(
        /^(focus|scenarios|tools|environment):\s*/i,
        "",
      );
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
      <pre
        style={{
          margin: 0,
          padding: "20px",
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre-wrap",
          color: "#A1A1AA",
        }}
      >
        {content}
      </pre>
    );
  }

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "20px 0",
        width: "100%",
      }}
    >
      {/* ─── METADATA BANNER ──────────────────────────────────────── */}
      {(strategy || coverage) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "32px",
            padding: "20px 24px",
            background: "#09090B",
            border: "1px solid #27272A",
            borderRadius: "8px",
            alignItems: "center",
          }}
        >
          {strategy && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: "#71717A",
                  fontFamily: '"Geist Mono", monospace',
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Testing Strategy
              </div>
              <div
                style={{ fontSize: "15px", color: "#FAFAFA", fontWeight: 500 }}
              >
                {strategy}
              </div>
            </div>
          )}

          {/* Vertical Divider */}
          {strategy && coverage && (
            <div
              style={{
                width: "1px",
                height: "32px",
                background: "#27272A",
                display: "block",
              }}
            />
          )}

          {coverage && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: "#71717A",
                  fontFamily: '"Geist Mono", monospace',
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Coverage Target
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                  }}
                />
                <div
                  style={{
                    fontSize: "16px",
                    color: "#10B981",
                    fontFamily: '"Geist Mono", monospace',
                    fontWeight: 700,
                  }}
                >
                  {coverage}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TESTING PHASES GRID ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {sections.map((sec, i) => {
          const color = sectionColors[sec.key] || "#A1A1AA";
          const label = sectionLabels[sec.key] || sec.key;

          return (
            <div
              key={i}
              style={{
                background: "#09090B",
                border: "1px solid #27272A",
                borderTop: `4px solid ${color}`,
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "rgba(255,255,255,0.02)",
                  borderBottom: "1px solid #27272A",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: color,
                    opacity: 0.9,
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: '"Geist Mono", monospace',
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "#FAFAFA",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Card Body (List Items) */}
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  flex: 1,
                }}
              >
                {sec.items.map((item, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    {/* Color-coordinated SVG Checkmark */}
                    <div
                      style={{ color: color, flexShrink: 0, marginTop: "2px" }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#D4D4D8",
                        lineHeight: "1.5",
                        fontWeight: 400,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
