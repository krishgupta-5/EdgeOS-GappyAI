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

export default function CookiePolicy() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("introduction");
  const isClickScrolling = useRef(false);

  // Reliable Scroll Spy for the Index
  useEffect(() => {
    const sections = ["introduction", "usage", "types", "managing", "contact"];
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

  const sectionsList = [
    { id: "introduction", label: "1. Introduction" },
    { id: "usage", label: "2. How We Use Cookies" },
    { id: "types", label: "3. Types of Cookies" },
    { id: "managing", label: "4. Managing Cookies" },
    { id: "contact", label: "5. Contact Details" }
  ];

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
              Cookie Policy
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
                transform: `translateY(${Math.max(0, sectionsList.findIndex(s => s.id === activeSection)) * 37}px)`
              }} />

              {sectionsList.map(item => (
                <NavButton key={item.id} active={activeSection === item.id} onClick={() => scrollTo(item.id)} label={item.label} />
              ))}
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
                This Cookie Policy explains how ProdMate ("we," "our," or "us") uses cookies and similar tracking technologies when you access our developer platform and AI workspace. By using our service, you consent to the use of cookies as described in this policy.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="usage">
              <PolicySection title="2. How We Use Cookies">
                We use cookies to maintain secure user authentication, remember your workspace preferences, ensure session continuity, and monitor system performance. Cookies allow us to deliver a fast, reliable, and personalized AI development environment without compromising security.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="types">
              <PolicySection title="3. Types of Cookies We Use">
                Our platform relies on three distinct categories of cookies:
                <ul style={{ paddingLeft: "16px", margin: "16px 0 0 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li>
                    <strong style={{ color: T.text, fontWeight: 500 }}>Essential Cookies:</strong> Required for authentication and core security. These tokens keep you signed in securely via Clerk and protect your workspace against unauthorized requests.
                  </li>
                  <li>
                    <strong style={{ color: T.text, fontWeight: 500 }}>Preference Cookies:</strong> Used to remember your customized settings, UI layouts, theme selections, and active project preferences across sessions.
                  </li>
                  <li>
                    <strong style={{ color: T.text, fontWeight: 500 }}>Performance & Telemetry Cookies:</strong> Help us measure API latency, token quota consumption, and resource utilization to maintain system reliability and prevent downtime.
                  </li>
                </ul>
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="managing">
              <PolicySection title="4. Managing Your Cookies">
                Most web browsers allow you to control or disable cookies through their settings preferences. However, please note that disabling essential authentication cookies will prevent you from logging into your ProdMate workspace or accessing AI services.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="contact">
              <PolicySection title="5. Contact Information">
                If you have any questions or concerns about our use of cookies or tracking technologies, please reach out to our privacy engineering team at:
                <div style={{
                  marginTop: "16px", padding: "12px 16px", background: "rgba(255,255,255,0.03)",
                  borderRadius: "6px", border: `1px solid ${T.border}`, fontFamily: "Consolas, 'Courier New', monospace",
                  fontSize: "13px", color: T.text, display: "inline-block"
                }}>
                  privacy@prodmate.dev
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
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.textHint}>
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/cookies" style={{ color: T.text, textDecoration: "none" }}>
            Cookie Policy
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
