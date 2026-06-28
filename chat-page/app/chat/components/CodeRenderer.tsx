"use client";

import React from "react";

// ── Aceternity / Vercel Code Theme Tokens ──────────
const C = {
  keyword: "#c678dd", // Pink/Purple (import, const, true/false)
  function: "#61afef", // Blue (useState, names)
  string: "#98c379", // Green (Strings)
  number: "#d19a66", // Amber (Numbers)
  punctuation: "#abb2bf", // Gray (Brackets, colons)
  text: "#e4e4e7", // White/Off-white (Variables, generic text)
  comment: "#5c6370", // Dim italic (Comments)
  lineNumber: "#3f3f46", // Dark gray for the line numbers
};

interface CodeRendererProps {
  content: string;
  language?: string;
}

export default function CodeRenderer({
  content,
  language = "",
}: CodeRendererProps) {
  const isYaml =
    language.toLowerCase() === "yaml" || language.toLowerCase() === "yml";

  // Helper to render the Aceternity-style line row
  const renderRow = (index: number, children: React.ReactNode) => (
    <div
      key={index}
      style={{
        display: "flex",
        minHeight: "24px",
        lineHeight: "24px",
        fontFamily: '"Geist Mono", monospace',
        fontWeight: 400,
        fontSize: "14px",
      }}
    >
      {/* Line Number */}
      <div
        style={{
          width: "48px",
          flexShrink: 0,
          textAlign: "right",
          paddingRight: "16px",
          color: C.lineNumber,
          userSelect: "none",
          fontSize: "13px",
          boxSizing: "border-box",
        }}
      >
        {index + 1}
      </div>
      {/* Code Content */}
      <div style={{ flex: 1, whiteSpace: "pre-wrap", overflowWrap: "anywhere", paddingRight: "16px" }}>
        {children}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // YAML SPECIFIC HIGHLIGHTER
  // ─────────────────────────────────────────────
  if (isYaml) {
    return (content ?? "").trimEnd().split("\n").map((line, i) => {
      const trimmedLine = line.trim();

      // Comments
      if (trimmedLine.startsWith("#")) {
        return renderRow(
          i,
          <>
            <span style={{ whiteSpace: "pre" }}>{line.match(/^\s*/)?.[0]}</span>
            <span style={{ color: C.comment, fontStyle: "italic" }}>{trimmedLine}</span>
          </>
        );
      }

      // Key-Value Pairs
      const kvMatch = line.match(/^(\s*)([a-zA-Z0-9_.-]+)(\s*:)(.*)$/);
      if (kvMatch) {
        const [, indent, key, colon, value] = kvMatch;
        return renderRow(
          i,
          <>
            <span style={{ whiteSpace: "pre" }}>{indent}</span>
            <span style={{ color: C.function, fontWeight: 500 }}>{key}</span>
            <span style={{ color: C.punctuation }}>{colon}</span>
            {colorizeYamlValue(value)}
          </>
        );
      }

      // Array items
      const arrayMatch = line.match(/^(\s*-\s+)(.*)$/);
      if (arrayMatch) {
        const [, dashMatch, value] = arrayMatch;
        return renderRow(
          i,
          <>
            <span style={{ color: C.punctuation, fontWeight: 700, whiteSpace: "pre" }}>{dashMatch}</span>
            {colorizeYamlValue(value)}
          </>
        );
      }

      // Fallback for unparsed lines
      return renderRow(i, <span style={{ color: C.text, whiteSpace: "pre" }}>{line}</span>);
    });
  }

  // ─────────────────────────────────────────────
  // GENERAL / JS HIGHLIGHTER
  // ─────────────────────────────────────────────
  const keywords = [
    "import", "from", "const", "let", "var", "export", "default",
    "function", "return", "type", "interface", "if", "else", "for",
    "while", "def", "class", "async", "await", "true", "false",
  ];
  const types = [
    "string", "number", "boolean", "any", "void", "React",
    "useState", "useEffect", "useCallback",
  ];

  return (content ?? "").trimEnd().split("\n").map((line, i) => {
    const trimmedLine = line.trim();

    // Comments
    if (trimmedLine.startsWith("#") || trimmedLine.startsWith("//")) {
      return renderRow(
        i,
        <>
          <span style={{ whiteSpace: "pre" }}>{line.match(/^\s*/)?.[0]}</span>
          <span style={{ color: C.comment, fontStyle: "italic" }}>{trimmedLine}</span>
        </>
      );
    }

    const tokens = line.split(/(\s+|[:{}()[\],;."']|(?<=")|(?='))/);

    return renderRow(
      i,
      <>
        {tokens.map((token, j) => {
          if (!token) return null;
          const trimmed = token.trim();

          if (keywords.includes(trimmed))
            return <span key={j} style={{ color: C.keyword, fontWeight: 500 }}>{token}</span>;

          if (types.includes(trimmed))
            return <span key={j} style={{ color: C.function }}>{token}</span>;

          if (!isNaN(Number(trimmed)) && trimmed !== "")
            return <span key={j} style={{ color: C.number }}>{token}</span>;

          if (token.startsWith('"') || token.startsWith("'") || token.endsWith('"') || token.endsWith("'"))
            return <span key={j} style={{ color: C.string }}>{token}</span>;

          const nextToken = tokens[j + 1]?.trim() ?? "";
          const nextActualToken = tokens.slice(j + 1).find((t) => t.trim() !== "") ?? "";

          // Function calls / declarations
          if (/^[a-zA-Z_]\w*$/.test(trimmed) && nextToken === "(")
            return <span key={j} style={{ color: C.function, fontWeight: 500 }}>{token}</span>;

          // Object keys
          if (/^[a-zA-Z_]\w*$/.test(trimmed) && nextActualToken === ":")
            return <span key={j} style={{ color: C.text }}>{token}</span>;

          // Punctuation
          if ([":", "{", "}", "(", ")", "[", "]", "=", "+", "-", "*", "/", ";", ","].includes(trimmed))
            return <span key={j} style={{ color: C.punctuation }}>{token}</span>;

          // Default text
          return <span key={j} style={{ color: C.text }}>{token}</span>;
        })}
      </>
    );
  });
}

// ─────────────────────────────────────────────
// YAML Value Colorizer Helper
// ─────────────────────────────────────────────
function colorizeYamlValue(val: string) {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return <span>{val}</span>;

  // Split trailing comments if they exist
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
    valueNode = <span style={{ color: C.string }}>{actualValue}</span>;
  } else if (!isNaN(Number(trimmedVal)) && trimmedVal !== "") {
    valueNode = <span style={{ color: C.number }}>{actualValue}</span>;
  } else if (trimmedVal === "true" || trimmedVal === "false") {
    valueNode = <span style={{ color: C.keyword }}>{actualValue}</span>; // Pink booleans like in your screenshot
  } else {
    valueNode = <span style={{ color: C.text }}>{actualValue}</span>;
  }

  return (
    <>
      {valueNode}
      {comment && (
        <span style={{ color: C.comment, fontStyle: "italic" }}>{comment}</span>
      )}
    </>
  );
}