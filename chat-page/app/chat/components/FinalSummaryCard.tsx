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
  }>({ github: false, notion: false, jira: false });

  const [loading, setLoading] = useState<{ github: boolean; notion: boolean; jira: boolean }>({
    github: false, notion: false, jira: false
  });

  const [urls, setUrls] = useState<{ github?: string; notion?: string; jira?: string }>({
    github: githubUrl,
    notion: notionUrl,
    jira: jiraUrl
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/integrations").then(res => res.json()).catch(() => ({})),
      fetch("/api/notion/pages").then(res => res.json()).catch(() => ({}))
    ]).then(([integrations, notion]) => {
      setIntegrationData({
        github: !!integrations?.github?.accessToken,
        jira: !!integrations?.jira?.accessToken,
        notion: !!notion?.connected
      });
    });
  }, []);

  const handleAction = async (platform: 'github' | 'jira' | 'notion') => {
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
        body: JSON.stringify({ platform, sessionId })
      });
      const data = await res.json();
      if (data.success && data.exportData) {
        setUrls(prev => ({
          ...prev,
          github: platform === 'github' ? data.exportData.githubUrl : prev.github,
          jira: platform === 'jira' ? data.exportData.jiraUrl : prev.jira,
          notion: platform === 'notion' ? data.exportData.notionUrl : prev.notion,
        }));
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

  const renderOptionButton = (platform: 'github' | 'jira' | 'notion', label: string, isIntegrated: boolean, url?: string) => {
    if (url) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "6px 12px", background: "transparent", border: `1px solid ${T.border}`, color: T.textHint,
            fontSize: "12px", fontFamily: T.font, cursor: "pointer", transition: "all .15s", borderRadius: "6px"
          }}
          onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.textHint; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.textHint; e.currentTarget.style.borderColor = T.border; }}>
            View in {label} ↗
          </button>
        </a>
      );
    }
    
    return (
      <button
        onClick={() => handleAction(platform)}
        disabled={loading[platform]}
        style={{
          padding: "6px 12px",
          background: isIntegrated ? T.text : T.surfaceHover,
          color: isIntegrated ? T.bg : T.textMuted,
          border: isIntegrated ? `1px solid ${T.text}` : `1px solid ${T.borderHover}`,
          fontSize: "12px", fontFamily: T.font,
          cursor: loading[platform] ? "not-allowed" : "pointer",
          transition: "all .15s", borderRadius: "6px",
          opacity: loading[platform] ? 0.5 : 1
        }}
        onMouseEnter={e => {
          if (!loading[platform] && !isIntegrated) {
            e.currentTarget.style.background = T.text;
            e.currentTarget.style.color = T.bg;
            e.currentTarget.style.borderColor = T.text;
          } else if (!loading[platform] && isIntegrated) {
            e.currentTarget.style.opacity = "0.85";
          }
        }}
        onMouseLeave={e => {
          if (!loading[platform] && !isIntegrated) {
            e.currentTarget.style.background = T.surfaceHover;
            e.currentTarget.style.color = T.textMuted;
            e.currentTarget.style.borderColor = T.borderHover;
          } else if (!loading[platform] && isIntegrated) {
            e.currentTarget.style.opacity = "1";
          }
        }}
      >
        {loading[platform] ? "..." : isIntegrated ? `Export to ${label}` : `Setup ${label}`}
      </button>
    );
  };

  return (
    <div style={{
      display: "flex", gap: "8px", margin: "16px auto 0", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
      fontFamily: T.font, width: "fit-content", padding: "12px 24px", background: "rgba(255,255,255,0.02)", 
      border: `1px solid rgba(255,255,255,0.05)`, borderRadius: "8px"
    }}>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: 500, marginRight: "4px" }}>
        🚀 Ready to Export
      </div>
      {renderOptionButton('github', 'GitHub', integrationData.github, urls.github)}
      {renderOptionButton('jira', 'Jira', integrationData.jira, urls.jira)}
      {renderOptionButton('notion', 'Notion', integrationData.notion, urls.notion)}
    </div>
  );
}
