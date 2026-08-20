"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/lib/actions/auth";
import { Shield, ArrowRight, CheckCircle2, Lock, UserPlus, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Login form state
  const [email, setEmail] = useState("manvi@newage.com");
  const [password, setPassword] = useState("password123");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("password123");
  const [signupDepartment, setSignupDepartment] = useState("Product Team");
  const [signupRole, setSignupRole] = useState<"EMPLOYEE" | "ADMIN">("EMPLOYEE");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = customEmail || email;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await login({ email: targetEmail, password });
    setLoading(false);

    if (res.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(res.error || "Login failed");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await signup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      department: signupDepartment,
      role: signupRole,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Account created! Redirecting to portal...");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } else {
      setError(res.error || "Sign up failed");
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword("password123");
    handleLogin(undefined, quickEmail);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0F1B33 0%, #16233F 50%, #1E293B 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "28px 32px 20px",
            textAlign: "center",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#0F1B33",
              color: "#fff",
              fontWeight: 800,
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 4px 12px rgba(15, 27, 51, 0.25)",
            }}
          >
            NA
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", margin: 0 }}>
            New Age Access Portal
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            Access Management & Governance System
          </p>

          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              background: "#F1F5F9",
              borderRadius: "9px",
              padding: "4px",
              marginTop: "20px",
              gap: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderRadius: "7px",
                background: tab === "login" ? "#fff" : "transparent",
                color: tab === "login" ? "#0F1B33" : "#64748B",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: tab === "login" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                border: "none",
                borderRadius: "7px",
                background: tab === "signup" ? "#fff" : "transparent",
                color: tab === "signup" ? "#0F1B33" : "#64748B",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: tab === "signup" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              <UserPlus size={14} /> Sign Up
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "26px 32px" }}>
          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "9px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                color: "#B91C1C",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "9px",
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                color: "#15803D",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === "login" && (
            <>
              {/* Quick Demo Login Chips */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "10px",
                  }}
                >
                  ⚡ Evaluator Quick Sign-In (1-Click)
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("manvi@newage.com")}
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "9px",
                      border: "1px solid #BFDBFE",
                      background: "#EFF6FF",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "#2563EB",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        MM
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1E3A8A" }}>
                          Manvi Mehta
                        </div>
                        <div style={{ fontSize: "11px", color: "#3B82F6" }}>
                          Employee · Product Team
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} style={{ color: "#2563EB" }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("rahul@newage.com")}
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "9px",
                      border: "1px solid #E2E8F0",
                      background: "#F8FAFC",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "#334155",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "11px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        RS
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>
                          Rahul Sharma
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>
                          Board Admin · IT Support
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} style={{ color: "#475569" }} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  margin: "18px 0",
                  color: "#9CA3AF",
                  fontSize: "12px",
                }}
              >
                <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                <span>or sign in with email</span>
                <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
              </div>

              {/* Manual Credentials Form */}
              <form onSubmit={(e) => handleLogin(e)}>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    htmlFor="login-email"
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Work Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@newage.com"
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "9px",
                      border: "1px solid #E5E7EB",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="login-password"
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "9px",
                      border: "1px solid #E5E7EB",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "42px",
                    borderRadius: "9px",
                    border: "none",
                    background: "#2F6FED",
                    color: "#fff",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(47, 111, 237, 0.25)",
                  }}
                >
                  {loading ? "Signing in..." : "Sign In to Portal"}
                </button>
              </form>
            </>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === "signup" && (
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="signup-name"
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "5px",
                  }}
                >
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Priya Menon"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  htmlFor="signup-email"
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "5px",
                  }}
                >
                  Work Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="priya@newage.com"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label
                    htmlFor="signup-department"
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: "5px",
                    }}
                  >
                    Department
                  </label>
                  <select
                    id="signup-department"
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 10px",
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      fontSize: "13px",
                      outline: "none",
                      background: "#fff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Product Team">Product Team</option>
                    <option value="Marketing Team">Marketing Team</option>
                    <option value="Sales Team">Sales Team</option>
                    <option value="Support Team">Support Team</option>
                    <option value="Finance Team">Finance Team</option>
                    <option value="IT Support">IT Support</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="signup-role"
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: "5px",
                    }}
                  >
                    Role
                  </label>
                  <select
                    id="signup-role"
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as any)}
                    style={{
                      width: "100%",
                      height: "38px",
                      padding: "0 10px",
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      fontSize: "13px",
                      outline: "none",
                      background: "#fff",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Board Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "5px",
                  }}
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "9px",
                  border: "none",
                  background: "#0F1B33",
                  color: "#fff",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(15, 27, 51, 0.25)",
                }}
              >
                <UserPlus size={16} /> {loading ? "Creating Account..." : "Create Account & Sign In"}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #F1F5F9",
              textAlign: "center",
              fontSize: "11.5px",
              color: "#9CA3AF",
            }}
          >
            🔒 Protected by bcrypt password hashing & secure HTTP-only cookies
          </div>
        </div>
      </div>
    </div>
  );
}
