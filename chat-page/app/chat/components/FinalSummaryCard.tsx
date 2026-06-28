import React from "react";
import { ProgressEvent } from "@/lib/pipeline/types";

const T = {
  bg: "#09090b",
  surface: "#121214",
  border: "#27272a",
  borderHover: "#3f3f46",
  text: "#ededed",
  textMuted: "#a1a1aa",
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
}

export default function FinalSummaryCard({ events, githubUrl, notionUrl, jiraUrl }: Props) {
  const generatedArtifacts = events
    .filter(e => e.type === 'ARTIFACT_GENERATED')
    .map(e => e.message.replace(' generated', ''));
    
  const pipelineEvents = events.filter(e => e.source === 'pipeline' && e.type === 'ARTIFACT_GENERATED');
  const totalPipelineDuration = pipelineEvents.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);

  const getExportDuration = (source: string) => {
    const completed = events.find(e => e.source === source && (e.type === 'EXPORT_COMPLETED' || e.type === 'EXPORT_FAILED'));
    return completed?.durationMs || 0;
  };

  const githubDuration = getExportDuration('github');
  const notionDuration = getExportDuration('notion');
  const jiraDuration = getExportDuration('jira');
  
  const totalDuration = totalPipelineDuration + githubDuration + notionDuration + jiraDuration;

  const exportStatuses = {
    github: events.find(e => e.source === 'github' && e.type === 'EXPORT_COMPLETED') ? 'Success' : 
            events.find(e => e.source === 'github' && e.type === 'EXPORT_FAILED') ? 'Failed' : 'Skipped',
    notion: events.find(e => e.source === 'notion' && e.type === 'EXPORT_COMPLETED') ? 'Success' : 
            events.find(e => e.source === 'notion' && e.type === 'EXPORT_FAILED') ? 'Failed' : 'Skipped',
    jira: events.find(e => e.source === 'jira' && e.type === 'EXPORT_COMPLETED') ? 'Success' : 
          events.find(e => e.source === 'jira' && e.type === 'EXPORT_FAILED') ? 'Failed' : 'Skipped',
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      padding: "24px",
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: "12px",
      fontFamily: T.font,
      width: "100%",
      marginTop: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: T.success, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
          ✓
        </div>
        <div style={{ fontSize: "18px", fontWeight: 600, color: T.text }}>Project Ready</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        
        {/* Artifacts */}
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.textMuted, marginBottom: "12px", fontWeight: 600 }}>Artifacts Generated</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {generatedArtifacts.map((name, i) => (
              <div key={i} style={{ fontSize: "13px", color: T.text, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: T.border }}>•</span> <span style={{ textTransform: 'capitalize' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exports */}
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.textMuted, marginBottom: "12px", fontWeight: 600 }}>Exports</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(exportStatuses).map(([source, status]) => (
              <div key={source} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: T.text, textTransform: 'capitalize' }}>{source}</span>
                <span style={{ color: status === 'Success' ? T.success : status === 'Failed' ? T.failed : T.textMuted }}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generation Time */}
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: T.textMuted, marginBottom: "12px", fontWeight: 600 }}>Generation Time</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: T.textMuted }}>
              <span>Documentation</span> <span>{(totalPipelineDuration / 1000).toFixed(1)}s</span>
            </div>
            {githubDuration > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: T.textMuted }}>
                <span>GitHub</span> <span>{(githubDuration / 1000).toFixed(1)}s</span>
              </div>
            )}
            {notionDuration > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: T.textMuted }}>
                <span>Notion</span> <span>{(notionDuration / 1000).toFixed(1)}s</span>
              </div>
            )}
            {jiraDuration > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: T.textMuted }}>
                <span>Jira</span> <span>{(jiraDuration / 1000).toFixed(1)}s</span>
              </div>
            )}
            <div style={{ height: "1px", background: T.border, margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: T.text, fontWeight: 600 }}>
              <span>Total</span> <span>{(totalDuration / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
        {notionUrl && (
          <a href={notionUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <button style={{ padding: "8px 16px", background: T.accent, color: "#000", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              📄 Open Notion Documentation
            </button>
          </a>
        )}
        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <button style={{ padding: "8px 16px", background: T.text, color: "#000", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              Open GitHub Repository
            </button>
          </a>
        )}
        {jiraUrl && (
          <a href={jiraUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <button style={{ padding: "8px 16px", background: "#0052CC", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              🟦 Open Jira Project
            </button>
          </a>
        )}
      </div>
    </div>
  );
}
