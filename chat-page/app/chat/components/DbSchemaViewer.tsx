"use client";

import React, { useState, useEffect, useRef } from "react";

interface DbSchemaViewerProps {
  mermaid: string;
  diagram?: string;
}

type ViewMode = "diagram" | "source";

export default function DbSchemaViewer({
  mermaid: mermaidSource,
}: DbSchemaViewerProps) {
  const [mode, setMode] = useState<ViewMode>("diagram");
  const [isExpanded, setIsExpanded] = useState(false);
  const [mermaidSvg, setMermaidSvg] = useState<string>("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const lines = mermaidSource.split('\n');
  const cleanedLines = lines.map(line => {
    let cleaned = line;
    
    // e.g. " |{ " or "|{" (without dashes or dots) -> " ||--o{ "
    cleaned = cleaned.replace(/(?<![-.])\s*\|\{\s*/g, ' ||--o{ ');
    
    // e.g. " }| " or "}|" (without dashes or dots) -> " }o--|| "
    cleaned = cleaned.replace(/\s*\}\|\s*(?![-.])/g, ' }o--|| ');

    // Fix LLM generating two relationships joined by .. (e.g. }o--|| .. ||--o{)
    cleaned = cleaned.replace(/--\|\|\s*\.\.\s*\|\|--/g, '--');

    // If it has a colon, it's a relationship label. Fix unquoted labels.
    if (cleaned.includes(':') && (!cleaned.includes('{') || cleaned.includes('||--'))) {
      // Strip trailing brace if the LLM wrongly wrapped the relationship line
      cleaned = cleaned.replace(/\}\s*$/, '');
      
      // Add quotes if the label is unquoted
      cleaned = cleaned.replace(/:\s*([^"\n\r]+)\s*$/, (match, p1) => {
          return ': "' + p1.trim() + '"';
      });
    }
    
    return cleaned;
  });
  
  let cleanSource = cleanedLines.join('\n');

  const processedMermaid = cleanSource.includes("direction")
    ? cleanSource
    : cleanSource.replace("erDiagram", "erDiagram\n    direction LR");

  const fitToScreen = (svgWidth: number, svgHeight: number) => {
    if (!containerRef.current || svgWidth === 0 || svgHeight === 0) return;
    const padding = 100;
    const scaleX = (containerRef.current.clientWidth - padding) / svgWidth;
    const scaleY = (containerRef.current.clientHeight - padding) / svgHeight;
    setScale(Math.min(scaleX, scaleY, 1.5));
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!processedMermaid.trim().startsWith("erDiagram")) return;

    const renderMermaid = async () => {
      setIsLoaded(false);
      try {
        setParseError(null);
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#171717",
            primaryTextColor: "#FAFAFA",
            lineColor: "#52525B",
            mainBkg: "transparent",
            entityBkg: "#171717",
            entityBorder: "#27272A",
          },
          er: {
            useMaxWidth: false,
            diagramPadding: 80,
            layoutDirection: "LR",
            minEntityHeight: 30,
            minEntityWidth: 160,
          },
          fontFamily: '"Geist Mono", monospace',
        });

        const id = `er-diag-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, processedMermaid);

        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, "image/svg+xml");
        const svgEl = doc.querySelector("svg");

        let width = 0;
        let height = 0;

        if (svgEl) {
          const vb = svgEl.getAttribute("viewBox");
          if (vb) {
            const parts = vb.split(/[\s,]+/);
            width = parseFloat(parts[2]) || 0;
            height = parseFloat(parts[3]) || 0;
          }
          if (width && height) {
            svgEl.setAttribute("width", `${width}px`);
            svgEl.setAttribute("height", `${height}px`);
            svgEl.style.width = `${width}px`;
            svgEl.style.height = `${height}px`;
          }
          svgEl.style.maxWidth = "none";
          svgEl.style.maxHeight = "none";
          svgEl.style.overflow = "visible";
          setMermaidSvg(new XMLSerializer().serializeToString(svgEl));
          setSvgDimensions({ width, height });
        } else {
          setMermaidSvg(svg);
        }

        setTimeout(() => setIsLoaded(true), 50);
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        setParseError(String(error));
      }
    };

    renderMermaid();
  }, [processedMermaid, isExpanded]);

  useEffect(() => {
    if (!isLoaded || svgDimensions.width === 0 || !containerRef.current) return;

    const observer = new ResizeObserver(() => {
      fitToScreen(svgDimensions.width, svgDimensions.height);
    });
    observer.observe(containerRef.current);
    fitToScreen(svgDimensions.width, svgDimensions.height);

    return () => observer.disconnect();
  }, [isLoaded, svgDimensions.width, svgDimensions.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === "source") return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || mode === "source") return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const resetView = () =>
    fitToScreen(svgDimensions.width, svgDimensions.height);
  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.1));

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: isExpanded ? "85vh" : "550px",
    overflow: "hidden",
    clipPath: "inset(0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#09090B", // Darker, cleaner background
    // Subtle, elegant dotted background like Excalidraw/Figma
    backgroundImage: "radial-gradient(circle, #27272A 1px, transparent 1px)",
    backgroundSize: "24px 24px",
    borderRadius: "12px", // Softer corners
    border: "1px solid #27272A", // Brighter border for definition
    transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smoother transition
    boxSizing: "border-box",
    position: "relative",
    zIndex: 1,
    cursor: mode === "source" ? "default" : isDragging ? "grabbing" : "grab",
  };

  const renderContent = () => {
    if (mode === "source" || parseError) {
      return (
        <div
          style={{
            ...containerStyle,
            backgroundColor: "#000000",
            backgroundImage: "none",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            padding: "24px",
            overflow: "auto",
            flexDirection: "column",
          }}
        >
          {parseError && mode === "diagram" && (
            <div style={{ color: "#ef4444", marginBottom: "16px", fontSize: "12px", fontFamily: '"Geist Mono", monospace' }}>
              <strong>Mermaid Parse Error:</strong><br/>
              {parseError.split('\n')[0]}<br/><br/>
              <em>Displaying raw ER text instead:</em>
            </div>
          )}
          <pre
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#A78BFA",
              fontFamily: '"Geist Mono",monospace',
              whiteSpace: "pre-wrap",
            }}
          >
            {processedMermaid}
          </pre>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
          }}
        >
          <div
            ref={wrapperRef}
            className="mermaid-wrapper"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center",
              transition: isDragging
                ? "none"
                : "transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: "none",
            }}
            dangerouslySetInnerHTML={{ __html: mermaidSvg }}
          />
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .mermaid-wrapper svg, [data-mermaid] svg { overflow: visible !important; }
          /* Colored entities for better visual parsing */
          text.er.entityName { fill: #60A5FA !important; font-size: 15px !important; font-weight: 700 !important; font-family: "Geist Mono", monospace !important; letter-spacing: 0.5px; }
          /* Sleeker relationship lines */
          path.er.relationshipLine { stroke: #52525B !important; stroke-width: 2px !important; }
          /* Slightly brighter attributes */
          text.er.attributeBox { font-size: 13px !important; fill: #A1A1AA !important; font-family: "Geist Mono", monospace !important; }
          /* Box background tuning */
          rect.er.entityBox { fill: #18181B !important; stroke: #27272A !important; stroke-width: 2px !important; rx: 4px !important; ry: 4px !important; }
        `,
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Top Control Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* View Mode Toggle */}
        <div
          style={{
            display: "flex",
            background: "#09090B",
            borderRadius: "8px",
            padding: "4px",
            border: "1px solid #27272A",
          }}
        >
          {(["diagram", "source"] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "8px 16px",
                background: mode === m ? "#27272A" : "transparent",
                border: "none",
                borderRadius: "4px",
                color: mode === m ? "#FAFAFA" : "#A1A1AA",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                fontFamily: '"Geist Mono", monospace',
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Zoom Controls */}
          {mode === "diagram" && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
                background: "#09090B",
                padding: "4px",
                borderRadius: "8px",
                border: "1px solid #27272A",
              }}
            >
              <button onClick={zoomOut} style={controlButtonStyle}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                </svg>
              </button>
              <button
                onClick={resetView}
                style={{
                  ...controlButtonStyle,
                  fontSize: "10px",
                  width: "auto",
                  padding: "0 12px",
                  letterSpacing: "0.5px",
                }}
              >
                FIT
              </button>
              <button onClick={zoomIn} style={controlButtonStyle}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </button>
            </div>
          )}

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: isExpanded ? "#3B82F615" : "#09090B",
              border: `1px solid ${isExpanded ? "#3B82F650" : "#27272A"}`,
              color: isExpanded ? "#60A5FA" : "#D4D4D8",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "11px",
              cursor: "pointer",
              fontWeight: 600,
              textTransform: "uppercase",
              fontFamily: '"Geist Mono", monospace',
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              letterSpacing: "0.5px",
            }}
          >
            {isExpanded ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                  <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                  <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                  <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                </svg>
                Collapse
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6" />
                  <path d="M9 21H3v-6" />
                  <path d="M21 3l-7 7" />
                  <path d="M3 21l7-7" />
                </svg>
                Expand
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diagram Canvas */}
      {renderContent()}

      {/* Footer Info Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "11px",
            color: "#71717A",
            fontFamily: '"Geist Mono", monospace',
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          <span>Scale: {Math.round(scale * 100)}%</span>
          {svgDimensions.width > 0 && (
            <span style={{ color: "#52525B" }}>
              Native Size: {Math.round(svgDimensions.width)} ×{" "}
              {Math.round(svgDimensions.height)}px
            </span>
          )}
        </div>

        {mode === "diagram" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "10px",
              color: "#A1A1AA",
              fontFamily: '"Geist Mono", monospace',
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: "0.5px",
              background: "#09090B",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #27272A",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 9 7-7 7 7" />
              <path d="M12 2v20" />
              <path d="m5 15 7 7 7-7" />
            </svg>
            Drag to pan
          </div>
        )}
      </div>
    </div>
  );
}

const controlButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#A1A1AA",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: '"Geist Mono", monospace',
  fontSize: "14px",
  fontWeight: 600,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
};

// Quick injection to handle hover states purely in React
if (typeof window !== "undefined") {
  document.head.insertAdjacentHTML(
    "beforeend",
    `
    <style>
      button[style*="controlButtonStyle"]:hover { background: #27272A !important; color: #FAFAFA !important; }
      button:hover { opacity: 0.9; }
    </style>
  `,
  );
}
