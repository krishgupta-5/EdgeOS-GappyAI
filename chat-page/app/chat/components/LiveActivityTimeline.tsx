import React from "react";
import { ProgressEvent } from "@/lib/pipeline/types";

const T = {
  bg: "#09090b",
  surface: "#121214",
  border: "#27272a",
  text: "#ededed",
  textMuted: "#a1a1aa",
  accent: "#ffffff",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
  success: "#10b981",
  failed: "#ef4444",
};

interface Props {
  events: ProgressEvent[];
}

const getIcon = (type: string) => {
  if (type === 'ARTIFACT_GENERATED' || type === 'EXPORT_COMPLETED') {
    return <span style={{ color: T.success, fontSize: '14px' }}>✓</span>;
  }
  if (type === 'EXPORT_FAILED') {
    return <span style={{ color: T.failed, fontSize: '14px' }}>✗</span>;
  }
  return <span style={{ animation: "spin 1s linear infinite", fontSize: '14px', display: 'inline-block' }}>⏳</span>;
};

export default function LiveActivityTimeline({ events }: Props) {
  // Deduplicate pipeline events to only show the latest status for each artifact or step
  const timelineEvents = events.filter(e => e.type !== 'EXPORT_PROGRESS');
  
  // Group export progress by source
  const exportProgress = events.filter(e => e.type === 'EXPORT_PROGRESS');
  
  const getLatestProgress = (source: string) => {
    const sourceEvents = exportProgress.filter(e => e.source === source);
    if (sourceEvents.length === 0) return null;
    return sourceEvents[sourceEvents.length - 1];
  };

  const hasExports = events.some(e => e.source !== 'pipeline');

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "16px",
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "12px",
      fontFamily: T.font,
      width: "100%",
      marginTop: "16px",
    }}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: T.text, marginBottom: "8px" }}>Live Generation Activity</div>
      
      {/* Pipeline Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {timelineEvents.filter(e => e.source === 'pipeline').map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: T.textMuted }}>
            <div style={{ width: "16px", display: "flex", justifyContent: "center" }}>
              {getIcon(ev.type)}
            </div>
            <span>{ev.message}</span>
            {ev.durationMs && <span style={{ fontSize: "11px", color: T.border, marginLeft: "auto" }}>{(ev.durationMs / 1000).toFixed(1)}s</span>}
          </div>
        ))}
      </div>

      {hasExports && <div style={{ height: "1px", background: T.border, margin: "8px 0" }} />}

      {/* Export Cards */}
      {hasExports && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {['github', 'notion', 'jira'].map(source => {
            const started = events.find(e => e.source === source && e.type === 'EXPORT_STARTED');
            const completed = events.find(e => e.source === source && e.type === 'EXPORT_COMPLETED');
            const failed = events.find(e => e.source === source && e.type === 'EXPORT_FAILED');
            const latestProg = getLatestProgress(source);
            
            if (!started) return null;
            
            const statusType = completed ? 'EXPORT_COMPLETED' : failed ? 'EXPORT_FAILED' : 'EXPORT_STARTED';
            const msg = completed ? completed.message : failed ? failed.message : latestProg ? latestProg.message : started.message;

            return (
              <div key={source} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: T.textMuted }}>
                <div style={{ width: "16px", display: "flex", justifyContent: "center" }}>
                  {getIcon(statusType)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontWeight: 500, color: T.text, textTransform: 'capitalize' }}>{source}</span>
                  <span style={{ fontSize: "12px" }}>{msg}</span>
                </div>
                {(completed || failed) && (completed?.durationMs || failed?.durationMs) && (
                  <span style={{ fontSize: "11px", color: T.border, marginLeft: "auto" }}>
                    {(((completed?.durationMs || failed?.durationMs || 0) / 1000).toFixed(1))}s
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
