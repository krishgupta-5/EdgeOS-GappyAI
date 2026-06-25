"use client";

import React from "react";

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

interface ModifyBannerProps {
  modifyTargetArtifact: ArtifactType;
  onCancel: () => void;
}

export default function ModifyBanner({
  modifyTargetArtifact,
  onCancel,
}: ModifyBannerProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "10px",
        padding: "8px 14px",
        border: "1px solid #FBBF2440",
        borderRadius: "6px",
        background: "rgba(251,191,36,0.04)",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          fontFamily: '"Geist Mono", monospace',
          color: "#FBBF24",
          letterSpacing: "0.5px",
          fontWeight: 600,
        }}
      >
        MODIFY MODE
      </span>
      <span
        style={{
          fontSize: "10px",
          fontFamily: '"Geist Mono", monospace',
          color: "#555",
          letterSpacing: "0.5px",
        }}
      >
        Targeting: {modifyTargetArtifact.toUpperCase()}
      </span>
      <span
        style={{
          fontSize: "10px",
          fontFamily: '"Geist Mono", monospace',
          color: "#444",
          flex: 1,
        }}
      >
        Only this artifact will regenerate
      </span>
      <button
        onClick={onCancel}
        style={{
          background: "none",
          border: "none",
          color: "#555",
          cursor: "pointer",
          fontSize: "11px",
          fontFamily: '"Geist Mono", monospace',
          padding: "0 4px",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#EAEAEA";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#555";
        }}
      >
        x CANCEL
      </button>
    </div>
  );
}
