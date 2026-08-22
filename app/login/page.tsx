"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/lib/actions/auth";
import { requestMagicLink } from "@/lib/actions/magic-link";
import { Mail } from "lucide-react";
import {
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("Engineering");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(res.error || "Invalid email or password");
    }
  };

  const [magicLink, setMagicLink] = useState<{ demoLink: string } | null>(null);

  const handleMagicLink = async () => {
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setMagicLink(null);
    const res = await requestMagicLink({ email });
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to send magic link");
      return;
    }
    setSuccessMsg(
      res.dispatched
        ? "Magic link sent! Check your inbox."
        : "Magic link generated. Demo mode: copy the link below to sign in instantly."
    );
    if (res.demoLink) setMagicLink({ demoLink: res.demoLink });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await signup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      department: signupDepartment,
      role: "EMPLOYEE",
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Account created successfully! Signing you in...");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } else {
      setError(res.error || "Failed to create account");
    }
  };

  const quickFill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("password123");
    setTab("login");
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          background: "var(--surface)",
          borderRadius: "18px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-popover)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr",
        }}
      >
        {/* Left Feature Showcase Pane */}
        <div
          style={{
            background: "linear-gradient(145deg, #090D16 0%, #111827 50%, #1E3A8A 100%)",
            padding: "36px 32px",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            {/* Brand Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#2563EB",
                  color: "#FFF",
                  fontWeight: 800,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                }}
              >
                NA
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>New Age</div>
                <div style={{ fontSize: "11.5px", color: "#94A3B8" }}>Access Management Portal</div>
              </div>
            </div>

            {/* Value Props */}
            <div style={{ marginTop: "36px" }}>
              <h2 style={{ fontSize: "19px", fontWeight: 700, lineHeight: 1.3, margin: "0 0 8px" }}>
                Enterprise Access Governance, Automated.
              </h2>
              <p style={{ fontSize: "12.5px", color: "#94A3B8", lineHeight: 1.5, margin: "0 0 24px" }}>
                Instant self-service requests, automated SCIM provisioning, and multi-step policy enforcement.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(37, 99, 235, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60A5FA" }}>
                    <Zap size={14} />
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#E2E8F0" }}>
                    <strong>Zero-Touch Provisioning</strong> via SCIM Webhooks
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(34, 197, 94, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4ADE80" }}>
                    <ShieldCheck size={14} />
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#E2E8F0" }}>
                    <strong>Multi-Step Audit Trail</strong> &amp; SLA Tracking
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(168, 85, 247, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C084FC" }}>
                    <Layers size={14} />
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#E2E8F0" }}>
                    <strong>Cross-Department</strong> Exception Policies
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: "32px", paddingTop: "18px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <div style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "8px" }}>
              Quick Demo Personas (1-Click Fill)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button
                type="button"
                onClick={() => quickFill("soujanyadasroy@gmail.com")}
                style={{
                  padding: "4px 9px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                👑 Soujanya (Admin)
              </button>
              <button
                type="button"
                onClick={() => quickFill("arjun.mehta@newage.com")}
                style={{
                  padding: "4px 9px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                💻 Arjun (Eng)
              </button>
              <button
                type="button"
                onClick={() => quickFill("priya.sharma@newage.com")}
                style={{
                  padding: "4px 9px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📊 Priya (Product)
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Pane */}
        <div style={{ padding: "36px 36px" }}>
          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "4px",
              marginBottom: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError("");
                setSuccessMsg("");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                background: tab === "login" ? "var(--surface)" : "transparent",
                color: tab === "login" ? "var(--text)" : "var(--muted)",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "7px",
                cursor: "pointer",
                boxShadow: tab === "login" ? "var(--shadow-xs)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError("");
                setSuccessMsg("");
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                background: tab === "signup" ? "var(--surface)" : "transparent",
                color: tab === "signup" ? "var(--text)" : "var(--muted)",
                fontWeight: 600,
                fontSize: "13px",
                borderRadius: "7px",
                cursor: "pointer",
                boxShadow: tab === "signup" ? "var(--shadow-xs)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error / Success Feedback */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#F87171",
                fontSize: "12.5px",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                color: "#4ADE80",
                fontSize: "12.5px",
                marginBottom: "16px",
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. soujanyadasroy@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "13.5px",
                    outline: "none",
                    background: "var(--surface-input)",
                    color: "var(--text)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>
                    Password
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>Demo: password123</span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 40px 0 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      fontSize: "13.5px",
                      outline: "none",
                      background: "var(--surface-input)",
                      color: "var(--text)",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "var(--muted)",
                      cursor: "pointer",
                      display: "flex",
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
                style={{
                  height: "44px",
                  fontSize: "13.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? "Verifying..." : "Sign In to Portal"} <ArrowRight size={15} />
              </button>

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  margin: "16px 0 12px",
                  color: "var(--muted)",
                  fontSize: "11px",
                }}
              >
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Or use passwordless</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleMagicLink}
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-subtle)",
                  color: "var(--text)",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Mail size={15} /> Email me a sign-in link
              </button>

              {magicLink && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px dashed var(--border)",
                    background: "var(--surface-input)",
                    fontSize: "11.5px",
                    color: "var(--muted)",
                    wordBreak: "break-all",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  <strong style={{ color: "var(--text)" }}>Demo link:</strong>{" "}
                  <a href={magicLink.demoLink} style={{ color: "#2563EB", textDecoration: "underline" }}>
                    {magicLink.demoLink}
                  </a>
                </div>
              )}
            </form>
          ) : (
            /* CREATE ACCOUNT FORM */
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "13.5px",
                    outline: "none",
                    background: "var(--surface-input)",
                    color: "var(--text)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Company Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.verma@newage.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "13.5px",
                    outline: "none",
                    background: "var(--surface-input)",
                    color: "var(--text)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Department / Team
                </label>
                <select
                  value={signupDepartment}
                  onChange={(e) => setSignupDepartment(e.target.value)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "13.5px",
                    outline: "none",
                    background: "var(--surface-input)",
                    color: "var(--text)",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Security & Compliance">Security &amp; Compliance</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                  Create Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Minimum 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 40px 0 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      fontSize: "13.5px",
                      outline: "none",
                      background: "var(--surface-input)",
                      color: "var(--text)",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "var(--muted)",
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
                style={{
                  height: "44px",
                  fontSize: "13.5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? "Creating Account..." : "Create Account & Sign In"} <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
