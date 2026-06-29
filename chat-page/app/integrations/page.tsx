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
      width: "56px",
      height: "56px",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      filter: grayscale ? "grayscale(100%) opacity(0.4)" : "none",
      transition: "filter 0.3s ease",
      flexShrink: 0
    }}>
      <Image
        src={logoUrl || `https://img.logo.dev/${domain}?token=${LOGO_DEV_PUBLIC_KEY}`}
        alt={`${domain} logo`}
        width={52}
        height={52}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

// ─── Custom Select Component to Fix Native Dropdown ─────────────────────────

function CustomSelect({ value, options, onChange, disabled, placeholder, width = "100%" }: any) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const close = () => setIsOpen(false);
    if (isOpen) {
      window.addEventListener("click", close);
    }
    return () => window.removeEventListener("click", close);
  }, [isOpen]);

  const selectedOption = options?.find((o: any) => o.value === value);

  return (
    <div style={{ position: "relative", width }} onClick={(e) => e.stopPropagation()}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          background: T.surfaceHover,
          border: `1px solid ${isOpen ? "rgba(255,255,255,0.15)" : T.borderHover}`,
          color: selectedOption ? T.text : T.textHint,
          padding: "8px 32px 8px 12px",
          borderRadius: "8px",
          fontSize: "13px",
          fontFamily: T.font,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.2s ease"
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg style={{ position: "absolute", right: "12px", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px",
          background: "#18181b", border: `1px solid ${T.borderHover}`, borderRadius: "8px",
          padding: "4px", zIndex: 50, maxHeight: "200px", overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}>
          {options?.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: "13px", color: T.textMuted }}>No options available</div>
          ) : (
            options?.map((opt: any) => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                style={{
                  padding: "8px 12px", fontSize: "13px", color: opt.value === value ? "#ffffff" : "#a1a1aa",
                  background: opt.value === value ? "rgba(255,255,255,0.1)" : "transparent",
                  borderRadius: "4px", cursor: "pointer", transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => { if (opt.value !== value) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#ffffff"; } }}
                onMouseLeave={(e) => { if (opt.value !== value) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a1a1aa"; } }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Component Data ─────────────────────────────────────────────────────────

type Category = "All" | "Workspace" | "Development" | "Project Management" | "Productivity" | "Communication" | "Automation";

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
    category: "Automation",
    description: "Sync project milestones and automatically schedule review meetings.",
    domain: "calendar.google.com",
    connected: false,
    logoUrl: "https://cloud.gmelius.com/public/logos/google/Google_Calendar_Logo_512px.png",
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "Automation",
    description: "Automate email updates and summaries to stakeholders on project progress.",
    domain: "gmail.com",
    connected: false,
    logoUrl: "/Gmail_Logo_512px.png",
  }
];

const CATEGORIES: Category[] = ["All", "Workspace", "Development", "Project Management", "Productivity", "Communication", "Automation"];

// ─── Child Components ───────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  onConnect,
  onConfigure,
  onToggleActive
}: {
  integration: Integration,
  onConnect?: (e: React.MouseEvent) => void,
  onConfigure?: (e: React.MouseEvent) => void,
  onToggleActive?: (id: string, e: React.MouseEvent) => void
}) {
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
        {/* Brand Icon Container */}
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (integration.connected && onConfigure) onConfigure(e);
            else if (!integration.connected && onConnect) onConnect(e);
            else if (onToggleActive) onToggleActive(integration.id, e);
          }}
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
            if (integration.connected) e.currentTarget.style.background = T.surfaceHover;
            else e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={e => {
            if (integration.connected) e.currentTarget.style.background = "transparent";
            else e.currentTarget.style.opacity = "1";
          }}
        >
          {integration.connected ? "Configure Settings" : "Connect"}
        </button>

        {/* Minimal Toggle Switch */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (integration.connected && onConfigure) onConfigure(e);
            else if (!integration.connected && onConnect) onConnect(e);
            else if (onToggleActive) onToggleActive(integration.id, e);
          }}
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

    </div>
  );
}

// ─── Main Layout Component ──────────────────────────────────────────────────

export default function IntegrationsPanel() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);

  const [notionData, setNotionData] = useState<{ connected: boolean; workspaceName?: string; pages?: any[]; defaultParentPageId?: string } | null>(null);
  const [githubData, setGithubData] = useState<{ connected: boolean; username?: string; avatarUrl?: string; repoVisibility?: string } | null>(null);
  const [jiraData, setJiraData] = useState<{ connected: boolean; workspaceName?: string; accountName?: string; projectPreference?: string } | null>(null);
  const [googleCalendarData, setGoogleCalendarData] = useState<{ connected: boolean; email?: string } | null>(null);
  const [gmailData, setGmailData] = useState<{ connected: boolean; email?: string } | null>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [selectedPage, setSelectedPage] = useState("");
  const [githubVisibility, setGithubVisibility] = useState("private");
  const [jiraPreference, setJiraPreference] = useState("CREATE_NEW");

  const [savingPage, setSavingPage] = useState(false);
  const [savingGithub, setSavingGithub] = useState(false);
  const [savingJira, setSavingJira] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchData = () => {
    setLoadingIntegrations(true);
    setError(false);
    Promise.all([
      fetch("/api/notion/pages").then((res) => { if (!res.ok) throw new Error(); return res.json(); }),
      fetch("/api/integrations").then((res) => { if (!res.ok) throw new Error(); return res.json(); })
    ]).then(([notionPages, allIntegrations]) => {
      // Notion
      setNotionData(notionPages);
      if (notionPages.defaultParentPageId) setSelectedPage(notionPages.defaultParentPageId);

      // GitHub & Jira
      setGithubData(allIntegrations.github ? { ...allIntegrations.github, connected: !!allIntegrations.github.accessToken } : { connected: false });
      if (allIntegrations.github?.repoVisibility) setGithubVisibility(allIntegrations.github.repoVisibility);

      setJiraData(allIntegrations.jira ? { ...allIntegrations.jira, connected: !!allIntegrations.jira.accessToken } : { connected: false });
      if (allIntegrations.jira?.projectPreference) setJiraPreference(allIntegrations.jira.projectPreference);

      // Google Calendar & Gmail
      setGoogleCalendarData(allIntegrations.googleCalendar ? { ...allIntegrations.googleCalendar, connected: !!allIntegrations.googleCalendar.accessToken } : { connected: false });
      setGmailData(allIntegrations.gmail ? { ...allIntegrations.gmail, connected: !!allIntegrations.gmail.accessToken } : { connected: false });

      setIntegrations(
        INTEGRATIONS.map((i) => {
          if (i.id === "notion") return { ...i, connected: !!notionPages.connected };
          if (i.id === "github") return { ...i, connected: !!allIntegrations.github?.accessToken };
          if (i.id === "jira") return { ...i, connected: !!allIntegrations.jira?.accessToken };
          if (i.id === "calendar") return { ...i, connected: !!allIntegrations.googleCalendar?.accessToken };
          if (i.id === "gmail") return { ...i, connected: !!allIntegrations.gmail?.accessToken };
          return i;
        })
      );
      setLoadingIntegrations(false);
    }).catch((err) => {
      console.error(err);
      setError(true);
      setLoadingIntegrations(false);
    });
  };

  useEffect(() => {
    fetchData();
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

  const handleDisconnect = async (id: string) => {
    setDisconnecting(id);
    try {
      if (id === "notion") {
        await fetch("/api/notion/disconnect", { method: "DELETE" });
        setNotionData({ connected: false });
      } else if (id === "github") {
        await fetch("/api/github/disconnect", { method: "DELETE" });
        setGithubData({ connected: false });
      } else if (id === "jira") {
        await fetch("/api/jira/disconnect", { method: "DELETE" });
        setJiraData({ connected: false });
      } else if (id === "calendar") {
        await fetch("/api/google-calendar/disconnect", { method: "DELETE" });
      } else if (id === "gmail") {
        await fetch("/api/gmail/disconnect", { method: "DELETE" });
      }

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, connected: false } : i
        )
      );
      setShowSettings(p => ({ ...p, [id]: false }));
    } catch (e) {
      console.error(e);
    } finally {
      setDisconnecting(null);
    }
  };

  const handleGithubVisibility = async (visibility: string) => {
    setGithubVisibility(visibility);
    setSavingGithub(true);
    try {
      await fetch("/api/github/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoVisibility: visibility })
      });
    } catch (e) { console.error(e); }
    finally { setSavingGithub(false); }
  };

  const handleJiraPreference = async (pref: string) => {
    setJiraPreference(pref);
    setSavingJira(true);
    try {
      await fetch("/api/jira/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectPreference: pref })
      });
    } catch (e) { console.error(e); }
    finally { setSavingJira(false); }
  };

  const handleConnect = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const routeId = id === "calendar" ? "google-calendar" : id;
    window.location.href = `/api/${routeId}/connect`;
  };

  const handleConfigure = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSettings(p => ({ ...p, [id]: !p[id] }));
  };

  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, connected: !i.connected } : i
      )
    );
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

          <div style={{ width: "100%", maxWidth: "1024px", position: "relative", zIndex: 1 }}>

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
                Connect ProdMate to your existing toolchain. Export generated planning artifacts and documentation directly into your team's workspace.
              </p>
            </div>

            {/* ───────────────────────────────────────────── */}
            {/* FILTERS                                       */}
            {/* ───────────────────────────────────────────── */}
            {!error && (
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
            )}

            {/* ───────────────────────────────────────────── */}
            {/* ERROR STATE                                   */}
            {/* ───────────────────────────────────────────── */}
            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "12px", padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "24px", animation: "fadeUp 0.3s ease-out both"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#f87171", fontSize: "14px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Unable to load integrations.
                </div>
                <button
                  onClick={fetchData}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)", border: "none", color: "#fca5a5",
                    padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                >
                  Retry
                </button>
              </div>
            )}

            {/* ───────────────────────────────────────────── */}
            {/* INTEGRATIONS GRID                             */}
            {/* ───────────────────────────────────────────── */}
            {!error && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "24px",
                alignItems: "flex-start",
                animation: "fadeUp 0.4s ease-out 0.2s both"
              }}>
                {loadingIntegrations ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "24px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.05)" }} />
                        <div style={{ width: "60px", height: "24px", borderRadius: "6px", background: "rgba(255,255,255,0.05)" }} />
                      </div>
                      <div style={{ width: "120px", height: "20px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginBottom: "12px" }} />
                      <div style={{ width: "100%", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginBottom: "8px" }} />
                      <div style={{ width: "80%", height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginBottom: "24px" }} />
                      <div style={{ paddingTop: "20px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
                        <div style={{ width: "100px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.05)" }} />
                        <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: "rgba(255,255,255,0.05)" }} />
                      </div>
                    </div>
                  ))
                ) : (
                  filteredIntegrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onConnect={["notion", "github", "jira", "calendar", "gmail"].includes(integration.id) ? (e) => handleConnect(integration.id, e) : undefined}
                      onConfigure={["notion", "github", "jira", "calendar", "gmail"].includes(integration.id) ? (e) => handleConfigure(integration.id, e) : undefined}
                      onToggleActive={!["notion", "github", "jira", "calendar", "gmail"].includes(integration.id) ? (id, e) => handleToggleActive(id, e) : undefined}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* CONFIGURATION MODAL                           */}
      {/* ───────────────────────────────────────────── */}
      {Object.values(showSettings).some(Boolean) && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            background: T.bg, border: `1px solid ${T.border}`, borderRadius: "16px",
            width: "440px", maxWidth: "90vw", padding: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            position: "relative",
            fontFamily: T.font
          }}>
            {/* Close button */}
            <button 
              onClick={() => setShowSettings({})}
              style={{ position: "absolute", top: "24px", right: "24px", background: "transparent", border: "none", color: T.textMuted, cursor: "pointer" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 style={{ margin: "0 0 24px 0", fontSize: "18px", color: T.text, fontWeight: 500 }}>
              {showSettings["notion"] ? "Notion Settings" 
                : showSettings["github"] ? "GitHub Settings" 
                : showSettings["jira"] ? "Jira Settings" 
                : showSettings["calendar"] ? "Google Calendar Settings"
                : "Gmail Settings"}
            </h2>

            {/* NOTION SETTINGS SECTION */}
            {showSettings["notion"] && notionData?.connected && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted }}>Connected Workspace</span>
                  <span style={{ fontSize: "13px", color: T.text, fontWeight: 500 }}>{notionData.workspaceName}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted, whiteSpace: "nowrap" }}>Parent Page</span>
                  <CustomSelect
                    value={selectedPage}
                    onChange={(val: string) => handleSavePage(val)}
                    disabled={savingPage}
                    placeholder="Select a page..."
                    options={notionData.pages?.map(p => ({ label: p.title, value: p.id })) || []}
                    width="180px"
                  />
                </div>

                {!selectedPage && (
                  <div style={{ fontSize: "12px", color: "#f59e0b", textAlign: "right" }}>
                    ⚠️ Select a page to enable exports.
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${T.border}` }}>
                  <button
                    onClick={() => handleDisconnect("notion")}
                    disabled={disconnecting === "notion"}
                    style={{
                      padding: "8px 16px", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171",
                      borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: disconnecting === "notion" ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: disconnecting === "notion" ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => { if (disconnecting !== "notion") { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; } }}
                    onMouseLeave={(e) => { if (disconnecting !== "notion") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; } }}
                  >
                    Disconnect Notion
                  </button>
                </div>
              </div>
            )}

            {/* GITHUB SETTINGS SECTION */}
            {showSettings["github"] && githubData?.connected && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted }}>Connected Account</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {githubData.avatarUrl && <img src={githubData.avatarUrl} alt="Avatar" width="20" height="20" style={{ borderRadius: "50%" }} />}
                    <span style={{ fontSize: "13px", color: T.text, fontWeight: 500 }}>{githubData.username}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted, whiteSpace: "nowrap" }}>Repo Visibility</span>
                  <CustomSelect
                    value={githubVisibility}
                    onChange={(val: string) => handleGithubVisibility(val)}
                    disabled={savingGithub}
                    options={[
                      { label: "Private (Recommended)", value: "private" },
                      { label: "Public", value: "public" }
                    ]}
                    width="180px"
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${T.border}` }}>
                  <button
                    onClick={() => handleDisconnect("github")}
                    disabled={disconnecting === "github"}
                    style={{
                      padding: "8px 16px", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: disconnecting === "github" ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: disconnecting === "github" ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => { if (disconnecting !== "github") { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; } }}
                    onMouseLeave={(e) => { if (disconnecting !== "github") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; } }}
                  >
                    Disconnect GitHub
                  </button>
                </div>
              </div>
            )}

            {/* JIRA SETTINGS SECTION */}
            {showSettings["jira"] && jiraData?.connected && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted }}>Connected Workspace</span>
                  <span style={{ fontSize: "13px", color: T.text, fontWeight: 500 }}>{jiraData.workspaceName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted }}>Connected Account</span>
                  <span style={{ fontSize: "13px", color: T.text, fontWeight: 500 }}>{jiraData.accountName}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted, whiteSpace: "nowrap" }}>Project Config</span>
                  <CustomSelect
                    value={jiraPreference}
                    onChange={(val: string) => handleJiraPreference(val)}
                    disabled={savingJira}
                    options={[
                      { label: "Create New Project", value: "CREATE_NEW" },
                      { label: "Select Existing", value: "SELECT_EXISTING" }
                    ]}
                    width="180px"
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${T.border}` }}>
                  <button
                    onClick={() => handleDisconnect("jira")}
                    disabled={disconnecting === "jira"}
                    style={{
                      padding: "8px 16px", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: disconnecting === "jira" ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: disconnecting === "jira" ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => { if (disconnecting !== "jira") { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; } }}
                    onMouseLeave={(e) => { if (disconnecting !== "jira") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; } }}
                  >
                    Disconnect Jira
                  </button>
                </div>
              </div>
            )}

            {/* GOOGLE CALENDAR SETTINGS SECTION */}
            {showSettings["calendar"] && googleCalendarData?.connected && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted }}>Connected Account</span>
                  <span style={{ fontSize: "13px", color: T.text, fontWeight: 500 }}>{googleCalendarData.email}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${T.border}` }}>
                  <button
                    onClick={() => handleDisconnect("calendar")}
                    disabled={disconnecting === "calendar"}
                    style={{
                      padding: "8px 16px", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: disconnecting === "calendar" ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: disconnecting === "calendar" ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => { if (disconnecting !== "calendar") { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; } }}
                    onMouseLeave={(e) => { if (disconnecting !== "calendar") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; } }}
                  >
                    Disconnect Google Calendar
                  </button>
                </div>
              </div>
            )}

            {/* GMAIL SETTINGS SECTION */}
            {showSettings["gmail"] && gmailData?.connected && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: T.textMuted }}>Connected Account</span>
                  <span style={{ fontSize: "13px", color: T.text, fontWeight: 500 }}>{gmailData.email}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${T.border}` }}>
                  <button
                    onClick={() => handleDisconnect("gmail")}
                    disabled={disconnecting === "gmail"}
                    style={{
                      padding: "8px 16px", background: "transparent", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: disconnecting === "gmail" ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: disconnecting === "gmail" ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => { if (disconnecting !== "gmail") { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; } }}
                    onMouseLeave={(e) => { if (disconnecting !== "gmail") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; } }}
                  >
                    Disconnect Gmail
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}


      {/* Animations & Global Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(12px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={() => window.location.href = "/login"} />
    </>
  );
}
