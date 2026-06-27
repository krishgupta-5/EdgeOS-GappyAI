"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { CSSProperties } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetSessionId } from "@/lib/sessionId";
import { satoshi } from "@/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  SidebarLeft01Icon,
  PlusSignIcon,
  Search02Icon,
  Settings01Icon,
  UserCircleIcon,
  Menu01Icon,
  PlugSocketIcon,
  MoreIcon,
  PinIcon
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

function SearchModal({ userSessions, onClose, onNavigate, leftOffset }: {
  userSessions: Array<{ sessionId: string; updatedAt: Date | string; messageCount: number; lastMessage?: string; }>;
  onClose: () => void;
  onNavigate: (id: string) => void;
  leftOffset: number;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return userSessions;
    const q = query.toLowerCase();
    return userSessions.filter(s => {
      const title = s.lastMessage || `Session · ${s.messageCount} messages`;
      return title.toLowerCase().includes(q) || s.sessionId.toLowerCase().includes(q);
    });
  }, [userSessions, query]);

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: leftOffset, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, transition: "left 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }} onClick={onClose}>
      <div style={{ background: "#09090b", border: `1px solid ${T.borderHover}`, borderRadius: "12px", width: "600px", maxWidth: "90vw", fontFamily: T.font, boxShadow: "0 24px 48px rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", maxHeight: "60vh" }} onClick={e => e.stopPropagation()}>
        
        {/* Search Input */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <Search02Icon size={20} color={T.textMuted} style={{ marginRight: "12px" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") onClose(); }}
            placeholder="Search projects..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.text, fontSize: "15px", fontFamily: T.font }}
          />
        </div>

        {/* Results */}
        <div style={{ padding: "12px", overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: T.textHint, fontSize: "14px" }}>No projects found.</div>
          ) : (
            filtered.map(s => (
              <button
                key={s.sessionId}
                onClick={() => { onNavigate(s.sessionId); onClose(); }}
                style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "none", borderRadius: "8px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ fontSize: "14px", fontWeight: 500, color: T.text }}>{s.lastMessage || `Session · ${s.messageCount} messages`}</div>
                <div style={{ fontSize: "12px", color: T.textHint }}>{new Date(s.updatedAt).toLocaleDateString()}</div>
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
}



function Toast({ message, onDone }: { message: string; onDone: () => void; }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: T.text, color: T.bg, padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: 500, fontFamily: T.font, boxShadow: "0 12px 24px rgba(0,0,0,0.5)", zIndex: 4000, animation: "slideUp 0.3s ease-out" }}>
      {message}
    </div>
  );
}

function SessionContextMenu({ visible, x, y, sessionId, sessionTitle, isPinned, onTogglePin, onRename, onExport, onDelete, menuRef }: {
  visible: boolean; x: number; y: number; sessionId: string; sessionTitle: string; isPinned: boolean;
  onTogglePin: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!visible) return null;
  const btn: CSSProperties = { width: "100%", padding: "8px 12px", background: "transparent", border: "none", color: T.textMuted, fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s", display: "block" };
  return (
    <div ref={menuRef} style={{ position: "fixed", left: x, top: y, background: "#121214", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: "10px", padding: "6px", zIndex: 5000, minWidth: "160px", boxShadow: "0 12px 32px rgba(0,0,0,0.9)", fontFamily: T.font }}>
      <button onClick={() => onTogglePin(sessionId)} style={btn}
        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
        {isPinned ? "Unpin" : "Pin"}
      </button>
      <button onClick={() => onRename(sessionId, sessionTitle)} style={btn}
        onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
        Edit
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

// ── Aceternity-Style Link Component ──────────────────────────────────────────
function SidebarLink({ icon, label, onClick, isOpen, isHighlight, className }: { 
  icon: React.ReactNode; label: string; onClick: () => void; isOpen: boolean; isHighlight?: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={isOpen ? "" : label}
      className={className}
      style={{ 
        display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "12px", 
        padding: "0 10px", height: "40px", width: "100%", overflow: "hidden", flexShrink: 0,
        background: isHighlight ? "rgba(255,255,255,0.03)" : "transparent", 
        border: isHighlight ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent", 
        borderRadius: "8px", 
        color: isHighlight ? T.text : T.textHint, 
        cursor: "pointer", transition: "all 0.2s ease",
        boxShadow: isHighlight ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
      }}
      onMouseEnter={e => { 
        e.currentTarget.style.background = isHighlight ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)"; 
        if (isHighlight) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; 
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.background = isHighlight ? "rgba(255,255,255,0.03)" : "transparent"; 
        if (isHighlight) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; 
      }}
    >
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px" }}>
        {icon}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.span 
            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
            animate={{ opacity: 1, width: "auto", marginLeft: 4 }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: "14px", fontWeight: isHighlight ? 500 : 400, whiteSpace: "nowrap" }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function HistoryItem({ sessionId, title, isOpen, active = false, isPinned = false, onNavigate, onOptionsClick, onTogglePin }: {
  sessionId: string; title: string; isOpen: boolean; active?: boolean; isPinned?: boolean;
  onNavigate?: (id: string) => void;
  onOptionsClick?: (e: React.MouseEvent, id: string, title: string) => void;
  onTogglePin?: (e: React.MouseEvent, id: string) => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div
      style={{ 
        width: "100%", padding: "10px", marginBottom: "2px", 
        background: active ? "rgba(255,255,255,0.06)" : "transparent", border: "none", 
        borderRadius: "8px", color: active ? T.text : T.textMuted, fontSize: "13px", 
        fontFamily: T.font, textAlign: "left", display: "flex", 
        alignItems: "center", gap: "10px", transition: "all .15s", overflow: "hidden" 
      }}
      onMouseEnter={e => { setIsHovered(true); if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = T.text; } }}
      onMouseLeave={e => { setIsHovered(false); if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; } }}>
      
      <button 
        onClick={() => onNavigate?.(sessionId)}
        style={{ flex: 1, background: "transparent", border: "none", padding: 0, margin: 0, textAlign: "left", cursor: "pointer", color: "inherit", outline: "none", display: "flex", alignItems: "center" }}>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: "auto", marginLeft: 4 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ lineHeight: "1.4", fontWeight: 500, whiteSpace: "normal", wordBreak: "break-word" }}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {isOpen && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {(isPinned || isHovered) && (
            <button 
              onClick={e => { e.stopPropagation(); onTogglePin?.(e, sessionId); }}
              style={{ flexShrink: 0, background: "transparent", border: "none", color: isPinned ? T.text : T.textMuted, cursor: "pointer", padding: "4px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              title={isPinned ? "Unpin" : "Pin"}
            >
              <PinIcon size={14} fill={isPinned ? "currentColor" : "none"} />
            </button>
          )}
          <button 
            onClick={e => { e.stopPropagation(); onOptionsClick?.(e, sessionId, title); }}
            style={{ flexShrink: 0, background: "transparent", border: "none", color: T.textMuted, cursor: "pointer", padding: "4px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <MoreIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ activeAgentId, onSelectAgent, isOpen = false, onToggle, sidebarWidth = 280, onResize, showLoginModal, onShowLoginModal }: SidebarProps) {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const [cachedDisplayName, setCachedDisplayName] = useState<string>("User");
  const [cachedEmail, setCachedEmail] = useState<string | null>(null);
  const [pinnedSessions, setPinnedSessions] = useState<string[]>([]);

  const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== "undefined") {
      const img = localStorage.getItem("edge-os-user-image");
      if (img) setCachedImageUrl(img);
      const name = localStorage.getItem("edge-os-user-name");
      if (name) setCachedDisplayName(name);
      const email = localStorage.getItem("edge-os-user-email");
      if (email) setCachedEmail(email);
      try {
        const p = localStorage.getItem("edge-os-pinned-sessions");
        if (p) setPinnedSessions(JSON.parse(p));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      localStorage.removeItem("edge-os-user-image");
      localStorage.removeItem("edge-os-user-name");
      localStorage.removeItem("edge-os-user-email");
      setCachedImageUrl(null);
      setCachedDisplayName("User");
      setCachedEmail(null);
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
      if (user.primaryEmailAddress?.emailAddress) {
        setCachedEmail(user.primaryEmailAddress.emailAddress);
        localStorage.setItem("edge-os-user-email", user.primaryEmailAddress.emailAddress);
      }
    }
  }, [user, isLoaded, isSignedIn]);

  const [userSessions, setUserSessions] = useState<Array<{ sessionId: string; updatedAt: Date | string; messageCount: number; lastMessage?: string; }>>([]);
  const [loading, setLoading] = useState(false);
  const [renameModal, setRenameModal] = useState<{ sessionId: string; currentTitle: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; sessionId: string; sessionTitle: string; } | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isPinnedCollapsed, setIsPinnedCollapsed] = useState(false);
  const [isRecentCollapsed, setIsRecentCollapsed] = useState(false);
  const expanded = isOpen || profileMenuOpen || (contextMenu !== null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const clampPos = (x: number, y: number) => ({ x: Math.min(x, window.innerWidth - 168), y: Math.min(y, window.innerHeight - 128) });



  const initials = cachedDisplayName !== "User" ? cachedDisplayName.charAt(0).toUpperCase() : "U";
  const displayName = cachedDisplayName;

  useEffect(() => {
    if (isOpen && isSignedIn) fetchUserSessions();
    
    const handleRefresh = () => {
      if (isSignedIn) fetchUserSessions();
    };
    window.addEventListener('refresh-sessions', handleRefresh);
    return () => window.removeEventListener('refresh-sessions', handleRefresh);
  }, [isOpen, isSignedIn]);
  
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) setContextMenu(null);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const fetchUserSessions = async () => {
    setLoading(true);
    try { const r = await fetch("/api/sessions", { credentials: "include", cache: "no-store" }); if (r.ok) setUserSessions((await r.json()).sessions || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleTogglePin = (id: string) => {
    setPinnedSessions(prev => {
      const newPins = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      localStorage.setItem("edge-os-pinned-sessions", JSON.stringify(newPins));
      return newPins;
    });
    setContextMenu(null);
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

  const { pinnedSessionsList, recentSessionsList } = useMemo(() => {
    const pinned = userSessions.filter(s => pinnedSessions.includes(s.sessionId));
    const unpinned = userSessions.filter(s => !pinnedSessions.includes(s.sessionId));
    return { pinnedSessionsList: pinned, recentSessionsList: unpinned };
  }, [userSessions, pinnedSessions]);

  return (
    <>
      {renameModal && <RenameModal currentTitle={renameModal.currentTitle} onSave={v => handleRenameSave(renameModal.sessionId, v)} onCancel={() => setRenameModal(null)} />}
      {isSearchModalOpen && <SearchModal userSessions={userSessions} onClose={() => setIsSearchModalOpen(false)} onNavigate={id => router.push(`/chat/${id}`)} leftOffset={isOpen ? sidebarWidth : 68} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <SessionContextMenu visible={contextMenu?.visible ?? false} x={contextMenu?.x ?? 0} y={contextMenu?.y ?? 0}
        sessionId={contextMenu?.sessionId ?? ""} sessionTitle={contextMenu?.sessionTitle ?? ""}
        isPinned={contextMenu ? pinnedSessions.includes(contextMenu.sessionId) : false}
        onTogglePin={handleTogglePin}
        onRename={handleRenameSession} onExport={handleExportSession} onDelete={handleDeleteSession} menuRef={contextMenuRef} />

      <motion.aside
        className={satoshi.variable}
        initial={{ width: expanded ? sidebarWidth : 68 }}
        animate={{ width: expanded ? sidebarWidth : 68 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          background: T.bg,
          borderRight: `1px solid rgba(255,255,255,0.06)`,
          display: "flex",
          flexDirection: "column",
          height: "100%",
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
            <Menu01Icon size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2. Primary Navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 14px", width: "100%" }}>
          <SidebarLink 
            isOpen={expanded}
            onClick={handleNewChat}
            icon={<PlusSignIcon size={18} strokeWidth={2.5} />}
            label="New Project"
          />
          <SidebarLink 
            isOpen={expanded}
            onClick={() => setIsSearchModalOpen(true)}
            icon={<Search02Icon size={18} strokeWidth={2.5} />}
            label="Search projects..."
          />
          <SidebarLink 
            isOpen={expanded}
            onClick={() => router.push('/integrations')}
            icon={<PlugSocketIcon size={18} strokeWidth={2.5} />}
            label="Integrations"
          />
        </div>

        {/* 3. History List */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 14px", marginTop: "24px", width: "100%" }}>
          {loading ? (
            <AnimatePresence>
              {expanded && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ padding: "16px 10px", color: T.textHint, fontSize: "13px", fontFamily: T.font }}>Loading...</motion.div>}
            </AnimatePresence>
          ) : !isSignedIn ? (
            <AnimatePresence>
              {expanded && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ padding: "16px 10px", color: T.textHint, fontSize: "13px", fontFamily: T.font }}>Log in to view workspace</motion.div>}
            </AnimatePresence>
          ) : (pinnedSessionsList.length > 0 || recentSessionsList.length > 0) ? (
            <>
              {pinnedSessionsList.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  {expanded && (
                    <div 
                      onClick={() => setIsPinnedCollapsed(!isPinnedCollapsed)}
                      style={{ fontSize: "11px", fontWeight: 600, color: T.textHint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", paddingLeft: "4px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
                    >
                      Pinned
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isPinnedCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  )}
                  <AnimatePresence>
                    {!isPinnedCollapsed && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                        {pinnedSessionsList.map(s => (
                          <HistoryItem 
                            key={s.sessionId} 
                            sessionId={s.sessionId}
                            title={s.lastMessage || `Session · ${s.messageCount} messages`}
                            isOpen={expanded}
                            active={activeAgentId === s.sessionId}
                            isPinned={true}
                            onNavigate={id => router.push(`/chat/${id}`)}
                            onOptionsClick={(e, id, title) => { e.preventDefault(); const { x, y } = clampPos(e.clientX, e.clientY); setContextMenu({ visible: true, x, y, sessionId: id, sessionTitle: title }); }} 
                            onTogglePin={(e, id) => { e.preventDefault(); handleTogglePin(id); }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {recentSessionsList.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  {expanded && (
                    <div 
                      onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
                      style={{ fontSize: "11px", fontWeight: 600, color: T.textHint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", paddingLeft: "4px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
                    >
                      Recent
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRecentCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  )}
                  <AnimatePresence>
                    {!isRecentCollapsed && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                        {recentSessionsList.map(s => (
                          <HistoryItem 
                            key={s.sessionId} 
                            sessionId={s.sessionId}
                            title={s.lastMessage || `Session · ${s.messageCount} messages`}
                            isOpen={expanded}
                            active={activeAgentId === s.sessionId}
                            isPinned={false}
                            onNavigate={id => router.push(`/chat/${id}`)}
                            onOptionsClick={(e, id, title) => { e.preventDefault(); const { x, y } = clampPos(e.clientX, e.clientY); setContextMenu({ visible: true, x, y, sessionId: id, sessionTitle: title }); }} 
                            onTogglePin={(e, id) => { e.preventDefault(); handleTogglePin(id); }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <AnimatePresence>
              {expanded && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ padding: "16px 10px", color: T.textHint, fontSize: "13px", fontFamily: T.font }}>No recent projects</motion.div>}
            </AnimatePresence>
          )}
        </div>

        {/* 4. Bottom Footer (Profile & Settings) */}
        <div style={{ padding: expanded ? "16px" : "16px 12px", display: "flex", flexDirection: expanded ? "row" : "column-reverse", alignItems: "center", justifyContent: expanded ? "space-between" : "center", gap: expanded ? "0" : "16px", marginTop: "auto", position: "relative", width: "100%", transition: "padding 0.25s ease", borderTop: `1px solid rgba(255,255,255,0.04)` }}>

          {/* User Profile Block */}
          <div
            onClick={(e) => { if (!isSignedIn) onShowLoginModal?.(true); else { e.stopPropagation(); setProfileMenuOpen(p => !p); } }}
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "6px 8px", borderRadius: "8px", transition: "background 0.15s", flexGrow: expanded ? 1 : 0, width: expanded ? "100%" : "44px", height: "46px", overflow: "hidden", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            title={isSignedIn ? "Account" : "Sign In"}
          >
            {cachedImageUrl ? (
              <img src={cachedImageUrl} alt="" style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }} />
            ) : (
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", color: T.text, flexShrink: 0 }}>
                {(isSignedIn || cachedDisplayName !== "User") ? <span style={{ fontSize: "11px", fontWeight: 600 }}>{initials}</span> : <UserCircleIcon size={16} />}
              </div>
            )}

            <AnimatePresence>
              {expanded && (
                <motion.div 
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {(isSignedIn || cachedDisplayName !== "User") ? displayName : "Sign in"}
                  </span>
                  {(isSignedIn || cachedDisplayName !== "User") && <span style={{ fontSize: "11px", color: T.textHint, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cachedEmail || "Settings"}</span>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings Icon */}
          {!expanded && (
            <button
              onClick={() => (window.location.href = "/settings")}
              title="Settings"
              style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, background: "transparent", border: "none", cursor: "pointer", borderRadius: "6px", transition: "all 0.2s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = "transparent"; }}
            >
              <Settings01Icon size={18} strokeWidth={2} />
            </button>
          )}

          {/* Profile Menu Popup */}
          {profileMenuOpen && isSignedIn && (
            <div ref={profileMenuRef} style={{
              position: "absolute",
              bottom: "70px",
              left: expanded ? "16px" : "12px",
              width: "200px",
              background: "#121214",
              border: `1px solid rgba(255,255,255,0.15)`,
              borderRadius: "10px",
              padding: "6px",
              zIndex: 1000,
              boxShadow: "0 12px 32px rgba(0,0,0,0.9)",
              fontFamily: T.font,
              display: "flex",
              flexDirection: "column",
            }}>
              {[ 
                { label: "Settings", href: "/settings" }
              ].map(item => (
                <Link key={item.label} href={item.href} style={{ textDecoration: "none" }} onClick={() => setProfileMenuOpen(false)}>
                  <button style={{ width: "100%", padding: "8px 12px", background: "transparent", border: "none", color: T.textMuted, fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s", display: "block" }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}>
                    {item.label}
                  </button>
                </Link>
              ))}
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
              <SignOutButton>
                <button style={{ width: "100%", padding: "8px 12px", background: "transparent", border: "none", color: "#ef4444", fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s", display: "block" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  onClick={() => setProfileMenuOpen(false)}>
                  Logout
                </button>
              </SignOutButton>
            </div>
          )}
        </div>


        <style dangerouslySetInnerHTML={{ __html: `aside *{font-family:var(--font-satoshi),system-ui,sans-serif!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.2)}input::placeholder{color:#71717a!important}` }} />
        
        {/* Resize Handle */}
        {onResize && (
          <div
            onMouseDown={onResize}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "4px",
              height: "100%",
              cursor: "col-resize",
              zIndex: 10,
              background: "transparent",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          />
        )}
      </motion.aside>
    </>
  );
}