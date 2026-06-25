"use client";

import React from "react";
import type { Message } from "./ChatPanel";
import FileHeader from "./FileHeader";
import FileContentRenderer from "./FileContentRenderer";

type ArtifactType =
  | "initial"
  | "config"
  | "docker"
  | "markdown"
  | "folderStructure"
  | "apiDesign"
  | "testingPlan"
  | "userStories"
  | "roadmap"
  | "deploymentGuide"
  | "costEstimation"
  | "projectTimeline"
  | "riskAnalysis"
  | "finalMarkdown"
  | "db";

// Map file language to ArtifactType for the MODIFY button
const LANG_TO_ARTIFACT: Record<string, ArtifactType> = {
  yaml: "config",
  markdown: "markdown",
  folder: "folderStructure",
  apidesign: "apiDesign",
  testingplan: "testingPlan",
  userstories: "userStories",
  deploymentguide: "deploymentGuide",
  roadmap: "roadmap",
  costestimation: "costEstimation",
  projecttimeline: "projectTimeline",
  riskanalysis: "riskAnalysis",
  finalmarkdown: "finalMarkdown",
};

interface MessageBubbleProps {
  msg: Message;
  isLast: boolean;
  userName: string;
  markdownMode: Record<string, "code" | "preview">;
  setMarkdownMode: React.Dispatch<
    React.SetStateAction<Record<string, "code" | "preview">>
  >;
  messages: Message[];
  onContextMenu: (e: React.MouseEvent, msg: Message) => void;
  onOptionClick: (label: string) => void;
  onModify: (target: ArtifactType) => void;
}

export default function MessageBubble({
  msg,
  isLast,
  userName,
  markdownMode,
  setMarkdownMode,
  messages,
  onContextMenu,
  onOptionClick,
  onModify,
}: MessageBubbleProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "24px 0",
        borderBottom: !isLast ? "1px solid #222" : "none",
        width: "100%",
      }}
      onContextMenu={(e) => onContextMenu(e, msg)}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: msg.role === "user" ? "#A0A0A0" : "#EAEAEA",
          fontFamily: '"Geist Mono", monospace',
          marginBottom: "12px",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        {msg.role === "user" ? userName : "SYSTEM"}
      </div>
      {msg.tools && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          {msg.tools.map((t) => (
            <span
              key={t}
              style={{
                fontSize: "10px",
                color: "#A0A0A0",
                background: "#111",
                border: "1px solid #333",
                padding: "4px 8px",
                fontFamily: '"Geist Mono", monospace',
                borderRadius: "4px",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div
        style={{
          width: "100%",
          color: "#CCCCCC",
          fontSize: "14px",
          lineHeight: "1.7",
          whiteSpace: "pre-line",
        }}
      >
        {msg.content}
        {msg.file && (
          <div
            style={{
              marginTop: "20px",
              border: "1px solid #333",
              background: "#000",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <FileHeader
              msg={msg}
              markdownMode={markdownMode}
              setMarkdownMode={setMarkdownMode}
            />
            <div
              style={{
                padding:
                  msg.file.language === "pipeline" ||
                  msg.file.language === "dbschema" ||
                  msg.file.language === "apidesign" ||
                  msg.file.language === "testingplan"
                    ? "20px"
                    : "16px",
                overflowX: "auto",
              }}
            >
              <FileContentRenderer msg={msg} markdownMode={markdownMode} />
            </div>
            {/* MODIFY button — all artifacts except db */}
            {msg.role === "assistant" && msg.file.language !== "dbschema" && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid #1A1A1A",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    const target =
                      LANG_TO_ARTIFACT[msg.file!.language] ?? "config";
                    onModify(target);
                  }}
                  style={{
                    padding: "5px 14px",
                    background: "transparent",
                    border: "1px solid #333",
                    color: "#666",
                    fontSize: "10px",
                    fontFamily: '"Geist Mono", monospace',
                    cursor: "pointer",
                    borderRadius: "4px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#FBBF24";
                    e.currentTarget.style.color = "#FBBF24";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#333";
                    e.currentTarget.style.color = "#666";
                  }}
                >
                  MODIFY
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {msg.options && msg.options.length > 0 && msg.role === "assistant" && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          {msg.options.map((option, i) => {
            const isClicked = messages.some(
              (m) => m.role === "user" && m.content === option,
            );
            return (
              <button
                key={i}
                onClick={() => {
                  if (!isClicked) onOptionClick(option);
                }}
                style={{
                  padding: "8px 16px",
                  background: isClicked ? "transparent" : "#080808",
                  border: `1px solid ${isClicked ? "#222" : "#333"}`,
                  color: isClicked ? "#555" : "#EAEAEA",
                  fontSize: "11px",
                  fontFamily: '"Geist Mono", monospace',
                  cursor: isClicked ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  opacity: isClicked ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isClicked) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#EAEAEA";
                    (e.currentTarget as HTMLButtonElement).style.color = "#000";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#EAEAEA";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isClicked) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#080808";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#EAEAEA";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#333";
                  }
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
      <span
        style={{
          fontSize: "10px",
          color: "#666",
          marginTop: "16px",
          fontFamily: '"Geist Mono", monospace',
        }}
      >
        {msg.timestamp}
      </span>
    </div>
  );
}
