"use client";

import React from "react";
import DbSchemaViewer from "@/app/chat/components/DbSchemaViewer";
import FolderStructureViewer from "@/app/chat/components/FolderStructureViewer";
import ApiDesignViewer from "@/app/chat/components/ApiDesignViewer";
import TestingPlanViewer from "@/app/chat/components/TestingPlanViewer";
import CodeRenderer from "@/app/chat/components/CodeRenderer";
import MarkdownRenderer from "@/app/chat/components/MarkdownRenderer";

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

  if (language === "dbschema")
    return (
      <DbSchemaViewer
        mermaid={msg.file.dbSchema?.mermaid ?? ""}
        diagram={msg.file.dbSchema?.diagram ?? content}
      />
    );
  if (language === "image")
    return (
      <div style={{ display: "flex" }}>
        <img
          src={content}
          alt={msg.file.name}
          style={{
            maxWidth: "100%",
            maxHeight: "400px",
            objectFit: "contain",
            border: "1px solid #333",
            borderRadius: "4px",
          }}
        />
      </div>
    );
  if (language === "folder") return <FolderStructureViewer content={content} />;
  if (language === "apidesign") return <ApiDesignViewer content={content} />;
  if (language === "testingplan")
    return <TestingPlanViewer content={content} />;
  if (language === "deploymentguide")
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: "#CCCCCC",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, fontSize: "14px", lineHeight: "1.65" }}>
        <MarkdownRenderer content={content} />
      </div>
    );
  if (language === "markdown")
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: "#CCCCCC",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, fontSize: "14px", lineHeight: "1.65" }}>
        <MarkdownRenderer content={content} />
      </div>
    );
  if (language === "userstories")
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: "#CCCCCC",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, fontSize: "14px", lineHeight: "1.65" }}>
        <MarkdownRenderer content={content} />
      </div>
    );

  if (language === "roadmap")
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: "#CCCCCC",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, fontSize: "14px", lineHeight: "1.65" }}>
        <MarkdownRenderer content={content} />
      </div>
    );
  if (language === "costestimation")
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: "#CCCCCC",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, fontSize: "14px", lineHeight: "1.65" }}>
        <MarkdownRenderer content={content} />
      </div>
    );

  if (language === "projecttimeline")
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: "#CCCCCC",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, fontSize: "14px", lineHeight: "1.65" }}>
        <MarkdownRenderer content={content} />
      </div>
    );

  if (language === "riskanalysis")
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: "#CCCCCC",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, fontSize: "14px", lineHeight: "1.65" }}>
        <MarkdownRenderer content={content} />
      </div>
    );

  if (language === "finalmarkdown")
    return markdownMode[msg.id] === "code" ? (
      <pre
        style={{
          margin: 0,
          fontSize: "13px",
          fontFamily: '"Geist Mono", monospace',
          lineHeight: "1.65",
          whiteSpace: "pre",
          color: "#CCCCCC",
        }}
      >
        <CodeRenderer content={content} language="markdown" />
      </pre>
    ) : (
      <div style={{ margin: 0, fontSize: "14px", lineHeight: "1.65" }}>
        <MarkdownRenderer content={content} />
      </div>
    );

  // FIX: Added `language` prop to CodeRenderer and nice padding/background
  return (
    <pre
      style={{
        margin: 0,
        padding: "20px",
        fontSize: "13px",
        fontFamily: '"Geist Mono", monospace',
        lineHeight: "1.65",
        whiteSpace: "pre",
        background: "#050505",
        borderRadius: "0 0 8px 8px",
      }}
    >
      <CodeRenderer content={content} language={language} />
    </pre>
  );
}
