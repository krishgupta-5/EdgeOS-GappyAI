"use client";

import React, { useState, useEffect } from "react";

const T_tokens = {
  bg: "#09090b",
  surface: "rgba(255, 255, 255, 0.02)",
  surfaceHover: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.06)",
  borderHover: "rgba(255, 255, 255, 0.15)",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  accent: "#ffffff",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
};

export default function IntegrationsPanel() {
  const [data, setData] = useState<{ connected: boolean; workspaceName?: string; pages?: any[]; defaultParentPageId?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/notion/pages")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        if (d.defaultParentPageId) setSelectedPage(d.defaultParentPageId);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
      setData({ connected: false });
    } catch (e) {
      console.error(e);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: "48px 32px 80px", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", color: T_tokens.text, fontFamily: T_tokens.font }}>
      <div style={{ width: "100%", maxWidth: "800px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>Integrations</h2>
          <p style={{ fontSize: "14px", color: T_tokens.textMuted, marginTop: "8px", lineHeight: "1.6" }}>
            Connect Edge OS with your favorite third-party services.
          </p>
        </div>

        <div style={{
          background: T_tokens.surface,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${T_tokens.border}`,
          borderRadius: "16px",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "40px", height: "40px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 1024 1024" fill="none"><path d="M125.751 289.878v487.696l245.922 133.402V364.555L125.751 289.878z" fill="#000"/><path d="M420.25 410.603v485.466l491.564-90.133V312.387L420.25 410.603zM784.814 748.225l-254.912 43.14V462.46l254.912-42.342v328.107z" fill="#000"/><path d="M371.674 274.776l424.316-72.333-149.52-67.625-424.28 72.343 149.484 67.615z" fill="#000"/></svg>
              </div>
              <div>
                <div style={{ fontSize: "16px", color: T_tokens.text, fontFamily: T_tokens.font, fontWeight: 500, marginBottom: "4px" }}>Notion</div>
                <div style={{ fontSize: "13px", color: T_tokens.textMuted, lineHeight: "1.6", fontFamily: T_tokens.font }}>
                  Export your generated technical documentation directly to your Notion workspace.
                </div>
              </div>
            </div>
            
            {loading ? (
              <div style={{ color: T_tokens.textHint, fontSize: "13px", fontFamily: T_tokens.font }}>Loading...</div>
            ) : data?.connected ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => window.location.href = "/api/notion/connect"}
                  style={{
                    padding: "8px 16px", background: "transparent", border: `1px solid ${T_tokens.borderHover}`, color: T_tokens.text,
                    borderRadius: "8px", fontSize: "13px", fontFamily: T_tokens.font, fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T_tokens.borderHover; }}
                >
                  Reconnect
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  style={{
                    padding: "8px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171",
                    borderRadius: "8px", fontSize: "13px", fontFamily: T_tokens.font, fontWeight: 500, cursor: disconnecting ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: disconnecting ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => { if (!disconnecting) { e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; } }}
                  onMouseLeave={(e) => { if (!disconnecting) { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; } }}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => window.location.href = "/api/notion/connect"}
                style={{
                  padding: "8px 16px", background: T_tokens.text, border: "none", color: T_tokens.bg,
                  borderRadius: "8px", fontSize: "13px", fontFamily: T_tokens.font, fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                Connect
              </button>
            )}
          </div>

          {data?.connected && (
            <>
              <div style={{ height: "1px", width: "100%", background: T_tokens.border }} />
              <div>
                <div style={{ fontSize: "14px", color: T_tokens.text, fontFamily: T_tokens.font, fontWeight: 500, marginBottom: "16px" }}>Integration Settings</div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: T_tokens.textMuted, fontFamily: T_tokens.font }}>Connected Workspace</span>
                    <span style={{ fontSize: "13px", color: T_tokens.text, fontFamily: T_tokens.font, fontWeight: 500 }}>{data.workspaceName}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: T_tokens.textMuted, fontFamily: T_tokens.font }}>Default Parent Page</span>
                    <select
                      value={selectedPage}
                      onChange={(e) => handleSavePage(e.target.value)}
                      disabled={savingPage}
                      style={{
                        background: T_tokens.surfaceHover,
                        border: `1px solid ${T_tokens.borderHover}`,
                        color: T_tokens.text,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontFamily: T_tokens.font,
                        outline: "none",
                        width: "240px",
                        cursor: savingPage ? "not-allowed" : "pointer"
                      }}
                    >
                      <option value="" disabled>Select a page...</option>
                      {data.pages?.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  {!selectedPage && (
                    <div style={{ fontSize: "12px", color: "#f59e0b", fontFamily: T_tokens.font, marginTop: "-8px", textAlign: "right" }}>
                      ⚠️ Please select a parent page to enable automatic exports.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
