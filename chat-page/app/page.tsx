"use client";

import React, { useState } from "react";
import Sidebar from "./chat/components/Sidebar";
import ChatPanel from "./chat/components/ChatPanel";
import LoginModal from "./chat/components/LoginModal";

const agentNames: Record<string, string> = {
  "1": "Product Architect",
  "2": "API Designer",
  "3": "Database Engineer",
  "4": "Technical Writer",
};

export default function Home() {
  const [activeAgentId, setActiveAgentId] = useState("1");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    let rafId: number;
    let lastWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const newWidth = moveEvent.clientX;
        if (newWidth >= 200 && newWidth <= 500 && newWidth !== lastWidth) {
          lastWidth = newWidth;
          setSidebarWidth(newWidth);
        }
      });
    };

    const handleMouseUp = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      {/* 
              PREMIUM DASHBOARD WRAPPER 
              Matches the ultra-dark, textured background of your screenshot 
            */}
      <div className="flex h-screen w-screen overflow-hidden relative bg-[#030303] text-foreground font-sans selection:bg-primary/30 selection:text-primary">
        {/* 
                  Subtle Texture/Noise Overlay to match the image background perfectly.
                  Creates that premium brushed/textured dark dashboard feel. 
                */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        {/* Extremely faint ambient glows to separate elements */}
        <div className="absolute top-0 left-1/4 w-[50%] h-[20%] rounded-full bg-white/5 blur-[120px] pointer-events-none z-0"></div>

        {/* Main App Layout */}
        <div className="flex flex-1 h-full w-full relative z-10">
          {/* Sidebar (Assuming its internal UI has a transparent or matching dark bg) */}
          <Sidebar
            activeAgentId={activeAgentId}
            onSelectAgent={setActiveAgentId}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            sidebarWidth={sidebarWidth}
            onResize={handleMouseDown}
            showLoginModal={showLoginModal}
            onShowLoginModal={setShowLoginModal}
          />

          {/* 
                      MAIN CONTENT AREA
                      Instead of a flat background, we wrap the ChatPanel in a "Widget Card"
                      just like the Analytics/Performance cards in your screenshot. 
                    */}
          <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-background">
            <ChatPanel
              agentName={agentNames[activeAgentId]}
              showLoginModal={showLoginModal}
              onShowLoginModal={setShowLoginModal}
            />
          </main>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={handleLoginModalClose}
        onLogin={handleLoginRedirect}
      />
    </>
  );
}
