"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";
import StatusBadge from "../StatusBadge";

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
        aria-label="Request Access Exception Form"
      >
        <div className="drawer-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3>{submittedId ? "Exception Request Submitted" : "Request Access Exception"}</h3>
              <span className="badge badge-amber">Exception</span>
            </div>
            <div className="sub">
              {accessItem.tool} – {accessItem.name}
            </div>
          </div>
          <button className="drawer-close" onClick={handleResetAndClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {submittedId ? (
            <div style={{ textAlign: "center", padding: "14px 0" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "999px",
                  background: "#FFFBEB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#D97706",
                }}
              >
                <AlertTriangle size={32} />
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "#111827" }}>
                Exception request submitted
              </h3>
              <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "5px" }}>
                Routed to the designated approver for exception evaluation.
              </p>

              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "#F8FAFC",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280" }}>Request ID</span>
                  <span className="mono font-bold text-[#111827]">{submittedId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280" }}>Status</span>
                  <StatusBadge status="Pending Exception Approval" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280" }}>Approver</span>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{accessItem.approver}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280" }}>Required Until</span>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{requiredUntil}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280" }}>Urgency</span>
                  <span style={{ fontWeight: 600, color: urgency === "CRITICAL" ? "#DC2626" : urgency === "URGENT" ? "#D97706" : "#4B5563" }}>
                    {urgency}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: "24px" }}
                onClick={handleResetAndClose}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="warn-box" style={{ marginBottom: "20px" }}>
                <AlertTriangle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: "#92400E" }}>
                    Out-of-Department Request
                  </div>
                  <div style={{ color: "#B45309", marginTop: "2px" }}>
                    You are requesting access to a resource outside your normal department ({accessItem.group}). This will require specific exception review.
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Reason for Exception</label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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

              <div className="field-grid" style={{ marginBottom: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Access Required Until</label>
                  <input
                    type="date"
                    className="form-input"
                    value={requiredUntil}
                    onChange={(e) => setRequiredUntil(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Urgency Level</label>
                  <select
                    className="form-select"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
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
                  Detail the project scope, deliverables, and why this exception is needed.
                </span>
                <textarea
                  className={`form-textarea ${error ? "input-error" : ""}`}
                  rows={4}
                  placeholder="Explain why standard departmental access is insufficient..."
                  value={justification}
                  onChange={(e) => {
                    setJustification(e.target.value);
                    if (error) setError("");
                  }}
                />
                {error && <div className="field-error">{error}</div>}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={handleResetAndClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-block"
                  style={{ flex: 2, background: "#B45309", color: "#fff" }}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Exception Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
