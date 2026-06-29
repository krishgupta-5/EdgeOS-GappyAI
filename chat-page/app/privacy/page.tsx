"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Shared Minimal Design Tokens ──────────────────────────────────────
const T = {
  bg: "#09090b",
  surface: "rgba(255, 255, 255, 0.02)",
  surfaceHover: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.08)",
  borderHover: "rgba(255, 255, 255, 0.15)",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  font: "var(--font-inter), system-ui, -apple-system, sans-serif",
};

export default function PrivacyPolicy() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("introduction");
  const isClickScrolling = useRef(false);

  // Reliable Scroll Spy for the Index
  useEffect(() => {
    const sections = ["introduction", "information", "security", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isClickScrolling.current) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" } // Triggers when the section is near the top
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    isClickScrolling.current = true;
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Re-enable scroll spy after scroll animation finishes
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        backgroundColor: T.bg,
        color: T.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 80px",
        fontFamily: T.font,
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* ───────────────────────────────────────────── */}
        {/* PAGE HEADER                                   */}
        {/* ───────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "20px",
          marginBottom: "40px", paddingBottom: "24px", borderBottom: `1px solid ${T.border}`,
          animation: "fadeUp 0.4s ease-out both"
        }}>
          <button
            onClick={() => router.back()}
            style={{
              width: "36px", height: "36px", background: "transparent", border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px",
              cursor: "pointer", color: T.textMuted, transition: "all 0.15s ease", flexShrink: 0
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = T.text;
              e.currentTarget.style.background = T.surfaceHover;
              e.currentTarget.style.borderColor = T.textHint;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = T.textMuted;
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = T.border;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 600, color: T.text, margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>
              Privacy Policy
            </h1>
            <p style={{ color: T.textHint, fontSize: "13px", margin: 0 }}>
              Last updated: June 27, 2026
            </p>
          </div>
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* DUAL-COLUMN LAYOUT                            */}
        {/* ───────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "row", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* LEFT SIDEBAR: Sticky Index */}
          <aside style={{
            width: "220px", flexShrink: 0, position: "sticky", top: "40px",
            display: "flex", flexDirection: "column",
            animation: "fadeUp 0.4s ease-out 0.1s both",
          }}>
            <div style={{ fontSize: "11px", color: T.textHint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px", paddingLeft: "12px", fontWeight: 600 }}>
              Contents
            </div>
            
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "2px" }}>
              {/* Sliding Highlighter */}
              <div style={{
                position: "absolute", left: 0, right: 0, height: "35px",
                background: T.surfaceHover, borderRadius: "6px", zIndex: 0,
                transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translateY(${
                  activeSection === "introduction" ? 0 :
                  activeSection === "information" ? 37 :
                  activeSection === "security" ? 74 :
                  activeSection === "contact" ? 111 : 0
                }px)`
              }} />

              <NavButton active={activeSection === "introduction"} onClick={() => scrollTo("introduction")} label="1. Introduction" />
              <NavButton active={activeSection === "information"} onClick={() => scrollTo("information")} label="2. Information Collected" />
              <NavButton active={activeSection === "security"} onClick={() => scrollTo("security")} label="3. Data Security" />
              <NavButton active={activeSection === "contact"} onClick={() => scrollTo("contact")} label="4. Contact Details" />
            </div>
          </aside>

          {/* RIGHT COLUMN: Document Content */}
          <main style={{
            flex: 1, minWidth: "300px",
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: "12px", padding: "32px",
            animation: "fadeUp 0.4s ease-out 0.2s both",
            display: "flex", flexDirection: "column", gap: "40px"
          }}>

            <div id="introduction">
              <PolicySection title="1. Introduction">
                ProdMate ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our developer platform and AI services.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="information">
              <PolicySection title="2. Information We Collect">
                We collect information through two primary channels to ensure optimal performance and security of our workspace environment:
                <ul style={{ paddingLeft: "16px", margin: "16px 0 0 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li>
                    <strong style={{ color: T.text, fontWeight: 500 }}>Account & Identity:</strong> Email, name, and necessary registration details to establish your workspace and prevent unauthorized access.
                  </li>
                  <li>
                    <strong style={{ color: T.text, fontWeight: 500 }}>Telemetry & Quotas:</strong> Interactions with AI assistants strictly to manage compute resources, token quotas, and system reliability.
                  </li>
                  <li>
                    <strong style={{ color: T.text, fontWeight: 500 }}>Project Artifacts:</strong> The architecture, code, and specifications generated within your private sessions.
                  </li>
                </ul>
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="security">
              <PolicySection title="3. Data Security & Storage">
                Your data is protected by industry-standard technical measures. We utilize end-to-end encryption for sensitive data in transit, secure server architectures, and routine access audits.
                <br /><br />
                <span style={{ color: T.text, fontWeight: 500 }}>Model Training Policy:</span> Your project data, code snippets, and proprietary architectures are completely isolated. They are <strong style={{ color: T.text }}>never</strong> used to train our generalized AI models without your explicit, opt-in consent.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="contact">
              <PolicySection title="4. Contact Information">
                If you have questions regarding your data, GDPR compliance, or wish to exercise your "Right to be Forgotten," our privacy engineering team is available directly at:
                <div style={{
                  marginTop: "16px", padding: "12px 16px", background: "rgba(255,255,255,0.03)",
                  borderRadius: "6px", border: `1px solid ${T.border}`, fontFamily: "Consolas, 'Courier New', monospace",
                  fontSize: "13px", color: T.text, display: "inline-block"
                }}>
                  privacy@ProdMate.com
                </div>
              </PolicySection>
            </div>

          </main>
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* FOOTER                                        */}
        {/* ───────────────────────────────────────────── */}
        <div style={{
          marginTop: "64px", paddingTop: "24px", borderTop: `1px solid ${T.border}`,
          display: "flex", gap: "20px", color: T.textHint, fontSize: "12px",
          textTransform: "uppercase", letterSpacing: "0.05em",
          animation: "fadeUp 0.4s ease-out 0.3s both"
        }}>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.textHint}>
            Terms of Service
          </Link>
          <span>&bull;</span>
          <Link href="/privacy" style={{ color: T.text, textDecoration: "none" }}>
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(12px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}} />
    </div>
  );
}

// ── Shared UI Components ──────────────────────────────────────────────

function NavButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", fontFamily: T.font,
        fontWeight: 500, transition: "all 0.15s ease", cursor: "pointer", border: "none", outline: "none",
        background: "transparent", position: "relative", zIndex: 1,
        color: active ? T.text : T.textMuted,
      }}
      onMouseEnter={(e) => {
        if (!active) { e.currentTarget.style.color = T.text; }
      }}
      onMouseLeave={(e) => {
        if (!active) { e.currentTarget.style.color = T.textMuted; }
      }}
    >
      {label}
    </button>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{
        fontSize: "15px", fontWeight: 600, color: T.text, marginBottom: "12px",
        letterSpacing: "-0.01em"
      }}>
        {title}
      </h2>
      <div style={{ color: T.textMuted, fontSize: "14px", lineHeight: "1.6", fontWeight: 400 }}>
        {children}
      </div>
    </div>
  );
}
