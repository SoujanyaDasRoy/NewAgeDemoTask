"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Send } from "lucide-react";
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
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                {submittedId ? "Exception Request Submitted" : "Request Access Exception"}
              </h3>
              <span className="badge badge-amber" style={{ fontSize: "10.5px" }}>Exception</span>
            </div>
            <div className="sub" style={{ fontSize: "12px", color: "#64748B", marginTop: "1px" }}>
              {accessItem.tool} – {accessItem.name}
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
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  color: "#D97706",
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0F172A" }}>
                Exception Request Submitted
              </h4>
              <p style={{ fontSize: "12.5px", color: "#64748B", marginTop: "4px" }}>
                Routed to {accessItem.approver} for exception evaluation.
              </p>

              <div
                style={{
                  marginTop: "20px",
                  padding: "12px 14px",
                  background: "#F8FAFC",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#64748B" }}>Request ID</span>
                  <span className="mono font-bold text-[#0F172A]">{submittedId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#64748B" }}>Status</span>
                  <StatusBadge status="Pending Exception Approval" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#64748B" }}>Approver</span>
                  <span style={{ fontWeight: 600, color: "#0F172A" }}>{accessItem.approver}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#64748B" }}>Required Until</span>
                  <span style={{ fontWeight: 600, color: "#0F172A" }}>{requiredUntil}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#64748B" }}>Urgency</span>
                  <span style={{ fontWeight: 600, color: urgency === "CRITICAL" ? "#DC2626" : urgency === "URGENT" ? "#D97706" : "#475569" }}>
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
                <AlertTriangle size={15} style={{ marginTop: "1px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: "#92400E" }}>
                    Out-of-Department Resource
                  </div>
                  <div style={{ color: "#B45309", marginTop: "2px" }}>
                    This resource belongs to {accessItem.group}. A justified exception review is required.
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Reason for Exception</label>
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
                  <label className="form-label">Access Required Until</label>
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
                  Explain the project scope and why this exception is needed.
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
                {error && <div style={{ color: "#DC2626", fontSize: "11.5px", marginTop: "4px" }}>{error}</div>}
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
                  <Send size={13} /> {loading ? "Submitting..." : "Submit Exception"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
