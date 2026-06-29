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
  const [collapsedPaths, setCollapsedPaths] = React.useState<Set<number>>(new Set());

  // Filter out sentences and markdown text to only show actual tree/files
  const rawLines = (content ?? "").split("\n");
  const lines = rawLines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;

    const name = trimmed.replace(/^[\s│├└─|`'\-\*]+/, "");
    if (!name) return false;

    if (name.startsWith("#")) return false;

    const spacesCount = (name.match(/ /g) || []).length;
    if (spacesCount > 2) return false;

    if (name.length > 50) return false;

    return true;
  });

  const getFileIconAndColor = (filename: string, isFolder: boolean) => {
    if (isFolder) {
      if (filename.toLowerCase() === '.github') {
        return { color: "#A1A1AA", icon: <IconBrandGithub size={16} /> };
      }
      return { color: "#60A5FA", icon: <IconFolderFilled size={16} /> };
    }

    const lowerName = filename.toLowerCase();
    
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

    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': return { color: "#3178C6", icon: <IconBrandTypescript size={16} /> };
      case 'tsx': return { color: "#61DAFB", icon: <IconBrandReact size={16} /> };
      case 'js':
      case 'jsx': return { color: "#F7DF1E", icon: <IconBrandJavascript size={16} /> };
      case 'json': return { color: "#4ADE80", icon: <IconJson size={16} /> };
      case 'md':
      case 'mdx': return { color: "#A1A1AA", icon: <IconMarkdown size={16} /> };
      case 'css':
      case 'scss': return { color: "#38BDF8", icon: <IconBrandCss3 size={16} /> };
      case 'py': return { color: "#3776AB", icon: <IconBrandPython size={16} /> };
      case 'sql':
      case 'db': return { color: "#F87171", icon: <IconDatabase size={16} /> };
      case 'txt': return { color: "#A1A1AA", icon: <IconFileTypeTxt size={16} /> };
      default: return { color: "#D4D4D8", icon: <IconFileCode size={16} /> };
    }
  };

  const parsedLines = lines.map((line, i) => {
    const trimmed = line.trimEnd();
    const treeMatch = trimmed.match(/^[\s│├└─|`'\-\*]+/);
    const treePrefix = treeMatch ? treeMatch[0] : "";
    const nodeName = trimmed.slice(treePrefix.length);

    const isRootProject = i === 0;
    const isFolder = nodeName.endsWith("/") || (!nodeName.includes('.') && nodeName.trim().length > 0);
    const cleanNodeName = nodeName.replace(/\/$/, '');
    
    const depth = isRootProject ? -1 : treePrefix.length;
    
    let indentPx = treePrefix.length === 0 && i > 0 ? 28 : 8;
    if (treePrefix.length > 0) {
       indentPx += treePrefix.length * 8;
    }

    return {
      index: i,
      cleanNodeName,
      isFolder,
      depth,
      indentPx,
      isRootProject,
      treePrefix
    };
  });

  const toggleFolder = (index: number) => {
    setCollapsedPaths(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const visibleLines = [];
  let collapseDepthThreshold = Infinity;

  for (let i = 0; i < parsedLines.length; i++) {
    const node = parsedLines[i];
    
    if (node.depth <= collapseDepthThreshold) {
      collapseDepthThreshold = Infinity;
      visibleLines.push(node);
      
      if (node.isFolder && collapsedPaths.has(node.index)) {
        collapseDepthThreshold = node.depth;
      }
    }
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "13px",
        padding: "12px 16px",
        background: "#0d0d0f",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
      }}
    >
      <style>{`
        .vsc-row {
          display: flex;
          align-items: center;
          height: 26px;
          cursor: pointer;
          user-select: none;
          padding-right: 12px;
          border-radius: 4px;
          transition: background-color 0.15s ease;
        }
        .vsc-row:hover {
          background-color: rgba(255, 255, 255, 0.06);
        }
      `}</style>
      {visibleLines.map((node) => {
        const { index, cleanNodeName, isFolder, indentPx, isRootProject } = node;
        const { color, icon } = getFileIconAndColor(cleanNodeName, isFolder);
        const isCollapsed = collapsedPaths.has(index);

        return (
          <div 
            key={index} 
            className="vsc-row" 
            style={{ paddingLeft: `${indentPx}px` }}
            onClick={() => isFolder && toggleFolder(index)}
          >
            <div style={{ width: "16px", display: "flex", justifyContent: "center", flexShrink: 0, marginRight: "4px" }}>
              {isFolder ? (
                <svg 
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  style={{ 
                    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", 
                    transition: "transform 0.15s ease" 
                  }}
                >
                  <path d="M4 6L8 10L12 6" stroke="#858585" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : null}
            </div>
            
            <span style={{ color, opacity: 0.9, marginRight: "6px", display: "flex" }}>{icon}</span>
            <span
              style={{
                color: isRootProject ? "#FAFAFA" : (isFolder ? "#E4E4E7" : "#D4D4D8"),
                fontWeight: isRootProject ? 600 : (isFolder ? 500 : 400),
                letterSpacing: isRootProject ? "0.3px" : "0.2px"
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
