"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Building2,
  Send,
  Copy,
  CheckCheck,
  Calendar,
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import ServiceLogo from "../ServiceLogo";

interface ExceptionFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessItem: any;
  currentUserName: string;
  onSubmit: (data: {
    accessItemId: string;
    reason: string;
    justification: string;
    requiredUntil: string;
    urgency: "STANDARD" | "URGENT" | "CRITICAL";
  }) => Promise<string | null>;
}

export default function ExceptionFormDrawer({
  isOpen,
  onClose,
  accessItem,
  currentUserName,
  onSubmit,
}: ExceptionFormDrawerProps) {
  const [reason, setReason] = useState("Cross-team Project Collaboration");
  const [justification, setJustification] = useState("");
  const [urgency, setUrgency] = useState<"STANDARD" | "URGENT" | "CRITICAL">("STANDARD");
  const [requiredUntil, setRequiredUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !accessItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError("Please provide a business justification for this cross-department request.");
      return;
    }
    setError("");
    setLoading(true);

    const reqId = await onSubmit({
      accessItemId: accessItem.id,
      reason,
      justification,
      requiredUntil,
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
    setError("");
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
        aria-label="Cross-Department Access Request Form"
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
                  {submittedId ? "Request Submitted" : "Cross-Department Request"}
                </h3>
                <span className="badge badge-neutral" style={{ fontSize: "11px", fontWeight: 600, padding: "2.5px 8px" }}>
                  🏢 Cross-Department
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "2px" }}>
                {accessItem.tool} · {accessItem.name}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={handleResetAndClose} aria-label="Close drawer">
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
                Cross-Department Request Submitted
              </h4>
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: "0 0 20px" }}>
                Routed to <strong>{accessItem.approver}</strong> ({accessItem.group} Owner) for cross-team approval.
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
            <form onSubmit={handleSubmit}>
              {/* Sleek Elegant Neutral Routing Note */}
              <div className="drawer-routing-note">
                <Building2 size={16} className="drawer-routing-note-icon" />
                <div>
                  <div className="drawer-routing-note-title">
                    Managed by {accessItem.group || "Marketing Team"}
                  </div>
                  <div className="drawer-routing-note-desc">
                    Routes to {accessItem.approver || "Rahul Verma"} (Owner) for cross-team approval.
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Cross-Department Access</label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ height: "38px" }}
                >
                  <option value="Cross-team Project Collaboration">
                    Cross-team Project Collaboration
                  </option>
                  <option value="Temporary Coverage / On-call Rotation">
                    Temporary Coverage / On-call Rotation
                  </option>
                  <option value="Auditing / QA Testing">Auditing / QA Testing</option>
                  <option value="Inter-Department Transition">
                    Inter-Department Transition
                  </option>
                </select>
              </div>

              {/* Expiration Date */}
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Calendar size={13} style={{ color: "var(--muted)" }} /> Access Expiration Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={requiredUntil}
                  onChange={(e) => setRequiredUntil(e.target.value)}
                  style={{ height: "38px" }}
                />
              </div>

              {/* Request Urgency (Linear Segmented Control) */}
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

              <div className="form-group" style={{ marginBottom: "22px" }}>
                <label className="form-label">
                  Business Justification <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <span className="form-sublabel">
                  Explain the project scope and why cross-department access is required.
                </span>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Detail project deliverables, rationale, and timelines..."
                  value={justification}
                  onChange={(e) => {
                    setJustification(e.target.value);
                    if (error) setError("");
                  }}
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
                    Provide clear context to accelerate owner approval.
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--muted-2)", fontVariantNumeric: "tabular-nums" }}>
                    {justification.length} chars
                  </span>
                </div>
                {error && <div style={{ color: "#EF4444", fontSize: "11.5px", marginTop: "4px" }}>{error}</div>}
              </div>

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
                  <span>{loading ? "Submitting..." : "Submit Cross-Team Request"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

