"use client";

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

// ── EdgeOS Design Tokens (Onyx Minimal Palette) ──────────
const T = {
  bg: "#09090b",
  surface: "#121214",
  surfaceHover: "#18181b",
  border: "#27272a",
  borderHover: "#3f3f46",
  text: "#ededed",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  accent: "#ffffff",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
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

// ── Professional SaaS Template Card ──────────
const TemplateCard = ({ title, desc, icon, prompt, delay, onClick }: { title: string, desc: string, icon: React.ReactNode, prompt: string, delay: string, onClick: (t: string) => void }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onClick(prompt)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "12px",
        padding: "16px",
        background: hover ? T.surfaceHover : T.surface,
        border: `1px solid ${hover ? T.borderHover : T.border}`,
        borderRadius: "12px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        animation: `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay} both`,
        width: "100%"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "28px", height: "28px", borderRadius: "6px",
          background: hover ? "#ffffff" : "rgba(255,255,255,0.08)",
          color: hover ? "#000000" : T.textMuted,
          transition: "all 0.2s ease"
        }}>
          {icon}
        </div>
        <span style={{ fontSize: "14px", fontWeight: 500, color: hover ? "#ffffff" : T.text, fontFamily: T.font, transition: "color 0.2s" }}>
          {title}
        </span>
      </div>
      <span style={{ fontSize: "13px", color: T.textMuted, lineHeight: "1.5", fontFamily: T.font }}>
        {desc}
      </span>
    </button>
  );
};

const aiPhrases = [
  "Synthesizing context...",
  "Applying architectural patterns...",
  "Optimizing structure...",
  "Finalizing output...",
];

const TypingStatusText = ({ artifact }: { artifact: string | null }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % aiPhrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const artifactMap: Record<string, string> = {
    initial: "System Architecture",
    config: "System Configuration",
    docker: "Docker Environment",
    markdown: "Project Documentation",
    folderStructure: "Directory Structure",
    apiDesign: "API Specifications",
    testingPlan: "Testing Strategy",
    userStories: "User Stories",
    roadmap: "Product Roadmap",
    deploymentGuide: "Deployment Infrastructure",
    costEstimation: "Cost Analysis",
    projectTimeline: "Project Timeline",
    riskAnalysis: "Risk Assessment",
    finalMarkdown: "Final Specification",
    db: "Database Schema",
  };

  const artifactName = artifact ? (artifactMap[artifact] || "Artifacts") : "Response";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", fontFamily: T.font, letterSpacing: "0.02em" }}>
        Generating {artifactName}
      </span>
      <span style={{ fontSize: "13px", color: T.textHint, fontFamily: T.font, animation: "typingFade 2s infinite" }}>
        {aiPhrases[idx]}
      </span>
    </div>
  );
};

export default function ChatPanel({
  agentName, onToggleSidebar, isSidebarOpen = true,
  sessionId, showLoginModal, onShowLoginModal,
}: ChatPanelProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const [cachedDisplayName, setCachedDisplayName] = useState<string>("You");

  // Use layout effect to run synchronously before browser paint to prevent flash
  // and keep initial state null to avoid hydration mismatch with server
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
    if (user?.imageUrl) {
      setCachedImageUrl(user.imageUrl);
      localStorage.setItem("edge-os-user-image", user.imageUrl);
    }
    
    if (user?.firstName || user?.primaryEmailAddress?.emailAddress) {
      const name = user.firstName
        ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
        : (user.primaryEmailAddress?.emailAddress ?? "You");
      setCachedDisplayName(name);
      localStorage.setItem("edge-os-user-name", name);
    }
  }, [user]);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generatingArtifact, setGeneratingArtifact] = useState<ArtifactType | null>(null);
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
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean; x: number; y: number;
    messageId: string; messageContent: string; messageRole: string;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  
  useEffect(() => { 
    // Only auto-scroll if we are already at the bottom, or if AI is typing.
    // If user explicitly scrolled up, don't force them down unless it's a new generation.
    scrollToBottom(); 
  }, [messages.length, isTyping]);

  const handleScroll = () => {
    if (!scrollableRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
  };

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

  const handleSend = async (overrideInput?: string, forceArtifact?: ArtifactType) => {
    if (!isSignedIn) { onShowLoginModal?.(true); return; }
    if (tokenQuota?.exhausted) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: `Daily token limit reached.`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
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
    setGeneratingArtifact(artifact);
    if (!overrideInput && textareaRef.current) textareaRef.current.style.height = "auto";
    setModifyMode(false); setModifyTargetArtifact(null);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: textToSend, sessionId: currentSessionId, artifact, mode: isModify ? "modify" : "generate" }) });
      if (!res.ok) {
        let errMsg = `API error: ${res.status}`;
        try { const errBody = await res.json(); if (errBody.error) errMsg = errBody.error; if (errBody.code) errMsg += ` [${errBody.code}]`; } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const quotaRes = await fetch("/api/token-quota");
      if (quotaRes.ok) {
        const fresh = await quotaRes.json(); setTokenQuota(fresh);
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
    } finally { setIsTyping(false); setGeneratingArtifact(null); }
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
    if (textareaRef.current) { textareaRef.current.style.height = "0px"; textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`; }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = "0px";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
      }, 0);
    }
  };

  const displayName = cachedDisplayName;

  return (
    <div id="chat-root" className={satoshi.variable} style={{ flex: 1, display: "flex", flexDirection: "column", background: T.bg, overflow: "hidden", minWidth: 0, position: "relative", fontFamily: T.font }}>

      {/* ── Floating Nav Elements ── */}
      <div style={{ position: "absolute", top: "24px", left: "24px", right: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, pointerEvents: "none" }}>

        {/* Left: Sidebar Toggle */}
        <div style={{ pointerEvents: "auto" }}>
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              title="Open sidebar"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: "6px", color: T.textMuted, cursor: "pointer", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surfaceHover; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = "transparent"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Right: Floating Structured CTA */}
        <div style={{ pointerEvents: "auto" }}>
          {!isSignedIn && isLoaded && (
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "6px 14px",
                background: "#ffffff",
                border: "1px solid #ffffff",
                borderRadius: "6px",
                color: "#000000",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: T.font,
                transition: "opacity .2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                Log in
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 1 }}>

        {/* Scrollable Area */}
        <div 
          ref={scrollableRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: "auto", paddingBottom: "180px", display: "flex", flexDirection: "column" }}
        >

          {/* ── Empty / Landing State (Functional Dashboard) ── */}
          {messages.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "8vh 32px 32px", alignItems: "center" }}>
              <div style={{ width: "100%", maxWidth: "720px", display: "flex", flexDirection: "column" }}>

                {/* Dashboard Header */}
                <div style={{ marginBottom: "32px", animation: "slideUp 0.3s ease-out both" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "8px" }}>
                    Edge OS
                  </span>
                  <h1 style={{
                    fontSize: "24px",
                    fontWeight: 500,
                    margin: "0",
                    fontFamily: T.font,
                    letterSpacing: "-0.02em",
                    color: T.text,
                    marginBottom: "12px",
                  }}>
                    What are you building today?
                  </h1>
                  <p style={{
                    fontSize: "14px",
                    color: T.textMuted,
                    lineHeight: "1.6",
                    margin: "0",
                    fontFamily: T.font,
                  }}>
                    Describe your software idea and Edge OS will generate product requirements, roadmaps, user stories, API designs, database schemas, architecture plans and technical documentation.
                  </p>
                </div>

                {/* Functional Template Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "12px",
                  marginBottom: "48px"
                }}>
                  <TemplateCard
                    title="AI SaaS Platform"
                    desc="Generate complete planning for an AI-powered SaaS application."
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>}
                    prompt="Build an AI SaaS platform where users can upload documents, chat with AI, manage workspaces and collaborate with teams. Generate a complete Product Requirement Document, User Stories, Product Roadmap, API Design, Database Schema, System Architecture, Folder Structure, Testing Plan, Deployment Guide and Technical Documentation."
                    delay="0.1s"
                    onClick={handleSuggestionClick}
                  />
                  <TemplateCard
                    title="E-Commerce Marketplace"
                    desc="Plan a scalable marketplace with products, orders and payments."
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>}
                    prompt="Build an e-commerce marketplace similar to Amazon with authentication, products, inventory, shopping cart, orders, payments and seller dashboard. Generate complete planning documents including PRD, User Stories, Roadmap, APIs, Database Schema, Architecture and Deployment Guide."
                    delay="0.15s"
                    onClick={handleSuggestionClick}
                  />
                  <TemplateCard
                    title="Social Media Platform"
                    desc="Design a modern social network with feeds and messaging."
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                    prompt="Build a social media platform similar to Instagram with authentication, profiles, posts, comments, likes, followers, messaging and notifications. Generate complete planning artifacts including PRD, Roadmap, APIs, Database Schema and Architecture."
                    delay="0.2s"
                    onClick={handleSuggestionClick}
                  />
                  <TemplateCard
                    title="Hospital Management System"
                    desc="Generate planning for a complete healthcare management platform."
                    icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>}
                    prompt="Build a hospital management system with patients, doctors, appointments, pharmacy, billing and reports. Generate Product Requirements, User Stories, Roadmap, API Design, Database Schema, Folder Structure, System Architecture, Testing Plan and Deployment Guide."
                    delay="0.25s"
                    onClick={handleSuggestionClick}
                  />
                </div>



              </div>
            </div>

          ) : (
            /* ── Message list ── */
            <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "64px 32px 32px", display: "flex", flexDirection: "column" }}>
              {messages.map((msg, idx) => (
                <div key={msg.id}
                  style={{ display: "flex", gap: "16px", padding: "24px 0", borderBottom: idx !== messages.length - 1 ? `1px solid ${T.border}` : "none", width: "100%" }}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, messageId: msg.id, messageContent: msg.content, messageRole: msg.role }); }}>

                  {/* Minimal Avatar */}
                  {msg.role === "user" && cachedImageUrl ? (
                    <img 
                      src={cachedImageUrl} 
                      alt={displayName} 
                      style={{
                        width: "24px", height: "24px", borderRadius: "4px", flexShrink: 0,
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "4px", flexShrink: 0,
                      background: msg.role === "user" ? T.borderHover : "#ffffff",
                      color: msg.role === "user" ? T.text : "#000000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 600, fontFamily: T.font
                    }}>
                      {msg.role === "user" ? (displayName.charAt(0).toUpperCase() || "U") : "E"}
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", width: "100%", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: T.text, fontFamily: T.font }}>
                        {msg.role === "user" ? displayName : "Edge OS AI"}
                      </span>
                      <span style={{ fontSize: "12px", color: T.textHint, fontFamily: T.font }}>{msg.timestamp}</span>
                    </div>

                    {/* Tool badges */}
                    {msg.tools && (
                      <div style={{ display: "flex", gap: "6px", margin: "8px 0", flexWrap: "wrap" }}>
                        {msg.tools.map(t => (
                          <span key={t} style={{ fontSize: "11px", color: T.textMuted, background: T.surfaceHover, border: `1px solid ${T.border}`, padding: "2px 6px", fontFamily: T.font, borderRadius: "4px" }}>{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Message body */}
                    <div style={{ width: "100%", color: "rgba(255,255,255,0.85)", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-line", fontFamily: T.font }}>
                      {msg.content}

                      {/* File artifact card */}
                      {msg.file && (
                        <div style={{ marginTop: "16px", border: `1px solid ${T.border}`, background: T.surface, borderRadius: "8px", overflow: "hidden" }}>
                          <FileHeader msg={msg} markdownMode={markdownMode} setMarkdownMode={setMarkdownMode} />
                          <div style={{ overflowX: "auto" }}>
                            <FileContentRenderer msg={msg} markdownMode={markdownMode} />
                          </div>

                          {/* Modify button */}
                          {msg.role === "assistant" && msg.file.language !== "dbschema" && (
                            <div style={{ padding: "8px 12px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", background: T.surfaceHover }}>
                              <button
                                onClick={() => { const target = LANG_TO_ARTIFACT[msg.file!.language] ?? "config"; setModifyMode(true); setModifyTargetArtifact(target); textareaRef.current?.focus(); }}
                                style={{ padding: "4px 12px", background: "transparent", border: `1px solid ${T.border}`, color: T.textMuted, fontSize: "12px", fontFamily: T.font, cursor: "pointer", borderRadius: "4px", transition: "all .15s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = T.textMuted; e.currentTarget.style.color = T.text; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}>
                                Modify
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Option buttons */}
                    {msg.options && msg.options.length > 0 && msg.role === "assistant" && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                        {msg.options.map((option, i) => {
                          const isClicked = messages.some(m => m.role === "user" && m.content === option);
                          return (
                            <button key={i} onClick={() => { if (!isClicked) handleOptionClick(option); }}
                              style={{ padding: "6px 12px", background: isClicked ? "transparent" : T.surfaceHover, border: `1px solid ${isClicked ? T.border : T.borderHover}`, color: isClicked ? T.textHint : T.textMuted, fontSize: "12px", fontFamily: T.font, cursor: isClicked ? "default" : "pointer", transition: "all .15s", borderRadius: "6px", opacity: isClicked ? 0.5 : 1 }}
                              onMouseEnter={e => { if (!isClicked) { (e.currentTarget as HTMLButtonElement).style.background = T.text; (e.currentTarget as HTMLButtonElement).style.color = T.bg; (e.currentTarget as HTMLButtonElement).style.borderColor = T.text; } }}
                              onMouseLeave={e => { if (!isClicked) { (e.currentTarget as HTMLButtonElement).style.background = T.surfaceHover; (e.currentTarget as HTMLButtonElement).style.color = T.textMuted; (e.currentTarget as HTMLButtonElement).style.borderColor = T.borderHover; } }}>
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ display: "flex", gap: "16px", padding: "24px 0" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "4px", flexShrink: 0, background: "#ffffff", color: "#000000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, fontFamily: T.font }}>E</div>
                  <div style={{ display: "flex", alignItems: "center", height: "24px" }}>
                    <TypingStatusText artifact={generatingArtifact} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} style={{ height: "40px" }} />
            </div>
          )}
        </div>

        {/* Blur Backdrop */}
        <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "180px",
            background: "linear-gradient(to top, rgba(9, 9, 11, 0.9) 20%, rgba(9, 9, 11, 0) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 10,
        }} />

        {/* ── Fixed input area ── */}
        <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0px 32px 32px",
            pointerEvents: "none",
            zIndex: 11,
          }}>
            <div style={{ width: "100%", maxWidth: "760px", margin: "0 auto", animation: "slideUp 0.3s ease-out", pointerEvents: "auto" }}>

              {/* Modify mode banner */}
              {modifyMode && modifyTargetArtifact && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", padding: "8px 12px",
                  border: `1px solid ${T.borderHover}`, borderRadius: "8px",
                  background: T.surfaceHover,
                }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "2px", background: T.text, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", fontFamily: T.font, color: T.text, fontWeight: 500 }}>Targeting: {modifyTargetArtifact}</span>
                  <span style={{ fontSize: "12px", fontFamily: T.font, color: T.textHint, flex: 1 }}>Only this artifact will regenerate</span>
                  <button
                    onClick={() => { setModifyMode(false); setModifyTargetArtifact(null); }}
                    style={{ background: "none", border: "none", color: T.textHint, cursor: "pointer", fontSize: "12px", fontFamily: T.font, padding: "0 4px", transition: "color .15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = T.text}
                    onMouseLeave={e => e.currentTarget.style.color = T.textHint}>
                    ✕ Cancel
                  </button>
                </div>
              )}

              {messages.length === 0 && (
                <div style={{ marginBottom: "12px", fontSize: "13px", fontWeight: 500, color: T.textMuted }}>Or start with your own product idea</div>
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

        {/* Scroll Down Button */}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            style={{
              position: "absolute",
              bottom: "120px", // Just above the gradient fade
              right: "48px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: T.surfaceHover,
              border: `1px solid ${T.borderHover}`,
              color: T.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              zIndex: 20,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#000000"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
            aria-label="Scroll to bottom"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>
        )}
      </div>

      {/* ── Context menu ── */}
      {contextMenu?.visible && (
        <div ref={contextMenuRef} style={{ position: "fixed", left: `${contextMenu.x}px`, top: `${contextMenu.y}px`, background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "4px", zIndex: 1000, minWidth: "140px", boxShadow: "0 12px 24px rgba(0,0,0,0.5)", fontFamily: T.font }}>
          {[{ label: "Copy", action: () => handleCopyMessage(contextMenu.messageContent), color: T.textMuted },
          ...(contextMenu.messageRole === "user" ? [{ label: "Edit", action: () => handleEditMessage(contextMenu.messageId, contextMenu.messageContent), color: T.textMuted }] : [])
          ].map(item => (
            <button key={item.label} onClick={item.action}
              style={{ width: "100%", padding: "6px 10px", background: "transparent", border: "none", color: item.color, fontSize: "13px", fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "4px", transition: "background .1s" }}
              onMouseEnter={e => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = item.color; }}>
              {item.label}
            </button>
          ))}
          <div style={{ height: "1px", background: T.border, margin: "4px 0" }} />
          <button onClick={() => handleDeleteMessage(contextMenu.messageId)}
            style={{ width: "100%", padding: "6px 10px", background: "transparent", border: "none", color: "#ef4444", fontSize: "13px", fontFamily: T.font, textAlign: "left", cursor: "pointer", borderRadius: "4px", transition: "background .1s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            Delete
          </button>
        </div>
      )}

      {/* ── Global styles ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        #chat-root, #chat-root * { font-family: var(--font-satoshi), system-ui, -apple-system, sans-serif !important; }
        @keyframes typingDot { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes typingFade { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        textarea::placeholder { color: #71717a !important; font-family: var(--font-satoshi), system-ui, sans-serif !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f1f1f; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
      `}} />
    </div>
  );
}