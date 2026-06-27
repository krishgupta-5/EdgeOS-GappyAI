"use client";

import React, { useState } from "react";

interface InputQuota {
  tokensUsed: number;
  tokensLimit: number;
  tokensRemaining: number;
  exhausted: boolean;
  resetAt: number;
}

interface InputAreaProps {
  input: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  tokenQuota: InputQuota | null;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  isTyping: boolean;
}

// --- Helper Components for Encapsulated Hover States ---

const IconButton = ({ children, title }: { children: React.ReactNode; title: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      title={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: isHovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
        color: isHovered ? "#ffffff" : "#a1a1aa",
        border: "1px solid transparent",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </button>
  );
};

const SendButton = ({
  onClick,
  disabled,
  isTyping,
}: {
  onClick: () => void;
  disabled: boolean;
  isTyping: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldAnimateLift = isHovered && !disabled;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isTyping}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: disabled ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
        color: disabled ? "rgba(255, 255, 255, 0.3)" : "#000000",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transform: shouldAnimateLift ? "scale(1.05)" : "scale(1)",
        boxShadow: shouldAnimateLift
          ? "0 4px 14px rgba(255, 255, 255, 0.25)"
          : "none",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {isTyping ? (
        <svg className="send-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3" />
          <path d="M21 12a9 9 0 0 1-6.219 8.56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
          </path>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      )}
    </button>
  );
};


// --- Main Component ---

export default function InputArea({
  input,
  textareaRef,
  tokenQuota,
  handleInputChange,
  handleKeyDown,
  handleSend,
  isTyping,
}: InputAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const onChangeWrapper = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
    handleInputChange(e);
  };

  const isSubmitDisabled = !input.trim() || tokenQuota?.exhausted || isTyping;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        // Premium Frosted Glass Container
        background: isFocused ? "rgba(255, 255, 255, 0.04)" : isHovered ? "rgba(255, 255, 255, 0.03)" : "rgba(20, 20, 24, 0.5)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${isFocused
            ? "rgba(255, 255, 255, 0.2)"
            : isHovered
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(255, 255, 255, 0.06)"
          }`,
        borderRadius: "20px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: isFocused
          ? "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          : "0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.02)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={onChangeWrapper}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Describe the software product you want to build..."
        disabled={isTyping}
        rows={1}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#ffffff",
          fontSize: "15px",
          fontFamily: "var(--font-satoshi), system-ui, sans-serif",
          lineHeight: "1.6",
          padding: "0 4px",
          margin: "0",
          resize: "none",
          overflowY: "auto",
          minHeight: "24px",
          maxHeight: "160px",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <IconButton title="Attach file">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </IconButton>
          <IconButton title="Voice input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </IconButton>
          <IconButton title="Upload image">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </IconButton>
        </div>

        <SendButton
          onClick={() => handleSend()}
          disabled={Boolean(isSubmitDisabled)}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
}