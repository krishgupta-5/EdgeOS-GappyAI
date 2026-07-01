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

export default function TermsOfService() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("acceptance");
  const isClickScrolling = useRef(false);

  // Reliable Scroll Spy for the Index
  useEffect(() => {
    const sections = [
      "acceptance", "description", "accounts", "payment",
      "ip", "prohibited", "availability", "liability",
      "termination", "changes", "contact"
    ];
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
    { id: "acceptance", label: "1. Acceptance of Terms" },
    { id: "description", label: "2. Description of Service" },
    { id: "accounts", label: "3. User Accounts" },
    { id: "payment", label: "4. Payment & Subscription" },
    { id: "ip", label: "5. Intellectual Property" },
    { id: "prohibited", label: "6. Prohibited Uses" },
    { id: "availability", label: "7. Service Availability" },
    { id: "liability", label: "8. Limitation of Liability" },
    { id: "termination", label: "9. Termination" },
    { id: "changes", label: "10. Changes to Terms" },
    { id: "contact", label: "11. Contact Details" }
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
              Terms of Service
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
                transform: `translateY(${Math.max(0, sectionsList.findIndex(s => s.id === activeSection)) * 37
                  }px)`
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

            <div id="acceptance">
              <PolicySection title="1. Acceptance of Terms">
                By accessing and using ProdMate ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="description">
              <PolicySection title="2. Description of Service">
                ProdMate is a developer platform that provides AI-powered coding assistance, project management tools, and collaborative workspace features. The service is offered on a subscription basis with different tiers available.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="accounts">
              <PolicySection title="3. User Accounts and Responsibilities">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. You are solely responsible for all activities that occur under your account.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="payment">
              <PolicySection title="4. Payment and Subscription Terms">
                Subscription fees are charged in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change our subscription fees at any time with 30 days notice.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="ip">
              <PolicySection title="5. Intellectual Property Rights">
                You retain ownership of all intellectual property rights in the code and content you create using our service. We retain ownership of all rights to the ProdMate platform, software, and proprietary technology.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="prohibited">
              <PolicySection title="6. Prohibited Uses">
                You may not use our service for any illegal or unauthorized purpose. You may not use our service to develop malicious software, violate intellectual property rights, or engage in activities that harm others or our platform.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="availability">
              <PolicySection title="7. Service Availability and Support">
                We strive to maintain high service availability but do not guarantee uninterrupted access. Support levels vary by subscription tier as described in our pricing page.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="liability">
              <PolicySection title="8. Limitation of Liability">
                To the maximum extent permitted by law, ProdMate shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="termination">
              <PolicySection title="9. Termination">
                We may terminate or suspend your account at any time for violation of these terms. You may cancel your subscription at any time through your account settings.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="changes">
              <PolicySection title="10. Changes to Terms">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of any modified terms.
              </PolicySection>
            </div>

            <div style={{ height: "1px", width: "100%", background: T.border }} />

            <div id="contact">
              <PolicySection title="11. Contact Information">
                If you have any questions about these Terms of Service, please contact us at:
                <div style={{
                  marginTop: "16px", padding: "12px 16px", background: "rgba(255,255,255,0.03)",
                  borderRadius: "6px", border: `1px solid ${T.border}`, fontFamily: "Consolas, 'Courier New', monospace",
                  fontSize: "13px", color: T.text, display: "inline-block"
                }}>
                  legal@prodmate.dev
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
          <Link href="/terms" style={{ color: T.text, textDecoration: "none" }}>
            Terms of Service
          </Link>
          <span>&bull;</span>
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.textHint}>
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/cookies" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.text}
            onMouseLeave={e => e.currentTarget.style.color = T.textHint}>
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
