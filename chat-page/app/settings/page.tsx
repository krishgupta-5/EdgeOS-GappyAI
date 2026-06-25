"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, SignOutButton, useClerk } from "@clerk/nextjs";

// ── Luro Design Tokens ────────────────────────────────────────────────────────
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

type Tab = "profile" | "preferences" | "security" | "billing";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        overflowY: "auto",
        backgroundColor: T.bg,
        color: T.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 24px 60px",
        fontFamily: T.font,
      }}
    >
      {/* ───────────────────────────────────────────── */}
      {/* PAGE HEADER                                   */}
      {/* ───────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1024px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "48px",
          paddingBottom: "24px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <Link href="/chat" style={{ textDecoration: "none" }}>
          <button
            style={{
              width: "36px",
              height: "36px",
              background: "transparent",
              border: `1px solid ${T.borderHover}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              cursor: "pointer",
              color: T.textHint,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = T.text;
              e.currentTarget.style.background = T.surfaceHover;
              e.currentTarget.style.borderColor = T.textHint;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = T.textHint;
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = T.borderHover;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        </Link>

        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: T.text,
              fontFamily: T.font,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Settings
          </div>
          <p
            style={{
              color: T.textMuted,
              fontSize: "13px",
              marginTop: "6px",
              lineHeight: "1.5",
              margin: "6px 0 0 0",
            }}
          >
            Manage your workspace configuration, identity, and system preferences.
          </p>
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* MAIN LAYOUT                                   */}
      {/* ───────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1024px",
          display: "flex",
          flexDirection: "row",
          gap: "64px",
          flexWrap: "wrap",
        }}
      >
        {/* SIDEBAR NAVIGATION */}
        <aside
          style={{
            width: "240px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: T.textHint,
              fontFamily: T.font,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px",
              paddingLeft: "16px",
              fontWeight: 600,
            }}
          >
            Configuration
          </div>
          <NavButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} label="User Profile" />
          <NavButton active={activeTab === "preferences"} onClick={() => setActiveTab("preferences")} label="Preferences" />
          <NavButton active={activeTab === "security"} onClick={() => setActiveTab("security")} label="Security" />
          <NavButton active={activeTab === "billing"} onClick={() => setActiveTab("billing")} label="Usage & Billing" />
        </aside>

        {/* CONTENT AREA */}
        <main style={{ flex: 1, minWidth: "300px" }}>
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "preferences" && <PreferencesSection />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "billing" && <BillingSection />}
        </main>
      </div>

      {/* GLOBAL ANIMATIONS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pipFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-SECTIONS
// ─────────────────────────────────────────────

function ProfileSection() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div style={{ animation: "pipFade 0.2s ease-out forwards" }}>
        <SectionHeader title="User Profile" description="Loading user profile..." />
      </div>
    );
  }

  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");
  const displayName = user.fullName || "";
  const email = user.primaryEmailAddress?.emailAddress || "";
  const imageUrl = user.imageUrl;

  return (
    <div style={{ animation: "pipFade 0.2s ease-out forwards" }}>
      <SectionHeader title="User Profile" description="Manage your personal information, display settings, and system identity." />

      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: "12px",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Avatar"
              style={{ width: "72px", height: "72px", border: `1px solid ${T.borderHover}`, borderRadius: "10px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "72px",
                height: "72px",
                background: T.surfaceHover,
                border: `1px solid ${T.borderHover}`,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontFamily: T.font,
                color: T.textMuted,
              }}
            >
              {initials || "U"}
            </div>
          )}

          <div>
            <SignOutButton>
              <button
                style={{
                  background: "transparent",
                  border: `1px solid ${T.borderHover}`,
                  color: T.textMuted,
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: T.font,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = T.text;
                  e.currentTarget.style.background = T.surfaceHover;
                  e.currentTarget.style.borderColor = T.textHint;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = T.textMuted;
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = T.borderHover;
                }}
              >
                Sign Out
              </button>
            </SignOutButton>
            <p style={{ fontSize: "11px", color: T.textHint, marginTop: "12px", marginBottom: 0, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              LOG OUT OF YOUR ACCOUNT
            </p>
          </div>
        </div>

        <div style={{ height: "1px", width: "100%", background: T.border }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InputField label="Display Name" defaultValue={displayName} readOnly />
          <InputField label="Email Address" defaultValue={email} type="email" readOnly />
        </div>

      </div>
    </div>
  );
}

function SecuritySection() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Check if user is using OAuth (Google, etc.) vs email/password
  const isOAuthUser = user?.externalAccounts && user.externalAccounts.length > 0;
  const hasPassword = user?.passwordEnabled || false;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Update password using Clerk's API
      await clerk.user?.updatePassword({
        currentPassword,
        newPassword
      });
      
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error: any) {
      console.error("Password change error:", error);
      if (error?.errors?.[0]?.code === "invalid_password") {
        setPasswordError("Current password is incorrect");
      } else if (error?.errors?.[0]?.code === "password_length_too_short") {
        setPasswordError("Password must be at least 8 characters long");
      } else if (error?.errors?.[0]?.code === "password_already_used") {
        setPasswordError("This password has been used before");
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ animation: "pipFade 0.2s ease-out forwards" }}>
      <SectionHeader title="Security" description="Manage your account security settings and authentication preferences." />

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Authentication Method Info */}
        <div>
          <div style={{ fontSize: "12px", color: T.text, fontFamily: T.font, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "16px" }}>
            AUTHENTICATION METHOD
          </div>
          
          {isOAuthUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", flex: 1, fontFamily: T.font }}>
                You are signed in with <strong>{user?.externalAccounts?.[0]?.provider || "Google"}</strong>. Your account is secured through OAuth authentication.
              </div>
              {user?.externalAccounts?.[0]?.imageUrl && (
                <img 
                  src={user.externalAccounts[0].imageUrl} 
                  alt={`${user.externalAccounts[0].provider} logo`}
                  style={{ width: "24px", height: "24px", borderRadius: "4px" }}
                />
              )}
            </div>
          ) : hasPassword ? (
            <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", marginBottom: "24px", fontFamily: T.font }}>
              You are signed in with email and password authentication.
            </div>
          ) : (
            <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", marginBottom: "24px", fontFamily: T.font }}>
              Your authentication method is not configured.
            </div>
          )}
        </div>

        <div style={{ height: "1px", width: "100%", background: T.border }} />

        {/* Password Section */}
        <div>
          {/* For OAuth users - show title and description */}
          {isOAuthUser && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", color: T.text, fontFamily: T.font, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                PASSWORD SECURITY
              </div>
              <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", fontFamily: T.font }}>
                Password changes are managed through your OAuth provider.
              </div>
            </div>
          )}

          {/* For email/password users - only show change password button */}
          {!isOAuthUser && hasPassword && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "transparent",
                  color: T.text,
                  border: `1px solid ${T.borderHover}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: T.font,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = T.surfaceHover;
                  e.currentTarget.style.borderColor = T.textHint;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = T.borderHover;
                }}
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>
          )}

          {/* For users with no password - show title and description */}
          {!isOAuthUser && !hasPassword && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", color: T.text, fontFamily: T.font, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                PASSWORD SECURITY
              </div>
              <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", fontFamily: T.font }}>
                Set up a password for additional security.
              </div>
            </div>
          )}

          
          {/* No Password User Info */}
          {!isOAuthUser && !hasPassword && (
            <div style={{
              padding: "16px",
              backgroundColor: "rgba(249,115,22,0.1)",
              border: `1px solid ${T.accent}`,
              borderRadius: "8px",
              fontSize: "13px",
              color: T.text,
              fontFamily: T.font,
              lineHeight: "1.6",
            }}>
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>No Password Set</div>
              <div>
                Your account doesn't have a password configured. You can only sign in using OAuth providers.
              </div>
            </div>
          )}

          {/* Success Message */}
          {passwordSuccess && (
            <div style={{
              padding: "12px 16px",
              backgroundColor: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.5)",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#22c55e",
              fontFamily: T.font,
            }}>
              {passwordSuccess}
            </div>
          )}

          {/* Error Message */}
          {passwordError && (
            <div style={{
              padding: "12px 16px",
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.5)",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#ef4444",
              fontFamily: T.font,
            }}>
              {passwordError}
            </div>
          )}

          {/* Password Change Form */}
          {!isOAuthUser && hasPassword && showPasswordForm && (
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: T.textHint, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={isChangingPassword}
                    style={{
                      width: "100%",
                      background: T.surfaceHover,
                      border: `1px solid ${T.borderHover}`,
                      color: T.text,
                      padding: "14px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: T.font,
                      outline: "none",
                      transition: "border-color 0.2s",
                      cursor: isChangingPassword ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => !isChangingPassword && (e.currentTarget.style.borderColor = T.accent)}
                    onBlur={(e) => !isChangingPassword && (e.currentTarget.style.borderColor = T.borderHover)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: T.textHint, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isChangingPassword}
                    minLength={8}
                    style={{
                      width: "100%",
                      background: T.surfaceHover,
                      border: `1px solid ${T.borderHover}`,
                      color: T.text,
                      padding: "14px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: T.font,
                      outline: "none",
                      transition: "border-color 0.2s",
                      cursor: isChangingPassword ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => !isChangingPassword && (e.currentTarget.style.borderColor = T.accent)}
                    onBlur={(e) => !isChangingPassword && (e.currentTarget.style.borderColor = T.borderHover)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: T.textHint, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isChangingPassword}
                    minLength={8}
                    style={{
                      width: "100%",
                      background: T.surfaceHover,
                      border: `1px solid ${T.borderHover}`,
                      color: T.text,
                      padding: "14px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: T.font,
                      outline: "none",
                      transition: "border-color 0.2s",
                      cursor: isChangingPassword ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => !isChangingPassword && (e.currentTarget.style.borderColor = T.accent)}
                    onBlur={(e) => !isChangingPassword && (e.currentTarget.style.borderColor = T.borderHover)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  disabled={isChangingPassword}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "transparent",
                    color: T.textMuted,
                    border: `1px solid ${T.borderHover}`,
                    borderRadius: "8px",
                    cursor: isChangingPassword ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontFamily: T.font,
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    opacity: isChangingPassword ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isChangingPassword) {
                      e.currentTarget.style.color = T.text;
                      e.currentTarget.style.borderColor = T.textHint;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isChangingPassword) {
                      e.currentTarget.style.color = T.textMuted;
                      e.currentTarget.style.borderColor = T.borderHover;
                    }
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: T.text,
                    color: T.bg,
                    border: `1px solid ${T.text}`,
                    borderRadius: "8px",
                    cursor: isChangingPassword ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontFamily: T.font,
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    opacity: isChangingPassword ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isChangingPassword) {
                      e.currentTarget.style.backgroundColor = "#e5e7eb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isChangingPassword) {
                      e.currentTarget.style.backgroundColor = T.text;
                    }
                  }}
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PreferencesSection() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/chat-history?clearAll=true", { method: "DELETE" });
      if (response.ok) {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("chatHistory_")) localStorage.removeItem(key);
        });
        window.location.reload();
      } else {
        alert("Failed to clear chat history. Please try again.");
        setIsClearing(false);
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error("Error clearing chat history:", error);
      setIsClearing(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div style={{ animation: "pipFade 0.2s ease-out forwards", position: "relative" }}>
      <SectionHeader title="Preferences" description="Customize your workspace environment and tooling behaviors." />

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <ToggleRow title="Terminal Output Mode" description="Display raw execution logs instead of formatted text responses." defaultChecked={true} />
        <div style={{ height: "1px", width: "100%", background: T.border }} />
        <ToggleRow title="Auto-Render Diagrams" description="Automatically compile Mermaid/Kroki diagrams when detected in output." defaultChecked={true} />
        <div style={{ height: "1px", width: "100%", background: T.border }} />
        <ToggleRow title="Strict Focus Mode" description="Hide sidebar and extraneous UI elements while generating infrastructure." defaultChecked={false} />
        <div style={{ height: "1px", width: "100%", background: T.border }} />

        {/* Minimal Delete Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "13px", color: T.text, fontFamily: T.font, fontWeight: 600, marginBottom: "4px" }}>
              Delete Chat History
            </div>
            <div style={{ fontSize: "13px", color: T.textMuted, lineHeight: "1.6", fontFamily: T.font }}>
              Permanently remove all conversations. This action cannot be undone.
            </div>
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            style={{
              padding: "10px 16px",
              backgroundColor: "transparent",
              color: "#EF4444",
              border: "1px solid #EF4444",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: T.font,
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* ULTRA-MINIMAL CONFIRMATION DIALOG             */}
      {/* ───────────────────────────────────────────── */}
      {showConfirmDialog && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "pipFade 0.2s ease-out forwards",
          }}
          onClick={() => !isClearing && setShowConfirmDialog(false)}
        >
          <div
            style={{
              background: T.surface, 
              border: `1px solid ${T.border}`, 
              borderRadius: "12px",
              padding: "40px",
              maxWidth: "400px",
              width: "90%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "18px", color: T.text, fontFamily: T.font, fontWeight: 600, marginBottom: "16px" }}>
              Confirm Deletion
            </div>
            <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", marginBottom: "32px", fontFamily: T.font }}>
              Are you sure you want to delete all chat history? This action is permanent and cannot be reversed.
            </div>

            <div style={{ display: "flex", gap: "16px", width: "100%" }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isClearing}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: `1px solid ${T.borderHover}`,
                  color: T.textMuted,
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: T.font,
                  fontWeight: 600,
                  cursor: isClearing ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: isClearing ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (!isClearing) { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surfaceHover; } }}
                onMouseLeave={(e) => { if (!isClearing) { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = "transparent"; } }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                disabled={isClearing}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid #EF4444",
                  color: "#EF4444",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: T.font,
                  fontWeight: 600,
                  cursor: isClearing ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: isClearing ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (!isClearing) { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; } }}
                onMouseLeave={(e) => { if (!isClearing) { e.currentTarget.style.background = "transparent"; } }}
              >
                {isClearing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BillingSection() {
  const [tokenData, setTokenData] = useState<{ tokensUsed: number; tokensLimit: number; resetAt?: number; } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/token-quota")
      .then((res) => res.json())
      .then((data) => { setTokenData(data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  const formattedTokensUsed = tokenData ? tokenData.tokensUsed.toLocaleString() : "0";
  const formattedTokensLimit = tokenData ? (tokenData.tokensLimit >= 1000 ? `${tokenData.tokensLimit / 1000}K` : tokenData.tokensLimit.toLocaleString()) : "0";
  let percentage = 0;
  if (tokenData && tokenData.tokensLimit > 0) percentage = Math.min(100, Math.round((tokenData.tokensUsed / tokenData.tokensLimit) * 100));

  let resetMessage = "Usage metrics unavailable";
  if (tokenData?.resetAt) {
    const diffMs = Math.max(0, tokenData.resetAt - Date.now());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) resetMessage = `Resets in ${Math.floor(hours / 24)} days`;
    else resetMessage = `Resets in ${hours}h ${minutes}m`;
  }

  return (
    <div style={{ animation: "pipFade 0.2s ease-out forwards" }}>
      <SectionHeader title="Usage & Billing" description="Monitor your LLM token consumption and active plan." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "11px", color: T.textHint, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", fontWeight: 600 }}>Current Plan</div>
          <div style={{ fontSize: "24px", color: T.text, fontFamily: T.font, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "8px" }}>Free Tier</div>
          <div style={{ fontSize: "14px", color: T.textMuted, fontFamily: T.font, marginBottom: "32px" }}>$0.00 / month</div>
          <div style={{ marginTop: "auto" }}>
            <button
              style={{
                width: "100%", background: "transparent", border: `1px solid ${T.borderHover}`, color: T.textMuted, padding: "12px 16px",
                borderRadius: "8px", fontSize: "13px", fontFamily: T.font, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.borderColor = T.textHint; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.borderHover; }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "11px", color: T.textHint, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", fontWeight: 600 }}>Current Cycle Usage</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
            <span style={{ fontSize: "36px", color: T.text, fontFamily: T.font, fontWeight: 700, lineHeight: 1, letterSpacing: "-1px" }}>{loading ? "..." : formattedTokensUsed}</span>
            <span style={{ fontSize: "13px", color: T.textHint, fontFamily: T.font, marginBottom: "4px" }}>/ {loading ? "..." : `${formattedTokensLimit} tokens`}</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: T.border, borderRadius: "4px", marginTop: "12px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: T.accent, width: `${percentage}%`, transition: 'width 0.5s ease', borderRadius: "4px" }} />
          </div>
          <div style={{ fontSize: "12px", color: T.textHint, marginTop: "16px", fontFamily: T.font }}>{loading ? "Loading metrics..." : resetMessage}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────

function NavButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", fontFamily: T.font,
        fontWeight: 500, transition: "all 0.2s ease", cursor: "pointer", border: "none",
        background: active ? T.surfaceHover : "transparent", color: active ? T.text : T.textMuted,
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surfaceHover; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = "transparent"; } }}
    >
      {label}
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description: string; }) {
  return (
    <div style={{ marginBottom: "40px", borderBottom: `1px solid ${T.border}`, paddingBottom: "24px" }}>
      <h2 style={{ fontSize: "26px", fontWeight: 600, color: T.text, fontFamily: T.font, letterSpacing: "-0.5px", margin: 0 }}>{title}</h2>
      <p style={{ fontSize: "15px", color: T.textMuted, marginTop: "12px", lineHeight: "1.6", margin: "12px 0 0 0", fontFamily: T.font }}>{description}</p>
    </div>
  );
}

function InputField({ label, defaultValue, type = "text", readOnly = false }: { label: string; defaultValue?: string; type?: string; readOnly?: boolean; }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <label style={{ fontSize: "12px", color: T.text, fontFamily: T.font, fontWeight: 600 }}>{label}</label>
      <input
        type={type} defaultValue={defaultValue} readOnly={readOnly} suppressHydrationWarning={true}
        style={{
          width: "100%", background: readOnly ? "transparent" : T.surfaceHover, border: `1px solid ${T.borderHover}`, color: readOnly ? T.textMuted : T.text,
          padding: "12px 16px", borderRadius: "8px", fontSize: "14px", fontFamily: T.font, outline: "none", transition: "border-color 0.2s", cursor: readOnly ? "not-allowed" : "text",
        }}
        onFocus={(e) => !readOnly && (e.currentTarget.style.borderColor = T.accent)}
        onBlur={(e) => !readOnly && (e.currentTarget.style.borderColor = T.borderHover)}
      />
    </div>
  );
}

function ToggleRow({ title, description, defaultChecked }: { title: string; description: string; defaultChecked?: boolean; }) {
  const [checked, setChecked] = useState(defaultChecked || false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
      <div>
        <div style={{ fontSize: "14px", color: T.text, fontFamily: T.font, fontWeight: 600, marginBottom: "4px" }}>{title}</div>
        <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", fontFamily: T.font }}>{description}</div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 16px", borderRadius: "8px", border: `1px solid`,
          fontSize: "13px", fontFamily: T.font, fontWeight: 600,
          cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0,
          background: checked ? T.text : "transparent", color: checked ? T.bg : T.textMuted, borderColor: checked ? T.text : T.borderHover,
        }}
        onMouseEnter={(e) => { if (!checked) e.currentTarget.style.borderColor = T.textHint; }}
        onMouseLeave={(e) => { if (!checked) e.currentTarget.style.borderColor = T.borderHover; }}
      >
        {checked ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}