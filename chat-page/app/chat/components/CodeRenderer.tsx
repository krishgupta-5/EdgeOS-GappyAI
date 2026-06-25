"use client";

import React from "react";

interface CodeRendererProps {
  content: string;
  language?: string; // Added language prop to detect YAML
}

export default function CodeRenderer({
  content,
  language = "",
}: CodeRendererProps) {
  const isYaml =
    language.toLowerCase() === "yaml" || language.toLowerCase() === "yml";

  // ─────────────────────────────────────────────
  // YAML SPECIFIC HIGHLIGHTER
  // ─────────────────────────────────────────────
  if (isYaml) {
    return (content ?? "").split("\n").map((line, i) => {
      const trimmedLine = line.trim();

      // Comments
      if (trimmedLine.startsWith("#")) {
        return (
          <div key={i} style={{ minHeight: "19px" }}>
            <span style={{ whiteSpace: "pre" }}>{line.match(/^\s*/)?.[0]}</span>
            <span style={{ color: "#71717A", fontStyle: "italic" }}>
              {trimmedLine}
            </span>
          </div>
        );
      }

      // Key-Value Pairs (e.g., "version: '3.8'" or "  backend:")
      const kvMatch = line.match(/^(\s*)([a-zA-Z0-9_.-]+)(\s*:)(.*)$/);
      if (kvMatch) {
        const [, indent, key, colon, value] = kvMatch;
        return (
          <div key={i} style={{ minHeight: "19px" }}>
            <span style={{ whiteSpace: "pre" }}>{indent}</span>
            <span style={{ color: "#60A5FA", fontWeight: 600 }}>{key}</span>
            <span style={{ color: "#52525B" }}>{colon}</span>
            {colorizeYamlValue(value)}
          </div>
        );
      }

      // Array items (e.g., "- ./app" or "- '8000:8000'")
      const arrayMatch = line.match(/^(\s*-\s+)(.*)$/);
      if (arrayMatch) {
        const [, dashMatch, value] = arrayMatch;
        return (
          <div key={i} style={{ minHeight: "19px" }}>
            <span
              style={{ whiteSpace: "pre", color: "#52525B", fontWeight: 700 }}
            >
              {dashMatch}
            </span>
            {colorizeYamlValue(value)}
          </div>
        );
      }

      // Fallback for unparsed lines
      return (
        <div key={i} style={{ minHeight: "19px" }}>
          <span style={{ color: "#D4D4D8" }}>{line}</span>
        </div>
      );
    });
  }

  // ─────────────────────────────────────────────
  // GENERAL / JS HIGHLIGHTER (Your original logic)
  // ─────────────────────────────────────────────
  const keywords = [
    "import",
    "from",
    "const",
    "let",
    "var",
    "export",
    "default",
    "function",
    "return",
    "type",
    "interface",
    "if",
    "else",
    "for",
    "while",
    "def",
    "class",
    "async",
    "await",
    "true",
    "false",
  ];
  const types = [
    "string",
    "number",
    "boolean",
    "any",
    "void",
    "React",
    "useState",
    "useEffect",
  ];

  return (content ?? "").split("\n").map((line, i) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("#") || trimmedLine.startsWith("//"))
      return (
        <div key={i} style={{ minHeight: "19px" }}>
          <span style={{ whiteSpace: "pre" }}>{line.match(/^\s*/)?.[0]}</span>
          <span style={{ color: "#71717A", fontStyle: "italic" }}>
            {trimmedLine}
          </span>
        </div>
      );
    const tokens = line.split(/(\s+|[:{}()[\],;."']|(?<=")|(?='))/);
    return (
      <div key={i} style={{ minHeight: "19px" }}>
        {tokens.map((token, j) => {
          if (!token) return null;
          const trimmed = token.trim();
          if (keywords.includes(trimmed))
            return (
              <span key={j} style={{ color: "#F472B6", fontWeight: 500 }}>
                {token}
              </span>
            );
          if (types.includes(trimmed))
            return (
              <span key={j} style={{ color: "#60A5FA" }}>
                {token}
              </span>
            );
          if (!isNaN(Number(trimmed)) && trimmed !== "")
            return (
              <span key={j} style={{ color: "#FBBF24" }}>
                {token}
              </span>
            );
          if (
            token.startsWith('"') ||
            token.startsWith("'") ||
            token.endsWith('"') ||
            token.endsWith("'")
          )
            return (
              <span key={j} style={{ color: "#34D399" }}>
                {token}
              </span>
            );
          const nextToken = tokens[j + 1]?.trim() ?? "";
          const nextActualToken =
            tokens.slice(j + 1).find((t) => t.trim() !== "") ?? "";
          if (/^[a-zA-Z_]\w*$/.test(trimmed) && nextToken === "(")
            return (
              <span key={j} style={{ color: "#A78BFA", fontWeight: 500 }}>
                {token}
              </span>
            );
          if (/^[a-zA-Z_]\w*$/.test(trimmed) && nextActualToken === ":")
            return (
              <span key={j} style={{ color: "#38BDF8" }}>
                {token}
              </span>
            );
          if (
            [
              ":",
              "{",
              "}",
              "(",
              ")",
              "[",
              "]",
              "=",
              "+",
              "-",
              "*",
              "/",
              ";",
              ",",
            ].includes(trimmed)
          )
            return (
              <span key={j} style={{ color: "#52525B" }}>
                {token}
              </span>
            );
          return (
            <span key={j} style={{ color: "#D4D4D8" }}>
              {token}
            </span>
          );
        })}
      </div>
    );
  });
}

// Helper function to colorize the values in YAML cleanly
function colorizeYamlValue(val: string) {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return <span style={{ whiteSpace: "pre" }}>{val}</span>;

  // Split trailing comments if they exist (e.g. `port: 8080 # App port`)
  let actualValue = val;
  let comment = "";
  const commentIdx = val.indexOf(" #");
  if (commentIdx !== -1) {
    actualValue = val.substring(0, commentIdx);
    comment = val.substring(commentIdx);
  }

  let valueNode;
  const trimmedVal = actualValue.trim();

  // Syntax highlighting logic
  if (trimmedVal.startsWith('"') || trimmedVal.startsWith("'")) {
    valueNode = <span style={{ color: "#34D399" }}>{actualValue}</span>; // Green strings
  } else if (!isNaN(Number(trimmedVal)) && trimmedVal !== "") {
    valueNode = <span style={{ color: "#FBBF24" }}>{actualValue}</span>; // Amber numbers
  } else if (trimmedVal === "true" || trimmedVal === "false") {
    valueNode = <span style={{ color: "#F472B6" }}>{actualValue}</span>; // Pink booleans
  } else {
    valueNode = <span style={{ color: "#E4E4E7" }}>{actualValue}</span>; // Clean white for regular text (like `postgres:15-alpine`)
  }

  return (
    <>
      {valueNode}
      {comment && (
        <span style={{ color: "#71717A", fontStyle: "italic" }}>{comment}</span>
      )}
    </>
  );
}
