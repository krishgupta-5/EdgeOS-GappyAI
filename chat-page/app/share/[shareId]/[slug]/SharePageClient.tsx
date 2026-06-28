"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ChatPanel from "@/app/chat/components/ChatPanel";
import { satoshi } from "@/constants";

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
          if (res.status === 404) setError("Shared chat not available or deleted.");
          else setError("Failed to load shared chat.");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shareId]);

  const handleFork = async () => {
    if (!isSignedIn) {
      // Redirect to login if they try to fork without being signed in (or we can let clerk handle via middleware)
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
      <div className={satoshi.variable} style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, height: "100dvh", background: T.bg, color: T.text, fontFamily: T.font }}>
        Loading shared project...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={satoshi.variable} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, height: "100dvh", background: T.bg, color: T.text, fontFamily: T.font, gap: "16px" }}>
        <h2 style={{ fontSize: "24px", margin: 0 }}>404</h2>
        <p style={{ color: T.textMuted }}>{error}</p>
      </div>
    );
  }

  const { metadata } = data;

  return (
    <div className={satoshi.variable} style={{ display: "flex", flexDirection: "column", flex: 1, height: "100dvh", background: T.bg, fontFamily: T.font }}>
      
      {/* Top Banner */}
      <div style={{ padding: "12px 24px", background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h1 style={{ fontSize: "16px", fontWeight: 600, color: T.text, margin: 0 }}>{metadata.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: T.textMuted }}>
            <span>Shared by <strong>{metadata.ownerName}</strong></span>
            <span>•</span>
            <span>Created with <strong>EdgeOS</strong></span>
            <span>•</span>
            <span>{metadata.views} Views</span>
            <span>•</span>
            <span>{metadata.forks} Forks</span>
          </div>
        </div>

        <div>
          {isLoaded && isSignedIn ? (
            <button
              onClick={handleFork}
              disabled={forking}
              style={{ padding: "8px 16px", background: "#ffffff", color: "#000000", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: forking ? "not-allowed" : "pointer", opacity: forking ? 0.7 : 1, transition: "transform 0.1s", fontFamily: T.font }}
              onMouseDown={e => !forking && (e.currentTarget.style.transform = "scale(0.96)")}
              onMouseUp={e => !forking && (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={e => !forking && (e.currentTarget.style.transform = "scale(1)")}
            >
              {forking ? "Forking..." : "Fork Project"}
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              style={{ padding: "8px 16px", background: T.surfaceHover, color: T.text, border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: T.font }}
            >
              Sign in to Fork
            </button>
          )}
        </div>

      </div>

      {/* Chat Panel Read Only View */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
        <ChatPanel
          agentName="AI Architect"
          isSidebarOpen={false}
          onToggleSidebar={() => {}}
          isSharedView={true}
          sharedData={data}
        />
      </div>

    </div>
  );
}
