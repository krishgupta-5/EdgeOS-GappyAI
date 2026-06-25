"use client";

import React from "react";

interface WelcomeScreenProps {
  onSendPrompt: (text: string) => void;
}

const MACROS = [
  {
    title: "Initialize Complete SaaS",
    desc: "Scaffold agents, backend, frontend, CI/CD, and deployment infrastructure.",
    text: "Create a complete AI SaaS including agents, backend, frontend, CI/CD, and deployment",
  },
  {
    title: "Build RAG Pipeline",
    desc: "Design an AI system with RAG, embeddings, and a scalable vector database.",
    text: "Design an AI system with RAG pipeline, embeddings, and vector database",
  },
  {
    title: "Enterprise Architecture",
    desc: "Generate a production-ready AI architecture focused on security and scale.",
    text: "Generate an enterprise-grade AI architecture with security and scaling",
  },
];

export default function WelcomeScreen({ onSendPrompt }: WelcomeScreenProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "40px 20px",
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div style={{ marginBottom: "64px" }}>
        <div
          style={{
            color: "#888",
            fontSize: "11px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: '"Geist Mono", monospace',
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Status: <span style={{ color: "#EAEAEA" }}>ONLINE</span>
        </div>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "#FFFFFF",
            letterSpacing: "-1px",
            margin: 0,
          }}
        >
          System Initialized.
        </h1>
        <div
          style={{
            color: "#A0A0A0",
            fontSize: "14px",
            marginTop: "16px",
            maxWidth: "600px",
            lineHeight: "1.6",
          }}
        >
          Development environment active. Awaiting input for architecture
          synthesis, infrastructure deployment, or codebase manipulation.
        </div>
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "#888",
          fontWeight: 600,
          letterSpacing: "1px",
          marginBottom: "16px",
          textTransform: "uppercase",
          fontFamily: '"Geist Mono", monospace',
        }}
      >
        AVAILABLE MACROS
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1px",
          background: "#333",
          border: "1px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {MACROS.map((p, i) => (
          <button
            key={i}
            onClick={() => onSendPrompt(p.text)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "24px 20px",
              background: "#080808",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#111";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#080808";
            }}
          >
            <div
              style={{
                color: "#EAEAEA",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "8px",
                fontFamily: '"Geist Mono", monospace',
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#666", marginRight: "8px" }}>&gt;</span>
              {p.title}
            </div>
            <div
              style={{
                color: "#888",
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              {p.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
