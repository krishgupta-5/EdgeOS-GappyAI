"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircleIcon } from "hugeicons-react";
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
import FinalSummaryCard from "@/app/chat/components/FinalSummaryCard";
import EmailPreviewCard from "@/app/chat/components/EmailPreviewCard";
import MeetingPreviewCard from "@/app/chat/components/MeetingPreviewCard";
import type { ProgressEvent, EmailPreview, MeetingPreview } from "@/lib/pipeline/types";

const AppIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 196 196" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M73.9216 7.17157V38.2486C73.9216 38.519 74.0311 38.7779 74.2251 38.9662L90.3396 54.6067C90.7128 54.969 91.2125 55.1716 91.7326 55.1716H104.093C104.624 55.1716 105.132 54.9609 105.507 54.5858L121.129 38.9645C121.316 38.7769 121.422 38.5226 121.422 38.2574V7.17157L114.836 0.585786C114.055 -0.195263 112.788 -0.195261 112.007 0.585787L105.422 7.17157V37.6716C105.422 38.2239 104.974 38.6716 104.422 38.6716H90.9216C90.3693 38.6716 89.9216 38.2239 89.9216 37.6716V7.17157L83.3358 0.585786C82.5547 -0.195263 81.2884 -0.195261 80.5074 0.585787L73.9216 7.17157ZM7.17158 121.422H38.2486C38.519 121.422 38.7779 121.312 38.9662 121.118L54.6067 105.004C54.969 104.63 55.1716 104.131 55.1716 103.611V91.25C55.1716 90.7196 54.9609 90.2109 54.5858 89.8358L38.9645 74.2145C38.7769 74.0269 38.5226 73.9216 38.2574 73.9216H7.17157L0.585786 80.5074C-0.195263 81.2884 -0.195261 82.5547 0.585787 83.3358L7.17157 89.9216H37.6716C38.2239 89.9216 38.6716 90.3693 38.6716 90.9216V104.422C38.6716 104.974 38.2239 105.422 37.6716 105.422H7.17157L0.585787 112.007C-0.195261 112.788 -0.19526 114.055 0.585789 114.836L7.17158 121.422ZM38.8598 72.4469L16.8851 50.4722V41.1585C16.8851 40.0539 17.7805 39.1585 18.8851 39.1585H28.1988L49.7655 60.7252C50.1561 61.1157 50.7892 61.1157 51.1798 60.7252L60.7257 51.1793C61.1162 50.7887 61.1162 50.1556 60.7257 49.7651L39.1589 28.1983V18.8846C39.1589 17.78 40.0544 16.8846 41.1589 16.8846H50.4726L72.4536 38.8656C72.6411 39.0531 72.7465 39.3075 72.7465 39.5727V61.6646C72.7465 62.195 72.5358 62.7037 72.1607 63.0788L63.4205 71.819C63.0527 72.1868 62.5561 72.3968 62.0361 72.4046L39.5819 72.7397C39.3115 72.7438 39.051 72.6381 38.8598 72.4469ZM145.565 16.8284L123.591 38.8032C123.4 38.9944 123.294 39.2549 123.298 39.5252L123.633 61.9795C123.641 62.4995 123.851 62.9961 124.219 63.3638L132.959 72.1041C133.334 72.4791 133.843 72.6899 134.373 72.6899H156.465C156.73 72.6899 156.985 72.5845 157.172 72.397L179.153 50.416V41.1023C179.153 39.9977 178.258 39.1023 177.153 39.1023H167.839L146.273 60.669C145.882 61.0596 145.249 61.0596 144.858 60.669L135.312 51.1231C134.922 50.7326 134.922 50.0994 135.312 49.7089L156.879 28.1421V18.8284C156.879 17.7239 155.984 16.8284 154.879 16.8284L145.565 16.8284ZM121.422 157.095V188.172L114.836 194.757C114.055 195.538 112.788 195.538 112.007 194.757L105.422 188.172V157.672C105.422 157.119 104.974 156.672 104.422 156.672H90.9216C90.3693 156.672 89.9216 157.119 89.9216 157.672V188.172L83.3358 194.757C82.5547 195.538 81.2884 195.538 80.5074 194.757L73.9216 188.172V157.086C73.9216 156.821 74.0269 156.566 74.2145 156.379L89.8358 140.757C90.2109 140.382 90.7196 140.172 91.25 140.172H103.611C104.131 140.172 104.63 140.374 105.004 140.736L121.118 156.377C121.312 156.565 121.422 156.824 121.422 157.095ZM188.172 73.9216H157.095C156.824 73.9216 156.565 74.0311 156.377 74.2251L140.736 90.3396C140.374 90.7128 140.172 91.2125 140.172 91.7326V104.093C140.172 104.624 140.382 105.132 140.757 105.507L156.379 121.129C156.566 121.316 156.821 121.422 157.086 121.422H188.172L194.757 114.836C195.538 114.055 195.538 112.788 194.757 112.007L188.172 105.422H157.672C157.119 105.422 156.672 104.974 156.672 104.422V90.9216C156.672 90.3693 157.119 89.9216 157.672 89.9216H188.172L194.757 83.3358C195.538 82.5547 195.538 81.2884 194.757 80.5074L188.172 73.9216ZM156.483 122.896L178.458 144.871V154.185C178.458 155.289 177.563 156.185 176.458 156.185H167.144L145.578 134.618C145.187 134.227 144.554 134.227 144.163 134.618L134.617 144.164C134.227 144.554 134.227 145.188 134.617 145.578L156.184 167.145V176.459C156.184 177.563 155.289 178.459 154.184 178.459H144.871L122.89 156.478C122.702 156.29 122.597 156.036 122.597 155.77V133.679C122.597 133.148 122.807 132.639 123.182 132.264L131.923 123.524C132.29 123.156 132.787 122.946 133.307 122.939L155.761 122.603C156.032 122.599 156.292 122.705 156.483 122.896ZM51.1663 178.401L73.1411 156.427C73.3323 156.235 73.4379 155.975 73.4339 155.705L73.0987 133.25C73.091 132.73 72.8809 132.234 72.5132 131.866L63.7729 123.126C63.3979 122.751 62.8892 122.54 62.3587 122.54H40.2668C40.0016 122.54 39.7473 122.645 39.5597 122.833L17.5788 144.814L17.5788 154.128C17.5788 155.232 18.4742 156.128 19.5788 156.128H28.8925L50.4592 134.561C50.8497 134.17 51.4829 134.17 51.8734 134.561L61.4194 144.107C61.8099 144.497 61.8099 145.13 61.4194 145.521L39.8526 167.088V176.401C39.8526 177.506 40.748 178.401 41.8526 178.401H51.1663Z" fill="currentColor" />
  </svg>
);

// ── ProdMate Design Tokens (ProdMate Minimal Palette) ──────────
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
  notionUrl?: string;
  exportStatus?: string;
  githubUrl?: string;
  githubExportStatus?: string;
  jiraUrl?: string;
  jiraExportStatus?: string;
  emailPreview?: EmailPreview;
  meetingPreview?: MeetingPreview;
}

const initialMessages: Message[] = [];

interface ChatPanelProps {
  agentName: string;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  sessionId?: string;
  showLoginModal?: boolean;
  onShowLoginModal?: (show: boolean) => void;
  isSharedView?: boolean;
  sharedData?: any;
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

const generalPhrases = [
  "Analyzing request...",
  "Gathering thoughts...",
  "Formulating response...",
  "Writing...",
];

const exportPhrases = [
  "Syncing with integrations...",
  "Exporting to GitHub...",
  "Setting up Jira project...",
  "Publishing Notion docs...",
];

const TypingStatusText = ({ artifact, isExporting }: { artifact: string | null, isExporting?: boolean }) => {
  const [idx, setIdx] = useState(0);

  // Decide which phrases to use based on mode
  let phrases = aiPhrases;
  if (isExporting) {
    phrases = exportPhrases;
  } else if (!artifact) {
    phrases = generalPhrases;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [phrases]);

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

  const isGeneral = !artifact && !isExporting;
  const artifactName = artifact ? (artifactMap[artifact] || "Artifacts") : "Response";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", fontFamily: T.font, letterSpacing: "0.02em" }}>
        {isExporting ? "Exporting Project" : (isGeneral ? "Thinking..." : `Generating ${artifactName}`)}
      </span>
      <span style={{ fontSize: "13px", color: T.textHint, fontFamily: T.font, animation: "typingFade 2s infinite" }}>
        {phrases[idx]}
      </span>
    </div>
  );
};

export default function ChatPanel({
  agentName, onToggleSidebar, isSidebarOpen = true,
  sessionId, showLoginModal, onShowLoginModal, isSharedView, sharedData,
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
      const img = localStorage.getItem("ProdMate-user-image");
      if (img) setCachedImageUrl(img);
      const name = localStorage.getItem("ProdMate-user-name");
      if (name) setCachedDisplayName(name);
    }
  }, []);

  useEffect(() => {
    if (user?.imageUrl) {
      setCachedImageUrl(user.imageUrl);
      localStorage.setItem("ProdMate-user-image", user.imageUrl);
    }

    if (user?.firstName || user?.primaryEmailAddress?.emailAddress) {
      const name = user.firstName
        ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
        : (user.primaryEmailAddress?.emailAddress ?? "You");
      setCachedDisplayName(name);
      localStorage.setItem("ProdMate-user-name", name);
    }
  }, [user]);

  const [messages, setMessages] = useState<Message[]>(isSharedView ? (sharedData?.messages || []) : initialMessages);
  const [input, setInput] = useState(() => {
    if (typeof window !== "undefined") {
      const p = localStorage.getItem("pending_prompt");
      if (p) {
        localStorage.removeItem("pending_prompt");
        return p;
      }
    }
    return "";
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatingArtifact, setGeneratingArtifact] = useState<ArtifactType | null>(null);
  const [markdownMode, setMarkdownMode] = useState<Record<string, "code" | "preview">>({});
  const [generatedData, setGeneratedData] = useState<any>(isSharedView ? sharedData : null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasGeneratedConfig, setHasGeneratedConfig] = useState(isSharedView ? true : false);
  const [conversationMode, setConversationMode] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<any>(null);
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
  const [liveEvents, setLiveEvents] = useState<ProgressEvent[]>([]);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [integrationData, setIntegrationData] = useState<{
    github: boolean;
    notion: boolean;
    jira: boolean;
  }>({ github: false, notion: false, jira: false });
  const [isInitialLoading, setIsInitialLoading] = useState(!!sessionId && !isSharedView);

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
    if (!isSignedIn || isSharedView) return;
    fetch("/api/token-quota").then(r => r.ok ? r.json() : null).then(d => d && setTokenQuota(d));
    Promise.all([
      fetch("/api/integrations").then(res => res.json()).catch(() => ({})),
      fetch("/api/notion/pages").then(res => res.json()).catch(() => ({}))
    ]).then(([integrations, notion]) => {
      setIntegrationData({
        github: !!integrations?.github?.accessToken,
        jira: !!integrations?.jira?.accessToken,
        notion: !!notion?.connected
      });
    });
  }, [isSignedIn, isSharedView]);

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

  // Listen to SSE Events
  useEffect(() => {
    if (!sessionId || isSharedView) {
      setLiveEvents([]);
      return;
    }
    const eventSource = new EventSource(`/api/events?sessionId=${sessionId}`);
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as ProgressEvent;
        setLiveEvents((prev) => {
          // Avoid duplicates based on type and source
          if (prev.find(p => p.type === data.type && p.source === data.source && p.message === data.message)) return prev;
          return [...prev, data];
        });
      } catch (err) {
        console.error('Failed to parse SSE event', err);
      }
    };
    eventSource.onerror = (err) => {
      console.error('SSE Error', err);
      eventSource.close();
    };
    return () => eventSource.close();
  }, [sessionId, isSharedView]);

  // Load chat history
  useEffect(() => {
    let isMounted = true;
    let pollingTimer: NodeJS.Timeout | null = null;

    const load = async () => {
      if (!isSharedView && !isSignedIn) return;
      if (!isSharedView && !sessionId) {
        if (isMounted) { setMessages([]); setGeneratedData(null); setHasGeneratedConfig(false); }
        return;
      }
      try {
        let resData: any;
        if (isSharedView && sharedData) {
          resData = sharedData;
        } else {
          const res = await fetch(`/api/chat-history?sessionId=${sessionId}`, { cache: "no-store" });
          if (!res.ok) return;
          resData = await res.json();
        }
        const {
          messages: rawAll = [],
          artifacts: rawArtifacts = {},
          notionUrl, exportStatus, githubUrl, githubExportStatus, jiraUrl, jiraExportStatus,
          conversationMode: apiConvMode, pendingIntegrationUpdates
        } = resData;

        if (apiConvMode) setConversationMode(true);
        if (pendingIntegrationUpdates) setPendingUpdates(pendingIntegrationUpdates);

        const raw: any[] = [];
        for (const msg of rawAll) {
          const prev = raw[raw.length - 1];
          if (prev && prev.role === msg.role && prev.content === msg.content) continue;
          raw.push(msg);
        }

        const singleArtifactToKey: Record<string, string> = {
          config: "yaml", docker: "docker", markdown: "markdown", folderStructure: "folderStructure",
          apiDesign: "apiDesign", testingPlan: "testingPlan", userStories: "userStories",
          roadmap: "roadmap", deploymentGuide: "deploymentGuide", costEstimation: "costEstimation",
          projectTimeline: "projectTimeline", riskAnalysis: "riskAnalysis", finalMarkdown: "finalMarkdown",
        };

        const singleArtifactToStep: Record<string, Step> = {
          config: "config", docker: "docker", markdown: "docs", folderStructure: "folder",
          apiDesign: "apiDesign", testingPlan: "testingPlan", userStories: "userStories",
          roadmap: "roadmap", deploymentGuide: "deploymentGuide", costEstimation: "costEstimation",
          projectTimeline: "projectTimeline", riskAnalysis: "riskAnalysis", finalMarkdown: "finalMarkdown",
          db: "db"
        };

        let latestResult: any = {};
        for (const [key, artifact] of Object.entries(rawArtifacts) as [string, any][]) {
          const mappedKey = singleArtifactToKey[key] || key;
          if (key === 'db' || key === 'dbSchema') {
            try { latestResult.dbSchema = JSON.parse(artifact.content); } catch { }
          } else {
            latestResult[mappedKey] = artifact.content;
          }
        }

        // Always run legacy extraction fallback to populate yaml/markdown for old sessions
        // where they were not saved in the artifacts subcollection
        for (const msg of raw) {
          if (msg.role === "assistant") {
            try {
              const p = JSON.parse(msg.content);
              if (p.yaml && !latestResult.yaml) { latestResult = { ...latestResult, yaml: p.yaml, markdown: p.markdown }; }
              else if (p.artifact && p.content) {
                const key = singleArtifactToKey[p.artifact];
                if (key && !latestResult[key]) latestResult[key] = p.content;
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

          // LEGACY MESSAGE FORMAT
          if (parsed && (parsed.yaml || parsed.artifact)) {
            if (parsed.artifact && parsed.content && !parsed.yaml) {
              const step = singleArtifactToStep[parsed.artifact];
              const dataKey = singleArtifactToKey[parsed.artifact];
              if (step && dataKey) {
                const syntheticData = { [dataKey]: parsed.content };
                const { content, file, options } = buildAssistantMessage(step, syntheticData, false);
                historyMessages.push({ id: msg.id, role: "assistant", content, timestamp: ts, file, options });
                continue;
              }
            }
            if (!parsed.yaml) { historyMessages.push({ id: msg.id, role: "assistant", content: msg.content, timestamp: ts }); continue; }

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
            continue;
          }

          // NEW MESSAGE FORMAT
          if (msg.artifactType) {
            if (msg.artifactType === 'initial') {
              const { content: c1, file: f1, options: o1 } = buildAssistantMessage('docs', latestResult, !localHasConfig);
              historyMessages.push({ id: `${msg.id}-docs`, role: "assistant", content: msg.content, timestamp: ts, file: f1, options: o1 });

              const { content: c2, file: f2, options: o2 } = buildAssistantMessage('config', latestResult, false);
              localHasConfig = true;
              historyMessages.push({ id: `${msg.id}-config`, role: "assistant", content: "System config generated.", timestamp: ts, file: f2, options: o2 });
            } else {
              const step = singleArtifactToStep[msg.artifactType];
              if (step) {
                const { file, options } = buildAssistantMessage(step, latestResult, false);
                historyMessages.push({ id: msg.id, role: "assistant", content: msg.content, timestamp: ts, file, options });
              } else {
                historyMessages.push({ id: msg.id, role: "assistant", content: msg.content, timestamp: ts, emailPreview: msg.emailPreview, meetingPreview: msg.meetingPreview });
              }
            }
          } else {
            historyMessages.push({ id: msg.id, role: "assistant", content: msg.content, timestamp: ts, emailPreview: msg.emailPreview, meetingPreview: msg.meetingPreview });
          }
        }

        if (notionUrl || exportStatus || githubUrl || githubExportStatus || jiraUrl || jiraExportStatus) {
          const finalMsgIndex = historyMessages.findIndex(m => m.file?.name === "final-spec.md");
          if (finalMsgIndex !== -1) {
            historyMessages[finalMsgIndex].notionUrl = notionUrl;
            historyMessages[finalMsgIndex].exportStatus = exportStatus;
            historyMessages[finalMsgIndex].githubUrl = githubUrl;
            historyMessages[finalMsgIndex].githubExportStatus = githubExportStatus;
            historyMessages[finalMsgIndex].jiraUrl = jiraUrl;
            historyMessages[finalMsgIndex].jiraExportStatus = jiraExportStatus;
          } else if (historyMessages.length > 0) {
            historyMessages[historyMessages.length - 1].notionUrl = notionUrl;
            historyMessages[historyMessages.length - 1].exportStatus = exportStatus;
            historyMessages[historyMessages.length - 1].githubUrl = githubUrl;
            historyMessages[historyMessages.length - 1].githubExportStatus = githubExportStatus;
            historyMessages[historyMessages.length - 1].jiraUrl = jiraUrl;
            historyMessages[historyMessages.length - 1].jiraExportStatus = jiraExportStatus;
          }
        }

        if (isMounted) {
          setMessages(historyMessages);
          if (Object.keys(latestResult).length > 0) {
            setGeneratedData(latestResult);
            setHasGeneratedConfig(true);
            setConversationMode(true);
          }

          const isAwaitingAssistant = historyMessages.length > 0 && historyMessages[historyMessages.length - 1].role === 'user';
          const isAwaitingNotion = Object.keys(latestResult).includes('finalMarkdown') && exportStatus === 'PENDING';
          const isAwaitingGithub = Object.keys(latestResult).includes('finalMarkdown') && githubExportStatus === 'PENDING';
          const isAwaitingJira = Object.keys(latestResult).includes('finalMarkdown') && jiraExportStatus === 'PENDING';
          const awaitingExport = isAwaitingNotion || isAwaitingGithub || isAwaitingJira;

          setIsExporting(awaitingExport);

          if (isAwaitingAssistant || awaitingExport) {
            pollingTimer = setTimeout(load, 3000);
          }
          setIsInitialLoading(false);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        if (isMounted) setIsInitialLoading(false);
      }
    };

    // Only clear on initial mount/session change
    if (sessionId || isSharedView) {
      setMessages([]); setGeneratedData(null); setHasGeneratedConfig(false);
      load();
    } else {
      setMessages([]); setGeneratedData(null); setHasGeneratedConfig(false);
    }

    return () => {
      isMounted = false;
      if (pollingTimer) clearTimeout(pollingTimer);
    };
  }, [sessionId, isSignedIn, isSharedView]);

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
    if (isSharedView) return;
    const textToSend = (overrideInput ?? input).trim();
    if (!isSignedIn) {
      if (textToSend) localStorage.setItem("pending_prompt", textToSend);
      onShowLoginModal?.(true);
      return;
    }
    if (tokenQuota?.exhausted) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: `Daily token limit reached.`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      return;
    }
    if (!textToSend) return;
    let forceArtifactParam = forceArtifact;
    if (!forceArtifactParam) {
      const matchedArtifact = OPTION_TO_ARTIFACT[textToSend.toLowerCase()];
      if (matchedArtifact) {
        forceArtifactParam = matchedArtifact;
      }
    }

    let artifact: ArtifactType;
    let isModify = false;
    if (forceArtifactParam) { artifact = !hasGeneratedConfig ? "initial" : forceArtifactParam; isModify = false; }
    else if (modifyMode && modifyTargetArtifact) { artifact = modifyTargetArtifact; isModify = true; }
    else if (!hasGeneratedConfig) { artifact = "initial"; isModify = false; }
    else { artifact = "markdown"; isModify = false; }
    const currentSessionId = sessionId || getSessionId() || resetSessionId();
    if (!sessionId) { window.history.replaceState(null, "", `/chat/${currentSessionId}`); sessionStorage.setItem("ProdMate-session-id", currentSessionId); }

    // Format chat history for /api/chat context
    const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: textToSend, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    if (!overrideInput) setInput("");
    setIsTyping(true);
    setGeneratingArtifact(artifact);
    if (!overrideInput && textareaRef.current) textareaRef.current.style.height = "auto";
    setModifyMode(false); setModifyTargetArtifact(null);
    try {
      const isExplicitRequest = !!forceArtifactParam || (modifyMode && !!modifyTargetArtifact);
      // We also want to use chat if they've generated a config (i.e. conversationMode is effectively true for free text)
      const useChat = (conversationMode || hasGeneratedConfig) && !isExplicitRequest;
      const endpoint = useChat ? "/api/chat" : "/api/generate";
      const payload = useChat
        ? { prompt: textToSend, sessionId: currentSessionId, history: chatHistory }
        : { prompt: textToSend, sessionId: currentSessionId, artifact, mode: isModify ? "modify" : "generate" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let errMsg = `API error: ${res.status}`;
        try { const errBody = await res.json(); if (errBody.error) errMsg = errBody.error; if (errBody.code) errMsg += ` [${errBody.code}]`; } catch { }
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const quotaRes = await fetch("/api/token-quota");
      if (quotaRes.ok) {
        const fresh = await quotaRes.json(); setTokenQuota(fresh);
      }

      let merged: any = generatedData ? { ...generatedData } : {};

      if (useChat) {
        // Conversational Mode Response (Groq + Gemini if modified)
        setMessages(prev => {
          // If the new message has a preview, remove previous previews to maintain a single draft
          let updatedPrev = prev;
          if (data.emailPreview || data.meetingPreview) {
            updatedPrev = prev.map(m => {
              if (m.emailPreview?.status === 'preview' && data.emailPreview) return { ...m, emailPreview: undefined };
              if (m.meetingPreview?.status === 'preview' && data.meetingPreview) return { ...m, meetingPreview: undefined };
              return m;
            });
          }
          return [...updatedPrev, {
            id: data.id || (Date.now() + 1).toString(),
            role: "assistant",
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            emailPreview: data.emailPreview,
            meetingPreview: data.meetingPreview
          }];
        });

        // If artifacts were modified, they are updated in the backend, but we don't fetch them all again right away.
        // The SSE events would have fired, or we could just trigger a reload of history.
        if (data.artifactsModified && data.artifactsModified.length > 0) {
          // Add a minor delay then force a history reload to get the new artifact contents
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('refresh-sessions'));
            // Could also trigger a local load() here but the useEffect does it when it needs to
          }, 1000);
        }
      } else {
        // Legacy Generate Pipeline Response
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
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), file, options, notionUrl: data.notionUrl, exportStatus: data.exportStatus, githubUrl: data.githubUrl, githubExportStatus: data.githubExportStatus, jiraUrl: data.jiraUrl, jiraExportStatus: data.jiraExportStatus }]);
      }

      // Dispatch event to tell sidebar to refresh its sessions list
      window.dispatchEvent(new CustomEvent('refresh-sessions'));
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Execution failed."}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } finally { setIsTyping(false); setGeneratingArtifact(null); }
  };
  const handleSendEmail = async (emailPreview: EmailPreview, messageId: string) => {
    if (!sessionId) return;

    if (!emailPreview.recipient || emailPreview.recipient.trim() === "" || emailPreview.recipient.includes("Leave empty string")) {
      alert("Please specify a valid recipient email address before sending.");
      return;
    }

    const signature = "\n\n---\nThis email was sent with the help of ProdMate.";
    const updatedEmailPreview = {
      ...emailPreview,
      body: emailPreview.body.includes("ProdMate") ? emailPreview.body : emailPreview.body + signature
    };

    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, emailPreview: { ...updatedEmailPreview, status: 'sending' } } : m));
    try {
      const res = await fetch("/api/action/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, emailPreview: updatedEmailPreview, messageId }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, emailPreview: { ...updatedEmailPreview, status: 'sent', sentAt: new Date().toISOString() } } : m));
      } else {
        const error = await res.json();
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, emailPreview: { ...updatedEmailPreview, status: 'preview' } } : m));
        alert(`Failed to send email: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, emailPreview: { ...updatedEmailPreview, status: 'preview' } } : m));
      alert("Failed to send email. Please check your connection or integration settings.");
    }
  };

  const handleScheduleMeeting = async (meetingPreview: MeetingPreview, messageId: string) => {
    if (!sessionId) return;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, meetingPreview: { ...meetingPreview, status: 'scheduling' } } : m));
    try {
      const res = await fetch("/api/action/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, meetingPreview, messageId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, meetingPreview: { ...meetingPreview, status: 'scheduled', scheduledAt: new Date().toISOString(), meetLink: data.meetLink } } : m));
      } else {
        const error = await res.json();
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, meetingPreview: { ...meetingPreview, status: 'preview' } } : m));
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: `Failed to schedule meeting: ${error.error || 'Unknown error'}`, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, meetingPreview: { ...meetingPreview, status: 'preview' } } : m));
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Failed to schedule meeting.", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }
  };

  const handleCancelAction = (msgId: string, type: 'email' | 'meeting') => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        if (type === 'email' && m.emailPreview) {
          return { ...m, emailPreview: { ...m.emailPreview, status: 'cancelled' } };
        } else if (type === 'meeting' && m.meetingPreview) {
          return { ...m, meetingPreview: { ...m.meetingPreview, status: 'cancelled' } };
        }
      }
      return m;
    }));
  };

  const handleRefine = (prompt: string, currentState: any) => {
    const isMeeting = 'guests' in currentState;
    const contextStr = JSON.stringify(currentState);
    const draftType = isMeeting ? "Meeting" : "Email";
    handleSend(`${prompt}\n\n[System Context: Current ${draftType} Draft: ${contextStr}]`);
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
          {!isSidebarOpen && !isSharedView && (
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

        {/* Right: Floating Structured CTA & Integration Badges */}
        <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px" }}>


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
          {isInitialLoading ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "8vh 32px 32px", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "14px", color: T.textHint, fontFamily: T.font, animation: "typingFade 2s infinite" }}>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "8vh 32px 32px", alignItems: "center" }}>
              <div style={{ width: "100%", maxWidth: "720px", display: "flex", flexDirection: "column" }}>

                {/* Dashboard Header */}
                <div style={{ marginBottom: "32px", animation: "slideUp 0.3s ease-out both" }}>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "8px" }}>
                    ProdMate
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
                    {hasGeneratedConfig ? "Ask anything about your project" : "What are you building today?"}
                  </h1>
                  <p style={{
                    fontSize: "14px",
                    color: T.textMuted,
                    lineHeight: "1.6",
                    margin: "0",
                    fontFamily: T.font,
                  }}>
                    {hasGeneratedConfig
                      ? "Use ProdMate AI to write emails, schedule meetings, update roadmaps, and modify your product documentation."
                      : "Describe your software idea and ProdMate will generate product requirements, roadmaps, user stories, API designs, database schemas, architecture plans and technical documentation."}
                  </p>
                </div>

                {/* Functional Template Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "12px",
                  marginBottom: "48px"
                }}>
                  {hasGeneratedConfig ? (
                    <>
                      <TemplateCard
                        title="Write an email"
                        desc="Draft emails to clients or team members based on project status."
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
                        prompt="Write an email to my client with a project update."
                        delay="0.1s"
                        onClick={handleSuggestionClick}
                      />
                      <TemplateCard
                        title="Schedule a meeting"
                        desc="Schedule Google Meet calls with your team or stakeholders."
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
                        prompt="Schedule a 30 minute sprint review meeting for tomorrow."
                        delay="0.15s"
                        onClick={handleSuggestionClick}
                      />
                      <TemplateCard
                        title="Update roadmap"
                        desc="Modify the project timeline, add milestones or adjust phases."
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>}
                        prompt="Update the roadmap to include a new phase for AI integration."
                        delay="0.2s"
                        onClick={handleSuggestionClick}
                      />
                      <TemplateCard
                        title="Modify database"
                        desc="Update the database schema with new tables or relationships."
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>}
                        prompt="Modify the database schema to add user profiles and avatars."
                        delay="0.25s"
                        onClick={handleSuggestionClick}
                      />
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>

          ) : (
            /* ── Message list ── */
            <div style={{ maxWidth: "900px", width: "100%", margin: "0 auto", padding: "64px 32px 32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {messages.map((msg, idx) => (
                <div key={msg.id}
                  style={{ display: "flex", width: "100%", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, messageId: msg.id, messageContent: msg.content, messageRole: msg.role }); }}>

                  {msg.role === "user" ? (
                    <div style={{ display: "flex", gap: "16px", width: "100%", maxWidth: "85%", justifyContent: "flex-end", alignItems: "flex-start" }}>
                      <div style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        padding: "12px 20px",
                        borderRadius: "24px",
                        color: T.text,
                        fontSize: "15px",
                        lineHeight: "1.5",
                        fontFamily: T.font
                      }}>
                        <div style={{ whiteSpace: "pre-line" }}
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\n\n\[System Context:[\s\S]*?\]/, '')
                              .replace(/\n\nCurrent Draft:\n[\s\S]*/, '')
                              .split('<').join('&lt;').split('>').join('&gt;')
                              .replace(/^\s*(?:\*|-)\s+/gm, '• ')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }}
                        />
                      </div>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "16px", flexShrink: 0, overflow: "hidden",
                        background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", marginTop: "4px"
                      }}>
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <UserCircleIcon size={20} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "16px", width: "100%", maxWidth: "85%" }}>
                      {/* Assistant Avatar */}
                      <div style={{
                        width: "32px", height: "32px", flexShrink: 0,
                        color: "#ffffff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: "4px"
                      }}>
                        <AppIcon size={28} />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", width: "100%", minWidth: 0 }}>
                        {/* Tool badges */}
                        {msg.tools && (
                          <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                            {msg.tools.map(t => (
                              <span key={t} style={{ fontSize: "11px", color: T.textMuted, background: T.surfaceHover, border: `1px solid ${T.border}`, padding: "2px 6px", fontFamily: T.font, borderRadius: "4px" }}>{t}</span>
                            ))}
                          </div>
                        )}

                        {/* Message body */}
                        <div style={{ width: "100%", color: "rgba(255,255,255,0.9)", fontSize: "15px", lineHeight: "1.6", whiteSpace: "pre-line", fontFamily: T.font }}>
                          {(() => {
                            let text = msg.content
                              .replace(/\n\n\[System Context:[\s\S]*?\]/, '')
                              .replace(/\n\nCurrent Draft:\n[\s\S]*/, '')
                              .split('<').join('&lt;').split('>').join('&gt;');
                            
                            const parts: React.ReactNode[] = [];
                            
                            // Fallback for previous messages that used "---" followed by paths like "app/"
                            let fallbackFolder = null;
                            if (text.includes('\n---\n') && text.includes('app/')) {
                               const split = text.split('\n---\n');
                               if (split.length === 2 && split[1].trim().includes('app/')) {
                                  text = split[0];
                                  fallbackFolder = split[1];
                               }
                            }

                            // Match ```folder ... ``` blocks
                            const folderRegex = /```folder\n([\s\S]*?)```/g;
                            let lastIndex = 0;
                            let match;

                            const formatText = (t: string) => t.replace(/^\s*(?:\*|-)\s+/gm, '• ').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                            while ((match = folderRegex.exec(text)) !== null) {
                              if (match.index > lastIndex) {
                                const chunk = text.substring(lastIndex, match.index);
                                parts.push(<span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatText(chunk) }} />);
                              }
                              parts.push(
                                <div key={`folder-${match.index}`} style={{ margin: "16px 0", border: `1px solid ${T.border}`, borderRadius: "8px", overflow: "hidden" }}>
                                  <FolderStructureViewer content={match[1]} />
                                </div>
                              );
                              lastIndex = folderRegex.lastIndex;
                            }

                            if (lastIndex < text.length) {
                              parts.push(<span key={`text-last`} dangerouslySetInnerHTML={{ __html: formatText(text.substring(lastIndex)) }} />);
                            }

                            if (fallbackFolder) {
                               parts.push(
                                 <div key="fallback-folder" style={{ margin: "16px 0", border: `1px solid ${T.border}`, borderRadius: "8px", overflow: "hidden" }}>
                                   <FolderStructureViewer content={fallbackFolder.trim()} />
                                 </div>
                               );
                            }

                            return parts;
                          })()}
                        </div>

                        {/* File artifact card */}
                        {msg.file && (
                          <div style={{ marginTop: "16px", border: `1px solid ${T.border}`, background: T.surface, borderRadius: "8px", overflow: "hidden" }}>
                            <FileHeader msg={msg} markdownMode={markdownMode} setMarkdownMode={setMarkdownMode} />
                            <div style={{ overflowX: "auto" }}>
                              <FileContentRenderer msg={msg} markdownMode={markdownMode} />
                            </div>

                            {/* Modify button */}
                            {msg.role === "assistant" && msg.file.language !== "dbschema" && !isSharedView && (
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

                        {/* Conversational AI Actions */}
                        {msg.emailPreview && (
                          <EmailPreviewCard
                            email={msg.emailPreview}
                            onSend={(updated) => handleSendEmail(updated, msg.id)}
                            onCancel={() => handleCancelAction(msg.id, 'email')}
                            onRefine={handleRefine}
                            isSending={msg.emailPreview.status === 'sending'}
                          />
                        )}

                        {msg.meetingPreview && (
                          <MeetingPreviewCard
                            meeting={msg.meetingPreview}
                            onSchedule={(updated) => handleScheduleMeeting(updated, msg.id)}
                            onCancel={() => handleCancelAction(msg.id, 'meeting')}
                            onRefine={handleRefine}
                            isScheduling={msg.meetingPreview.status === 'scheduling'}
                          />
                        )}

                        {/* Final Markdown Project Ready Banner & Integrations */}
                        {msg.role === "assistant" && msg.file?.language === "finalmarkdown" && !isSharedView && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                            <div style={{
                              display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
                              border: `1px dashed rgba(255, 255, 255, 0.15)`, borderRadius: "12px",
                              background: "rgba(255, 255, 255, 0.01)", cursor: "pointer", transition: "all 0.2s ease"
                            }} onClick={() => textareaRef.current?.focus()}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"; }}>
                              <span style={{ fontSize: "13px", color: T.textHint, display: "flex", alignItems: "center", gap: "8px", fontFamily: T.font }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span style={{ color: T.text, fontWeight: 500 }}>Project Ready</span>
                                •
                                Continue refining or ask questions about your project
                              </span>
                            </div>

                            <FinalSummaryCard
                              events={liveEvents}
                              githubUrl={msg.githubUrl}
                              notionUrl={msg.notionUrl}
                              jiraUrl={msg.jiraUrl}
                              sessionId={sessionId}
                            />
                          </div>
                        )}

                        {/* Option buttons */}
                        {msg.options && msg.options.length > 0 && msg.role === "assistant" && !isSharedView && (
                          <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
                            {msg.options?.map((option, i) => {
                              const isClicked = messages.some(m => m.role === "user" && m.content === option);
                              const isDisabled = isClicked || isTyping;
                              return (
                                <button key={i} onClick={() => { if (!isDisabled) handleOptionClick(option); }}
                                  style={{ padding: "6px 12px", background: isClicked ? "transparent" : T.surfaceHover, border: `1px solid ${isClicked ? T.border : T.borderHover}`, color: isClicked ? T.textHint : T.textMuted, fontSize: "12px", fontFamily: T.font, cursor: isDisabled ? "default" : "pointer", transition: "all .15s", borderRadius: "6px", opacity: isDisabled ? 0.5 : 1 }}
                                  onMouseEnter={e => { if (!isDisabled) { (e.currentTarget as HTMLButtonElement).style.background = T.text; (e.currentTarget as HTMLButtonElement).style.color = T.bg; (e.currentTarget as HTMLButtonElement).style.borderColor = T.text; } }}
                                  onMouseLeave={e => { if (!isDisabled) { (e.currentTarget as HTMLButtonElement).style.background = T.surfaceHover; (e.currentTarget as HTMLButtonElement).style.color = T.textMuted; (e.currentTarget as HTMLButtonElement).style.borderColor = T.borderHover; } }}>
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {!isSharedView && (isTyping || isExporting) && (
                <div style={{ display: "flex", gap: "16px", padding: "24px 0" }}>
                  <div style={{ width: "32px", height: "32px", flexShrink: 0, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AppIcon size={24} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", height: "24px" }}>
                    <TypingStatusText artifact={generatingArtifact} isExporting={isExporting} />
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
          <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto", pointerEvents: "auto" }}>

            {isSharedView ? (
              <>
                {/* ── Premium Read-Only Placeholder Box ── */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
                  background: "rgba(255, 255, 255, 0.01)", border: "1px dashed rgba(255, 255, 255, 0.15)",
                  borderRadius: "12px", width: "100%",
                }}>
                  <span style={{ fontSize: "13px", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    This is a shared ProdMate conversation. Fork this project to continue working on it.
                  </span>
                </div>
              </>
            ) : (
              <>
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
                  isTyping={isTyping || isExporting}
                  hasGeneratedConfig={hasGeneratedConfig}
                />
              </>
            )}
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
