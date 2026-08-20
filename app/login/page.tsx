"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/lib/actions/auth";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("Product Team");

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
      role: "EMPLOYEE", // Every new user starts as Employee until Admin elevates them
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
          maxWidth: "400px",
          background: "#FFFFFF",
          borderRadius: "14px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px -2px rgba(15, 27, 51, 0.05), 0 2px 6px -1px rgba(15, 27, 51, 0.03)",
          overflow: "hidden",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "32px 32px 20px",
            textAlign: "center",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#0F1B33",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "15px",
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
              fontSize: "19px",
              fontWeight: 600,
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

          {/* Segmented Tab Switcher */}
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
                setSuccessMsg("");
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
                boxShadow: tab === "login" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
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
                padding: "7px 0",
                border: "none",
                borderRadius: "6px",
                background: tab === "signup" ? "#FFFFFF" : "transparent",
                color: tab === "signup" ? "#0F1B33" : "#64748B",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: tab === "signup" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: "26px 32px 32px" }}>
          {error && (
            <div
              style={{
                marginBottom: "18px",
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
                marginBottom: "18px",
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
            <form onSubmit={handleLogin}>
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
                  Work Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
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
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT */}
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
                  placeholder="e.g. Alex Morgan"
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
                  placeholder="alex@company.com"
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
                    padding: "0 10px",
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

          {/* Footer note */}
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
