"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { CSSProperties } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { resetSessionId } from "@/lib/sessionId";
import { satoshi } from "@/constants";
import {
  SidebarLeft01Icon,
  PlusSignIcon,
  Search02Icon,
  Settings01Icon,
  UserCircleIcon
} from "hugeicons-react";

interface SidebarProps {
  activeAgentId?: string;
  onSelectAgent?: (id: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  sidebarWidth?: number;
  onResize?: (e: React.MouseEvent) => void;
  showLoginModal?: boolean;
  onShowLoginModal?: (show: boolean) => void;
}

// ── Minimal Premium Design Tokens ──────────────────────────────────────
const T = {
  bg: "#09090b", // Deep onyx
  surface: "rgba(255,255,255,0.02)",
  surfaceHover: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.15)",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
};

// ── Modals & Popovers ──────────────────────────────────────────────────
function RenameModal({ currentTitle, onSave, onCancel }: {
  currentTitle: string; onSave: (v: string) => void; onCancel: () => void;
}) {
  const [value, setValue] = useState(currentTitle || "");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onCancel}>
      <div style={{ background: "#09090b", border: `1px solid ${T.borderHover}`, borderRadius: "12px", padding: "24px", width: "400px", maxWidth: "90vw", fontFamily: T.font, boxShadow: "0 24px 48px rgba(0,0,0,0.9)" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: "16px", fontWeight: 600, color: T.text, marginBottom: "16px", letterSpacing: "-0.01em" }}>Rename Project</div>
        <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onSave(value); if (e.key === "Escape") onCancel(); }}
          style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, borderRadius: "8px", color: T.text, fontSize: "14px", fontFamily: T.font, padding: "12px 14px", outline: "none", boxSizing: "border-box", transition: "border-color .15s, background .15s" }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }} />
        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button onClick={onCancel}
            style={{ flex: 1, background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, fontFamily: T.font, cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
            Cancel
          </button>
          <button onClick={() => onSave(value)}
            style={{ flex: 1, background: T.text, color: "#000", border: "none", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, fontFamily: T.font, cursor: "pointer", transition: "opacity .15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#18181b", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: "8px", padding: "10px 20px", color: T.text, fontSize: "13px", fontWeight: 500, fontFamily: T.font, zIndex: 3000, whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(0,0,0,0.8)" }}>
      {message}
    </div>
  );
}

function SessionContextMenu({ visible, x, y, sessionId, sessionTitle, onRename, onExport, onDelete, menuRef }: {
  visible: boolean; x: number; y: number; sessionId: string; sessionTitle: string;
  onRename: (id: string, title: string) => void; onExport: (id: string) => void;
  onDelete: (id: string) => void; menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!visible) return null;
  const btn: CSSProperties = { width: "100%", padding: "8px 12px", background: "transparent", border: "none", color: T.textMuted, fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s", display: "block" };
  return (
    <div ref={menuRef} style={{ position: "fixed", left: x, top: y, background: "#121214", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: "10px", padding: "6px", zIndex: 1000, minWidth: "160px", boxShadow: "0 12px 32px rgba(0,0,0,0.9)", fontFamily: T.font }}>
      <button onClick={() => onRename(sessionId, sessionTitle)} style={btn}
        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
        Rename
      </button>
      <button onClick={() => onExport(sessionId)} style={btn}
        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
        Export Document
      </button>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
      <button onClick={() => onDelete(sessionId)} style={{ ...btn, color: "#ef4444" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
        Delete
      </button>
    </div>
  );
}

function HistoryItem({ sessionId, title, timestamp, active = false, onNavigate, onContextMenu }: {
  sessionId: string; title: string; timestamp: Date | string; active?: boolean;
  onNavigate?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string, title: string) => void;
}) {
  return (
    <button
      onClick={() => onNavigate?.(sessionId)}
      onContextMenu={e => onContextMenu?.(e, sessionId, title)}
      style={{ width: "100%", padding: "10px 14px", marginBottom: "2px", background: active ? "rgba(255,255,255,0.06)" : "transparent", border: "none", borderRadius: "8px", color: active ? T.text : T.textMuted, fontSize: "13px", fontFamily: T.font, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", transition: "all .15s", overflow: "hidden" }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = T.text; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; } }}>
      <span style={{ lineHeight: "1.4", fontWeight: 500, width: "100%", wordBreak: "break-word" }}>{title}</span>
    </button>
  );
}

export default function Sidebar({ activeAgentId, onSelectAgent, isOpen = false, onToggle, sidebarWidth = 280, onResize, showLoginModal, onShowLoginModal }: SidebarProps) {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const [cachedDisplayName, setCachedDisplayName] = useState<string>("User");

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== "undefined") {
      const img = localStorage.getItem("edge-os-user-image");
      if (img) setCachedImageUrl(img);
      const name = localStorage.getItem("edge-os-user-name");
      if (name) setCachedDisplayName(name);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      localStorage.removeItem("edge-os-user-image");
      localStorage.removeItem("edge-os-user-name");
      setCachedImageUrl(null);
      setCachedDisplayName("User");
    } else if (user) {
      if (user.imageUrl) {
        setCachedImageUrl(user.imageUrl);
        localStorage.setItem("edge-os-user-image", user.imageUrl);
      }
      if (user.firstName || user.primaryEmailAddress?.emailAddress) {
        const name = user.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` : (user.primaryEmailAddress?.emailAddress ?? "User");
        setCachedDisplayName(name);
        localStorage.setItem("edge-os-user-name", name);
      }
    }
  }, [user, isLoaded, isSignedIn]);

  const [userSessions, setUserSessions] = useState<Array<{ sessionId: string; updatedAt: Date | string; messageCount: number; lastMessage?: string; }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [renameModal, setRenameModal] = useState<{ sessionId: string; currentTitle: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; sessionId: string; sessionTitle: string; } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const clampPos = (x: number, y: number) => ({ x: Math.min(x, window.innerWidth - 168), y: Math.min(y, window.innerHeight - 128) });

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return userSessions;
    const q = searchQuery.toLowerCase();
    return userSessions.filter(s => {
      const title = s.lastMessage || `Session · ${s.messageCount} messages`;
      return title.toLowerCase().includes(q) || s.sessionId.toLowerCase().includes(q);
    });
  }, [userSessions, searchQuery]);

  const initials = cachedDisplayName !== "User" ? cachedDisplayName.charAt(0).toUpperCase() : "U";
  const displayName = cachedDisplayName;

  useEffect(() => { if (isOpen && isSignedIn) fetchUserSessions(); }, [isOpen, isSignedIn]);
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) setContextMenu(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const fetchUserSessions = async () => {
    setLoading(true);
    try { const r = await fetch("/api/sessions", { credentials: "include" }); if (r.ok) setUserSessions((await r.json()).sessions || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const r = await fetch(`/api/sessions/${id}`, { method: "DELETE", credentials: "include" });
      if (r.ok) { setUserSessions(p => p.filter(s => s.sessionId !== id)); setToast("Project deleted"); }
      else setToast("Delete failed");
    } catch { setToast("Delete failed"); }
    setContextMenu(null);
  };

  const handleRenameSession = (id: string, title: string) => { setContextMenu(null); setRenameModal({ sessionId: id, currentTitle: title }); };

  const handleRenameSave = async (id: string, newTitle: string) => {
    setRenameModal(null);
    try {
      const r = await fetch(`/api/sessions/${id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle }) });
      if (r.ok) { setUserSessions(p => p.map(s => s.sessionId === id ? { ...s, lastMessage: newTitle } : s)); setToast("Renamed successfully"); }
      else setToast("Rename failed");
    } catch { setToast("Rename failed"); }
  };

  const handleExportSession = async (id: string) => {
    setContextMenu(null);
    try {
      const r = await fetch(`/api/sessions/${id}/export`, { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
        const a = document.createElement("a"); a.href = url; a.download = `project-${id}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        setToast("Document Exported");
      } else setToast("Export failed");
    } catch { setToast("Export failed"); }
  };

  const handleNewChat = () => {
    if (!isSignedIn) { onShowLoginModal?.(true); return; }
    try { router.push(`/chat/${resetSessionId()}`); } catch (e) { console.error(e); }
  };

  return (
    <>
      {renameModal && <RenameModal currentTitle={renameModal.currentTitle} onSave={v => handleRenameSave(renameModal.sessionId, v)} onCancel={() => setRenameModal(null)} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <aside
        className={satoshi.variable}
        style={{
          width: isOpen ? `${sidebarWidth}px` : "68px",
          background: T.bg,
          borderRight: `1px solid rgba(255,255,255,0.06)`,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
          fontFamily: T.font,
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* 1. Header (Hamburger Toggle) */}
        <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", width: "100%" }}>
          <button
            onClick={onToggle}
            title="Toggle Sidebar"
            style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, background: "transparent", border: "none", cursor: "pointer", borderRadius: "8px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = "transparent"; }}
          >
            <SidebarLeft01Icon size={20} strokeWidth={2} />
          </button>
        </div>

        {/* 2. Primary Navigation (Icons as Prefixes) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "0 14px", width: "100%" }}>
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            title="New Project"
            style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "12px", padding: isOpen ? "10px 12px" : "0 10px", height: "40px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: T.text, cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap", width: isOpen ? "100%" : "40px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            <PlusSignIcon size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "14px", fontWeight: 500, opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease" }}>New Project</span>
          </button>

          {/* Search Box */}
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "12px", padding: isOpen ? "10px 12px" : "0 10px", height: "40px", background: "transparent", border: "1px solid transparent", borderRadius: "8px", color: T.textHint, transition: "all 0.2s ease", whiteSpace: "nowrap", width: isOpen ? "100%" : "40px", cursor: !isOpen ? "pointer" : "text", overflow: "hidden", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
            onClick={() => { if (!isOpen && onToggle) onToggle(); }}
          >
            <Search02Icon size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: "14px", fontFamily: T.font, width: "100%", opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease", pointerEvents: isOpen ? "auto" : "none" }}
            />
          </div>
        </div>

        {/* 3. History List */}
        <div style={{ marginTop: "24px", padding: "0 24px 8px", fontSize: "12px", fontWeight: 600, color: T.textHint, textTransform: "uppercase", letterSpacing: "0.04em", opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease", whiteSpace: "nowrap", width: "100%" }}>
          Recent
        </div>

        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 12px", opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease", pointerEvents: isOpen ? "auto" : "none", width: "100%" }}>
          {loading ? (
            <div style={{ padding: "16px 12px", color: T.textHint, fontSize: "13px", fontFamily: T.font }}>Loading workspace...</div>
          ) : !isSignedIn ? (
            <div style={{ padding: "16px 12px", fontFamily: T.font }}>
              <div style={{ fontSize: "13px", color: T.textHint }}>Log in to view workspace</div>
            </div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map(s => (
              <HistoryItem key={s.sessionId} sessionId={s.sessionId}
                title={s.lastMessage || `Session · ${s.messageCount} messages`}
                timestamp={s.updatedAt}
                onNavigate={id => router.push(`/chat/${id}`)}
                onContextMenu={(e, id, title) => { e.preventDefault(); const { x, y } = clampPos(e.clientX, e.clientY); setContextMenu({ visible: true, x, y, sessionId: id, sessionTitle: title }); }} />
            ))
          ) : (
            <div style={{ padding: "16px 12px", fontFamily: T.font }}>
              <div style={{ fontSize: "13px", color: T.textHint }}>No recent projects</div>
            </div>
          )}
        </div>

        {/* 4. Bottom Footer (Profile & Settings) */}
        <div style={{ padding: isOpen ? "12px 16px 16px" : "12px 0 24px", display: "flex", flexDirection: isOpen ? "row" : "column-reverse", alignItems: "center", justifyContent: isOpen ? "space-between" : "center", gap: isOpen ? "0" : "16px", marginTop: "auto", position: "relative", width: "100%", transition: "padding 0.25s ease", borderTop: `1px solid rgba(255,255,255,0.04)` }}>

          {/* User Profile Block */}
          <div
            onClick={() => { if (!isSignedIn) onShowLoginModal?.(true); else window.location.href = "/settings"; }}
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: isSignedIn ? "default" : "pointer", padding: "6px 8px", borderRadius: "8px", transition: "background 0.15s", flexGrow: isOpen ? 1 : 0, width: isOpen ? "100%" : "44px", height: "46px", overflow: "hidden", flexShrink: 0 }}
            onMouseEnter={e => { if (!isSignedIn) e.currentTarget.style.background = T.surfaceHover; }}
            onMouseLeave={e => { if (!isSignedIn) e.currentTarget.style.background = "transparent"; }}
            title={isSignedIn ? "Account" : "Sign In"}
          >
            {cachedImageUrl ? (
              <img src={cachedImageUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }} />
            ) : (
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", color: T.text, flexShrink: 0 }}>
                {(isSignedIn || cachedDisplayName !== "User") ? <span style={{ fontSize: "11px", fontWeight: 600 }}>{initials}</span> : <UserCircleIcon size={16} />}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease", visibility: "visible" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {(isSignedIn || cachedDisplayName !== "User") ? displayName : "Sign in"}
              </span>
              {(isSignedIn || cachedDisplayName !== "User") && <span style={{ fontSize: "11px", color: T.textHint, fontWeight: 500 }}>Settings</span>}
            </div>
          </div>

          {/* Settings Icon */}
          <button
            onClick={() => (window.location.href = "/settings")}
            title="Settings"
            style={{ width: "32px", height: "32px", display: isOpen ? "none" : "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, background: "transparent", border: "none", cursor: "pointer", borderRadius: "6px", transition: "all 0.2s", flexShrink: 0, marginLeft: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = "transparent"; }}
          >
            <Settings01Icon size={18} strokeWidth={2} />
          </button>

        </div>

        {/* Subtle Resize handle */}
        {onResize && (
          <div style={{ position: "absolute", right: -3, top: 0, width: "6px", height: "100%", cursor: "col-resize", zIndex: 60, background: "transparent", transition: "background .15s" }}
            onMouseDown={onResize}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"} />
        )}

        <SessionContextMenu visible={contextMenu?.visible ?? false} x={contextMenu?.x ?? 0} y={contextMenu?.y ?? 0}
          sessionId={contextMenu?.sessionId ?? ""} sessionTitle={contextMenu?.sessionTitle ?? ""}
          onRename={handleRenameSession} onExport={handleExportSession} onDelete={handleDeleteSession} menuRef={contextMenuRef} />

        <style dangerouslySetInnerHTML={{ __html: `aside *{font-family:var(--font-satoshi),system-ui,sans-serif!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2)}input::placeholder{color:#71717a!important}` }} />
      </aside>
    </>
  );
}