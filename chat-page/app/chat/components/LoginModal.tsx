"use client";

import React from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
}: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#09090b",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.9)",
          fontFamily: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            color: "#EAEAEA",
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "16px",
            fontFamily: "var(--font-satoshi), system-ui, sans-serif",
            textAlign: "center",
            letterSpacing: "0.5px",
          }}
        >
          Authentication Required
        </div>

        <div
          style={{
            color: "#888",
            fontSize: "14px",
            marginBottom: "24px",
            textAlign: "center",
            lineHeight: "1.6",
            fontFamily: "var(--font-satoshi), system-ui, sans-serif",
          }}
        >
          You need to be logged in to send messages. Please sign in to continue
          using the chat.
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #333",
              color: "#888",
              cursor: "pointer",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "var(--font-satoshi), system-ui, sans-serif",
              transition: "all 0.15s ease",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#555";
              e.currentTarget.style.color = "#A0A0A0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#333";
              e.currentTarget.style.color = "#888";
            }}
          >
            Cancel
          </button>

          <button
            onClick={onLogin}
            style={{
              background: "#EAEAEA",
              border: "1px solid #EAEAEA",
              color: "#000000",
              cursor: "pointer",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-satoshi), system-ui, sans-serif",
              transition: "all 0.15s ease",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.borderColor = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#EAEAEA";
              e.currentTarget.style.borderColor = "#EAEAEA";
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
