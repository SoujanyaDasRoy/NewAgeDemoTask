"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { Shield, ArrowRight, CheckCircle2, Lock, UserCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manvi@newage.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = customEmail || email;
    setLoading(true);
    setError("");

    const res = await login({ email: targetEmail, password });
    setLoading(false);

    if (res.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(res.error || "Login failed");
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
          maxWidth: "460px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "32px 32px 24px",
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
              margin: "0 auto 16px",
              boxShadow: "0 4px 12px rgba(15, 27, 51, 0.25)",
            }}
          >
            NA
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", margin: 0 }}>
            New Age Access Portal
          </h1>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "6px 0 0" }}>
            Sign in to manage tool access, approvals & governance
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px" }}>
          {error && (
            <div
              style={{
                marginBottom: "20px",
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

          {/* Quick Demo Login Chips */}
          <div style={{ marginBottom: "24px" }}>
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
                  padding: "11px 14px",
                  borderRadius: "9px",
                  border: "1px solid #BFDBFE",
                  background: "#EFF6FF",
                  cursor: "pointer",
                  transition: "all 0.15s",
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
                      Employee · Product Team (Requester)
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
                  padding: "11px 14px",
                  borderRadius: "9px",
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                  cursor: "pointer",
                  transition: "all 0.15s",
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
                      Board Admin · IT Support (Provider)
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
              margin: "20px 0",
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
            <div style={{ marginBottom: "16px" }}>
              <label
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

            <div style={{ marginBottom: "22px" }}>
              <label
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

          {/* Footer note */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid #F1F5F9",
              textAlign: "center",
              fontSize: "11.5px",
              color: "#9CA3AF",
            }}
          >
            🔒 Protected by enterprise bcrypt password encryption & session cookies
          </div>
        </div>
      </div>
    </div>
  );
}
