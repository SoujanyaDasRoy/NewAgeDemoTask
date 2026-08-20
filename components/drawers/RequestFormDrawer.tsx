"use client";

import React, { useState } from "react";
import { X, CheckCircle2, User, Users } from "lucide-react";
import StatusBadge from "../StatusBadge";

const EMPLOYEES = [
  "Vanshika Sharma",
  "Rohit Malhotra",
  "Ananya Rao",
  "Kabir Singh",
  "Priya Menon",
];

interface RequestFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessItem: any;
  currentUserName: string;
  onSubmit: (data: {
    accessItemId: string;
    beneficiary: string;
    onBehalf: boolean;
    justification: string;
  }) => Promise<string | null>;
}

export default function RequestFormDrawer({
  isOpen,
  onClose,
  accessItem,
  currentUserName,
  onSubmit,
}: RequestFormDrawerProps) {
  const [onBehalf, setOnBehalf] = useState(false);
  const [beneficiary, setBeneficiary] = useState(EMPLOYEES[0]);
  const [justification, setJustification] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!isOpen || !accessItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError("Please provide a business justification for this request.");
      return;
    }
    setError("");
    setLoading(true);

    const reqId = await onSubmit({
      accessItemId: accessItem.id,
      beneficiary: onBehalf ? beneficiary : currentUserName,
      onBehalf,
      justification,
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
    onClose();
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
        <div className="drawer-head">
          <div>
            <h3>{submittedId ? "Request Submitted" : "Request Access"}</h3>
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
                  background: "#F0FDF4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#22C55E",
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "#111827" }}>
                Access request submitted
              </h3>
              <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "5px" }}>
                We'll notify you as it moves through approval.
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
                  <StatusBadge status="Pending Approval" />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280" }}>Approver</span>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{accessItem.approver}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280" }}>Beneficiary</span>
                  <span style={{ fontWeight: 600, color: "#111827" }}>
                    {onBehalf ? beneficiary : currentUserName}
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
              <div className="form-group">
                <label className="form-label">Who is this access for?</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="button"
                    className={`btn ${!onBehalf ? "btn-primary" : "btn-secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => setOnBehalf(false)}
                  >
                    <User size={15} /> For Myself
                  </button>
                  <button
                    type="button"
                    className={`btn ${onBehalf ? "btn-primary" : "btn-secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => setOnBehalf(true)}
                  >
                    <Users size={15} /> On Behalf Of
                  </button>
                </div>
              </div>

              {onBehalf && (
                <div className="form-group">
                  <label className="form-label">Select Employee</label>
                  <select
                    className="form-select"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                  >
                    {EMPLOYEES.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-label">Business Justification</label>
                <span className="form-sublabel">
                  Explain why this access is required for your or the beneficiary's work.
                </span>
                <textarea
                  className={`form-textarea ${error ? "input-error" : ""}`}
                  rows={4}
                  placeholder="e.g. Need visibility into customer tickets to resolve escalations..."
                  value={justification}
                  onChange={(e) => {
                    setJustification(e.target.value);
                    if (error) setError("");
                  }}
                />
                {error && <div className="field-error">{error}</div>}
              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  background: "#F8FAFC",
                  borderRadius: "9px",
                  fontSize: "12px",
                  color: "#64748B",
                }}
              >
                Approver: <strong style={{ color: "#334155" }}>{accessItem.approver}</strong> · Provisioning:{" "}
                <strong style={{ color: "#334155" }}>
                  {accessItem.automation ? "Automated upon approval" : "Manual by access provider"}
                </strong>
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
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Access Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
