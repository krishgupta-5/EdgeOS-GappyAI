import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { satoshi } from "@/constants";
import { getSessionId, resetSessionId } from "@/lib/sessionId";
import DbSchemaViewer from "@/app/chat/components/DbSchemaViewer";
import LanguageBadge from "@/app/chat/components/LanguageBadge";
import FolderStructureViewer from "@/app/chat/components/FolderStructureViewer";
import ApiDesignViewer from "@/app/chat/components/ApiDesignViewer";
import TestingPlanViewer from "@/app/chat/components/TestingPlanViewer";
import CodeRenderer from "@/app/chat/components/CodeRenderer";
import MarkdownRenderer from "@/app/chat/components/MarkdownRenderer";
import FileContentRenderer from "@/app/chat/components/FileContentRenderer";
import FileHeader from "@/app/chat/components/FileHeader";
import InputArea from "@/app/chat/components/InputArea";

// ── EdgeOS Design Tokens ──────────────────────────────────────────────────────
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

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tools?: string[];
  file?: {
    name: string;
    language: string;
    content: string;
    dbSchema?: { mermaid: string; diagram: string };
  };
  options?: string[];
}

const initialMessages: Message[] = [];

interface ChatPanelProps {
  agentName: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  sessionId?: string;
  showLoginModal?: boolean;
  onShowLoginModal?: (show: boolean) => void;
}

type ArtifactType =
  | "initial" | "config" | "docker" | "markdown" | "folderStructure"
  | "apiDesign" | "testingPlan" | "userStories" | "roadmap"
  | "deploymentGuide" | "costEstimation" | "projectTimeline"
  | "riskAnalysis" | "finalMarkdown" | "db";

type Step =
  | "docs" | "config" | "docker" | "apiDesign" | "db" | "folder"
  | "testingPlan" | "userStories" | "deploymentGuide" | "roadmap"
  | "costEstimation" | "projectTimeline" | "riskAnalysis" | "finalMarkdown";

const LANG_TO_ARTIFACT: Record<string, ArtifactType> = {
  yaml: "config", markdown: "markdown", folder: "folderStructure",
  apidesign: "apiDesign", testingplan: "testingPlan", userstories: "userStories",
  deploymentguide: "deploymentGuide", roadmap: "roadmap",
  costestimation: "costEstimation", projecttimeline: "projectTimeline",
  riskanalysis: "riskAnalysis", finalmarkdown: "finalMarkdown",
};

const OPTION_TO_ARTIFACT: Record<string, ArtifactType> = {
  "system config": "config", "show docker": "docker",
  "show api design": "apiDesign", "view db schema": "db",
  "show folder structure": "folderStructure", "show testing plan": "testingPlan",
  "generate docs": "markdown", "show user stories": "userStories",
  "show roadmap": "roadmap", "show deployment guide": "deploymentGuide",
  "show cost estimation": "costEstimation", "show project timeline": "projectTimeline",
  "show risk analysis": "riskAnalysis", "generate final doc": "finalMarkdown",
};

export default function ChatPanel({
  agentName, onToggleSidebar, isSidebarOpen = true,
  sessionId, showLoginModal, onShowLoginModal,
}: ChatPanelProps) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [markdownMode, setMarkdownMode] = useState<Record<string, "code" | "preview">>({});
  const [generatedData, setGeneratedData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasGeneratedConfig, setHasGeneratedConfig] = useState(false);
  const [modifyMode, setModifyMode] = useState(false);
  const [modifyTargetArtifact, setModifyTargetArtifact] = useState<ArtifactType | null>(null);
  const [tokenQuota, setTokenQuota] = useState<{
    tokensUsed: number; tokensLimit: number; tokensRemaining: number;
    exhausted: boolean; resetAt: number;
  } | null>(null);
  const [resetCountdown, setResetCountdown] = useState<string>("");
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean; x: number; y: number;
    messageId: string; messageContent: string; messageRole: string;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tokenQuota?.exhausted || !tokenQuota.resetAt) return;
    const update = () => {
      const diff = tokenQuota.resetAt - Date.now();
      if (diff <= 0) { setResetCountdown("now"); fetch("/api/token-quota").then(r => r.json()).then(setTokenQuota); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setResetCountdown(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [tokenQuota?.exhausted, tokenQuota?.resetAt]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/token-quota").then(r => r.ok ? r.json() : null).then(d => d && setTokenQuota(d));
  }, [isSignedIn]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) setContextMenu(null);
    };
    if (contextMenu?.visible) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [contextMenu?.visible]);

  const handleCopyMessage = async (content: string) => {
    try { await navigator.clipboard.writeText(content); }
    catch {
      const el = document.createElement("textarea"); el.value = content;
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    }
    setContextMenu(null);
  };
  const handleDeleteMessage = (id: string) => { setMessages(p => p.filter(m => m.id !== id)); setContextMenu(null); };
  const handleEditMessage = (id: string, content: string) => {
    const n = prompt("Edit message:", content);
    if (n && n !== content) setMessages(p => p.map(m => m.id === id ? { ...m, content: n } : m));
    setContextMenu(null);
  };

  // Load chat history
  useEffect(() => {
    const load = async () => {
      if (!isSignedIn) return;
      if (!sessionId) { setMessages([]); setGeneratedData(null); setHasGeneratedConfig(false); return; }
      setMessages([]); setGeneratedData(null); setHasGeneratedConfig(false);
      try {
        const res = await fetch(`/api/chat-history?sessionId=${sessionId}`);
        if (!res.ok) return;
        const { messages: rawAll = [] } = await res.json();
        const raw: any[] = [];
        for (const msg of rawAll) {
          const prev = raw[raw.length - 1];
          if (prev && prev.role === msg.role && prev.content === msg.content) continue;
          raw.push(msg);
        }
        let latestResult: any = null;
        const singleKeyMap: Record<string, string> = {
          config: "yaml", docker: "docker", markdown: "markdown",
          folderStructure: "folderStructure", apiDesign: "apiDesign", testingPlan: "testingPlan",
        };
        for (const msg of raw) {
          if (msg.role === "assistant") {
            try {
              const p = JSON.parse(msg.content);
              if (p.yaml) { latestResult = p; }
              else if (p.artifact && p.content && latestResult) {
                const key = singleKeyMap[p.artifact]; if (key) latestResult[key] = p.content;
              }
            } catch { }
          }
        }
        const historyMessages: Message[] = [];
        let localHasConfig = false;
        for (const msg of raw) {
          const ts = new Date(msg.createdAt?.toDate?.() || msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          if (msg.role === "user") { historyMessages.push({ id: msg.id, role: "user", content: msg.content, timestamp: ts }); continue; }
          let parsed: any = null;
          try { parsed = JSON.parse(msg.content); } catch { }
          if (parsed?.artifact && parsed?.content && !parsed?.yaml) {
            const singleArtifactToStep: Record<string, Step> = {
              config: "config", docker: "docker", markdown: "docs", folderStructure: "folder",
              apiDesign: "apiDesign", testingPlan: "testingPlan", userStories: "userStories",
              deploymentGuide: "deploymentGuide", costEstimation: "costEstimation",
              projectTimeline: "projectTimeline", riskAnalysis: "riskAnalysis", finalMarkdown: "finalMarkdown",
            };
            const singleArtifactToKey: Record<string, string> = {
              config: "yaml", docker: "docker", markdown: "markdown", folderStructure: "folderStructure",
              apiDesign: "apiDesign", testingPlan: "testingPlan", userStories: "userStories",
              roadmap: "roadmap", deploymentGuide: "deploymentGuide", costEstimation: "costEstimation",
              projectTimeline: "projectTimeline", riskAnalysis: "riskAnalysis", finalMarkdown: "finalMarkdown",
            };
            const step = singleArtifactToStep[parsed.artifact];
            const dataKey = singleArtifactToKey[parsed.artifact];
            if (step && dataKey) {
              const syntheticData = { [dataKey]: parsed.content };
              const { content, file, options } = buildAssistantMessage(step, syntheticData, false);
              historyMessages.push({ id: msg.id, role: "assistant", content, timestamp: ts, file, options });
              continue;
            }
          }
          if (!parsed?.yaml) { historyMessages.push({ id: msg.id, role: "assistant", content: msg.content, timestamp: ts }); continue; }
          const steps: Step[] = ["docs", "config", "docker", "apiDesign", "db", "folder", "testingPlan", "userStories", "roadmap", "deploymentGuide", "projectTimeline", "riskAnalysis", "finalMarkdown"];
          const hasData = (s: Step) => {
            switch (s) {
              case "config": return !!parsed.yaml; case "docker": return !!parsed.docker;
              case "docs": return !!parsed.markdown; case "folder": return !!parsed.folderStructure;
              case "db": return !!parsed.dbSchema; case "apiDesign": return !!parsed.apiDesign;
              case "testingPlan": return !!parsed.testingPlan; case "userStories": return !!parsed.userStories;
              case "roadmap": return !!parsed.roadmap; case "deploymentGuide": return !!parsed.deploymentGuide;
              case "projectTimeline": return !!parsed.projectTimeline; case "riskAnalysis": return !!parsed.riskAnalysis;
              case "finalMarkdown": return !!parsed.finalMarkdown; default: return false;
            }
          };
          for (const step of steps) {
            if (!hasData(step)) continue;
            const { content, file, options } = buildAssistantMessage(step, parsed, step === "docs" && !localHasConfig);
            if (step === "config") localHasConfig = true;
            historyMessages.push({ id: `${msg.id}-${step}`, role: "assistant", content, timestamp: ts, file, options });
          }
        }
        setMessages(historyMessages);
        if (latestResult) { setGeneratedData(latestResult); setHasGeneratedConfig(true); }
      } catch (err) { console.error("Failed to load chat history:", err); }
    };
    load();
  }, [sessionId, isSignedIn]);

  const buildAssistantMessage = (step: Step, data: any, isFirstDocs: boolean): { content: string; file: Message["file"]; options: string[] } => {
    switch (step) {
      case "config": return { content: isFirstDocs ? "System config generated.\nProceed to generate documentation or explore artifacts below." : "System config loaded.", file: { name: "system-config.yaml", language: "yaml", content: data.yaml }, options: ["Show Docker"] };
      case "docker": return { content: "Docker Compose configuration generated. Services, volumes, and health checks are bound.", file: { name: "docker-compose.yaml", language: "yaml", content: data.docker }, options: ["Show API Design"] };
      case "docs": return { content: "Project documentation generated.", file: { name: "README.md", language: "markdown", content: data.markdown }, options: ["System Config"] };
      case "folder": return { content: "Project folder structure generated.", file: { name: "project-structure.txt", language: "folder", content: data.folderStructure ?? "Not available." }, options: ["Show Testing Plan"] };
      case "apiDesign": { const c = data.apiDesign ?? ""; if (!c) return { content: "API design not available.", file: undefined, options: ["View DB Schema"] }; return { content: "API design specification generated.", file: { name: "api-design.yaml", language: "apidesign", content: c }, options: ["View DB Schema"] }; }
      case "testingPlan": { const c = data.testingPlan ?? ""; if (!c) return { content: "Testing plan not available.", file: undefined, options: ["Show User Stories", "View DB Schema", "Show Folder Structure"] }; return { content: "Testing plan generated. Unit, integration, and E2E strategy defined.", file: { name: "testing-plan.yaml", language: "testingplan", content: c }, options: ["Show User Stories", "View DB Schema", "Show Folder Structure"] }; }
      case "userStories": { const c = data.userStories ?? ""; if (!c) return { content: "User stories not available.", file: undefined, options: ["Show Testing Plan"] }; return { content: "User stories generated. All modules covered.", file: { name: "user-stories.md", language: "userstories", content: c }, options: ["Show Roadmap", "Show Testing Plan", "Show Folder Structure"] }; }
      case "roadmap": { const c = data.roadmap ?? ""; if (!c) return { content: "Roadmap not available.", file: undefined, options: ["Show User Stories"] }; return { content: "Product roadmap generated. Phases, milestones, and dependencies mapped.", file: { name: "roadmap.md", language: "roadmap", content: c }, options: ["Show Deployment Guide", "Show User Stories", "Show Cost Estimation"] }; }
      case "deploymentGuide": { const c = data.deploymentGuide ?? ""; if (!c) return { content: "Deployment guide not available.", file: undefined, options: ["Show Roadmap"] }; return { content: "Deployment guide generated. Infrastructure, CI/CD, rollback, and monitoring covered.", file: { name: "deployment-guide.md", language: "deploymentguide", content: c }, options: ["Show Roadmap", "Show Docker", "Show Cost Estimation"] }; }
      case "costEstimation": { const c = data.costEstimation ?? ""; if (!c) return { content: "Cost estimation not available.", file: undefined, options: ["Show Roadmap", "Show Deployment Guide", "Show Project Timeline"] }; return { content: "Cost estimation report generated. Development, infrastructure, and scaling costs mapped.", file: { name: "cost-estimation.md", language: "costestimation", content: c }, options: ["Show Deployment Guide", "Show Project Timeline", "Show Risk Analysis"] }; }
      case "projectTimeline": { const c = data.projectTimeline ?? ""; if (!c) return { content: "Project timeline not available.", file: undefined, options: ["Show Roadmap", "Show Cost Estimation", "Show Risk Analysis"] }; return { content: "Project timeline generated. All phases, critical path, and delivery estimates mapped.", file: { name: "project-timeline.md", language: "projecttimeline", content: c }, options: ["Show Deployment Guide", "Show Project Timeline", "Show Risk Analysis"] }; }
      case "riskAnalysis": { const c = data.riskAnalysis ?? ""; if (!c) return { content: "Risk analysis not available.", file: undefined, options: ["Show Project Timeline", "Show Cost Estimation", "Generate Final Doc"] }; return { content: "Risk analysis generated. Technical, security, infrastructure, and operational risks mapped.", file: { name: "risk-analysis.md", language: "riskanalysis", content: c }, options: ["Show Project Timeline", "Show Cost Estimation", "Generate Final Doc"] }; }
      case "finalMarkdown": { const c = data.finalMarkdown ?? ""; if (!c) return { content: "Final document not available.", file: undefined, options: [] }; return { content: "Final project document generated. All artifacts consolidated into a single specification.", file: { name: "final-spec.md", language: "finalmarkdown", content: c }, options: [] }; }
      case "db": if (!data.dbSchema) return { content: "ERR: DB schema not available.\n\nCheck ACTIVEPIECES_WEBHOOK_URL in .env.local.", file: undefined, options: ["Show Folder Structure"] }; return { content: "Database schema rendered via n8n.", file: { name: "schema.er", language: "dbschema", content: data.dbSchema.diagram ?? "", dbSchema: { mermaid: data.dbSchema.mermaid ?? "", diagram: data.dbSchema.diagram ?? "" } }, options: ["Show Folder Structure"] };
      default: return { content: "", file: undefined, options: [] };
    }
  };

  const optionToStep = (label: string): Step => {
    const map: Record<string, Step> = {
      "system config": "config", "show docker": "docker", "show api design": "apiDesign",
      "view db schema": "db", "show folder structure": "folder", "show testing plan": "testingPlan",
      "generate docs": "docs", "show user stories": "userStories", "show roadmap": "roadmap",
      "show deployment guide": "deploymentGuide", "show cost estimation": "costEstimation",
      "show project timeline": "projectTimeline", "show risk analysis": "riskAnalysis", "generate final doc": "finalMarkdown",
    };
    return map[label.toLowerCase()] ?? "docs";
  };

  const handleSend = async (overrideInput?: string, forceArtifact?: ArtifactType) => {
    if (!isSignedIn) { onShowLoginModal?.(true); return; }
    if (tokenQuota?.exhausted) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: `Daily token limit reached.\n\nQuota resets in: ${resetCountdown || "< 24h"}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      return;
    }
    const textToSend = (overrideInput ?? input).trim();
    if (!textToSend) return;
    let artifact: ArtifactType;
    let isModify = false;
    if (forceArtifact) { artifact = !hasGeneratedConfig ? "initial" : forceArtifact; isModify = false; }
    else if (modifyMode && modifyTargetArtifact) { artifact = modifyTargetArtifact; isModify = true; }
    else if (!hasGeneratedConfig) { artifact = "initial"; isModify = false; }
    else { artifact = "markdown"; isModify = false; }
    const currentSessionId = sessionId || getSessionId() || resetSessionId();
    if (!sessionId) { window.history.replaceState(null, "", `/chat/${currentSessionId}`); sessionStorage.setItem("edge-os-session-id", currentSessionId); }
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: textToSend, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    if (!overrideInput) setInput("");
    setIsTyping(true);
    if (!overrideInput && textareaRef.current) textareaRef.current.style.height = "auto";
    setModifyMode(false); setModifyTargetArtifact(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: textToSend, sessionId: currentSessionId, artifact, mode: isModify ? "modify" : "generate" }) });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const quotaRes = await fetch("/api/token-quota");
      if (quotaRes.ok) {
        const fresh = await quotaRes.json(); setTokenQuota(fresh);
        const pct = fresh.tokensUsed / fresh.tokensLimit;
        if (pct >= 0.8 && !fresh.exhausted) setMessages(prev => [...prev, { id: `warn-${Date.now()}`, role: "assistant", content: `Token warning: ${fresh.tokensRemaining.toLocaleString()} tokens remaining today.`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      }
      let merged: any = generatedData ? { ...generatedData } : {};
      if (data.artifact === "initial") { merged = { ...merged, yaml: data.yaml, markdown: data.markdown }; setHasGeneratedConfig(true); }
      else if (isModify) {
        merged = { ...merged, yaml: data.yaml };
        const aMap: Record<string, string> = { docker: "docker", markdown: "markdown", folderStructure: "folderStructure", apiDesign: "apiDesign", testingPlan: "testingPlan", userStories: "userStories", costEstimation: "costEstimation", projectTimeline: "projectTimeline", riskAnalysis: "riskAnalysis", finalMarkdown: "finalMarkdown", config: "yaml" };
        const key = aMap[data.artifact]; if (key) merged[key] = data.content;
      } else {
        switch (data.artifact) {
          case "config": merged.yaml = data.content; break; case "docker": merged.docker = data.content; break;
          case "markdown": merged.markdown = data.content; break; case "folderStructure": merged.folderStructure = data.content; break;
          case "apiDesign": merged.apiDesign = data.content; break; case "testingPlan": merged.testingPlan = data.content; break;
          case "userStories": merged.userStories = data.content; break; case "roadmap": merged.roadmap = data.content; break;
          case "deploymentGuide": merged.deploymentGuide = data.content; break; case "costEstimation": merged.costEstimation = data.content; break;
          case "projectTimeline": merged.projectTimeline = data.content; break; case "riskAnalysis": merged.riskAnalysis = data.content; break;
          case "finalMarkdown": merged.finalMarkdown = data.content; break; case "db": merged.dbSchema = data.dbSchema; break;
        }
      }
      setGeneratedData(merged);
      const artifactToStep: Record<ArtifactType, Step> = { initial: "docs", config: "config", docker: "docker", markdown: "docs", folderStructure: "folder", apiDesign: "apiDesign", testingPlan: "testingPlan", userStories: "userStories", roadmap: "roadmap", deploymentGuide: "deploymentGuide", costEstimation: "costEstimation", projectTimeline: "projectTimeline", riskAnalysis: "riskAnalysis", finalMarkdown: "finalMarkdown", db: "db" };
      const step = artifactToStep[artifact] ?? "docs";
      const { content, file, options } = buildAssistantMessage(step, merged, !hasGeneratedConfig);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), file, options }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Execution failed."}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } finally { setIsTyping(false); }
  };

  const handleOptionClick = (label: string) => {
    const artifact = OPTION_TO_ARTIFACT[label.toLowerCase()] ?? "markdown";
    handleSend(label, artifact);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; }
  };

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : (user?.primaryEmailAddress?.emailAddress ?? "You");

  return (
    <div id="chat-root" className={satoshi.variable} style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden", minWidth: 0, position: "relative", fontFamily: T.font }}>

      {/* ── Navbar ── */}
      <div style={{ height: "56px", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: `1px solid ${T.border}`, background: "rgba(9,9,11,0.9)", backdropFilter: "blur(8px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* Hamburger toggle — only show when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              id="sidebar-open-btn"
              onClick={onToggleSidebar}
              title="Open sidebar"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: "7px", color: T.textHint, cursor: "pointer", transition: "all .15s", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#18181b"; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.borderHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textHint; e.currentTarget.style.borderColor = T.border; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}

          {/* Logo — static, matching ss segmented gear/circle styling */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", userSelect: "none" }}>
            <svg className="logo-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" style={{ transition: "transform .25s, filter .25s" }}>
              <circle cx="12" cy="12" r="8" strokeDasharray="4 3" />
              <circle cx="12" cy="12" r="3" fill="#fff" />
            </svg>
            <span style={{ fontSize: "18px", fontWeight: 700, color: T.text, letterSpacing: "-0.3px", fontFamily: T.font }}>EdgeOS</span>
          </div>
        </div>

        {/* Right side — signed in */}
        {isSignedIn && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

            {/* Upgrade button — premium text style with orange lightning bolt */}
            <button
              id="upgrade-btn"
              onClick={() => router.push("/pricing")}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: "transparent", border: "none", borderRadius: "6px", color: T.text, cursor: "pointer", fontSize: "14px", fontWeight: 500, fontFamily: T.font, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#f97316"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Upgrade
            </button>

            {/* ? token info tooltip */}
            {tokenQuota && (
              <div className="token-hint-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                {/* The ? button */}
                <div
                  id="token-hint-btn"
                  style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: `1px solid ${T.border}`, color: T.textHint, cursor: "default", fontSize: "13px", fontWeight: 600, fontFamily: T.font, background: "transparent", transition: "all .15s", userSelect: "none" }}>
                  ?
                </div>

                {/* Hover card */}
                <div className="token-tooltip" style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "#09090b", border: `1px solid ${T.border}`,
                  borderRadius: "10px", padding: "14px 16px", minWidth: "210px",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.7)",
                  opacity: 0, pointerEvents: "none",
                  transform: "translateY(-4px)",
                  transition: "opacity .18s, transform .18s",
                  zIndex: 200, fontFamily: T.font,
                }}>
                  {/* Arrow */}
                  <div style={{ position: "absolute", top: "-5px", right: "10px", width: "9px", height: "9px", background: "#09090b", border: `1px solid ${T.border}`, borderBottom: "none", borderRight: "none", transform: "rotate(45deg)" }} />

                  <div style={{ fontSize: "11px", fontWeight: 600, color: T.textHint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                    {tokenQuota.exhausted ? "Limit reached" : "Token usage"}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: tokenQuota.exhausted ? "#ef4444" : T.text }}>
                      {tokenQuota.tokensUsed.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "12px", color: T.textHint }}>/ {tokenQuota.tokensLimit.toLocaleString()}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: "100%", height: "3px", background: T.border, borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min((tokenQuota.tokensUsed / tokenQuota.tokensLimit) * 100, 100)}%`,
                      background: tokenQuota.exhausted ? "#ef4444" : tokenQuota.tokensUsed / tokenQuota.tokensLimit > 0.8 ? T.accent : "#22c55e",
                      borderRadius: "3px", transition: "width .4s ease"
                    }} />
                  </div>

                  <div style={{ fontSize: "12px", color: T.textHint, lineHeight: "1.5" }}>
                    {tokenQuota.exhausted
                      ? `Resets in: ${resetCountdown || "< 24h"}`
                      : `${tokenQuota.tokensRemaining.toLocaleString()} tokens remaining`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Right side — signed out */}
        {!isSignedIn && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <button style={{ padding: "6px 14px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: "8px", color: T.textMuted, cursor: "pointer", fontSize: "13px", fontWeight: 500, fontFamily: T.font, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.borderHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.border; }}>
                Log in
              </button>
            </Link>
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <button style={{ padding: "6px 14px", background: T.text, border: `1px solid ${T.text}`, borderRadius: "8px", color: T.bg, cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: T.font, transition: "all .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#e5e7eb"}
                onMouseLeave={e => e.currentTarget.style.background = T.text}>
                Sign up
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: "200px", display: "flex", flexDirection: "column" }}>

          {/* ── Empty / landing state ── */}
          {messages.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "0 32px" }}>

              {/* Logo + greeting */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "36px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px", boxShadow: "0 0 40px rgba(249,115,22,0.2), 0 0 0 1px rgba(249,115,22,0.12)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff" />
                  </svg>
                </div>
                <h1 style={{ fontSize: "26px", fontWeight: 700, color: T.text, letterSpacing: "-0.4px", margin: "0 0 10px", fontFamily: T.font, textAlign: "center" }}>
                  How can I help you build?
                </h1>
                <p style={{ color: T.textHint, fontSize: "14px", lineHeight: "1.6", fontFamily: T.font, textAlign: "center", maxWidth: "340px", margin: 0 }}>
                  Describe your project and I'll scaffold the full architecture, infra, and codebase.
                </p>
              </div>

              {/* Suggestion cards — 2×2 grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", maxWidth: "540px" }}>
                {[
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/></svg>,
                    title: "Full-Stack SaaS",
                    desc: "Agents, backend, frontend, CI/CD & deployment",
                    text: "Create a complete AI SaaS including agents, backend, frontend, CI/CD, and deployment"
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/></svg>,
                    title: "RAG Pipeline",
                    desc: "Embeddings, vector DB & retrieval system",
                    text: "Design an AI system with RAG pipeline, embeddings, and vector database"
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 8h1m5 0h1M9 12h1m5 0h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>,
                    title: "Enterprise Architecture",
                    desc: "Production-ready, secure & scalable design",
                    text: "Generate an enterprise-grade AI architecture with security and scaling"
                  },
                  {
                    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.27 6.96 8.73 5.04 8.73-5.04M12 22.08V12"/></svg>,
                    title: "Docker + Infra",
                    desc: "Containerized services, volumes & health checks",
                    text: "Generate Docker Compose configuration with services, volumes, and health checks"
                  },
                ].map((p, i) => (
                  <button key={i} onClick={() => handleSend(p.text)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "16px 18px", background: "#0f0f11", border: "1px solid #1e1e22", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all .18s", fontFamily: T.font, gap: "0" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#131316"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a32"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0f0f11"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e1e22"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
                    <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", background: "rgba(249,115,22,0.08)", borderRadius: "8px", flexShrink: 0 }}>{p.icon}</div>
                    <div style={{ color: T.text, fontSize: "13px", fontWeight: 600, marginBottom: "4px", fontFamily: T.font }}>{p.title}</div>
                    <div style={{ color: T.textHint, fontSize: "12px", lineHeight: "1.5", fontFamily: T.font }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          ) : (
            /* ── Message list ── */
            <div style={{ maxWidth: "860px", width: "100%", margin: "0 auto", padding: "24px 32px 0", display: "flex", flexDirection: "column" }}>
              {messages.map((msg, idx) => (
                <div key={msg.id}
                  style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "24px 0", borderBottom: idx !== messages.length - 1 ? `1px solid ${T.border}` : "none", width: "100%" }}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, messageId: msg.id, messageContent: msg.content, messageRole: msg.role }); }}>

                  {/* Role label */}
                  <div style={{ fontSize: "13px", fontWeight: 600, color: msg.role === "user" ? T.textHint : T.textMuted, fontFamily: T.font, marginBottom: "10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {msg.role === "user" ? displayName.toUpperCase() : "EDGEOS"}
                  </div>

                  {/* Tool badges */}
                  {msg.tools && (
                    <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                      {msg.tools.map(t => (
                        <span key={t} style={{ fontSize: "11px", color: T.textMuted, background: "#18181b", border: `1px solid ${T.border}`, padding: "3px 8px", fontFamily: T.font, borderRadius: "6px" }}>{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Message body */}
                  <div style={{ width: "100%", color: T.textMuted, fontSize: "15px", lineHeight: "1.75", whiteSpace: "pre-line", fontFamily: T.font }}>
                    {msg.content}

                    {/* File artifact card */}
                    {msg.file && (
                      <div style={{ marginTop: "16px", border: `1px solid ${T.border}`, background: T.surface, borderRadius: "10px", overflow: "hidden" }}>
                        <FileHeader msg={msg} markdownMode={markdownMode} setMarkdownMode={setMarkdownMode} />
                        <div style={{ padding: msg.file.language === "pipeline" || msg.file.language === "dbschema" || msg.file.language === "apidesign" || msg.file.language === "testingplan" ? "20px" : "16px", overflowX: "auto" }}>
                          <FileContentRenderer msg={msg} markdownMode={markdownMode} />
                        </div>

                        {/* Modify button */}
                        {msg.role === "assistant" && msg.file.language !== "dbschema" && (
                          <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => { const target = LANG_TO_ARTIFACT[msg.file!.language] ?? "config"; setModifyMode(true); setModifyTargetArtifact(target); textareaRef.current?.focus(); }}
                              style={{ padding: "5px 14px", background: "transparent", border: `1px solid ${T.border}`, color: T.textHint, fontSize: "12px", fontFamily: T.font, cursor: "pointer", borderRadius: "6px", fontWeight: 500, transition: "all .15s" }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textHint; }}>
                              Modify
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option buttons */}
                  {msg.options && msg.options.length > 0 && msg.role === "assistant" && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap" }}>
                      {msg.options.map((option, i) => {
                        const isClicked = messages.some(m => m.role === "user" && m.content === option);
                        return (
                          <button key={i} onClick={() => { if (!isClicked) handleOptionClick(option); }}
                            style={{ padding: "8px 16px", background: isClicked ? "transparent" : "#18181b", border: `1px solid ${isClicked ? T.border : T.borderHover}`, color: isClicked ? T.textHint : T.textMuted, fontSize: "13px", fontFamily: T.font, cursor: isClicked ? "default" : "pointer", transition: "all .15s", borderRadius: "8px", fontWeight: 500, opacity: isClicked ? 0.5 : 1 }}
                            onMouseEnter={e => { if (!isClicked) { (e.currentTarget as HTMLButtonElement).style.background = T.text; (e.currentTarget as HTMLButtonElement).style.color = T.bg; (e.currentTarget as HTMLButtonElement).style.borderColor = T.text; } }}
                            onMouseLeave={e => { if (!isClicked) { (e.currentTarget as HTMLButtonElement).style.background = "#18181b"; (e.currentTarget as HTMLButtonElement).style.color = T.textMuted; (e.currentTarget as HTMLButtonElement).style.borderColor = T.borderHover; } }}>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span style={{ fontSize: "12px", color: T.textHint, marginTop: "14px", fontFamily: T.font }}>{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ padding: "24px 0" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: T.textMuted, fontFamily: T.font, marginBottom: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>EDGEOS</div>
                  <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.textHint, animation: `edgeosdot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} style={{ height: "40px" }} />
            </div>
          )}
        </div>

        {/* ── Fixed input area ── */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(to top, ${T.bg} 65%, transparent)`, padding: "20px 32px 24px", zIndex: 10 }}>
          <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>

            {/* Modify mode banner */}
            {modifyMode && modifyTargetArtifact && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", padding: "8px 14px", border: `1px solid ${T.accent}30`, borderRadius: "8px", background: `${T.accent}08` }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.accent, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontFamily: T.font, color: T.accent, fontWeight: 600 }}>Modify mode</span>
                <span style={{ fontSize: "12px", fontFamily: T.font, color: T.textHint }}>Targeting: {modifyTargetArtifact}</span>
                <span style={{ fontSize: "12px", fontFamily: T.font, color: T.textHint, flex: 1 }}>Only this artifact will regenerate</span>
                <button
                  onClick={() => { setModifyMode(false); setModifyTargetArtifact(null); }}
                  style={{ background: "none", border: "none", color: T.textHint, cursor: "pointer", fontSize: "13px", fontFamily: T.font, padding: "0 4px", transition: "color .15s", lineHeight: 1 }}
                  onMouseEnter={e => e.currentTarget.style.color = T.text}
                  onMouseLeave={e => e.currentTarget.style.color = T.textHint}>
                  ✕
                </button>
              </div>
            )}

            <InputArea
              input={input}
              textareaRef={textareaRef}
              tokenQuota={tokenQuota}
              handleInputChange={handleInputChange}
              handleKeyDown={handleKeyDown}
              handleSend={handleSend}
              isTyping={isTyping}
            />
          </div>
        </div>
      </div>

      {/* ── Context menu ── */}
      {contextMenu?.visible && (
        <div ref={contextMenuRef} style={{ position: "fixed", left: `${contextMenu.x}px`, top: `${contextMenu.y}px`, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "6px", zIndex: 1000, minWidth: "160px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", fontFamily: T.font }}>
          {[{ label: "Copy", action: () => handleCopyMessage(contextMenu.messageContent), color: T.textMuted },
          ...(contextMenu.messageRole === "user" ? [{ label: "Edit", action: () => handleEditMessage(contextMenu.messageId, contextMenu.messageContent), color: T.textMuted }] : [])
          ].map(item => (
            <button key={item.label} onClick={item.action}
              style={{ width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: item.color, fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s", display: "block" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = item.color; }}>
              {item.label}
            </button>
          ))}
          <div style={{ height: "1px", background: T.border, margin: "4px 0" }} />
          <button onClick={() => handleDeleteMessage(contextMenu.messageId)}
            style={{ width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: "#ef4444", fontSize: "13px", fontWeight: 500, fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "6px", transition: "all .12s", display: "block" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            Delete
          </button>
        </div>
      )}

      {/* ── Global styles ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        #chat-root, #chat-root * { font-family: var(--font-inter), system-ui, -apple-system, sans-serif !important; }
        @keyframes edgeosdot { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea::placeholder { color: #71717a !important; font-family: var(--font-inter), system-ui, sans-serif !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
        #logo-toggle-btn:active .logo-icon { transform: rotate(360deg) scale(0.9) !important; }
        .token-hint-wrap:hover #token-hint-btn { border-color: #27272a; color: #a1a1aa; background: #18181b; }
        .token-hint-wrap:hover .token-tooltip { opacity: 1 !important; pointer-events: auto !important; transform: translateY(0) !important; }
      `}} />
    </div>
  );
}