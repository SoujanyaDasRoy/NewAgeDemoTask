"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  User,
  Users,
  Building2,
  Clock,
  Send,
  Copy,
  CheckCheck,
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
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "Permanent", days: 365 },
];

const QUICK_PRESETS = [
  { label: "+ Daily Sprint", value: "Daily Sprint & Project Delivery" },
  { label: "+ Marketing Sync", value: "Cross-Team Marketing Sync" },
  { label: "+ Client Deliverable", value: "Client Engagement & Deliverable" },
  { label: "+ Audit Review", value: "Operations & Audit Review" },
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
            <div className="drawer-logo-lightbox">
              <ServiceLogo tool={accessItem.tool} size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  {submittedId ? "Request Submitted" : "Request Access"}
                </h3>
                {isException ? (
                  <span className="badge badge-neutral" style={{ fontSize: "11px", fontWeight: 600, padding: "2.5px 8px" }}>
                    🏢 Cross-Department
                  </span>
                ) : (
                  <span className="badge badge-green" style={{ fontSize: "11px", fontWeight: 600, padding: "2.5px 8px" }}>
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
              {/* Sleek Elegant Neutral Routing Note */}
              <div className="drawer-routing-note">
                <Building2 size={16} className="drawer-routing-note-icon" />
                <div>
                  <div className="drawer-routing-note-title">
                    {isException
                      ? `Managed by ${accessItem.group || "Marketing Team"}`
                      : "Standard Policy Match"}
                  </div>
                  <div className="drawer-routing-note-desc">
                    {isException
                      ? `Routes to ${accessItem.approver || "Rahul Verma"} (Owner) for cross-team approval.`
                      : `Pre-approved for your department. Routes directly to ${accessItem.approver || "Owner"} for fulfillment.`}
                  </div>
                </div>
              </div>

              {/* 1. Who needs this access? (Linear-Grade Segmented Control) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Who needs this access?
                </label>
                <div className="drawer-segmented-control" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <button
                    type="button"
                    onClick={() => setOnBehalf(false)}
                    className={`drawer-segmented-btn ${!onBehalf ? "active" : ""}`}
                  >
                    <User size={13} style={{ color: !onBehalf ? "var(--text)" : "var(--muted)" }} />
                    <span>For Myself</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnBehalf(true)}
                    className={`drawer-segmented-btn ${onBehalf ? "active" : ""}`}
                  >
                    <Users size={13} style={{ color: onBehalf ? "var(--text)" : "var(--muted)" }} />
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

              {/* 2. Access Duration (Unified 4-Segment Pill Bar) */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={13} style={{ color: "var(--muted)" }} /> Access Duration
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Expires: <strong style={{ color: "var(--text)" }}>{requiredUntilFormatted}</strong>
                  </span>
                </div>

                <div className="drawer-pill-grid">
                  {DURATION_PRESETS.map((preset) => {
                    const isSelected = durationDays === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setDurationDays(preset.days)}
                        className={`drawer-pill-btn ${isSelected ? "active" : ""}`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Request Urgency (Linear Segmented Control) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Request Urgency
                </label>
                <div className="drawer-segmented-control" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {(["STANDARD", "URGENT", "CRITICAL"] as const).map((lvl) => {
                    const isSelected = urgency === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl)}
                        className={`drawer-segmented-btn ${isSelected ? "active" : ""}`}
                      >
                        {lvl === "STANDARD" ? "Standard" : lvl === "URGENT" ? "Urgent" : "Critical"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Business Justification with Inline Chip Bar */}
              <div style={{ marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Business Justification <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>1-Click Presets:</span>
                </div>

                {/* Cohesive, unobtrusive inline chip bar */}
                <div className="quick-chip-bar">
                  {QUICK_PRESETS.map((preset) => {
                    const isSelected = justification === preset.value;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setJustification(preset.value)}
                        className={`quick-chip-btn ${isSelected ? "active" : ""}`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Provide clear business context to speed up review..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.5,
                    padding: "10px 12px",
                    marginTop: "4px",
                  }}
                  required
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Provide clear business context to speed up review.
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--muted-2)", fontVariantNumeric: "tabular-nums" }}>
                    {justification.length} chars
                  </span>
                </div>
              </div>

              {error && (
                <div style={{ color: "#EF4444", fontSize: "12px", marginBottom: "14px", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              {/* Form Action Footer */}
              <div className="drawer-footer-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetAndClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
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

