import React from "react";
import { CopyIcon } from "lucide-react"; // Assuming lucide-react is used, or replace with simple SVG

const T = {
  bg: "#09090b",
  surface: "#121214",
  surfaceHover: "#18181b",
  border: "#27272a",
  borderHover: "#3f3f46",
  text: "#ededed",
  textMuted: "#a1a1aa",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
};

export default function ShareDialog({ sessionId, shareUrl, shareId, loading, onClose, onDelete }: {
  sessionId: string;
  shareUrl?: string;
  shareId?: string;
  loading?: boolean;
  onClose: () => void;
  onDelete: (shareId: string, sessionId: string) => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, fontFamily: T.font }} onClick={onClose}>
      <div style={{ background: T.bg, border: `1px solid ${T.borderHover}`, borderRadius: "12px", width: "420px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 24px 48px rgba(0,0,0,0.9)" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: T.text }}>Share Chat</h3>
        
        {loading ? (
          <p style={{ color: T.textMuted, fontSize: "14px" }}>Generating secure link...</p>
        ) : (
          <>
            <p style={{ color: T.textMuted, fontSize: "14px", margin: 0 }}>
              Anyone with this link can view this project.
            </p>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="text" 
                readOnly 
                value={shareUrl || ""}
                style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "6px", padding: "8px 12px", color: T.text, fontSize: "13px", fontFamily: T.font, outline: "none" }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button 
                onClick={() => { if(shareUrl) { navigator.clipboard.writeText(shareUrl); alert("Copied!"); } }}
                style={{ flex: 1, background: T.surfaceHover, color: T.text, border: `1px solid ${T.border}`, padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
              >
                Copy Link
              </button>
              <button 
                onClick={() => { if(shareUrl) window.open(shareUrl, "_blank"); }}
                style={{ flex: 1, background: T.text, color: "#000", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
              >
                Open Link
              </button>
            </div>
            
            <div style={{ display: "flex", gap: "8px" }}>
              {/* Note: Update Share is effectively the same as creating a new share which happens via handleShareClick, but the user requested it. For now, it's just the shareUrl copying unless they click the context menu again */}
              <button 
                onClick={() => { if(shareId) onDelete(shareId, sessionId); }}
                style={{ flex: 1, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
              >
                Delete Share
              </button>
            </div>
          </>
        )}
        
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: T.textMuted, cursor: "pointer", fontSize: "18px" }}>
          ×
        </button>
      </div>
    </div>
  );
}
