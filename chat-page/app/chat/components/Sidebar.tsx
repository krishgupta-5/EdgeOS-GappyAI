"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { CSSProperties } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { resetSessionId } from "@/lib/sessionId";
import { satoshi } from "@/constants";

interface SidebarProps {
  activeAgentId?: string;
  onSelectAgent?: (id: string) => void;
  isOpen: boolean;
  onToggle?: () => void;
  sidebarWidth?: number;
  onResize?: (e: React.MouseEvent) => void;
  showLoginModal?: boolean;
  onShowLoginModal?: (show: boolean) => void;
}

// ── Tokens ──────────────────────────────────────────────
const T = {
  bg: "#09090b",
  surface: "#09090b",
  surfaceHover: "#18181b",
  border: "#18181b",
  borderHover: "#27272a",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  accent: "#f97316",
  font: "var(--font-inter), system-ui, -apple-system, sans-serif",
};

function RenameModal({ currentTitle, onSave, onCancel }: {
  currentTitle: string; onSave: (v: string) => void; onCancel: () => void;
}) {
  const [value, setValue] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }} onClick={onCancel}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "28px", width: "400px", maxWidth: "90vw", fontFamily: T.font }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: "16px", fontWeight: 600, color: T.text, marginBottom: "16px" }}>Rename Session</div>
        <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onSave(value); if (e.key === "Escape") onCancel(); }}
          style={{ width: "100%", background: "#111", border: `1px solid ${T.border}`, borderRadius: "8px", color: T.text, fontSize: "15px", fontFamily: T.font, padding: "10px 14px", outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
          onFocus={e => e.currentTarget.style.borderColor = T.borderHover}
          onBlur={e => e.currentTarget.style.borderColor = T.border} />
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onCancel}
            style={{ flex: 1, background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, fontFamily: T.font, cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
            Cancel
          </button>
          <button onClick={() => onSave(value)}
            style={{ flex: 1, background: T.text, color: T.bg, border: "none", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, fontFamily: T.font, cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e5e7eb"}
            onMouseLeave={e => e.currentTarget.style.background = T.text}>
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
    <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "10px 18px", color: T.text, fontSize: "13px", fontWeight: 500, fontFamily: T.font, zIndex: 3000, whiteSpace: "nowrap" }}>
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
  const btn: CSSProperties = { width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: T.textMuted, fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s", display: "block" };
  return (
    <div ref={menuRef} style={{ position: "fixed", left: x, top: y, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "6px", zIndex: 1000, minWidth: "160px", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", fontFamily: T.font }}>
      <button onClick={() => onRename(sessionId, sessionTitle)} style={btn}
        onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = T.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
        Rename
      </button>
      <button onClick={() => onExport(sessionId)} style={btn}
        onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = T.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
        Export
      </button>
      <div style={{ height: "1px", background: T.border, margin: "4px 0" }} />
      <button onClick={() => onDelete(sessionId)} style={{ ...btn, color: "#ef4444" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
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
  const formatDate = (date: Date | string) => {
    const now = new Date();
    const d = typeof date === "string" ? new Date(date) : date;
    const diff = Math.floor(Math.abs(now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString();
  };
  return (
    <button
      onClick={() => onNavigate?.(sessionId)}
      onContextMenu={e => onContextMenu?.(e, sessionId, title)}
      style={{ width: "100%", padding: "8px 10px", marginBottom: "1px", background: active ? "#18181b" : "transparent", border: "1px solid transparent", borderRadius: "8px", color: active ? T.text : T.textMuted, fontSize: "14px", fontFamily: T.font, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "8px", transition: "all .12s", wordBreak: "break-word", whiteSpace: "normal" }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = T.text; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; } }}>
      <div>
        <div style={{ lineHeight: "1.4", marginBottom: "2px", fontSize: "14px" }}>{title}</div>
        <div style={{ fontSize: "12px", color: T.textHint }}>{formatDate(timestamp)}</div>
      </div>
    </button>
  );
}

export default function Sidebar({ activeAgentId, onSelectAgent, isOpen, onToggle, sidebarWidth = 240, onResize, showLoginModal, onShowLoginModal }: SidebarProps) {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [userSessions, setUserSessions] = useState<Array<{ sessionId: string; updatedAt: Date | string; messageCount: number; lastMessage?: string; }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [renameModal, setRenameModal] = useState<{ sessionId: string; currentTitle: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; sessionId: string; sessionTitle: string; } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const clampPos = (x: number, y: number) => ({ x: Math.min(x, window.innerWidth - 168), y: Math.min(y, window.innerHeight - 128) });

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return userSessions;
    const q = searchQuery.toLowerCase();
    return userSessions.filter(s => (s.lastMessage || "").toLowerCase().includes(q) || s.sessionId.toLowerCase().includes(q));
  }, [userSessions, searchQuery]);

  const displayName = user?.firstName ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}` : (user?.primaryEmailAddress?.emailAddress ?? "User");
  const initials = ((user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")).toUpperCase();

  useEffect(() => { if (isOpen && isSignedIn) fetchUserSessions(); }, [isOpen, isSignedIn]);
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) setContextMenu(null);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
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
      if (r.ok) { setUserSessions(p => p.filter(s => s.sessionId !== id)); setToast("Session deleted"); }
      else setToast("Delete failed");
    } catch { setToast("Delete failed"); }
    setContextMenu(null);
  };

  const handleRenameSession = (id: string, title: string) => { setContextMenu(null); setRenameModal({ sessionId: id, currentTitle: title }); };

  const handleRenameSave = async (id: string, newTitle: string) => {
    setRenameModal(null);
    try {
      const r = await fetch(`/api/sessions/${id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newTitle }) });
      if (r.ok) { setUserSessions(p => p.map(s => s.sessionId === id ? { ...s, lastMessage: newTitle } : s)); setToast("Renamed"); }
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
        const a = document.createElement("a"); a.href = url; a.download = `session-${id}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        setToast("Exported");
      } else setToast("Export failed");
    } catch { setToast("Export failed"); }
  };

  const handleNewChat = () => {
    if (!isSignedIn) { onShowLoginModal?.(true); return; }
    try { router.push(`/chat/${resetSessionId()}`); } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <>
      {renameModal && <RenameModal currentTitle={renameModal.currentTitle} onSave={v => handleRenameSave(renameModal.sessionId, v)} onCancel={() => setRenameModal(null)} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <aside className={satoshi.variable} style={{ width: `${sidebarWidth}px`, background: T.bg, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", fontFamily: T.font, zIndex: 50, position: "relative", flexShrink: 0 }}>

        {/* Sidebar header — close button row */}
        <div style={{ height: "56px", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 10px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button
            id="sidebar-close-btn"
            onClick={onToggle}
            title="Close sidebar"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", background: "transparent", border: `1px solid transparent`, borderRadius: "7px", color: T.textHint, cursor: "pointer", transition: "all .15s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "#18181b"; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.border; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textHint; e.currentTarget.style.borderColor = "transparent"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New session + search */}
        <div style={{ padding: "14px 12px 12px", borderBottom: `1px solid ${T.border}` }}>
          <button onClick={handleNewChat}
            style={{ width: "100%", padding: "8px 12px", background: "transparent", border: `1px solid ${T.borderHover}`, borderRadius: "8px", color: T.text, fontSize: "14px", fontWeight: 500, fontFamily: T.font, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", transition: "all .15s", marginBottom: "8px" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#18181b"; e.currentTarget.style.borderColor = T.borderHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.borderHover; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            New session
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: `1px solid ${T.borderHover}`, borderRadius: "8px", padding: "7px 10px", transition: "border-color .15s" }}
            onFocus={() => { }} >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.textHint} strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: "14px", fontFamily: T.font, width: "100%", caretColor: T.text }} />
            <span style={{ fontSize: "11px", color: T.textHint, background: "#18181b", border: `1px solid ${T.border}`, borderRadius: "4px", padding: "1px 5px", flexShrink: 0, fontFamily: T.font }}>⌘K</span>
          </div>
        </div>

        {/* Sessions label */}
        <div style={{ padding: "10px 14px 6px", fontSize: "12px", fontWeight: 500, color: T.textHint, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: T.font }}>
          Sessions{searchQuery && filteredSessions.length > 0 ? ` (${filteredSessions.length})` : ""}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: T.textHint, fontSize: "14px", fontFamily: T.font }}>Loading...</div>
          ) : !isSignedIn ? (
            <div style={{ padding: "40px 16px", textAlign: "center", fontFamily: T.font }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: T.text, marginBottom: "6px" }}>Authentication required</div>
              <div style={{ fontSize: "14px", color: T.textHint }}>Log in to view history</div>
            </div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map(s => (
              <HistoryItem key={s.sessionId} sessionId={s.sessionId}
                title={s.lastMessage || `Session · ${s.messageCount} messages`}
                timestamp={s.updatedAt}
                onNavigate={id => router.push(`/chat/${id}`)}
                onContextMenu={(e, id, title) => { e.preventDefault(); const { x, y } = clampPos(e.clientX, e.clientY); setContextMenu({ visible: true, x, y, sessionId: id, sessionTitle: title }); }} />
            ))
          ) : searchQuery ? (
            <div style={{ padding: "40px 16px", textAlign: "center", fontFamily: T.font }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: T.text, marginBottom: "6px" }}>No results</div>
              <div style={{ fontSize: "14px", color: T.textHint }}>No sessions match "{searchQuery}"</div>
            </div>
          ) : (
            <div style={{ padding: "40px 16px", textAlign: "center", fontFamily: T.font }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: T.text, marginBottom: "6px" }}>No history</div>
              <div style={{ fontSize: "14px", color: T.textHint }}>Start a new session to begin</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px", borderTop: `1px solid ${T.border}`, position: "relative" }}>

          {/* Popup menu */}
          {showUserMenu && isSignedIn && (
            <div ref={userMenuRef} style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "10px", right: "10px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "6px", boxShadow: "0 -8px 24px rgba(0,0,0,0.6)", zIndex: 100, fontFamily: T.font }}>
              {[{ label: "Plans & Pricing", href: "/pricing" }, { label: "Settings", href: "/settings" }].map(item => (
                <button key={item.label} onClick={() => window.location.href = item.href}
                  style={{ width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: T.textMuted, fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s", display: "block" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#18181b"; e.currentTarget.style.color = T.text; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
                  {item.label}
                </button>
              ))}
              <div style={{ height: "1px", background: T.border, margin: "4px 0" }} />
              <SignOutButton>
                <button style={{ width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: T.textHint, fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textHint; }}>
                  Sign out
                </button>
              </SignOutButton>
            </div>
          )}

          {isSignedIn ? (
            <button onClick={() => setShowUserMenu(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: "9px", width: "100%", padding: "7px 8px", background: showUserMenu ? "#18181b" : "transparent", border: `1px solid ${showUserMenu ? T.border : "transparent"}`, borderRadius: "8px", color: T.textMuted, fontSize: "14px", fontWeight: 500, fontFamily: T.font, cursor: "pointer", transition: "all .15s" }}
              onMouseEnter={e => { if (!showUserMenu) { e.currentTarget.style.background = "#18181b"; e.currentTarget.style.borderColor = T.border; } }}
              onMouseLeave={e => { if (!showUserMenu) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}>
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", border: `1px solid ${T.border}`, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #d946ef 0%, #ec4899 50%, #f43f5e 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#fff", flexShrink: 0, boxShadow: "0 0 10px rgba(236,72,153,0.3)" }}>
                  {initials || "U"}
                </div>
              )}
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left", color: T.textMuted }}>{displayName}</span>
            </button>
          ) : (
            <button onClick={() => window.location.href = "/login"}
              style={{ width: "100%", padding: "9px", background: T.text, border: "none", borderRadius: "8px", color: T.bg, fontSize: "13px", fontWeight: 600, fontFamily: T.font, cursor: "pointer", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e5e7eb"}
              onMouseLeave={e => e.currentTarget.style.background = T.text}>
              Authenticate
            </button>
          )}
        </div>

        {/* Resize handle */}
        {onResize && (
          <div style={{ position: "absolute", right: -3, top: 0, width: "6px", height: "100%", cursor: "col-resize", zIndex: 60, background: "transparent", transition: "background .15s" }}
            onMouseDown={onResize}
            onMouseEnter={e => e.currentTarget.style.background = T.border}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"} />
        )}

        <SessionContextMenu visible={contextMenu?.visible ?? false} x={contextMenu?.x ?? 0} y={contextMenu?.y ?? 0}
          sessionId={contextMenu?.sessionId ?? ""} sessionTitle={contextMenu?.sessionTitle ?? ""}
          onRename={handleRenameSession} onExport={handleExportSession} onDelete={handleDeleteSession} menuRef={contextMenuRef} />

        <style dangerouslySetInnerHTML={{ __html: `aside *{font-family:var(--font-inter),system-ui,sans-serif!important}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#27272a;border-radius:4px}input::placeholder{color:#71717a!important}` }} />
      </aside>
    </>
  );
}