"use client";

import React from "react";
import { 
  IconBrandDocker, 
  IconBrandTypescript, 
  IconBrandJavascript, 
  IconBrandPython,
  IconBrandCss3,
  IconBrandGithub,
  IconFileTypePdf,
  IconFileTypeTxt,
  IconSettings,
  IconFileCode,
  IconFileText,
  IconFileDescription,
  IconFolderFilled,
  IconLock,
  IconJson,
  IconMarkdown,
  IconDatabase,
  IconBrandReact
} from "@tabler/icons-react";

interface FolderStructureViewerProps {
  content: string;
}

export default function FolderStructureViewer({
  content,
}: FolderStructureViewerProps) {
  const lines = (content ?? "").split("\n");

  const getFileIconAndColor = (filename: string, isFolder: boolean) => {
    if (isFolder) {
      // Github folder
      if (filename.toLowerCase() === '.github') {
        return { color: "#A1A1AA", icon: <IconBrandGithub size={16} /> };
      }
      return {
        color: "#60A5FA", // Blue for folders
        icon: <IconFolderFilled size={16} />
      };
    }

    const lowerName = filename.toLowerCase();
    
    // Exact file name matches
    if (lowerName === 'dockerfile' || lowerName.includes('docker-compose')) {
      return { color: "#2496ED", icon: <IconBrandDocker size={16} /> };
    }
    if (lowerName === 'package.json') {
      return { color: "#4ADE80", icon: <IconJson size={16} /> };
    }
    if (lowerName === 'package-lock.json' || lowerName === 'yarn.lock') {
      return { color: "#A1A1AA", icon: <IconLock size={16} /> };
    }
    if (lowerName === '.gitignore' || lowerName === '.gitattributes') {
      return { color: "#F05032", icon: <IconBrandGithub size={16} /> };
    }
    if (lowerName.startsWith('.env')) {
      return { color: "#FDE047", icon: <IconSettings size={16} /> };
    }
    if (lowerName === 'readme.md' || lowerName === 'readme') {
      return { color: "#38BDF8", icon: <IconFileDescription size={16} /> };
    }
    if (lowerName.includes('config') || lowerName.includes('.rc')) {
      return { color: "#A1A1AA", icon: <IconSettings size={16} /> };
    }

    // Extension matches
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
        return { color: "#3178C6", icon: <IconBrandTypescript size={16} /> };
      case 'tsx':
        return { color: "#61DAFB", icon: <IconBrandReact size={16} /> };
      case 'js':
      case 'jsx':
        return { color: "#F7DF1E", icon: <IconBrandJavascript size={16} /> };
      case 'json':
        return { color: "#4ADE80", icon: <IconJson size={16} /> };
      case 'md':
      case 'mdx':
        return { color: "#A1A1AA", icon: <IconMarkdown size={16} /> };
      case 'css':
      case 'scss':
        return { color: "#38BDF8", icon: <IconBrandCss3 size={16} /> };
      case 'py':
        return { color: "#3776AB", icon: <IconBrandPython size={16} /> };
      case 'sql':
      case 'db':
        return { color: "#F87171", icon: <IconDatabase size={16} /> };
      case 'txt':
        return { color: "#A1A1AA", icon: <IconFileTypeTxt size={16} /> };
      default:
        return { color: "#D4D4D8", icon: <IconFileCode size={16} /> };
    }
  };

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "13px",
        padding: "8px 0",
        background: "#18181b", // Matches a VS Code dark theme background closely
        borderRadius: "6px",
      }}
    >
      <style>{`
        .vsc-row {
          display: flex;
          align-items: center;
          height: 22px;
          cursor: pointer;
          user-select: none;
          padding-right: 12px;
        }
        .vsc-row:hover {
          background-color: #2a2d2e;
        }
      `}</style>
      {lines.map((line, i) => {
        const trimmed = line.trimEnd();

        // Render empty lines as spacing
        if (!trimmed) return <div key={i} style={{ height: "12px" }} />;

        // Robust regex to match standard ASCII and UTF-8 tree line characters
        const treeMatch = trimmed.match(/^[\s│├└─|`'\-\*]+/);
        const treePrefix = treeMatch ? treeMatch[0] : "";
        const nodeName = trimmed.slice(treePrefix.length);

        const isRootProject = i === 0;

        // It's a folder if it ends with a slash or has no extension
        const isFolder = nodeName.endsWith("/") || (!nodeName.includes('.') && nodeName.trim().length > 0);
        const cleanNodeName = nodeName.replace(/\/$/, '');
        
        const { color, icon } = getFileIconAndColor(cleanNodeName, isFolder);

        if (isRootProject) {
          return (
            <div key={i} className="vsc-row" style={{ paddingLeft: "8px" }}>
              <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0, marginRight: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="#858585" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ color, opacity: 0.9, marginRight: "6px", display: "flex" }}>{icon}</span>
              <span style={{ color: "#FAFAFA", fontWeight: 600, letterSpacing: "0.3px" }}>
                {cleanNodeName}
              </span>
            </div>
          );
        }

        // Base VS Code indent padding. If it's a flat list item inside the root, give it a base indent of 24px
        let indentPx = treePrefix.length === 0 && i > 0 ? 28 : 8;
        
        if (treePrefix.length > 0) {
           indentPx += treePrefix.length * 8;
        }

        return (
          <div key={i} className="vsc-row" style={{ paddingLeft: `${indentPx}px` }}>
            
            <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0, marginRight: "4px" }}>
              {isFolder ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="#858585" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : null}
            </div>
            
            <span style={{ color, opacity: 0.9, marginRight: "6px", display: "flex" }}>{icon}</span>
            <span
              style={{
                color: isFolder ? "#E4E4E7" : "#D4D4D8",
                fontWeight: isFolder ? 500 : 400,
                letterSpacing: "0.2px"
              }}
            >
              {cleanNodeName}
            </span>
          </div>
        );
      })}
    </div>
  );
}
