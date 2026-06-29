import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgressEvent } from "@/lib/pipeline/types";

const T = {
  bg: "#09090b",
  surface: "#121214",
  surfaceHover: "#18181b",
  border: "#27272a",
  borderHover: "#3f3f46",
  text: "#ededed",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  accent: "#ffffff",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
  success: "#10b981",
  failed: "#ef4444",
};

interface Props {
  events: ProgressEvent[];
  githubUrl?: string;
  notionUrl?: string;
  jiraUrl?: string;
  sessionId?: string;
}

export default function FinalSummaryCard({ events, githubUrl, notionUrl, jiraUrl, sessionId }: Props) {
  const router = useRouter();

  const [integrationData, setIntegrationData] = useState<{
    github: boolean;
    notion: boolean;
    jira: boolean;
    calendar: boolean;
    gmail: boolean;
  }>({ github: false, notion: false, jira: false, calendar: false, gmail: false });

  const [loading, setLoading] = useState<{ github: boolean; notion: boolean; jira: boolean; calendar: boolean; gmail: boolean }>({
    github: false, notion: false, jira: false, calendar: false, gmail: false
  });

  const [urls, setUrls] = useState<{ github?: string; notion?: string; jira?: string; calendar?: string; gmail?: string }>({
    github: githubUrl,
    notion: notionUrl,
    jira: jiraUrl
  });

  const [showGmailModal, setShowGmailModal] = useState(false);
  const [gmailRecipient, setGmailRecipient] = useState("");
  const [gmailTemplate, setGmailTemplate] = useState("proposal");

  const [syncStates, setSyncStates] = useState<any>({});
  
  const loadData = () => {
    Promise.all([
      fetch("/api/integrations").then(res => res.json()).catch(() => ({})),
      fetch("/api/notion/pages").then(res => res.json()).catch(() => ({})),
      sessionId ? fetch(`/api/chat-history?sessionId=${sessionId}`).then(res => res.json()).catch(() => ({})) : Promise.resolve({})
    ]).then(([integrations, notion, chatData]) => {
      setIntegrationData({
        github: !!integrations?.github?.accessToken,
        jira: !!integrations?.jira?.accessToken,
        notion: !!notion?.connected,
        calendar: !!integrations?.googleCalendar?.accessToken,
        gmail: !!integrations?.gmail?.accessToken
      });
      if (chatData) {
        setSyncStates({
          githubExported: chatData.githubExported,
          githubDirty: chatData.githubDirty,
          githubDirtyArtifacts: chatData.githubDirtyArtifacts || [],
          githubUrl: chatData.githubUrl,
          jiraExported: chatData.jiraExported,
          jiraDirty: chatData.jiraDirty,
          jiraDirtyArtifacts: chatData.jiraDirtyArtifacts || [],
          jiraUrl: chatData.jiraUrl,
          notionExported: chatData.notionExported,
          notionDirty: chatData.notionDirty,
          notionDirtyArtifacts: chatData.notionDirtyArtifacts || [],
          notionUrl: chatData.notionUrl,
        });
        setUrls(prev => ({
          ...prev,
          github: chatData.githubUrl || prev.github,
          jira: chatData.jiraUrl || prev.jira,
          notion: chatData.notionUrl || prev.notion,
        }));
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const handleAction = async (platform: 'github' | 'jira' | 'notion' | 'calendar' | 'gmail', extraData?: any) => {
    if (!integrationData[platform]) {
      router.push('/integrations');
      return;
    }

    if (!sessionId) return;

    setLoading(prev => ({ ...prev, [platform]: true }));
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, sessionId, ...extraData })
      });
      const data = await res.json();
      if (data.success) {
        setUrls(prev => ({
          ...prev,
          github: platform === 'github' ? data.exportData?.githubUrl : prev.github,
          jira: platform === 'jira' ? data.exportData?.jiraUrl : prev.jira,
          notion: platform === 'notion' ? data.exportData?.notionUrl : prev.notion,
          calendar: platform === 'calendar' ? data.calendarUrl : prev.calendar,
          gmail: platform === 'gmail' ? data.draftUrl : prev.gmail,
        }));
        if (platform === 'gmail') setShowGmailModal(false);
        // Refresh sync states
        loadData();
      } else {
        console.error(data.error);
        alert(`Failed to export to ${platform}: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert(`An error occurred while exporting to ${platform}`);
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const renderOptionButton = (platform: 'github' | 'jira' | 'notion' | 'calendar' | 'gmail', label: string, isIntegrated: boolean) => {
    if (!isIntegrated) {
      return (
        <button onClick={() => handleAction(platform)}
          style={{
            padding: "6px 12px", background: "transparent", border: `1px solid ${T.borderHover}`, color: T.textMuted,
            fontSize: "12px", fontFamily: T.font, cursor: "pointer", transition: "all .15s", borderRadius: "6px"
          }}
          onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.textHint; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.borderHover; }}>
          Connect {label}
        </button>
      );
    }

    const isExported = syncStates[`${platform}Exported`];
    const isDirty = syncStates[`${platform}Dirty`];
    const dirtyArtifacts = syncStates[`${platform}DirtyArtifacts`] || [];
    const url = urls[platform];

    if (isExported) {
      if (isDirty) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button onClick={() => handleAction(platform)} disabled={loading[platform]}
              style={{
                padding: "6px 12px", background: "rgba(239, 68, 68, 0.1)", border: `1px solid rgba(239, 68, 68, 0.3)`, color: "#fca5a5",
                fontSize: "12px", fontFamily: T.font, cursor: loading[platform] ? "not-allowed" : "pointer", transition: "all .15s", borderRadius: "6px",
                opacity: loading[platform] ? 0.5 : 1
              }}
              onMouseEnter={e => { if (!loading[platform]) { e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"; } }}
              onMouseLeave={e => { if (!loading[platform]) { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; } }}>
              {loading[platform] ? "Updating..." : `⚠ Update ${label}`}
            </button>
            <span style={{ fontSize: '10px', color: T.textHint, textAlign: 'center' }}>
              {dirtyArtifacts.length} out of sync
            </span>
          </div>
        );
      } else {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: T.success, display: 'flex', alignItems: 'center', gap: '4px', padding: "6px 12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              ✓ {label} Synced
            </span>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: T.textMuted, fontSize: '12px', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = T.text} onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
                ↗
              </a>
            )}
          </div>
        );
      }
    }

    return (
      <button onClick={() => handleAction(platform)} disabled={loading[platform]}
        style={{
          padding: "6px 12px", background: T.text, color: T.bg, border: `1px solid ${T.text}`,
          fontSize: "12px", fontFamily: T.font, cursor: loading[platform] ? "not-allowed" : "pointer", transition: "all .15s", borderRadius: "6px",
          opacity: loading[platform] ? 0.5 : 1
        }}
        onMouseEnter={e => { if (!loading[platform]) e.currentTarget.style.opacity = "0.85"; }}
        onMouseLeave={e => { if (!loading[platform]) e.currentTarget.style.opacity = "1"; }}>
        {loading[platform] ? "..." : `Export to ${label}`}
      </button>
    );
  };

  const renderGmailModal = () => {
    if (!showGmailModal) return null;
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.2s ease-out"
      }}>
        <div style={{
          background: T.bg, border: `1px solid ${T.border}`, borderRadius: "16px",
          width: "400px", maxWidth: "90vw", padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)", position: "relative",
          fontFamily: T.font
        }}>
          <button
            onClick={() => setShowGmailModal(false)}
            style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: T.textMuted, cursor: "pointer" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <h3 style={{ margin: "0 0 16px 0", color: T.text, fontSize: "16px", fontWeight: 600 }}>Create Email Draft</h3>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", color: T.textMuted, marginBottom: "8px" }}>Recipient Email</label>
            <input
              type="email"
              value={gmailRecipient}
              onChange={(e) => setGmailRecipient(e.target.value)}
              placeholder="team@example.com"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${T.borderHover}`,
                background: T.surface, color: T.text, fontSize: "14px", outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", color: T.textMuted, marginBottom: "8px" }}>Template</label>
            <select
              value={gmailTemplate}
              onChange={(e) => setGmailTemplate(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${T.borderHover}`,
                background: T.surface, color: T.text, fontSize: "14px", outline: "none", boxSizing: "border-box"
              }}
            >
              <option value="proposal">Project Proposal</option>
              <option value="weekly">Weekly Progress Report</option>
              <option value="delivery">Project Delivery</option>
            </select>
          </div>

          <button
            onClick={() => handleAction("gmail", { recipient: gmailRecipient, template: gmailTemplate })}
            disabled={loading.gmail || !gmailRecipient}
            style={{
              width: "100%", padding: "10px", background: T.text, color: T.bg, border: "none", borderRadius: "8px",
              fontSize: "14px", fontWeight: 600, cursor: loading.gmail || !gmailRecipient ? "not-allowed" : "pointer",
              opacity: loading.gmail || !gmailRecipient ? 0.5 : 1
            }}
          >
            {loading.gmail ? "Creating Draft..." : "Create Draft"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderGmailModal()}
      <div style={{
        display: "flex", flexDirection: "column", gap: "12px", margin: "16px auto 0",
        fontFamily: T.font, width: "fit-content", padding: "16px 24px", background: "rgba(255,255,255,0.02)",
        border: `1px solid rgba(255,255,255,0.05)`, borderRadius: "12px"
      }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: 500, marginRight: "8px" }}>
            Ready to Export
          </div>
          {renderOptionButton('github', 'GitHub', integrationData.github)}
          {renderOptionButton('jira', 'Jira', integrationData.jira)}
          {renderOptionButton('notion', 'Notion', integrationData.notion)}
        </div>

      </div>
    </>
  );
}
