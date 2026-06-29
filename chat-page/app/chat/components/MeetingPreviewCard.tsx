"use client";

import React, { useState, useEffect } from "react";
import type { MeetingPreview } from "@/lib/pipeline/types";

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

interface MeetingPreviewCardProps {
  meeting: MeetingPreview;
  onSchedule: (updatedMeeting: MeetingPreview) => void;
  onCancel: () => void;
  onRefine: (prompt: string, currentState: MeetingPreview) => void;
  isScheduling?: boolean;
}

export default function MeetingPreviewCard({ meeting, onSchedule, onCancel, onRefine, isScheduling }: MeetingPreviewCardProps) {
  const [localMeeting, setLocalMeeting] = useState<MeetingPreview>(meeting);

  useEffect(() => {
    if (meeting.status === 'preview') {
      setLocalMeeting(meeting);
    }
  }, [meeting]);

  const handleChange = (field: keyof MeetingPreview, value: string | number) => {
    setLocalMeeting(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestsChange = (val: string) => {
    setLocalMeeting(prev => ({ ...prev, guests: val.split(",").map(s => s.trim()) }));
  };

  const chips = [
    "Move Tomorrow",
    "Make 30 Minutes",
    "Add Google Meet",
    "Add Agenda",
    "Invite Team",
    "Change Time"
  ];

  if (meeting.status === 'cancelled') {
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
          <span style={{ fontWeight: 600, fontSize: "15px", color: T.textMuted }}>Meeting Draft Cancelled</span>
        </div>
      </div>
    );
  }

  if (meeting.status === 'scheduled') {
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
          <span style={{ fontWeight: 600, fontSize: "15px", color: "#10b981" }}>Meeting Scheduled Successfully</span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "8px", fontSize: "14px", marginTop: "8px" }}>
          <div style={{ color: T.textMuted }}>Title:</div>
          <div style={{ color: T.text, fontWeight: 500 }}>{meeting.title}</div>
          <div style={{ color: T.textMuted }}>When:</div>
          <div style={{ color: T.text }}>{meeting.date} at {meeting.time} ({meeting.duration} mins)</div>
          <div style={{ color: T.textMuted }}>Guests:</div>
          <div style={{ color: T.text }}>{meeting.guests.join(", ")}</div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "12px", borderTop: `1px solid ${T.border}`, paddingTop: "16px" }}>
          <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 16px", background: T.surfaceHover, color: T.text, border: `1px solid ${T.border}`,
              borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
            }} onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHover} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              Open Calendar ↗
            </button>
          </a>
          {meeting.meetLink && (
            <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "8px 16px", background: "#3b82f6", color: "#ffffff", border: `1px solid #2563eb`,
                borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
              }} onMouseEnter={e => e.currentTarget.style.background = "#2563eb"} onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}>
                Join Meet
              </button>
            </a>
          )}
          <button style={{
            padding: "8px 16px", background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`,
            borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
          }} 
          onClick={(e) => {
             const target = e.currentTarget;
             navigator.clipboard.writeText(`Meeting: ${meeting.title}\nWhen: ${meeting.date} at ${meeting.time}\nGuests: ${meeting.guests.join(", ")}\nAgenda: ${meeting.agenda}\nMeet: ${meeting.meetLink || 'N/A'}`);
             target.innerText = "Copied!";
             setTimeout(() => { target.innerText = "Copy Invite" }, 2000);
          }}
          onMouseEnter={e => e.currentTarget.style.color = T.text} onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
            Copy Invite
          </button>
        </div>

        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px dashed ${T.border}` }}>
          <div style={{ fontSize: "12px", color: T.textHint, marginBottom: "8px", fontWeight: 500 }}>SUGGESTED NEXT ACTIONS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["Send Meeting Summary", "Generate Action Items", "Update Timeline", "Notify Team"].map(action => (
              <button key={action}
                onClick={() => onRefine(action, meeting)}
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

  const isSchedulingOrScheduled = meeting.status === 'scheduling' || isScheduling;

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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Meeting Draft</span>
        </div>
        {meeting.status === 'preview' && <span style={{ fontSize: "12px", color: T.textHint }}>Editable</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "12px", alignItems: "center", fontSize: "14px" }}>
        <div style={{ color: T.textMuted }}>Title:</div>
        <input 
          value={localMeeting.title}
          onChange={(e) => handleChange('title', e.target.value)}
          disabled={isSchedulingOrScheduled}
          style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, color: T.text, outline: "none", padding: "4px 0", fontSize: "14px", fontFamily: T.font, fontWeight: 500 }}
        />
        
        <div style={{ color: T.textMuted }}>When:</div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input 
            type="date"
            value={localMeeting.date}
            onChange={(e) => handleChange('date', e.target.value)}
            disabled={isSchedulingOrScheduled}
            style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text, outline: "none", padding: "4px 8px", fontSize: "14px", fontFamily: T.font, borderRadius: "6px" }}
          />
          <input 
            type="time"
            value={localMeeting.time}
            onChange={(e) => handleChange('time', e.target.value)}
            disabled={isSchedulingOrScheduled}
            style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text, outline: "none", padding: "4px 8px", fontSize: "14px", fontFamily: T.font, borderRadius: "6px" }}
          />
          <input 
            type="number"
            value={localMeeting.duration}
            onChange={(e) => handleChange('duration', parseInt(e.target.value) || 30)}
            disabled={isSchedulingOrScheduled}
            style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text, outline: "none", padding: "4px 8px", fontSize: "14px", fontFamily: T.font, borderRadius: "6px", width: "60px" }}
          /> <span style={{ color: T.textMuted }}>mins</span>
        </div>

        <div style={{ color: T.textMuted }}>Guests:</div>
        <input 
          value={localMeeting.guests.join(", ")}
          onChange={(e) => handleGuestsChange(e.target.value)}
          disabled={isSchedulingOrScheduled}
          placeholder="email1@example.com, email2@example.com"
          style={{ background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, color: T.text, outline: "none", padding: "4px 0", fontSize: "14px", fontFamily: T.font }}
        />
      </div>

      <div style={{ marginTop: "8px", padding: "16px", background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}`, borderRadius: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <div style={{ fontWeight: 500, color: T.text, marginBottom: "4px", fontSize: "13px" }}>Agenda:</div>
          <textarea
            value={localMeeting.agenda}
            onChange={(e) => handleChange('agenda', e.target.value)}
            disabled={isSchedulingOrScheduled}
            style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "6px", color: T.textMuted, outline: "none", padding: "8px", fontSize: "13px", fontFamily: T.font, width: "100%", boxSizing: "border-box", minHeight: "60px", resize: "vertical" }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 500, color: T.text, marginBottom: "4px", fontSize: "13px" }}>Description:</div>
          <textarea
            value={localMeeting.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isSchedulingOrScheduled}
            style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: "6px", color: T.textMuted, outline: "none", padding: "8px", fontSize: "13px", fontFamily: T.font, width: "100%", boxSizing: "border-box", minHeight: "80px", resize: "vertical" }}
          />
        </div>
      </div>

      {meeting.status === 'preview' && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
            {chips.map(chip => (
              <button key={chip} 
                onClick={() => onRefine(chip, localMeeting)}
                disabled={isSchedulingOrScheduled}
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
              onClick={() => onSchedule(localMeeting)}
              disabled={isSchedulingOrScheduled}
              style={{
                padding: "8px 16px", background: T.text, color: T.bg, border: "none", borderRadius: "6px",
                fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px",
                cursor: isSchedulingOrScheduled ? "not-allowed" : "pointer", opacity: isSchedulingOrScheduled ? 0.7 : 1, transition: "opacity 0.2s"
              }}
            >
              {isSchedulingOrScheduled && (
                <div style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              )}
              {isSchedulingOrScheduled ? "Scheduling..." : "Approve & Schedule"}
            </button>
            {!isSchedulingOrScheduled && (
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
