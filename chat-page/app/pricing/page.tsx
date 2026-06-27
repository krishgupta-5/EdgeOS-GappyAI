"use client";

import React, { useState } from "react";
import Link from "next/link";

// ── Minimal Premium Design Tokens ──────────────────────────────────────
const T = {
  bg: "#09090b",
  surface: "rgba(255, 255, 255, 0.02)",
  surfaceHover: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.08)",
  borderHover: "rgba(255, 255, 255, 0.15)",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
};

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: T.bg,
        color: T.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px 80px",
        fontFamily: T.font,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ── Ambient Background Glow ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "800px",
        height: "400px",
        background: "radial-gradient(ellipse at top, rgba(255,255,255,0.035) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* ───────────────────────────────────────────── */}
      {/* PAGE HEADER                                   */}
      {/* ───────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "64px",
          position: "relative",
          zIndex: 1,
          animation: "fadeUp 0.6s ease-out both",
        }}
      >
        <Link href="/chat" style={{ position: "absolute", left: 0, top: 0, textDecoration: "none" }}>
          <button
            style={{
              width: "40px",
              height: "40px",
              background: T.surface,
              border: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              cursor: "pointer",
              color: T.textMuted,
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = T.text;
              e.currentTarget.style.background = T.surfaceHover;
              e.currentTarget.style.borderColor = T.borderHover;
              e.currentTarget.style.transform = "translateX(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = T.textMuted;
              e.currentTarget.style.background = T.surface;
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        </Link>

        {/* Early Access Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "100px",
          background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`,
          marginBottom: "24px",
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff", boxShadow: "0 0 8px #ffffff" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: T.textMuted, letterSpacing: "0.04em", textTransform: "uppercase" }}>Early Access</span>
        </div>

        <h1 style={{
          fontSize: "48px",
          fontWeight: 500,
          letterSpacing: "-0.03em",
          margin: "0 0 16px 0",
          textAlign: "center",
          lineHeight: 1.1,
          background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.6) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Build better products.<br />
          <span style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>Free for now.</span>
        </h1>

        <p style={{
          color: T.textMuted,
          fontSize: "16px",
          lineHeight: "1.6",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 0 32px 0",
        }}>
          Generate product roadmaps, technical documentation, APIs, database schemas, architecture plans and testing strategies completely free during our early access period.
        </p>

        {/* BILLING TOGGLE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            padding: "4px",
            borderRadius: "12px",
            border: `1px solid ${T.border}`,
            backdropFilter: "blur(12px)"
          }}
        >
          <button
            onClick={() => setIsAnnual(false)}
            style={{
              padding: "8px 20px",
              background: !isAnnual ? "rgba(255,255,255,0.08)" : "transparent",
              color: !isAnnual ? T.text : T.textMuted,
              border: "1px solid",
              borderColor: !isAnnual ? "rgba(255,255,255,0.1)" : "transparent",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: T.font,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: !isAnnual ? "0 2px 8px rgba(0,0,0,0.2)" : "none"
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            style={{
              padding: "8px 20px",
              background: isAnnual ? "rgba(255,255,255,0.08)" : "transparent",
              color: isAnnual ? T.text : T.textMuted,
              border: "1px solid",
              borderColor: isAnnual ? "rgba(255,255,255,0.1)" : "transparent",
              borderRadius: "8px",
              fontSize: "13px",
              fontFamily: T.font,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: isAnnual ? "0 2px 8px rgba(0,0,0,0.2)" : "none"
            }}
          >
            Annually
            <span style={{ color: T.textMuted, fontSize: "11px", fontWeight: 600, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* PRICING CARDS                                 */}
      {/* ───────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          alignItems: "stretch",
          position: "relative",
          zIndex: 1,
          animation: "fadeUp 0.6s ease-out 0.2s both",
        }}
      >
        {/* TIER 1: STARTER */}
        <PricingCard
          title="Starter"
          description="Perfect for founders, students and solo builders."
          price="0"
          interval="month"
          isAvailable={true}
          features={[
            "AI Product Planning",
            "Roadmap Generation",
            "User Stories",
            "PRD Generation",
            "Markdown Documentation",
            "Project Timeline Planning"
          ]}
          buttonText="Start Planning Free"
        />

        {/* TIER 2: PRO */}
        <PricingCard
          title="Pro"
          description="For developers building production-ready software."
          price={isAnnual ? "39" : "49"}
          interval="month"
          isAvailable={false}
          features={[
            "Everything in Starter",
            "API Design",
            "Database Schema Generation",
            "System Architecture",
            "Testing Plans",
            "Docker Configuration",
            "CI/CD Pipeline Planning",
            "Risk Analysis"
          ]}
          buttonText="Upgrade"
        />

        {/* TIER 3: TEAM */}
        <PricingCard
          title="Team"
          description="For startups and collaborative product teams."
          price={isAnnual ? "89" : "99"}
          interval="month"
          isAvailable={false}
          features={[
            "Everything in Pro",
            "Team Workspaces",
            "Shared Project Planning",
            "Architecture Decisions (ADR)",
            "Advanced Documentation",
            "Deployment Planning",
            "Priority Support"
          ]}
          buttonText="Upgrade"
        />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}} />
    </div>
  );
}

// ─────────────────────────────────────────────
// PRICING CARD COMPONENT
// ─────────────────────────────────────────────

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  interval: string;
  features: string[];
  buttonText: string;
  isAvailable: boolean;
}

function PricingCard({
  title,
  description,
  price,
  interval,
  features,
  buttonText,
  isAvailable,
}: PricingCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{
        background: isAvailable ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
        border: `1px solid ${isAvailable ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
        borderRadius: "24px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: isAvailable
          ? "inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)"
          : "none",
        transform: hover && isAvailable ? "translateY(-4px)" : "translateY(0)"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Locked Overlay for Unavailable Plans */}
      {!isAvailable && (
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            padding: "8px 20px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "100px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)"
          }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Available Soon
            </span>
          </div>
        </div>
      )}

      {/* Card Content (HEAVILY BLURRED if not available) */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        opacity: isAvailable ? 1 : 0.2,
        filter: isAvailable ? "none" : "blur(12px) grayscale(100%)",
        pointerEvents: isAvailable ? "auto" : "none",
        userSelect: isAvailable ? "auto" : "none",
        transition: "all 0.3s ease"
      }}>

        <div style={{ marginBottom: "24px" }}>
          <h3 style={{
            fontSize: "20px",
            fontWeight: 600,
            color: T.text,
            letterSpacing: "-0.01em",
            margin: "0 0 8px 0"
          }}>
            {title}
          </h3>
          <p style={{
            color: T.textMuted,
            fontSize: "14px",
            lineHeight: "1.6",
            margin: 0,
            minHeight: "44px",
          }}>
            {description}
          </p>
        </div>

        <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
            <span style={{
              fontSize: "42px",
              color: T.text,
              fontWeight: 600,
              letterSpacing: "-1px",
              lineHeight: 1,
            }}>
              ${price}
            </span>
            <span style={{
              fontSize: "14px",
              color: T.textHint,
              fontWeight: 500,
              marginBottom: "4px"
            }}>
              / {interval}
            </span>
          </div>

          {isAvailable && (
            <div>
              <span style={{
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 600,
                color: T.text,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "4px 10px",
                borderRadius: "100px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Unlimited Beta Access
              </span>
            </div>
          )}
        </div>

        <div style={{ height: "1px", width: "100%", background: T.border, marginBottom: "32px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
          {features.map((feature, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: "1.5" }}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        <button
          style={{
            width: "100%",
            marginTop: "40px",
            padding: "12px",
            background: isAvailable ? T.text : "rgba(255,255,255,0.05)",
            color: isAvailable ? T.bg : T.textHint,
            border: `1px solid ${isAvailable ? T.text : T.border}`,
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: T.font,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (isAvailable) {
              e.currentTarget.style.background = "#e5e5e5";
              e.currentTarget.style.borderColor = "#e5e5e5";
            }
          }}
          onMouseLeave={(e) => {
            if (isAvailable) {
              e.currentTarget.style.background = T.text;
              e.currentTarget.style.borderColor = T.text;
            }
          }}
        >
          {buttonText}
        </button>

      </div>
    </div>
  );
}