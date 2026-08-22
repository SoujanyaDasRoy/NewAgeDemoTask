"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Send } from "lucide-react";
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

  if (!isOpen || !accessItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError("Please provide a business justification for this exception.");
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
    onClose();
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
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="tool-logo-badge">
              <ServiceLogo tool={accessItem.tool} size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  {submittedId ? "Cross-Department Access Request Submitted" : "Cross-Department Access Request"}
                </h3>
                <span className="badge badge-amber" style={{ fontSize: "10.5px" }}>Cross-Team</span>
              </div>
              <div className="sub" style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1px" }}>
                {accessItem.tool} – {accessItem.name}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={handleResetAndClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {submittedId ? (
            <div style={{ textAlign: "center", padding: "14px 0" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "999px",
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  color: "#FBBF24",
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                Cross-Department Access Request Submitted
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "4px" }}>
                Routed to {accessItem.approver} for cross-team approval.
              </p>

              <div
                style={{
                  marginTop: "20px",
                  padding: "12px 14px",
                  background: "var(--surface-subtle)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--muted)" }}>Request ID</span>
                  <span className="mono font-bold" style={{ color: "var(--text)" }}>{submittedId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--muted)" }}>Status</span>
                  <StatusBadge status="Pending Exception Approval" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--muted)" }}>Approver</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{accessItem.approver}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--muted)" }}>Access Expiration Date</span>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{requiredUntil}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "var(--muted)" }}>Urgency</span>
                  <span style={{ fontWeight: 600, color: urgency === "CRITICAL" ? "#EF4444" : urgency === "URGENT" ? "#F59E0B" : "var(--text)" }}>
                    {urgency}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: "20px", height: "38px" }}
                onClick={handleResetAndClose}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="warn-box" style={{ marginBottom: "16px" }}>
                <AlertTriangle size={15} style={{ marginTop: "1px", flexShrink: 0, color: "#F59E0B" }} />
                <div>
                  <div style={{ fontWeight: 700 }}>
                    🏢 Cross-Department Resource
                  </div>
                  <div style={{ marginTop: "2px", fontSize: "11.5px" }}>
                    This resource is managed by {accessItem.group}. Submitting a request will route directly to the {accessItem.group} owner ({accessItem.approver}) for cross-team approval.
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Cross-Department Access</label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ height: "36px" }}
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

              <div className="field-grid" style={{ marginBottom: "14px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Access Expiration Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={requiredUntil}
                    onChange={(e) => setRequiredUntil(e.target.value)}
                    style={{ height: "36px" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Urgency Level</label>
                  <select
                    className="form-select"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    style={{ height: "36px" }}
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="URGENT">Urgent (Blocked)</option>
                    <option value="CRITICAL">Critical (Production)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Business Justification</label>
                <span className="form-sublabel">
                  Explain the project scope and why cross-department access is needed.
                </span>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Detail project deliverables and rationale..."
                  value={justification}
                  onChange={(e) => {
                    setJustification(e.target.value);
                    if (error) setError("");
                  }}
                />
                {error && <div style={{ color: "#EF4444", fontSize: "11.5px", marginTop: "4px" }}>{error}</div>}
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, height: "38px" }}
                  onClick={handleResetAndClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5, height: "38px" }}
                  disabled={loading}
                >
                  <Send size={13} /> {loading ? "Submitting..." : "Submit Cross-Team Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
