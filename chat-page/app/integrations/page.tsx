"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "../chat/components/Sidebar";
import LoginModal from "../chat/components/LoginModal";

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

const LOGO_DEV_PUBLIC_KEY = process.env.NEXT_PUBLIC_LOGO_DEV_KEY || 'pk_dNdWcUuQT6e3A-6SxXGIYw';

function CompanyLogo({ domain, grayscale, logoUrl }: { domain: string, grayscale?: boolean, logoUrl?: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      filter: grayscale ? "grayscale(100%) opacity(0.5)" : "none",
      transition: "filter 0.3s ease"
    }}>
      <Image
        src={logoUrl || `https://img.logo.dev/${domain}?token=${LOGO_DEV_PUBLIC_KEY}`}
        alt={`${domain} logo`}
        width={48}
        height={48}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

// ─── Component Data ─────────────────────────────────────────────────────────

type Category = "All" | "Workspace" | "Communication" | "Development" | "Project Management" | "Productivity";

interface Integration {
  id: string;
  name: string;
  category: Category;
  description: string;
  domain: string;
  connected: boolean;
  logoUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "notion",
    name: "Notion",
    category: "Workspace",
    description: "Export your PRDs, User Stories, and Architecture specs directly to your Notion workspace.",
    domain: "notion.so",
    connected: false,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    category: "Communication",
    description: "Send notifications and sync tasks directly with your team's channels.",
    domain: "teams.microsoft.com",
    connected: false,
  },
  {
    id: "github",
    name: "GitHub",
    category: "Development",
    description: "Link commits, pull requests, and issues directly to your planning documents.",
    domain: "github.com",
    connected: false,
  },
  {
    id: "jira",
    name: "Jira",
    category: "Project Management",
    description: "Automatically create and update Jira tickets from generated user stories.",
    domain: "jira.com",
    connected: false,
  },
  {
    id: "calendar",
    name: "Google Calendar",
    category: "Productivity",
    description: "Sync project milestones and automatically schedule review meetings.",
    domain: "calendar.google.com",
    connected: false,
    logoUrl: "https://cloud.gmelius.com/public/logos/google/Google_Calendar_Logo_512px.png",
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "Communication",
    description: "Automate email updates and summaries to stakeholders on project progress.",
    domain: "gmail.com",
    connected: false,
    logoUrl: "/Gmail_Logo_512px.png",
  }
];

const CATEGORIES: Category[] = ["All", "Workspace", "Communication", "Development", "Project Management", "Productivity"];

// ─── Child Components ───────────────────────────────────────────────────────

function IntegrationCard({ integration, onToggle, children }: { integration: Integration, onToggle: (id: string) => void, children?: React.ReactNode }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        background: hover ? T.surfaceHover : T.surface,
        border: `1px solid ${hover ? T.borderHover : T.border}`,
        borderRadius: "16px",
        padding: "24px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: hover ? "0 8px 32px rgba(0,0,0,0.2)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
        {/* Brand Icon Container using Logo.dev or Custom URL */}
        <CompanyLogo domain={integration.domain} grayscale={!integration.connected} logoUrl={integration.logoUrl} />

        {/* Status Badge */}
        <div style={{
          padding: "4px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.05em", transition: "all 0.3s ease",
          background: integration.connected ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.03)",
          color: integration.connected ? "#34d399" : T.textHint,
          border: `1px solid ${integration.connected ? "rgba(16, 185, 129, 0.2)" : T.border}`,
        }}>
          {integration.connected ? "Connected" : "Inactive"}
        </div>
      </div>

      <div style={{ flex: 1, marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: T.text, margin: "0 0 8px 0", letterSpacing: "-0.01em" }}>
          {integration.name}
        </h3>
        <p style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", margin: 0 }}>
          {integration.description}
        </p>
      </div>

      {/* Footer / Toggle Area */}
      <div style={{ paddingTop: "20px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => onToggle(integration.id)}
          style={{
            background: integration.connected ? "transparent" : T.text,
            color: integration.connected ? T.text : T.bg,
            border: integration.connected ? `1px solid ${T.borderHover}` : "none",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: T.font,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={e => {
            if (integration.connected) {
              e.currentTarget.style.background = T.surfaceHover;
            } else {
              e.currentTarget.style.opacity = "0.9";
            }
          }}
          onMouseLeave={e => {
            if (integration.connected) {
              e.currentTarget.style.background = "transparent";
            } else {
              e.currentTarget.style.opacity = "1";
            }
          }}
        >
          {integration.connected ? "Configure Settings" : "Connect"}
        </button>

        {/* Minimal Toggle Switch */}
        <div
          onClick={() => onToggle(integration.id)}
          style={{
            width: "36px", height: "20px", borderRadius: "10px", cursor: "pointer",
            background: integration.connected ? T.text : "rgba(255,255,255,0.1)",
            position: "relative", transition: "background 0.3s ease"
          }}
        >
          <div style={{
            position: "absolute", top: "2px", left: "2px",
            width: "16px", height: "16px", borderRadius: "50%",
            background: integration.connected ? T.bg : T.textMuted,
            transform: integration.connected ? "translateX(16px)" : "translateX(0)",
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease"
          }} />
        </div>
      </div>

      {/* Expanding Settings Area */}
      {children}
    </div>
  );
}

// ─── Main Layout Component ──────────────────────────────────────────────────

export default function IntegrationsPanel() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);

  const [notionData, setNotionData] = useState<{ connected: boolean; workspaceName?: string; pages?: any[]; defaultParentPageId?: string } | null>(null);
  const [loadingNotion, setLoadingNotion] = useState(true);
  const [selectedPage, setSelectedPage] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showSettings, setShowSettings] = useState<{ [key: string]: boolean }>({});

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetch("/api/notion/pages")
      .then((res) => res.json())
      .then((d) => {
        setNotionData(d);
        if (d.defaultParentPageId) setSelectedPage(d.defaultParentPageId);

        setIntegrations(
          INTEGRATIONS.map((i) =>
            i.id === "notion" ? { ...i, connected: !!d.connected } : i
          )
        );
        setLoadingNotion(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingNotion(false);
      });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    let rafId: number;
    let lastWidth = sidebarWidth;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const newWidth = moveEvent.clientX;
        if (newWidth >= 200 && newWidth <= 500 && newWidth !== lastWidth) {
          lastWidth = newWidth;
          setSidebarWidth(newWidth);
        }
      });
    };
    const handleMouseUp = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleSavePage = async (pageId: string) => {
    setSelectedPage(pageId);
    setSavingPage(true);
    try {
      await fetch("/api/notion/parent-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPage(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/notion/disconnect", { method: "DELETE" });
      setNotionData({ connected: false });
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === "notion" ? { ...i, connected: false } : i
        )
      );
      setShowSettings(p => ({ ...p, notion: false }));
    } catch (e) {
      console.error(e);
    } finally {
      setDisconnecting(false);
    }
  };

  const toggleConnection = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (id === "notion") {
      if (integration?.connected) {
        setShowSettings(p => ({ ...p, [id]: !p[id] }));
      } else {
        window.location.href = "/api/notion/connect";
      }
    } else {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, connected: !i.connected } : i
        )
      );
    }
  };

  const filteredIntegrations = integrations.filter(
    (integration) => activeCategory === "All" || integration.category === activeCategory
  );

  return (
    <>
      <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", position: "relative", zIndex: 1, backgroundColor: T.bg }}>
        <Sidebar
          activeAgentId=""
          onSelectAgent={() => { }}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          sidebarWidth={sidebarWidth}
          onResize={handleMouseDown}
          showLoginModal={showLoginModal}
          onShowLoginModal={setShowLoginModal}
        />

        <div
          style={{
            flex: 1,
            height: "100%",
            overflowY: "auto",
            backgroundColor: T.bg,
            color: T.text,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 32px 100px",
            fontFamily: T.font,
            position: "relative",
          }}
        >
          {/* ── Ambient Background Glow ── */}
          <div style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "300px",
            background: "radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0
          }} />

          <div style={{ width: "100%", maxWidth: "860px", position: "relative", zIndex: 1 }}>

            {/* ───────────────────────────────────────────── */}
            {/* PAGE HEADER                                   */}
            {/* ───────────────────────────────────────────── */}
            <div style={{
              display: "flex", flexDirection: "column", gap: "8px",
              marginBottom: "48px",
              animation: "fadeUp 0.4s ease-out both"
            }}>
              <h1 style={{
                fontSize: "32px", fontWeight: 500, color: T.text, margin: "0",
                letterSpacing: "-0.02em"
              }}>
                Integrations
              </h1>
              <p style={{ color: T.textMuted, fontSize: "15px", margin: "8px 0 0 0", maxWidth: "600px", lineHeight: "1.6" }}>
                Connect EdgeOS to your existing toolchain. Export generated planning artifacts and documentation directly into your team's workspace.
              </p>
            </div>

            {/* ───────────────────────────────────────────── */}
            {/* FILTERS                                       */}
            {/* ───────────────────────────────────────────── */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px",
              flexWrap: "wrap", animation: "fadeUp 0.4s ease-out 0.1s both"
            }}>
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    style={{
                      padding: "8px 20px", borderRadius: "100px", fontSize: "13px", fontWeight: 500, fontFamily: T.font,
                      cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap",
                      background: isActive ? T.text : "transparent",
                      color: isActive ? T.bg : T.textMuted,
                      border: `1px solid ${isActive ? T.text : T.border}`,
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = T.text; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = "transparent"; } }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* ───────────────────────────────────────────── */}
            {/* INTEGRATIONS GRID                             */}
            {/* ───────────────────────────────────────────── */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px",
              animation: "fadeUp 0.4s ease-out 0.2s both"
            }}>
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onToggle={toggleConnection}
                >
                  {/* EXPANDABLE SETTINGS SECTION */}
                  {integration.id === "notion" && showSettings["notion"] && notionData?.connected && (
                    <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: "16px", animation: "fadeUp 0.3s ease-out both" }}>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: T.textMuted }}>Connected Workspace</span>
                        <span style={{ fontSize: "13px", color: T.text, fontWeight: 500 }}>{notionData.workspaceName}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: T.textMuted }}>Default Parent Page</span>
                        {/* CUSTOM STYLED SELECT TO FIX THE UGLY BROWSER DEFAULT */}
                        <div style={{ position: "relative" }}>
                          <select
                            value={selectedPage}
                            onChange={(e) => handleSavePage(e.target.value)}
                            disabled={savingPage}
                            className="custom-select"
                            style={{
                              appearance: "none",
                              WebkitAppearance: "none",
                              background: T.surfaceHover,
                              border: `1px solid ${T.borderHover}`,
                              color: T.text,
                              padding: "8px 32px 8px 12px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontFamily: T.font,
                              outline: "none",
                              width: "200px",
                              cursor: savingPage ? "not-allowed" : "pointer",
                              textOverflow: "ellipsis"
                            }}
                          >
                            <option value="" disabled style={{ background: "#18181b", color: "#fff" }}>Select a page...</option>
                            {notionData.pages?.map(p => (
                              <option key={p.id} value={p.id} style={{ background: "#18181b", color: "#fff" }}>{p.title}</option>
                            ))}
                          </select>
                          {/* Custom Dropdown Arrow */}
                          <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>

                      {!selectedPage && (
                        <div style={{ fontSize: "12px", color: "#f59e0b", textAlign: "right", marginTop: "-4px" }}>
                          Select a parent page to enable automatic exports.
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                        <button
                          onClick={handleDisconnect}
                          disabled={disconnecting}
                          style={{
                            padding: "8px 16px", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171",
                            borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: disconnecting ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: disconnecting ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => { if (!disconnecting) { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; } }}
                          onMouseLeave={(e) => { if (!disconnecting) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; } }}
                        >
                          Disconnect Notion
                        </button>
                      </div>
                    </div>
                  )}
                </IntegrationCard>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(12px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        select option {
          background-color: #18181b;
          color: #ffffff;
        }
      `}} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={() => window.location.href = "/login"} />
    </>
  );
}