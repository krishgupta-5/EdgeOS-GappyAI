"use client";

import React from "react";
import CodeRenderer from "@/app/chat/components/CodeRenderer";
import MarkdownRenderer from "@/app/chat/components/MarkdownRenderer";

// ── ProdMate Design Tokens (ProdMate Minimal Palette) ──────────
const T = {
  bg: "#09090b",
  codeBg: "#050505",
  surface: "#121214",
  border: "#27272a",
  text: "#ededed",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
  mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

const methodColors: Record<string, string> = {
  GET: "#34D399",    // Emerald
  POST: "#61afef",   // Blue
  PUT: "#FBBF24",    // Amber
  PATCH: "#c678dd",  // Purple/Pink
  DELETE: "#F87171", // Red
};

interface ApiDesignViewerProps {
  content: string;
}

export default function ApiDesignViewer({ content }: ApiDesignViewerProps) {
  let overview = "";
  let groups: Array<{
    group: string;
    description?: string;
    routes: Array<{
      method: string;
      path: string;
      description: string;
      request_body?: string;
      response?: string;
    }>;
    groupRequestModels?: string;
    groupResponseModels?: string;
  }> = [];

  try {
    const isMarkdownFormat = content.includes("### ") && content.includes("#### Endpoints");

    if (isMarkdownFormat) {
      // ─── PARSE NEW MARKDOWN FORMAT ──────────────────────
      const sections = content.split(/^###\s+/m);
      overview = sections[0].trim();

      for (let i = 1; i < sections.length; i++) {
        const section = sections[i];

        // If it doesn't have endpoints, it's a standard markdown section (e.g. Entities, Relationships)
        if (!section.includes("#### Endpoints")) {
          const trimmed = section.trim();
          const sectionLines = trimmed.split("\n").map(l => l.trim()).filter(l => l.length > 0);
          const title = (sectionLines[0] || "").toLowerCase();
          // Skip category headers like "Resources" that just group the endpoint cards
          const skipHeaders = ["resources", "api resources", "api endpoints", "endpoints", "routes"];
          if (skipHeaders.includes(title)) continue;
          // Only include sections with real body content (more than just a title)
          if (sectionLines.length > 1) {
            overview += `\n\n### ${trimmed}`;
          }
          continue;
        }

        const lines = section.split("\n");
        const groupName = lines[0].trim();

        const routes: any[] = [];
        const endpointRegex = /^\|\s*(GET|POST|PUT|PATCH|DELETE)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|([^|]+)?\|/;

        for (const line of lines) {
          const match = line.match(endpointRegex);
          if (match) {
            routes.push({
              method: match[1].trim(),
              path: match[2].trim(),
              description: match[3].trim(),
            });
          }
        }

        let description = "";
        const descMatch = section.match(/#### Purpose([\s\S]*?)(?=####|$)/);
        if (descMatch) description = descMatch[1].trim();

        let groupRequestModels = "";
        const reqMatch = section.match(/#### Request Models([\s\S]*?)(?=####|$)/);
        if (reqMatch) {
          const text = reqMatch[1].trim();
          if (text && text.toLowerCase() !== "none" && text.toLowerCase() !== "n/a") {
            groupRequestModels = text;
          }
        }

        let groupResponseModels = "";
        const resMatch = section.match(/#### Response Models([\s\S]*?)(?=####|$)/);
        if (resMatch) {
          const text = resMatch[1].trim();
          if (text && text.toLowerCase() !== "none" && text.toLowerCase() !== "n/a") {
            groupResponseModels = text;
          }
        }

        groups.push({
          group: groupName,
          description,
          routes,
          groupRequestModels,
          groupResponseModels,
        });
      }
    } else {
      // ─── PARSE LEGACY YAML FORMAT ───────────────────────
      const lines = content.split("\n");
      let currentGroup: string | null = null;
      let currentRoutes: any[] = [];
      let currentRoute: any = {};
      let inRoutes = false;

      for (const line of lines) {
        const trimmed = line.trim();

        const groupMatch = trimmed.match(/^-\s*group:\s*(.+)$/);
        if (groupMatch) {
          if (currentGroup !== null) {
            if (currentRoute.method) {
              currentRoutes.push({
                method: currentRoute.method,
                path: currentRoute.path ?? "",
                description: currentRoute.description ?? "",
                request_body: currentRoute.request_body ?? "none",
                response: currentRoute.response ?? "",
              });
            }
            if (currentRoutes.length > 0) {
              groups.push({ group: currentGroup, routes: [...currentRoutes] });
            }
          }
          currentGroup = groupMatch[1].trim();
          currentRoutes = [];
          currentRoute = {};
          inRoutes = false;
          continue;
        }

        if (trimmed === "routes:") {
          inRoutes = true;
          continue;
        }

        if (!currentGroup) continue;

        const methodMatch = trimmed.match(/^-\s*method:\s*(.+)$/);
        if (methodMatch) {
          if (currentRoute.method) {
            currentRoutes.push({
              method: currentRoute.method,
              path: currentRoute.path ?? "",
              description: currentRoute.description ?? "",
              request_body: currentRoute.request_body ?? "none",
              response: currentRoute.response ?? "",
            });
          }
          currentRoute = { method: methodMatch[1].trim() };
          inRoutes = true;
          continue;
        }

        if (inRoutes && currentRoute.method !== undefined) {
          const pathMatch = trimmed.match(/^path:\s*(.+)$/);
          if (pathMatch) currentRoute.path = pathMatch[1].trim();

          const descMatch = trimmed.match(/^description:\s*(.+)$/);
          if (descMatch) currentRoute.description = descMatch[1].trim();

          const bodyMatch = trimmed.match(/^request_body:\s*(.+)$/);
          if (bodyMatch) currentRoute.request_body = bodyMatch[1].trim();

          const respMatch = trimmed.match(/^response:\s*(.+)$/);
          if (respMatch) currentRoute.response = respMatch[1].trim();
        }
      }

      if (currentRoute.method) {
        currentRoutes.push({
          method: currentRoute.method,
          path: currentRoute.path ?? "",
          description: currentRoute.description ?? "",
          request_body: currentRoute.request_body ?? "none",
          response: currentRoute.response ?? "",
        });
      }
      if (currentGroup !== null && currentRoutes.length > 0) {
        groups.push({ group: currentGroup, routes: [...currentRoutes] });
      }
    }
  } catch (e) {
    groups = [];
  }

  // Fallback if parsing completely fails or no groups were found
  if (groups.length === 0 && !overview) {
    // We still want to render whatever they generated as markdown, so tables and mermaid diagrams work!
    return (
      <div style={{ padding: "0" }}>
        <MarkdownRenderer content={content} />
      </div>
    );
  }

  // ── Extract erDiagram relationships from overview ──
  let relationships: Array<{ left: string; right: string; label: string; arrow: string }> = [];
  let cleanOverview = overview;

  // Find erDiagram block and parse it (greedy — grab everything until end or next major heading)
  const erMatch = overview.match(/erDiagram\s*\n([\s\S]*?)(?=\n#{2,3}\s|\s*$)/i);
  if (erMatch) {
    const relLines = erMatch[1].split("\n").map(l => l.trim()).filter(l => l.length > 0);
    for (const line of relLines) {
      // Parse: ENTITY1 ||--o{ ENTITY2 : label
      const relMatch = line.match(/^(\w+)\s+([\|{}o\-]+)\s+(\w+)\s*:\s*(.+)$/);
      if (relMatch) {
        relationships.push({
          left: relMatch[1],
          arrow: relMatch[2],
          right: relMatch[3],
          label: relMatch[4].replace(/"/g, "").trim(),
        });
      }
    }
    // Remove the entire erDiagram block from overview
    cleanOverview = cleanOverview.replace(/erDiagram[\s\S]*?(?=\n#{2,3}\s|\s*$)/i, "").trim();
  }

  // Strip "Relationships" and "Resources" headings at any level (##, ###, or plain bold)
  cleanOverview = cleanOverview
    .replace(/#{2,3}\s*Relationships\s*\n?/gi, "")
    .replace(/#{2,3}\s*Resources\s*\n?/gi, "")
    .replace(/\*\*Resources\*\*\s*\n?/gi, "")
    .replace(/\*\*Relationships\*\*\s*\n?/gi, "")
    .trim();

  // ── Relationship type decoder ──
  const decodeArrow = (arrow: string): string => {
    if (arrow.includes("||") && arrow.includes("o{")) return "one-to-many";
    if (arrow.includes("||") && arrow.includes("||")) return "one-to-one";
    if (arrow.includes("}o") && arrow.includes("o{")) return "many-to-many";
    return "relates-to";
  };

  const relTypeColors: Record<string, string> = {
    "one-to-many": "#3B82F6",
    "one-to-one": "#10B981",
    "many-to-many": "#F59E0B",
    "relates-to": "#71717A",
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: "0" }}>

      {/* Overview Markdown (non-erDiagram parts) */}
      {cleanOverview && (
        <div style={{ marginBottom: (relationships.length > 0 || groups.length > 0) ? "24px" : "0" }}>
          <MarkdownRenderer content={cleanOverview} />
        </div>
      )}

      {/* ── ER Relationships Card ── */}
      {relationships.length > 0 && (
        <div style={{ marginBottom: groups.length > 0 ? "24px" : "0" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: T.textMuted, margin: "0 0 12px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Entity Relationships
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {relationships.map((rel, i) => {
              const type = decodeArrow(rel.arrow);
              const color = relTypeColors[type] || "#71717A";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "8px 14px", background: T.surface,
                  border: `1px solid ${T.border}`, borderRadius: "6px",
                  borderLeft: `3px solid ${color}`,
                }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: T.text, fontFamily: T.mono, minWidth: "100px" }}>
                    {rel.left}
                  </span>
                  <span style={{
                    fontSize: "10px", fontWeight: 600, color, background: `${color}15`,
                    padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase",
                    letterSpacing: "0.5px", fontFamily: T.mono, whiteSpace: "nowrap",
                  }}>
                    {type}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: T.text, fontFamily: T.mono, minWidth: "100px" }}>
                    {rel.right}
                  </span>
                  <span style={{ fontSize: "12px", color: T.textHint, marginLeft: "auto", fontStyle: "italic" }}>
                    {rel.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resource Groups (Tightened gaps) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ borderTop: overview || gi > 0 ? `1px solid ${T.border}` : "none", paddingTop: overview || gi > 0 ? "20px" : "0px" }}>

            {/* Group Header */}
            <h2 style={{ fontSize: "18px", fontWeight: 500, color: T.text, margin: "0 0 12px 0", textTransform: "capitalize", letterSpacing: "-0.01em" }}>
              {g.group}
            </h2>

            {/* Group Description */}
            {g.description && (
              <p style={{ fontSize: "14px", color: T.textMuted, margin: "0 0 16px 0", lineHeight: "1.5" }}>
                {g.description}
              </p>
            )}

            {/* Endpoints List (Compressed) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {g.routes.map((r, ri) => (
                <div key={ri} style={{ display: "flex", flexDirection: "column", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "6px", overflow: "hidden" }}>

                  {/* Route Header Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderBottom: (r.request_body && r.request_body !== "none" || r.response) ? `1px solid ${T.border}` : "none" }}>
                    <span style={{ color: methodColors[r.method.toUpperCase()] || T.textMuted, background: `${methodColors[r.method.toUpperCase()] || T.textMuted}15`, padding: "2px 0", width: "56px", textAlign: "center", borderRadius: "4px", fontFamily: T.mono, fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px" }}>
                      {r.method.toUpperCase()}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: T.text, fontFamily: T.mono }}>
                      {r.path}
                    </span>
                    <span style={{ color: T.textMuted, fontSize: "12px", marginLeft: "auto", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "40%" }}>
                      {r.description}
                    </span>
                  </div>

                  {/* Route-level Models (Legacy YAML Format - Compressed) */}
                  {(r.request_body || r.response) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px" }}>
                      {r.request_body && r.request_body !== "none" && r.request_body !== '"none"' && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "10px", color: T.textHint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Request Body</span>
                          <div style={{ margin: 0, padding: "8px 12px", background: T.codeBg, border: `1px solid ${T.border}`, borderRadius: "4px", fontSize: "12px", fontFamily: T.mono, overflowX: "auto" }}>
                            <CodeRenderer content={r.request_body} language="json" />
                          </div>
                        </div>
                      )}
                      {r.response && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "10px", color: T.textHint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Response</span>
                          <div style={{ margin: 0, padding: "8px 12px", background: T.codeBg, border: `1px solid ${T.border}`, borderRadius: "4px", fontSize: "12px", fontFamily: T.mono, overflowX: "auto" }}>
                            <CodeRenderer content={r.response} language="json" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Group-level Models (New Markdown Format - Compressed) */}
            {(g.groupRequestModels || g.groupResponseModels) && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                {g.groupRequestModels && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "13px", color: T.text, fontWeight: 500 }}>Request Models</h4>
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "6px", padding: "0 12px", fontSize: "13px" }}>
                      <MarkdownRenderer content={g.groupRequestModels} />
                    </div>
                  </div>
                )}
                {g.groupResponseModels && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "13px", color: T.text, fontWeight: 500 }}>Response Models</h4>
                    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "6px", padding: "0 12px", fontSize: "13px" }}>
                      <MarkdownRenderer content={g.groupResponseModels} />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
