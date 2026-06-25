"use client";

import React from "react";

interface InputAreaProps {
  input: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  tokenQuota: {
    tokensUsed: number;
    tokensLimit: number;
    tokensRemaining: number;
    exhausted: boolean;
    resetAt: number;
  } | null;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  isTyping: boolean;
}

export default function InputArea({ 
  input, 
  textareaRef, 
  tokenQuota, 
  handleInputChange, 
  handleKeyDown, 
  handleSend,
  isTyping 
}: InputAreaProps) {
  return (
    <div
      style={{
        background: "#18181b",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        border: "1px solid #27272a",
        borderRadius: "10px",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3f3f46"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#27272a"; }}
    >

      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={isTyping ? "Processing..." : "Ask about projects, suites, or the UI..."}
        disabled={isTyping}
        rows={1}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: isTyping ? "#71717a" : "#ffffff",
          fontSize: "14px",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          resize: "none",
          lineHeight: "1.5",
          height: "auto",
          minHeight: "24px",
          maxHeight: "120px",
          overflowY: "auto",
          padding: "0",
          margin: "0",
          cursor: isTyping ? "not-allowed" : "text",
          opacity: isTyping ? 0.6 : 1,
        }}
      />
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={() => {
            // File attachment functionality to be implemented
            console.log('File attachment clicked');
          }}
          style={{ background: "transparent", border: "none", color: "#a1a1aa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 8px", borderRadius: "8px", transition: "all 0.15s ease", fontSize: "16px", fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 500 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#a1a1aa"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          title="Attach File"
        >
          +
        </button>
        <button
          onClick={handleSend}
          disabled={tokenQuota?.exhausted || isTyping}
          style={{
            background: (input.trim() && !tokenQuota?.exhausted && !isTyping) ? "#ffffff" : "transparent",
            border: `1px solid ${tokenQuota?.exhausted ? "#ef444440" : isTyping ? "#27272a" : input.trim() ? "#ffffff" : "#27272a"}`,
            color: tokenQuota?.exhausted ? "#ef4444" : isTyping ? "#71717a" : input.trim() ? "#09090b" : "#71717a",
            cursor: (input.trim() && !tokenQuota?.exhausted && !isTyping) ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            textTransform: "uppercase",
            transition: "all 0.15s ease",
            borderRadius: "8px",
            opacity: isTyping ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (input.trim() && !tokenQuota?.exhausted && !isTyping) {
              e.currentTarget.style.background = "#e4e4e7";
              e.currentTarget.style.borderColor = "#e4e4e7";
            } else if (!isTyping && !tokenQuota?.exhausted) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor = "#3f3f46";
            }
          }}
          onMouseLeave={(e) => {
            if (input.trim() && !tokenQuota?.exhausted && !isTyping) {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#ffffff";
            } else {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = tokenQuota?.exhausted ? "#ef444440" : isTyping ? "#27272a" : "#27272a";
            }
          }}
        >
          {tokenQuota?.exhausted ? "BURNED" : isTyping ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ 
                width: "8px", 
                height: "8px", 
                border: "2px solid #71717a", 
                borderTop: "2px solid transparent", 
                borderRadius: "50%", 
                animation: "spin 1s linear infinite" 
              }} />
              <span>Processing</span>
            </div>
          ) : "Exec"}
        </button>
      </div>
    </div>
  );
}

