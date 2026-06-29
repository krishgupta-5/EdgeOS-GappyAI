"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ChatPanel from "@/app/chat/components/ChatPanel";
import { satoshi } from "@/constants";

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

export default function SharePageClient({ shareId, slug }: { shareId: string; slug: string }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [forking, setForking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/share/${shareId}`);
        if (!res.ok) {
          if (res.status === 404) setError("Shared workspace not available or has been deleted.");
          else setError("Failed to load shared workspace.");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError("Network error encountered.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shareId]);

  const handleFork = async () => {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    setForking(true);
    try {
      const res = await fetch(`/api/share/${shareId}/fork`, { method: "POST" });
      if (!res.ok) throw new Error("Fork failed");
      const { newSessionId } = await res.json();
      router.push(`/chat/${newSessionId}`);
    } catch (e) {
      console.error(e);
      alert("Failed to fork project.");
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div className={satoshi.variable} style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: 1, height: "100vh", background: T.bg, color: T.textMuted,
        fontFamily: T.font, fontSize: "14px", fontWeight: 500
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#fff", animation: "spin 1s linear infinite" }} />
          Loading workspace...
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={satoshi.variable} style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        flex: 1, height: "100vh", background: T.bg, color: T.text, fontFamily: T.font, gap: "16px"
      }}>
        <div style={{ padding: "24px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#f87171", margin: "0 0 8px 0" }}>Unavailable</h2>
          <p style={{ color: "rgba(248, 113, 113, 0.8)", margin: 0, fontSize: "14px" }}>{error}</p>
        </div>
      </div>
    );
  }

  const { metadata } = data;

  return (
    <div className={satoshi.variable} style={{
      display: "flex", flexDirection: "column", flex: 1, height: "100vh",
      background: T.bg, fontFamily: T.font, position: "relative"
    }}>

      {/* ── Ambient Background Glow ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "800px",
        height: "300px",
        background: "radial-gradient(ellipse at top, rgba(255,255,255,0.035) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Top Banner */}
      <div style={{
        padding: "16px 24px",
        background: "rgba(9, 9, 11, 0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "relative",
        zIndex: 10
      }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{
              fontSize: "10px", fontWeight: 600, color: T.textHint,
              textTransform: "uppercase", letterSpacing: "0.06em",
              background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "100px",
              border: `1px solid rgba(255,255,255,0.05)`
            }}>
              Read Only
            </span>
            <h1 style={{ fontSize: "16px", fontWeight: 500, color: T.text, margin: 0, letterSpacing: "-0.01em" }}>
              {metadata.title || "Shared Workspace"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: T.textMuted }}>
            <span>Shared by <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{metadata.ownerName}</strong></span>
            <span style={{ color: T.borderHover }}>|</span>
            <span>Created with <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>ProdMate</strong></span>
          </div>
        </div>

        <div>
          {isLoaded && isSignedIn ? (
            <button
              onClick={handleFork}
              disabled={forking}
              style={{
                padding: "8px 16px",
                background: T.text,
                color: T.bg,
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: forking ? "not-allowed" : "pointer",
                opacity: forking ? 0.7 : 1,
                transition: "all 0.2s ease",
                fontFamily: T.font,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={e => !forking && (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => !forking && (e.currentTarget.style.opacity = "1")}
            >
              {forking ? "Forking..." : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Fork to Workspace
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: T.text,
                border: `1px solid ${T.borderHover}`,
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: T.font,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.borderHover; }}
            >
              Sign in to Fork
            </button>
          )}
        </div>

      </div>

      {/* Chat Panel Read Only View */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", minHeight: 0, zIndex: 1 }}>
        <ChatPanel
          agentName="AI Architect"
          isSidebarOpen={false}
          onToggleSidebar={() => { }}
          isSharedView={true}
          sharedData={data}
        />
      </div>

    </div>
  );
}
