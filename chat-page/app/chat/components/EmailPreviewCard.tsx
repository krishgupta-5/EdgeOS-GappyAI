"use client";

import React, { useState, useEffect } from "react";
import type { EmailPreview } from "@/lib/pipeline/types";

// Design Tokens (Onyx Minimal Palette)
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

interface EmailPreviewCardProps {
  email: EmailPreview;
  onSend: (updatedEmail: EmailPreview) => void;
  onCancel: () => void;
  onRefine: (prompt: string, currentState: EmailPreview) => void;
  isSending?: boolean;
}

export default function EmailPreviewCard({ email, onSend, onCancel, onRefine, isSending }: EmailPreviewCardProps) {
  const [localEmail, setLocalEmail] = useState<EmailPreview>(email);

  useEffect(() => {
    // If the external email prop updates (e.g., from backend refinement), sync it if it's in preview mode
    if (email.status === 'preview') {
      setLocalEmail(email);
    }
  }, [email]);

  const handleChange = (field: keyof EmailPreview, value: string) => {
    setLocalEmail(prev => ({ ...prev, [field]: value }));
  };

  const chips = [
    "Make Shorter",
    "Make Professional",
    "Friendly Tone",
    "Formal Tone",
    "Improve Grammar",
    "Add Call To Action"
  ];

  if (email.status === 'cancelled') {
    return (
      <div style={{
        marginTop: "16px", background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: "12px", padding: "20px", fontFamily: T.font, color: T.text,
        display: "flex", flexDirection: "column", gap: "12px", width: "100%",
        animation: "fadeIn 0.3s ease-in-out"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ background: "rgba(161, 161, 170, 0.1)", color: T.textMuted, borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px", color: T.textMuted }}>Draft Cancelled</span>
        </div>
      </div>
    );
  }

  if (email.status === 'sent') {
    return (
      <div style={{
        marginTop: "16px", background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: "12px", padding: "20px", fontFamily: T.font, color: T.text,
        display: "flex", flexDirection: "column", gap: "12px", width: "100%",
        animation: "fadeIn 0.3s ease-in-out"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✓
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px", color: "#10b981" }}>Email Sent Successfully</span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "8px", fontSize: "14px", marginTop: "8px" }}>
          <div style={{ color: T.textMuted }}>To:</div>
          <div style={{ color: T.text }}>{email.recipient}</div>
          <div style={{ color: T.textMuted }}>Subject:</div>
          <div style={{ color: T.text, fontWeight: 500 }}>{email.subject}</div>
          <div style={{ color: T.textMuted }}>Sent:</div>
          <div style={{ color: T.text }}>{email.sentAt ? new Date(email.sentAt).toLocaleString() : 'Just now'}</div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "12px", borderTop: `1px solid ${T.border}`, paddingTop: "16px" }}>
          <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 16px", background: T.surfaceHover, color: T.text, border: `1px solid ${T.border}`,
              borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
            }} onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHover} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              View in Gmail ↗
            </button>
          </a>
          <button style={{
            padding: "8px 16px", background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`,
            borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
          }} 
          onClick={(e) => {
             const target = e.currentTarget;
             navigator.clipboard.writeText(`To: ${email.recipient}\nSubject: ${email.subject}\n\n${email.body}`);
             target.innerText = "Copied!";
             setTimeout(() => { target.innerText = "Copy Details" }, 2000);
          }}
          onMouseEnter={e => e.currentTarget.style.color = T.text} onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
            Copy Details
          </button>
        </div>

        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px dashed ${T.border}` }}>
          <div style={{ fontSize: "12px", color: T.textHint, marginBottom: "8px", fontWeight: 500 }}>SUGGESTED NEXT ACTIONS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["Schedule Follow-up Meeting", "Export to GitHub", "Export to Jira", "Export to Notion", "Generate Client Proposal"].map(action => (
              <button key={action}
                onClick={() => onRefine(action, email)}
                style={{
                  padding: "4px 10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderHover}`,
                  borderRadius: "12px", fontSize: "12px", color: T.textMuted, cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = T.textMuted; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isSendingOrScheduled = email.status === 'sending' || isSending;

  return (
    <div style={{
      marginTop: "16px", background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: "12px", padding: "20px", fontFamily: T.font, color: T.text,
      display: "flex", flexDirection: "column", gap: "12px", width: "100%",
      animation: "fadeIn 0.3s ease-in-out"
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Email Draft</span>
        </div>
        {email.status === 'preview' && <span style={{ fontSize: "12px", color: T.textHint }}>Editable</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "12px", alignItems: "center", fontSize: "14px" }}>
        <div style={{ color: T.textMuted }}>To:</div>
        <input 
          value={localEmail.recipient}
          onChange={(e) => handleChange('recipient', e.target.value)}
          disabled={isSendingOrScheduled}
          style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, color: T.text, outline: "none", padding: "4px 0", fontSize: "14px", fontFamily: T.font }}
        />
        
        <div style={{ color: T.textMuted }}>Subject:</div>
        <input 
          value={localEmail.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          disabled={isSendingOrScheduled}
          style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, color: T.text, outline: "none", padding: "4px 0", fontSize: "14px", fontFamily: T.font, fontWeight: 500 }}
        />
      </div>

      <textarea
        value={localEmail.body}
        onChange={(e) => handleChange('body', e.target.value)}
        disabled={isSendingOrScheduled}
        style={{
          marginTop: "8px", padding: "16px", background: "rgba(255,255,255,0.02)",
          border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "14px",
          lineHeight: "1.6", color: T.textMuted, width: "100%", boxSizing: "border-box",
          minHeight: "150px", resize: "vertical", fontFamily: T.font, outline: "none"
        }}
      />

      {email.status === 'preview' && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
            {chips.map(chip => (
              <button key={chip} 
                onClick={() => onRefine(chip, localEmail)}
                disabled={isSendingOrScheduled}
                style={{
                  padding: "4px 10px", background: T.surfaceHover, border: `1px solid ${T.border}`,
                  borderRadius: "12px", fontSize: "12px", color: T.textMuted, cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.textHint; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.border; }}
              >
                {chip}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px", borderTop: `1px solid ${T.border}`, paddingTop: "16px" }}>
            <button
              onClick={() => onSend(localEmail)}
              disabled={isSendingOrScheduled}
              style={{
                padding: "8px 16px", background: T.text, color: T.bg, border: "none", borderRadius: "6px",
                fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px",
                cursor: isSendingOrScheduled ? "not-allowed" : "pointer", opacity: isSendingOrScheduled ? 0.7 : 1, transition: "opacity 0.2s"
              }}
            >
              {isSendingOrScheduled && (
                <div style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              )}
              {isSendingOrScheduled ? "Sending..." : "Approve & Send"}
            </button>
            {!isSendingOrScheduled && (
              <button
                onClick={onCancel}
                style={{
                  padding: "8px 16px", background: "transparent", color: T.text, border: `1px solid ${T.borderHover}`,
                  borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer"
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
