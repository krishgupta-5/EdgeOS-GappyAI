"use client";

import React from "react";

interface ApiDesignViewerProps {
  content: string;
}

export default function ApiDesignViewer({ content }: ApiDesignViewerProps) {
  const methodColors: Record<string, string> = {
    GET: "#10B981",
    POST: "#3B82F6",
    PUT: "#F59E0B",
    PATCH: "#F97316",
    DELETE: "#EF4444",
  };

  let groups: Array<{
    group: string;
    routes: Array<{
      method: string;
      path: string;
      description: string;
      request_body: string;
      response: string;
    }>;
  }> = [];

  try {
    const lines = content.split("\n");

    let currentGroup: string | null = null;
    let currentRoutes: (typeof groups)[0]["routes"] = [];
    let currentRoute: Partial<(typeof groups)[0]["routes"][0]> = {};
    let inRoutes = false;

    for (const line of lines) {
      const trimmed = line.trim();

      const groupMatch = trimmed.match(/^-\s*group:\s*(.+)$/);
      if (groupMatch) {
        if (currentGroup !== null) {
          if (currentRoute.method) {
            currentRoutes.push({
              method: currentRoute.method ?? "",
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
            method: currentRoute.method ?? "",
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
        if (pathMatch) {
          currentRoute.path = pathMatch[1].trim();
          continue;
        }

        const descMatch = trimmed.match(/^description:\s*(.+)$/);
        if (descMatch) {
          currentRoute.description = descMatch[1].trim();
          continue;
        }

        const bodyMatch = trimmed.match(/^request_body:\s*(.+)$/);
        if (bodyMatch) {
          currentRoute.request_body = bodyMatch[1].trim();
          continue;
        }

        const respMatch = trimmed.match(/^response:\s*(.+)$/);
        if (respMatch) {
          currentRoute.response = respMatch[1].trim();
          continue;
        }
      }
    }

    if (currentRoute.method) {
      currentRoutes.push({
        method: currentRoute.method ?? "",
        path: currentRoute.path ?? "",
        description: currentRoute.description ?? "",
        request_body: currentRoute.request_body ?? "none",
        response: currentRoute.response ?? "",
      });
    }
    if (currentGroup !== null && currentRoutes.length > 0) {
      groups.push({ group: currentGroup, routes: [...currentRoutes] });
    }
  } catch {
    groups = [];
  }

  if (groups.length === 0) {
    return (
      <pre
        style={{
          color: "#888",
          fontSize: "14px",
          fontFamily: "monospace",
          margin: 0,
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
        color: "#E5E5E5",
        padding: "20px 0",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
        {groups.map((g, gi) => (
          <div key={gi}>
            {/* Group Header */}
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#FFF",
                margin: "0 0 32px 0",
                textTransform: "capitalize",
                letterSpacing: "-0.3px",
              }}
            >
              {g.group}
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "48px" }}
            >
              {g.routes.map((r, ri) => (
                <div
                  key={ri}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {/* Method + Path */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "16px",
                    }}
                  >
                    <span
                      style={{
                        color: methodColors[r.method.toUpperCase()] || "#888",
                        fontWeight: 700,
                        fontFamily: '"Geist Mono", monospace',
                        fontSize: "15px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {r.method.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#FAFAFA",
                        fontFamily: '"Geist Mono", monospace',
                      }}
                    >
                      {r.path}
                    </span>
                  </div>

                  {/* Description */}
                  {r.description && (
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#A1A1AA",
                        lineHeight: "1.5",
                      }}
                    >
                      {r.description}
                    </div>
                  )}

                  {/* Prominent Request & Response Code Blocks */}
                  {((r.request_body && r.request_body !== "none") ||
                    r.response) && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        marginTop: "12px",
                      }}
                    >
                      {/* Request Block */}
                      {r.request_body &&
                        r.request_body !== "none" &&
                        r.request_body !== '"none"' && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#71717A",
                                textTransform: "uppercase",
                                fontWeight: 600,
                                letterSpacing: "1px",
                              }}
                            >
                              Request Body
                            </span>
                            <pre
                              style={{
                                margin: 0,
                                padding: "16px",
                                background: "#09090B", // Deep dark background for code
                                border: "1px solid #27272A", // Subtle border to contain it
                                borderRadius: "6px",
                                fontSize: "13px",
                                color: "#D4D4D8",
                                fontFamily: '"Geist Mono", monospace',
                                overflowX: "auto",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {r.request_body}
                            </pre>
                          </div>
                        )}

                      {/* Response Block */}
                      {r.response && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#71717A",
                              textTransform: "uppercase",
                              fontWeight: 600,
                              letterSpacing: "1px",
                            }}
                          >
                            Response
                          </span>
                          <pre
                            style={{
                              margin: 0,
                              padding: "16px",
                              background: "#09090B", // Deep dark background for code
                              border: "1px solid #27272A", // Subtle border to contain it
                              borderRadius: "6px",
                              fontSize: "13px",
                              color: "#D4D4D8",
                              fontFamily: '"Geist Mono", monospace',
                              overflowX: "auto",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {r.response}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
