"use client";

import React from "react";
import DbSchemaViewer from "@/app/chat/components/DbSchemaViewer";
import FolderStructureViewer from "@/app/chat/components/FolderStructureViewer";
import ApiDesignViewer from "@/app/chat/components/ApiDesignViewer";
import TestingPlanViewer from "@/app/chat/components/TestingPlanViewer";
import CodeRenderer from "@/app/chat/components/CodeRenderer";
import MarkdownRenderer from "@/app/chat/components/MarkdownRenderer";

// ── EdgeOS Design Tokens (Onyx Minimal Palette) ──────────
const T = {
  bg: "#09090b",
  codeBg: "#0d1117", // Deepest black for code block backgrounds
  surface: "#121214",
  border: "#27272a",
  text: "#ededed",
  textMuted: "#a1a1aa",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
  mono: '"Geist Mono", var(--font-mono, monospace), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tools?: string[];
  file?: {
    name: string;
    language: string;
    content: string;
    dbSchema?: {
      mermaid: string;
      diagram: string;
    };
  };
  options?: string[];
}

interface FileContentRendererProps {
  msg: Message;
  markdownMode: Record<string, "code" | "preview">;
}

export default function FileContentRenderer({
  msg,
  markdownMode,
}: FileContentRendererProps) {
  if (!msg.file) return null;
  const { language, content } = msg.file;

  if (language === "dbschema") {
    return (
      <div style={{ padding: "20px" }}>
        <DbSchemaViewer
          mermaid={msg.file.dbSchema?.mermaid ?? ""}
          diagram={msg.file.dbSchema?.diagram ?? content}
        />
      </div>
    );
  }

  if (language === "image") {
    return (
      <div style={{ display: "flex" }}>
        <img
          src={content}
          alt={msg.file.name}
          style={{
            maxWidth: "100%",
            maxHeight: "400px",
            objectFit: "contain",
            border: `1px solid ${T.border}`,
            borderRadius: "6px",
          }}
        />
      </div>
    );
  }

  if (language === "folder") return <div style={{ padding: "16px 20px" }}><FolderStructureViewer content={content} /></div>;
  if (language === "apidesign") return <div style={{ padding: "20px" }}><ApiDesignViewer content={content} /></div>;
  if (language === "testingplan") return <div style={{ padding: "20px" }}><TestingPlanViewer content={content} /></div>;

  // Group all markdown-based artifact languages to prevent repetition
  const markdownArtifacts = [
    "deploymentguide",
    "markdown",
    "userstories",
    "roadmap",
    "costestimation",
    "projecttimeline",
    "riskanalysis",
    "finalmarkdown",
  ];

  if (markdownArtifacts.includes(language)) {
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          padding: "8px 0",
          fontSize: "14px",
          fontFamily: '"Geist Mono", monospace',
          fontWeight: 400,
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: T.textMuted,
          background: "transparent",
          overflowX: "auto",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, padding: "20px", fontSize: "14px", lineHeight: "1.65", fontFamily: T.font }}>
        <MarkdownRenderer content={content} />
      </div>
    );
  }

  // Default Code Block Wrapper (YAML, Docker, Config, etc.)
  return (
    <div
      style={{
        margin: 0,
        padding: "8px 0",
        fontSize: "14px",
        fontFamily: '"Geist Mono", monospace',
        fontWeight: 400,
        background: "transparent",
        overflowX: "auto",
      }}
    >
      <CodeRenderer content={content} language={language} />
    </div>
  );
}