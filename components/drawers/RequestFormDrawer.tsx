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
  { label: "90 Days (Quarterly)", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "Permanent / Indefinite", days: 365 },
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
  const [justification, setJustification] = useState("");
  const [durationDays, setDurationDays] = useState(90);
  const [urgency, setUrgency] = useState<"STANDARD" | "URGENT" | "CRITICAL">("STANDARD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !accessItem) return null;

  const isException = !accessItem.isEligible;

  // Calculate target expiration date
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
    setJustification("");
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
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ServiceLogo tool={accessItem.tool} size={26} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F1B33" }}>
                  {submittedId ? "Request Submitted" : "Request Access"}
                </h3>
                {isException && (
                  <span className="badge badge-amber" style={{ fontSize: "10.5px" }}>
                    Exception Required
                  </span>
                )}
              </div>
              <div className="sub" style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
                {accessItem.tool} · {accessItem.name}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={handleResetAndClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {submittedId ? (
            /* Confirmation Screen */
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "999px",
                  background: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0F1B33", margin: "0 0 6px" }}>
                Request Successfully Submitted
              </h4>
              <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px" }}>
                Your request has been routed to <strong>{accessItem.approver}</strong> for review.
              </p>

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "16px",
                  maxWidth: "320px",
                  margin: "0 auto 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>REQUEST ID</div>
                  <div className="mono" style={{ fontSize: "15px", fontWeight: 700, color: "#0F1B33", marginTop: "2px" }}>
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
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {copied ? <CheckCheck size={13} style={{ color: "#16A34A" }} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", height: "42px" }}
                onClick={handleResetAndClose}
              >
                Done · Return to Dashboard
              </button>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit}>
              {/* Policy Banner */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: isException ? "#FFFBEB" : "#F0FDF4",
                  border: `1px solid ${isException ? "#FDE68A" : "#BBF7D0"}`,
                  color: isException ? "#92400E" : "#166534",
                  fontSize: "12px",
                  lineHeight: 1.45,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {isException ? (
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "1px", color: "#D97706" }} />
                ) : (
                  <Zap size={16} style={{ flexShrink: 0, marginTop: "1px", color: "#16A34A" }} />
                )}
                <div>
                  <strong>{isException ? "Exception Required:" : "Standard Policy Match:"}</strong>{" "}
                  {isException
                    ? `This tool belongs to ${accessItem.group}. A business justification will be sent to ${accessItem.approver} for exception sign-off.`
                    : `Pre-approved for your department. Request will fast-track to ${accessItem.approver}.`}
                </div>
              </div>

              {/* Beneficiary Option */}
              <div style={{ marginBottom: "18px" }}>
                <label className="form-label" style={{ marginBottom: "8px" }}>Who needs this access?</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setOnBehalf(false)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1.5px solid ${!onBehalf ? "#2563EB" : "#E2E8F0"}`,
                      background: !onBehalf ? "#EFF6FF" : "#FFFFFF",
                      color: !onBehalf ? "#1E40AF" : "#64748B",
                      fontWeight: 600,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "center",
                    }}
                  >
                    <User size={14} /> For Myself
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnBehalf(true)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1.5px solid ${onBehalf ? "#2563EB" : "#E2E8F0"}`,
                      background: onBehalf ? "#EFF6FF" : "#FFFFFF",
                      color: onBehalf ? "#1E40AF" : "#64748B",
                      fontWeight: 600,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      justifyContent: "center",
                    }}
                  >
                    <Users size={14} /> On Behalf of Colleague
                  </button>
                </div>

                {onBehalf && (
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ fontSize: "11.5px", color: "#64748B", display: "block", marginBottom: "4px" }}>
                      Select Colleague Name
                    </label>
                    <select
                      className="form-input"
                      value={beneficiary || teamOptions[0]}
                      onChange={(e) => setBeneficiary(e.target.value)}
                      style={{ cursor: "pointer" }}
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

              {/* Duration Presets */}
              <div style={{ marginBottom: "18px" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Clock size={13} style={{ color: "#2563EB" }} /> Access Duration
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setDurationDays(preset.days)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "7px",
                        border: `1px solid ${durationDays === preset.days ? "#2563EB" : "#E2E8F0"}`,
                        background: durationDays === preset.days ? "#EFF6FF" : "#F8FAFC",
                        color: durationDays === preset.days ? "#1E40AF" : "#475569",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px" }}>
                  Access will automatically expire on <strong>{requiredUntilFormatted}</strong>.
                </div>
              </div>

              {/* Urgency Selector */}
              <div style={{ marginBottom: "18px" }}>
                <label className="form-label" style={{ marginBottom: "6px" }}>Request Priority / Urgency</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["STANDARD", "URGENT", "CRITICAL"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        borderRadius: "6px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        border: `1px solid ${urgency === lvl ? (lvl === "CRITICAL" ? "#DC2626" : lvl === "URGENT" ? "#D97706" : "#2563EB") : "#E2E8F0"}`,
                        background: urgency === lvl ? (lvl === "CRITICAL" ? "#FEF2F2" : lvl === "URGENT" ? "#FFFBEB" : "#EFF6FF") : "#FFFFFF",
                        color: urgency === lvl ? (lvl === "CRITICAL" ? "#B91C1C" : lvl === "URGENT" ? "#B45309" : "#1D4ED8") : "#64748B",
                        cursor: "pointer",
                      }}
                    >
                      {lvl === "STANDARD" ? "Standard" : lvl === "URGENT" ? "⚡ Urgent" : "🔥 Critical"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Justification Textarea */}
              <div style={{ marginBottom: "20px" }}>
                <label className="form-label" style={{ marginBottom: "4px" }}>
                  Business Justification <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <span className="form-sublabel" style={{ display: "block", marginBottom: "6px" }}>
                  Explain why you or your team requires access to this tool.
                </span>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Collaborating with marketing on Q3 field campaign assets and sprint sign-offs..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div style={{ color: "#DC2626", fontSize: "12px", marginBottom: "14px", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              {/* Form Action Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, height: "42px" }}
                  onClick={handleResetAndClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5, height: "42px" }}
                  disabled={loading}
                >
                  <Send size={14} /> {loading ? "Submitting..." : isException ? "Submit Exception Request" : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
