"use client";

import React from "react";

interface FolderStructureViewerProps {
  content: string;
}

export default function FolderStructureViewer({
  content,
}: FolderStructureViewerProps) {
  const lines = (content ?? "").split("\n");

  return (
    <div
      style={{
        fontFamily: '"Geist Mono", monospace',
        fontSize: "13px",
        lineHeight: "1.7",
      }}
    >
      {lines.map((line, i) => {
        const trimmed = line.trimEnd();

        // Render empty lines as spacing
        if (!trimmed) return <div key={i} style={{ height: "8px" }} />;

        // Robust regex to match standard ASCII and UTF-8 tree line characters
        // Matches spaces, pipes, branches (├, └, │, ─), dashes, and backticks
        const treeMatch = trimmed.match(/^[\s│├└─|`'-]+/);
        const treePrefix = treeMatch ? treeMatch[0] : "";
        const nodeName = trimmed.slice(treePrefix.length);

        // It's the root if there are no tree formatting prefix characters
        const isRoot = treePrefix.length === 0;

        // It's a folder if it ends with a slash
        const isFolder = nodeName.endsWith("/");

        if (isRoot) {
          return (
            <div
              key={i}
              style={{ color: "#FAFAFA", fontWeight: 600, marginBottom: "4px" }}
            >
              {nodeName}
            </div>
          );
        }

        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#525252", whiteSpace: "pre" }}>
              {treePrefix}
            </span>
            <span
              style={{
                color: isFolder ? "#60A5FA" : "#D4D4D8",
                fontWeight: isFolder ? 500 : 400,
              }}
            >
              {nodeName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
