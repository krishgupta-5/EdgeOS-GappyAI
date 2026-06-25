"use client";

import React from "react";

export default function TypingIndicator() {
  return (
    <div style={{ padding: "24px 0" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#EAEAEA",
          fontFamily: '"Geist Mono", monospace',
          marginBottom: "12px",
          letterSpacing: "1px",
        }}
      >
        SYSTEM
      </div>
      <div
        style={{
          display: "flex",
          gap: "4px",
          alignItems: "center",
          height: "24px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "12px",
            background: "#EAEAEA",
            animation: "blink 1s step-end infinite",
          }}
        />
      </div>
    </div>
  );
}
