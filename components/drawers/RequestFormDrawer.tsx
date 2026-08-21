"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  User,
  Users,
  AlertTriangle,
  Zap,
  Clock,
  Send,
  Copy,
  CheckCheck,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import ServiceLogo from "../ServiceLogo";

interface RequestFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessItem: any;
  currentUserName: string;
  users?: any[];
  onSubmit: (data: {
    accessItemId: string;
    beneficiary: string;
    onBehalf: boolean;
    justification: string;
    isException?: boolean;
    exceptionReason?: string;
    requiredUntil?: string;
    urgency?: "STANDARD" | "URGENT" | "CRITICAL";
  }) => Promise<string | null>;
}

const DURATION_PRESETS = [
  { label: "30 Days", days: 30, hint: "Temporary sprint" },
  { label: "90 Days", days: 90, hint: "Quarterly project" },
  { label: "6 Months", days: 180, hint: "Long-term engagement" },
  { label: "Permanent", days: 365, hint: "Indefinite access" },
];

const QUICK_JUSTIFICATIONS = [
  "Daily Sprint & Project Delivery",
  "Cross-Team Marketing Sync",
  "Client Engagement & Deliverable",
  "Operations & Audit Review",
];

export default function RequestFormDrawer({
  isOpen,
  onClose,
  accessItem,
  currentUserName,
  users = [],
  onSubmit,
}: RequestFormDrawerProps) {
  const [onBehalf, setOnBehalf] = useState(false);
  const [beneficiary, setBeneficiary] = useState("");
  const [justification, setJustification] = useState("Daily Sprint & Project Delivery");
  const [durationDays, setDurationDays] = useState(90);
  const [urgency, setUrgency] = useState<"STANDARD" | "URGENT" | "CRITICAL">("STANDARD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !accessItem) return null;

  const isException = !accessItem.isEligible;

  // Target expiration date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + durationDays);
  const requiredUntilFormatted = targetDate.toISOString().split("T")[0];

  const teamOptions = users.length > 0
    ? users.map((u) => u.name).filter((n) => n !== currentUserName)
    : ["Arjun Mehta", "Priya Sharma", "Rahul Verma", "Ananya Sen"];

  const effectiveBeneficiary = onBehalf
    ? (beneficiary || teamOptions[0])
    : currentUserName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError("Please provide a business justification for this access request.");
      return;
    }
    setError("");
    setLoading(true);

    const reqId = await onSubmit({
      accessItemId: accessItem.id,
      beneficiary: effectiveBeneficiary,
      onBehalf,
      justification,
      isException,
      exceptionReason: isException
        ? `Cross-department access: User department requesting ${accessItem.group} resource.`
        : undefined,
      requiredUntil: requiredUntilFormatted,
      urgency,
    });

    setLoading(false);
    if (reqId) {
      setSubmittedId(reqId);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedId(null);
    setJustification("Daily Sprint & Project Delivery");
    setOnBehalf(false);
    setError("");
    setDurationDays(90);
    setUrgency("STANDARD");
    onClose();
  };

  const copyId = () => {
    if (submittedId) {
      navigator.clipboard.writeText(submittedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={handleResetAndClose} aria-hidden="true" />
      <div
        className={`drawer ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Request Access Form"
      >
        {/* Drawer Header */}
        <div className="drawer-head" style={{ padding: "18px 22px", borderBottom: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ServiceLogo tool={accessItem.tool} size={28} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em" }}>
                  {submittedId ? "Request Submitted" : "Request Access"}
                </h3>
                {isException ? (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#92400E",
                      background: "#FEF3C7",
                      border: "1px solid #FDE68A",
                      padding: "2px 7px",
                      borderRadius: "999px",
                    }}
                  >
                    Exception
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#166534",
                      background: "#DCFCE7",
                      border: "1px solid #BBF7D0",
                      padding: "2px 7px",
                      borderRadius: "999px",
                    }}
                  >
                    Standard Policy
                  </span>
                )}
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
                {accessItem.tool} · {accessItem.name}
              </div>
            </div>
          </div>
          <button
            className="drawer-close"
            onClick={handleResetAndClose}
            aria-label="Close drawer"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748B",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body" style={{ padding: "22px" }}>
          {submittedId ? (
            /* Confirmation Screen */
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "999px",
                  background: "#F0FDF4",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  border: "1px solid #DCFCE7",
                }}
              >
                <CheckCircle2 size={28} />
              </div>

              <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Request Successfully Submitted
              </h4>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px" }}>
                Your request has been routed to <strong>{accessItem.approver}</strong> for review.
              </p>

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  maxWidth: "320px",
                  margin: "0 auto 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "10px", color: "#64748B", fontWeight: 700, letterSpacing: "0.05em" }}>REQUEST ID</div>
                  <div className="mono" style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>
                    {submittedId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyId}
                  style={{
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {copied ? <CheckCheck size={13} style={{ color: "#16A34A" }} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", height: "42px", background: "#0F172A", fontSize: "13px", fontWeight: 600 }}
                onClick={handleResetAndClose}
              >
                Done · Return to Dashboard
              </button>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit}>
              {/* Refined Policy Callout Banner */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: isException ? "#FEFCE8" : "#F0FDF4",
                  border: `1px solid ${isException ? "#FEF08A" : "#BBF7D0"}`,
                  color: isException ? "#854D0E" : "#166534",
                  fontSize: "12.5px",
                  lineHeight: 1.45,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {isException ? (
                  <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#CA8A04" }} />
                ) : (
                  <Zap size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#16A34A" }} />
                )}
                <div>
                  <strong style={{ color: isException ? "#713F12" : "#14532D" }}>
                    {isException ? "Exception Required:" : "Standard Policy Match:"}
                  </strong>{" "}
                  {isException
                    ? `This tool belongs to ${accessItem.group}. Justification will be sent to ${accessItem.approver} for sign-off.`
                    : `Pre-approved for your department. Will be routed to ${accessItem.approver}.`}
                </div>
              </div>

              {/* 1. Who needs this access? (Linear-Grade Segmented Capsule) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "8px" }}>
                  Who needs this access?
                </label>
                <div
                  style={{
                    background: "#F1F5F9",
                    padding: "3px",
                    borderRadius: "9px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "3px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOnBehalf(false)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: "7px",
                      border: "none",
                      background: !onBehalf ? "#FFFFFF" : "transparent",
                      color: !onBehalf ? "#0F172A" : "#64748B",
                      fontWeight: !onBehalf ? 600 : 500,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "center",
                      boxShadow: !onBehalf ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
                      transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <User size={13} style={{ color: !onBehalf ? "#2563EB" : "#94A3B8" }} />
                    <span>For Myself</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnBehalf(true)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: "7px",
                      border: "none",
                      background: onBehalf ? "#FFFFFF" : "transparent",
                      color: onBehalf ? "#0F172A" : "#64748B",
                      fontWeight: onBehalf ? 600 : 500,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "center",
                      boxShadow: onBehalf ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
                      transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <Users size={13} style={{ color: onBehalf ? "#2563EB" : "#94A3B8" }} />
                    <span>On Behalf of Colleague</span>
                  </button>
                </div>

                {onBehalf && (
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 600, color: "#64748B", display: "block", marginBottom: "4px" }}>
                      Select Colleague
                    </label>
                    <select
                      className="form-input"
                      value={beneficiary || teamOptions[0]}
                      onChange={(e) => setBeneficiary(e.target.value)}
                      style={{ cursor: "pointer", height: "38px" }}
                    >
                      {teamOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. Access Duration (Crisp Tile Cards) */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={13} style={{ color: "#64748B" }} /> Access Duration
                  </label>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>
                    Expires: <strong style={{ color: "#0F172A" }}>{requiredUntilFormatted}</strong>
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {DURATION_PRESETS.map((preset) => {
                    const isSelected = durationDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setDurationDays(preset.days)}
                        style={{
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: isSelected ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                          background: isSelected ? "#EFF6FF" : "#FFFFFF",
                          color: isSelected ? "#1D4ED8" : "#334155",
                          fontSize: "12px",
                          fontWeight: isSelected ? 600 : 500,
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.12s ease",
                        }}
                      >
                        <span>{preset.label}</span>
                        {isSelected && (
                          <div style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#2563EB" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Request Urgency (Segmented Control) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "8px" }}>
                  Request Urgency
                </label>
                <div
                  style={{
                    background: "#F1F5F9",
                    padding: "3px",
                    borderRadius: "9px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "3px",
                  }}
                >
                  {(["STANDARD", "URGENT", "CRITICAL"] as const).map((lvl) => {
                    const isSelected = urgency === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "7px",
                          border: "none",
                          background: isSelected ? "#FFFFFF" : "transparent",
                          color: isSelected
                            ? lvl === "CRITICAL"
                              ? "#DC2626"
                              : lvl === "URGENT"
                              ? "#D97706"
                              : "#0F172A"
                            : "#64748B",
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          boxShadow: isSelected ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {lvl === "STANDARD" ? "Standard" : lvl === "URGENT" ? "⚡ Urgent" : "🔥 Critical"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Business Justification with Quick Fill Chips */}
              <div style={{ marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                    Business Justification <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>1-Click Presets:</span>
                </div>

                {/* Clean Quick Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                  {QUICK_JUSTIFICATIONS.map((text) => {
                    const isSelected = justification === text;
                    return (
                      <button
                        key={text}
                        type="button"
                        onClick={() => setJustification(text)}
                        style={{
                          border: isSelected ? "1px solid #93C5FD" : "1px solid #E2E8F0",
                          background: isSelected ? "#EFF6FF" : "#F8FAFC",
                          color: isSelected ? "#1D4ED8" : "#475569",
                          padding: "4px 9px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          cursor: "pointer",
                          fontWeight: isSelected ? 600 : 500,
                          transition: "all 0.12s ease",
                        }}
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Explain why you or your team requires access..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.5,
                    borderRadius: "8px",
                    borderColor: "#E2E8F0",
                  }}
                  required
                />
              </div>

              {error && (
                <div style={{ color: "#DC2626", fontSize: "12px", marginBottom: "14px", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              {/* Form Action Footer */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, height: "40px", fontSize: "13px", fontWeight: 500 }}
                  onClick={handleResetAndClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    flex: 1.8,
                    height: "40px",
                    fontSize: "13px",
                    fontWeight: 600,
                    background: "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  disabled={loading}
                >
                  <Send size={14} />
                  <span>{loading ? "Submitting..." : isException ? "Submit Exception Request" : "Submit Access Request"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
