"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, SignOutButton, useClerk } from "@clerk/nextjs";

// ── Minimal Premium Design Tokens ──────────────────────────────────────
const T = {
  bg: "#09090b",
  surface: "rgba(255, 255, 255, 0.02)",
  surfaceHover: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.06)",
  borderHover: "rgba(255, 255, 255, 0.15)",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  textHint: "#71717a",
  accent: "#ffffff",
  font: "var(--font-satoshi), system-ui, -apple-system, sans-serif",
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
        padding: "48px 32px 80px",
        fontFamily: T.font,
        position: "relative",
      }}
    >
      {/* ── Ambient Background Glow ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "800px",
        height: "400px",
        background: "radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{ width: "100%", maxWidth: "1024px", position: "relative", zIndex: 1 }}>
        {/* ───────────────────────────────────────────── */}
        {/* PAGE HEADER                                   */}
        {/* ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "56px",
            paddingBottom: "32px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <Link href="/chat" style={{ textDecoration: "none" }}>
            <button
              style={{
                width: "40px",
                height: "40px",
                background: T.surface,
                border: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                cursor: "pointer",
                color: T.textMuted,
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.text;
                e.currentTarget.style.background = T.surfaceHover;
                e.currentTarget.style.borderColor = T.borderHover;
                e.currentTarget.style.transform = "translateX(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = T.textMuted;
                e.currentTarget.style.background = T.surface;
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          </Link>

          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: T.textHint,
                fontFamily: T.font,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "4px"
              }}
            >
              Workspace
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: 500,
              margin: "0",
              letterSpacing: "-0.02em",
              color: T.text
            }}>
              Settings
            </h1>
          </div>
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* MAIN LAYOUT                                   */}
        {/* ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "64px",
            flexWrap: "wrap",
            alignItems: "flex-start",
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
              position: "sticky",
              top: "48px"
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: T.textHint,
                fontFamily: T.font,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
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
            
            <div style={{ marginTop: "auto", paddingTop: "40px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px", color: T.textMuted }}>
              <Link href="/terms" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = T.text)} onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}>
                Terms of Service
              </Link>
              <Link href="/privacy" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = T.text)} onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}>
                Privacy Policy
              </Link>
            </div>
          </aside>

          {/* CONTENT AREA */}
          <main style={{ flex: 1, minWidth: "320px" }}>
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "preferences" && <PreferencesSection />}
            {activeTab === "security" && <SecuritySection />}
            {activeTab === "billing" && <BillingSection />}
          </main>
        </div>
      </div>

      {/* GLOBAL ANIMATIONS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideFade { 
          from { opacity: 0; transform: translateY(12px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        input::placeholder { color: #71717a !important; }
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
      <div style={{ animation: "slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
        <SectionHeader title="User Profile" description="Loading user profile..." />
      </div>
    );
  }

  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");
  const displayName = user.fullName || "";
  const email = user.primaryEmailAddress?.emailAddress || "";
  const imageUrl = user.imageUrl;

  return (
    <div style={{ animation: "slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
      <SectionHeader title="User Profile" description="Manage your personal information, display settings, and system identity." />

      <GlassCard>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Avatar"
              style={{ width: "72px", height: "72px", border: `1px solid ${T.borderHover}`, borderRadius: "16px", objectFit: "cover", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
            />
          ) : (
            <div
              style={{
                width: "72px",
                height: "72px",
                background: T.surfaceHover,
                border: `1px solid ${T.borderHover}`,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 500,
                fontFamily: T.font,
                color: T.textMuted,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
              }}
            >
              {initials || "U"}
            </div>
          )}

          <div>
            <SignOutButton>
              <button
                style={{
                  background: T.surface,
                  border: `1px solid ${T.borderHover}`,
                  color: T.text,
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: T.font,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.surfaceHover;
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.surface;
                  e.currentTarget.style.borderColor = T.borderHover;
                }}
              >
                Sign Out
              </button>
            </SignOutButton>
            <p style={{ fontSize: "11px", color: T.textHint, marginTop: "12px", marginBottom: 0, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Log out of this device
            </p>
          </div>
        </div>

        <div style={{ height: "1px", width: "100%", background: T.border }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InputField label="Display Name" defaultValue={displayName} readOnly />
          <InputField label="Email Address" defaultValue={email} type="email" readOnly />
        </div>
      </GlassCard>
    </div>
  );
}

function SecuritySection() {
  const { user } = useUser();
  const clerk = useClerk();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const isOAuthUser = user?.externalAccounts && user.externalAccounts.length > 0;
  const hasPassword = user?.passwordEnabled || false;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required"); return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long"); return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match"); return;
    }

    setIsChangingPassword(true);
    try {
      await clerk.user?.updatePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error: any) {
      console.error("Password change error:", error);
      if (error?.errors?.[0]?.code === "invalid_password") setPasswordError("Current password is incorrect");
      else if (error?.errors?.[0]?.code === "password_length_too_short") setPasswordError("Password must be at least 8 characters long");
      else if (error?.errors?.[0]?.code === "password_already_used") setPasswordError("This password has been used before");
      else setPasswordError("Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ animation: "slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
      <SectionHeader title="Security" description="Manage your account security settings and authentication preferences." />

      <GlassCard>
        {/* Authentication Method Info */}
        <div>
          <div style={{ fontSize: "12px", color: T.textHint, fontFamily: T.font, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
            Authentication Method
          </div>

          {isOAuthUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
              <div style={{ fontSize: "14px", color: T.text, lineHeight: "1.6", flex: 1, fontFamily: T.font }}>
                You are signed in with <strong>{user?.externalAccounts?.[0]?.provider || "Google"}</strong>. Your account is secured through OAuth.
              </div>
              {user?.externalAccounts?.[0]?.imageUrl && (
                <img
                  src={user.externalAccounts[0].imageUrl}
                  alt={`${user.externalAccounts[0].provider} logo`}
                  style={{ width: "24px", height: "24px", borderRadius: "6px" }}
                />
              )}
            </div>
          ) : hasPassword ? (
            <div style={{ fontSize: "14px", color: T.text, lineHeight: "1.6", marginBottom: "8px", fontFamily: T.font }}>
              You are signed in with email and password authentication.
            </div>
          ) : (
            <div style={{ fontSize: "14px", color: T.text, lineHeight: "1.6", marginBottom: "8px", fontFamily: T.font }}>
              Your authentication method is not configured.
            </div>
          )}
        </div>

        <div style={{ height: "1px", width: "100%", background: T.border }} />

        {/* Password Section */}
        <div>
          {isOAuthUser && (
            <div>
              <div style={{ fontSize: "12px", color: T.textHint, fontFamily: T.font, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "12px" }}>
                Password Security
              </div>
              <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", fontFamily: T.font }}>
                Password changes are managed through your OAuth provider.
              </div>
            </div>
          )}

          {!isOAuthUser && hasPassword && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                style={{
                  padding: "10px 16px",
                  background: T.surfaceHover,
                  color: T.text,
                  border: `1px solid ${T.borderHover}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: T.font,
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderHover; }}
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>
          )}

          {!isOAuthUser && !hasPassword && (
            <div style={{
              padding: "16px 20px",
              background: "rgba(255, 255, 255, 0.03)",
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              borderRadius: "12px",
              fontSize: "14px",
              color: T.textMuted,
              fontFamily: T.font,
              lineHeight: "1.6",
            }}>
              <div style={{ color: T.text, fontWeight: 500, marginBottom: "4px" }}>No Password Set</div>
              <div>Your account doesn't have a password configured. You can only sign in using OAuth providers.</div>
            </div>
          )}

          {passwordSuccess && (
            <div style={{ padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#34d399", fontFamily: T.font, border: "1px solid rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.15)", borderRadius: "8px" }}>
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div style={{ padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#f87171", fontFamily: T.font, border: "1px solid rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.15)", borderRadius: "8px" }}>
              {passwordError}
            </div>
          )}

          {!isOAuthUser && hasPassword && showPasswordForm && (
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px", animation: "slideFade 0.3s ease-out forwards" }}>
              <InputField label="Current Password" type="password" defaultValue={currentPassword} onChange={(e: any) => setCurrentPassword(e.target.value)} disabled={isChangingPassword} />
              <InputField label="New Password" type="password" defaultValue={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} disabled={isChangingPassword} />
              <InputField label="Confirm New Password" type="password" defaultValue={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} disabled={isChangingPassword} />

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => { setShowPasswordForm(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }}
                  disabled={isChangingPassword}
                  style={{
                    padding: "10px 16px", background: "transparent", color: T.textMuted, border: `1px solid ${T.borderHover}`, borderRadius: "8px",
                    cursor: isChangingPassword ? "not-allowed" : "pointer", fontSize: "13px", fontFamily: T.font, fontWeight: 500, transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (!isChangingPassword) e.currentTarget.style.color = T.text; }}
                  onMouseLeave={(e) => { if (!isChangingPassword) e.currentTarget.style.color = T.textMuted; }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{
                    padding: "10px 16px", background: T.text, color: T.bg, border: "none", borderRadius: "8px",
                    cursor: isChangingPassword ? "not-allowed" : "pointer", fontSize: "13px", fontFamily: T.font, fontWeight: 600, transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => { if (!isChangingPassword) e.currentTarget.style.opacity = "0.85"; }}
                  onMouseLeave={(e) => { if (!isChangingPassword) e.currentTarget.style.opacity = "1"; }}
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

function PreferencesSection() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [clearError, setClearError] = useState("");

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
        setClearError("Failed to clear chat history. Please try again.");
        setTimeout(() => setClearError(""), 3000);
        setIsClearing(false); setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      setIsClearing(false); setShowConfirmDialog(false);
    }
  };

  return (
    <div style={{ animation: "slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards", position: "relative" }}>
      <SectionHeader title="Preferences" description="Customize your workspace environment and tooling behaviors." />

      <GlassCard>


        {/* Delete Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "14px", color: T.text, fontFamily: T.font, fontWeight: 500, marginBottom: "4px" }}>
              Clear Workspace Data
            </div>
            <div style={{ fontSize: "13px", color: T.textMuted, lineHeight: "1.6", fontFamily: T.font }}>
              Permanently remove all local configurations and history.
            </div>
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            style={{
              padding: "8px 16px", background: "transparent", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontFamily: T.font, fontWeight: 500, transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; }}
          >
            Clear Data
          </button>
        </div>
      </GlassCard>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}
          onClick={() => !isClearing && setShowConfirmDialog(false)}>
          <div
            style={{ padding: "32px", maxWidth: "400px", width: "90%", display: "flex", flexDirection: "column", background: "#09090b", border: `1px solid ${T.borderHover}`, borderRadius: "16px", boxShadow: "0 24px 48px rgba(0,0,0,0.9)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "18px", color: T.text, fontFamily: T.font, fontWeight: 600, marginBottom: "12px", letterSpacing: "-0.01em" }}>
              Clear Workspace Data?
            </div>
            <div style={{ fontSize: "14px", color: T.textMuted, lineHeight: "1.6", marginBottom: "32px", fontFamily: T.font }}>
              This will permanently delete all chat history and local configurations. This action cannot be reversed.
            </div>

            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isClearing}
                style={{
                  flex: 1, background: T.surfaceHover, border: `1px solid ${T.borderHover}`, color: T.text,
                  padding: "10px", borderRadius: "8px", fontSize: "13px", fontFamily: T.font, fontWeight: 500,
                  cursor: isClearing ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: isClearing ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (!isClearing) e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={(e) => { if (!isClearing) e.currentTarget.style.borderColor = T.borderHover; }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                disabled={isClearing}
                style={{
                  flex: 1, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171",
                  padding: "10px", borderRadius: "8px", fontSize: "13px", fontFamily: T.font, fontWeight: 600,
                  cursor: isClearing ? "not-allowed" : "pointer", transition: "all 0.2s ease", opacity: isClearing ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (!isClearing) { e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)"; } }}
                onMouseLeave={(e) => { if (!isClearing) { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"; } }}
              >
                {isClearing ? "Clearing..." : "Yes, Clear Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {clearError && (
        <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", padding: "10px 20px", color: "#ef4444", fontSize: "13px", fontWeight: 500, fontFamily: T.font, zIndex: 3000, whiteSpace: "nowrap", background: "#18181b", border: `1px solid rgba(255,255,255,0.15)`, borderRadius: "8px", boxShadow: "0 8px 32px rgba(0,0,0,0.8)" }}>
          {clearError}
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
    <div style={{ animation: "slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
      <SectionHeader title="Usage & Billing" description="Monitor your LLM token consumption and active plan." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>

        <GlassCard>
          <div style={{ fontSize: "11px", color: T.textHint, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px", fontWeight: 600 }}>Active Plan</div>
          <div style={{ fontSize: "28px", color: T.text, fontFamily: T.font, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: "8px" }}>Free Tier</div>
          <div style={{ fontSize: "14px", color: T.textMuted, fontFamily: T.font, marginBottom: "32px" }}>$0.00 / month</div>
          <div style={{ marginTop: "auto" }}>
            <button
              onClick={() => window.location.href = "/pricing"}
              style={{
                width: "100%", background: T.surfaceHover, border: `1px solid ${T.borderHover}`, color: T.text, padding: "10px 16px",
                borderRadius: "8px", fontSize: "13px", fontFamily: T.font, fontWeight: 500,
                cursor: "pointer", transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderHover; }}
            >
              Upgrade Plan
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ fontSize: "11px", color: T.textHint, fontFamily: T.font, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", fontWeight: 600 }}>Current Cycle Usage</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
            <span style={{ fontSize: "36px", color: T.text, fontFamily: T.font, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>{loading ? "..." : formattedTokensUsed}</span>
            <span style={{ fontSize: "13px", color: T.textHint, fontFamily: T.font, marginBottom: "4px" }}>/ {loading ? "..." : `${formattedTokensLimit} tokens`}</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginTop: "16px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: T.text, width: `${percentage}%`, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)', borderRadius: "4px" }} />
          </div>
          <div style={{ fontSize: "12px", color: T.textHint, marginTop: "16px", fontFamily: T.font }}>{loading ? "Loading metrics..." : resetMessage}</div>
        </GlassCard>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────

// Reusable Glassmorphism Container
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: T.surface,
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: `1px solid ${T.border}`,
      borderRadius: "16px",
      padding: "32px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
    }}>
      {children}
    </div>
  );
}

function NavButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left", padding: "10px 16px", borderRadius: "8px", fontSize: "14px", fontFamily: T.font,
        fontWeight: 500, transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", cursor: "pointer",
        border: "1px solid",
        borderColor: active ? T.borderHover : "transparent",
        background: active ? T.surfaceHover : "transparent",
        color: active ? T.text : T.textMuted,
        boxShadow: active ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = T.text;
          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = T.textMuted;
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {label}
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description: string; }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: 500, color: T.text, fontFamily: T.font, letterSpacing: "-0.02em", margin: 0 }}>{title}</h2>
      <p style={{ fontSize: "14px", color: T.textMuted, marginTop: "8px", lineHeight: "1.6", margin: "8px 0 0 0", fontFamily: T.font }}>{description}</p>
    </div>
  );
}

function InputField({ label, defaultValue, type = "text", readOnly = false, disabled = false, onChange }: { label: string; defaultValue?: string; type?: string; readOnly?: boolean; disabled?: boolean; onChange?: any }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "12px", color: T.textHint, fontFamily: T.font, fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
        disabled={disabled}
        onChange={onChange}
        suppressHydrationWarning={true}
        style={{
          width: "100%",
          background: readOnly || disabled ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${T.border}`,
          color: readOnly || disabled ? T.textMuted : T.text,
          padding: "12px 16px",
          borderRadius: "10px",
          fontSize: "14px",
          fontFamily: T.font,
          outline: "none",
          transition: "all 0.2s ease",
          cursor: readOnly || disabled ? "not-allowed" : "text",
        }}
        onFocus={(e) => !(readOnly || disabled) && (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)", e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        onBlur={(e) => !(readOnly || disabled) && (e.currentTarget.style.borderColor = T.border, e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      />
    </div>
  );
}

function ToggleRow({ title, description, defaultChecked }: { title: string; description: string; defaultChecked?: boolean; }) {
  const [checked, setChecked] = useState(defaultChecked || false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
      <div>
        <div style={{ fontSize: "14px", color: T.text, fontFamily: T.font, fontWeight: 500, marginBottom: "4px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: T.textMuted, lineHeight: "1.6", fontFamily: T.font }}>{description}</div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 14px", borderRadius: "8px", border: `1px solid`,
          fontSize: "12px", fontFamily: T.font, fontWeight: 500,
          cursor: "pointer", transition: "all 0.2s ease", flexShrink: 0,
          background: checked ? T.text : "transparent", color: checked ? T.bg : T.textMuted, borderColor: checked ? T.text : T.borderHover,
        }}
        onMouseEnter={(e) => { if (!checked) e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
        onMouseLeave={(e) => { if (!checked) e.currentTarget.style.borderColor = T.borderHover; }}
      >
        {checked ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}
