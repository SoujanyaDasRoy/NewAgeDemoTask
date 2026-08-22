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
        <div className="drawer-head" style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="tool-logo-badge">
              <ServiceLogo tool={accessItem.tool} size={28} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  {submittedId ? "Request Submitted" : "Request Access"}
                </h3>
                {isException ? (
                  <span className="badge badge-amber">
                    Cross-Team
                  </span>
                ) : (
                  <span className="badge badge-green">
                    Standard Policy
                  </span>
                )}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "2px" }}>
                {accessItem.tool} · {accessItem.name}
              </div>
            </div>
          </div>
          <button
            className="drawer-close"
            onClick={handleResetAndClose}
            aria-label="Close drawer"
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
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#4ADE80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                }}
              >
                <CheckCircle2 size={28} />
              </div>

              <h4 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                Request Successfully Submitted
              </h4>
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 20px" }}>
                Your request has been routed to <strong>{accessItem.approver}</strong> for review.
              </p>

              <div
                style={{
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
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
                  <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.05em" }}>REQUEST ID</div>
                  <div className="mono" style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginTop: "2px" }}>
                    {submittedId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyId}
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {copied ? <CheckCheck size={13} style={{ color: "#4ADE80" }} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", height: "42px", fontSize: "13px", fontWeight: 600 }}
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
                  background: isException ? "rgba(245, 158, 11, 0.12)" : "rgba(34, 197, 94, 0.12)",
                  border: `1px solid ${isException ? "rgba(245, 158, 11, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
                  color: isException ? "#FBBF24" : "#4ADE80",
                  fontSize: "12.5px",
                  lineHeight: 1.45,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {isException ? (
                  <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#FBBF24" }} />
                ) : (
                  <Zap size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#4ADE80" }} />
                )}
                <div>
                  <strong style={{ color: "var(--text)" }}>
                    {isException ? "🏢 Cross-Department Resource:" : "Standard Policy Match:"}
                  </strong>{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    {isException
                      ? `This resource is managed by ${accessItem.group}. Submitting a request will route directly to the ${accessItem.group} owner (${accessItem.approver}) for cross-team approval.`
                      : `Pre-approved for your department. Will be routed to ${accessItem.approver}.`}
                  </span>
                </div>
              </div>

              {/* 1. Who needs this access? (Linear-Grade Segmented Capsule) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Who needs this access?
                </label>
                <div
                  style={{
                    background: "var(--surface-subtle)",
                    padding: "3px",
                    borderRadius: "9px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "3px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOnBehalf(false)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: "7px",
                      border: "none",
                      background: !onBehalf ? "var(--surface)" : "transparent",
                      color: !onBehalf ? "var(--text)" : "var(--muted)",
                      fontWeight: !onBehalf ? 600 : 500,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "center",
                      boxShadow: !onBehalf ? "var(--shadow-xs)" : "none",
                      transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <User size={13} style={{ color: !onBehalf ? "var(--accent)" : "var(--muted)" }} />
                    <span>For Myself</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnBehalf(true)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: "7px",
                      border: "none",
                      background: onBehalf ? "var(--surface)" : "transparent",
                      color: onBehalf ? "var(--text)" : "var(--muted)",
                      fontWeight: onBehalf ? 600 : 500,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "center",
                      boxShadow: onBehalf ? "var(--shadow-xs)" : "none",
                      transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <Users size={13} style={{ color: onBehalf ? "var(--accent)" : "var(--muted)" }} />
                    <span>On Behalf of Colleague</span>
                  </button>
                </div>

                {onBehalf && (
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "4px" }}>
                      Select Colleague
                    </label>
                    <select
                      className="form-select"
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
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={13} style={{ color: "var(--muted)" }} /> Access Duration
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Expires: <strong style={{ color: "var(--text)" }}>{requiredUntilFormatted}</strong>
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
                          border: isSelected ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                          background: isSelected ? "var(--accent-light)" : "var(--surface)",
                          color: isSelected ? "var(--accent)" : "var(--text-secondary)",
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
                          <div style={{ width: "6px", height: "6px", borderRadius: "999px", background: "var(--accent)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Request Urgency (Segmented Control) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Request Urgency
                </label>
                <div
                  style={{
                    background: "var(--surface-subtle)",
                    padding: "3px",
                    borderRadius: "9px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "3px",
                    border: "1px solid var(--border)",
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
                          background: isSelected ? "var(--surface)" : "transparent",
                          color: isSelected
                            ? lvl === "CRITICAL"
                              ? "#EF4444"
                              : lvl === "URGENT"
                              ? "#F59E0B"
                              : "var(--text)"
                            : "var(--muted)",
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          boxShadow: isSelected ? "var(--shadow-xs)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {lvl === "STANDARD" ? "Standard" : lvl === "URGENT" ? "Urgent" : "Critical"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Business Justification with Quick Fill Chips */}
              <div style={{ marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Business Justification <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>1-Click Presets:</span>
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
                          border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: isSelected ? "var(--accent-light)" : "var(--surface)",
                          color: isSelected ? "var(--accent)" : "var(--text-secondary)",
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
                  }}
                  required
                />
              </div>

              {error && (
                <div style={{ color: "#EF4444", fontSize: "12px", marginBottom: "14px", fontWeight: 500 }}>
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  disabled={loading}
                >
                  <Send size={14} />
                  <span>{loading ? "Submitting..." : isException ? "Submit Cross-Team Request" : "Submit Access Request"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
