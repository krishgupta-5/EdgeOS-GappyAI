"use client";

import React from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  messageId: string;
  messageContent: string;
  messageRole: string;
  contextMenuRef: React.RefObject<HTMLDivElement | null>;
  onCopy: (content: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export default function ContextMenu({
  x,
  y,
  messageId,
  messageContent,
  messageRole,
  contextMenuRef,
  onCopy,
  onEdit,
  onDelete,
}: ContextMenuProps) {
  return (
    <div
      ref={contextMenuRef}
      style={{
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        background: "#0A0A0A",
        border: "1px solid #333",
        borderRadius: "4px",
        padding: "4px 0",
        zIndex: 1000,
        minWidth: "150px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <button
        onClick={() => onCopy(messageContent)}
        style={{
          width: "100%",
          padding: "8px 16px",
          background: "transparent",
          border: "none",
          color: "#EAEAEA",
          fontSize: "11px",
          fontFamily: '"Geist Mono", monospace',
          textAlign: "left",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#222";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        COPY
      </button>
      {messageRole === "user" && (
        <button
          onClick={() => onEdit(messageId, messageContent)}
          style={{
            width: "100%",
            padding: "8px 16px",
            background: "transparent",
            border: "none",
            color: "#EAEAEA",
            fontSize: "11px",
            fontFamily: '"Geist Mono", monospace',
            textAlign: "left",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#222";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          EDIT
        </button>
      )}
      <div style={{ height: "1px", background: "#333", margin: "4px 0" }} />
      <button
        onClick={() => onDelete(messageId)}
        style={{
          width: "100%",
          padding: "8px 16px",
          background: "transparent",
          border: "none",
          color: "#ff6b6b",
          fontSize: "11px",
          fontFamily: '"Geist Mono", monospace',
          textAlign: "left",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,107,107,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        DELETE
      </button>
    </div>
  );
}
