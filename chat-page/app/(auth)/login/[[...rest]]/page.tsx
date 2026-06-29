"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

// Replaces StructuralNetwork with the grid/dashed-line design from the image
const AceGridBackground = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 0,
      overflow: "hidden",
    }}
  >
    {/* Subtle Dot Pattern */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle at center, #27272a 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        opacity: 0.5,
      }}
    />

    {/* Central Content Boundaries (Vertical Dashed Lines) */}
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "1100px", // Adjust this to match your desired content width
        borderLeft: "1px dashed #27272a",
        borderRight: "1px dashed #27272a",
      }}
    />

    {/* Header Boundary (Horizontal Dashed Line) */}
    <div
      style={{
        position: "absolute",
        top: "84px", // Matches header height
        left: 0,
        right: 0,
        borderBottom: "1px dashed #27272a",
      }}
    />

    {/* Footer Boundary (Horizontal Dashed Line) */}
    <div
      style={{
        position: "absolute",
        bottom: "64px", // Matches footer height
        left: 0,
        right: 0,
        borderTop: "1px dashed #27272a",
      }}
    />

    {/* Central Radial Gradient to soften the background behind main content */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at center, transparent 0%, #0a0a0a 100%)",
      }}
    />
  </div>
);

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0a", // Matched to the dark base of the reference image
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        fontFamily: 'var(--font-satoshi), system-ui, -apple-system, sans-serif',
      }}
    >
      {/* New Background Component */}
      <AceGridBackground />

      {/* ───────────────────────────────────────────── */}
      {/* HEADER                                        */}
      {/* ───────────────────────────────────────────── */}
      <div
        style={{
          height: "84px", // Fixed height to align with the dashed background line
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div />

        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="/signup" style={{ textDecoration: "none" }}>
            <span
              style={{
                color: "#71717a",
                fontSize: "12px",
                fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
                letterSpacing: "1px",
                transition: "all 0.2s ease",
                cursor: "pointer",
                padding: "6px 12px",
                border: "1px solid transparent",
                borderRadius: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ededed";
                e.currentTarget.style.border = "1px solid #27272a";
                e.currentTarget.style.background = "#121214";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#71717a";
                e.currentTarget.style.border = "1px solid transparent";
                e.currentTarget.style.background = "transparent";
              }}
            >
              CREATE ACCOUNT →
            </span>
          </Link>
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* MAIN CONTENT                                  */}
      {/* ───────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            zIndex: 10,
          }}
        >
          {/* STATUS INDICATOR */}
          {mounted && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 16px",
                background: "rgba(18, 18, 20, 0.6)",
                backdropFilter: "blur(8px)",
                border: "1px solid #27272a",
                borderRadius: "100px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "8px",
                  height: "8px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: "#38bdf8",
                    borderRadius: "50%",
                    animation: "pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
                    opacity: 0.8,
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    width: "6px",
                    height: "6px",
                    background: "#38bdf8",
                    borderRadius: "50%",
                    zIndex: 2,
                  }}
                />
              </div>
              <span
                style={{
                  color: "#ededed",
                  fontSize: "11px",
                  fontFamily: '"Geist Mono", monospace',
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
                }}
              >
                LOGIN
              </span>
            </div>
          )}

          {/* CLERK COMPONENT - LIGHT THEME */}
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            appearance={{
              variables: {
                colorPrimary: "#ffffff",
                colorDanger: "#ef4444",
                borderRadius: "8px",
                fontFamily: 'var(--font-satoshi), system-ui, sans-serif',
              },
              elements: {
                card: {
                  border: "1px solid #27272a",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  background: "#0a0a0a",
                },
                headerTitle: { color: "#ededed" },
                headerSubtitle: { color: "#a1a1aa" },
                socialButtonsBlockButton: {
                  border: "1px solid #27272a",
                  backgroundColor: "#0a0a0a",
                  color: "#ededed",
                  "&:hover": { backgroundColor: "#18181b" },
                },
                socialButtonsBlockButtonText: { fontWeight: 500 },
                dividerLine: { backgroundColor: "#27272a" },
                dividerText: { color: "#71717a" },
                formFieldLabel: { color: "#a1a1aa" },
                formFieldInput: {
                  border: "1px solid #27272a",
                  backgroundColor: "#0a0a0a",
                  "&:focus": { border: "1px solid #3f3f46", outline: "none", boxShadow: "none" },
                },
                formButtonPrimary: {
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#e4e4e7" },
                },
                footerActionText: { color: "#a1a1aa" },
                footerActionLink: { color: "#ededed", "&:hover": { color: "#ffffff" } },
              },
            }}
          />
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* FOOTER                                        */}
      {/* ───────────────────────────────────────────── */}
      <div
        style={{
          height: "64px", // Fixed height to align with the dashed background line
          padding: "0 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#71717a",
          fontSize: "11px",
          fontFamily: '"Geist Mono", monospace',
          textTransform: "uppercase",
          letterSpacing: "1px",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div />
        <div>v1.0.0</div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `,
        }}
      />
    </div>
  );
}
