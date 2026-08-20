"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/lib/actions/auth";
import { ArrowRight, Lock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Login form state
  const [email, setEmail] = useState("admin@newage.com");
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
      setError(res.error || "Invalid email or password");
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
      setError(res.error || "Failed to create account");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 10px 25px -5px rgba(15, 27, 51, 0.06), 0 8px 10px -6px rgba(15, 27, 51, 0.04)",
          overflow: "hidden",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "32px 32px 24px",
            textAlign: "center",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#0F1B33",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "16px",
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            NA
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#0F1B33",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Access Management
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#64748B",
              margin: "4px 0 0",
            }}
          >
            New Age Portal
          </p>

          {/* Clean Segmented Tab Switcher */}
          <div
            style={{
              display: "flex",
              background: "#F1F5F9",
              borderRadius: "8px",
              padding: "3px",
              marginTop: "20px",
              gap: "2px",
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
                padding: "7px 0",
                border: "none",
                borderRadius: "6px",
                background: tab === "login" ? "#FFFFFF" : "transparent",
                color: tab === "login" ? "#0F1B33" : "#64748B",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: tab === "login" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
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
              }}
              style={{
                flex: 1,
                padding: "7px 0",
                border: "none",
                borderRadius: "6px",
                background: tab === "signup" ? "#FFFFFF" : "transparent",
                color: tab === "signup" ? "#0F1B33" : "#64748B",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: tab === "signup" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: "28px 32px 32px" }}>
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#FEF2F2",
                border: "1px solid #FEE2E2",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#DC2626",
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                marginBottom: "20px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#F0FDF4",
                border: "1px solid #DCFCE7",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#16A34A",
                fontWeight: 500,
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === "login" && (
            <div>
              {/* 1-Click Master Sign-In */}
              <button
                type="button"
                onClick={() => handleLogin(undefined, "admin@newage.com")}
                disabled={loading}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  background: "#FAFAFA",
                  color: "#0F1B33",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#0F1B33",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    MA
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F1B33", display: "flex", alignItems: "center", gap: "5px" }}>
                      Master Admin <Sparkles size={12} color="#D97706" />
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                      1-click instant sign-in
                    </div>
                  </div>
                </div>
                <ArrowRight size={15} color="#94A3B8" />
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                  color: "#94A3B8",
                  fontSize: "12px",
                }}
              >
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
                <span>or continue with email</span>
                <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
              </div>

              {/* Login Form */}
              <form onSubmit={(e) => handleLogin(e)}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="login-email"
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Email
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
                      height: "38px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13.5px",
                      color: "#0F1B33",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s ease",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <label
                    htmlFor="login-password"
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#334155",
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
                      height: "38px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13.5px",
                      color: "#0F1B33",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s ease",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#0F1B33",
                    color: "#FFFFFF",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "background 0.15s ease",
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
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
                    fontWeight: 600,
                    color: "#334155",
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
                    border: "1px solid #CBD5E1",
                    fontSize: "13.5px",
                    color: "#0F1B33",
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
                    fontWeight: 600,
                    color: "#334155",
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
                    border: "1px solid #CBD5E1",
                    fontSize: "13.5px",
                    color: "#0F1B33",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label
                    htmlFor="signup-department"
                    style={{
                      display: "block",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#334155",
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
                      padding: "0 8px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      color: "#0F1B33",
                      outline: "none",
                      background: "#FFFFFF",
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
                      fontWeight: 600,
                      color: "#334155",
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
                      padding: "0 8px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      color: "#0F1B33",
                      outline: "none",
                      background: "#FFFFFF",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Board Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: "block",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
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
                    border: "1px solid #CBD5E1",
                    fontSize: "13.5px",
                    color: "#0F1B33",
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
                  height: "40px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#0F1B33",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {loading ? "Creating Account..." : "Create Account & Sign In"}
              </button>
            </form>
          )}

          {/* Subtle footer info */}
          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
              fontSize: "12px",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <Lock size={12} /> Powered by Neon Auth & PostgreSQL
          </div>
        </div>
      </div>
    </div>
  );
}
