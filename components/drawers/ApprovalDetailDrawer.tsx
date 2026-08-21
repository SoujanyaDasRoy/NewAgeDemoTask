"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  AlertCircle,
  ShieldCheck,
  User,
  Clock,
  Send,
  AlertTriangle,
  Zap,
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import Timeline from "../Timeline";
import ServiceLogo from "../ServiceLogo";

const PRESET_REJECTION_REASONS = [
  "Duplicate access request",
  "Role / department mismatch for requested permission",
  "Requires additional security & governance sign-off",
  "Insufficient business justification provided",
  "Temporary project duration expired",
];

interface ApprovalDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  actingUserName: string;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string, reason: string) => Promise<void>;
}

export default function ApprovalDetailDrawer({
  isOpen,
  onClose,
  request,
  actingUserName,
  onApprove,
  onReject,
}: ApprovalDetailDrawerProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(PRESET_REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !request) return null;

  const toolName = request.accessItem?.tool || request.accessLabel.split(" – ")[0] || "Tool";

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(request.id);
    setLoading(false);
    onClose();
  };

  const handleReject = async () => {
    const finalReason = customReason.trim() ? customReason.trim() : rejectReason;
    setLoading(true);
    await onReject(request.id, finalReason);
    setLoading(false);
    setRejectModalOpen(false);
    onClose();
  };

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Approval Review Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ServiceLogo tool={toolName} size={24} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                  Approval Review
                </h3>
                {request.isException ? (
                  <span className="badge badge-amber">Exception</span>
                ) : (
                  <span className="badge badge-gray">Standard</span>
                )}
              </div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "1px" }}>
                {request.accessLabel} · <span className="mono">{request.id}</span>
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Quick Decision Action Card */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#0F172A",
              color: "#FFFFFF",
              marginBottom: "20px",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#F1F5F9", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={14} style={{ color: "#60A5FA" }} /> Pending Decision
              </div>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                Approver: <strong>{actingUserName}</strong>
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                style={{
                  flex: 1.4,
                  height: "36px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
                disabled={loading}
                onClick={handleApprove}
              >
                <Check size={15} /> {loading ? "Approving..." : "Approve Access"}
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  height: "36px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  background: "transparent",
                  color: "#FCA5A5",
                  border: "1px solid #7F1D1D",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
                disabled={loading}
                onClick={() => setRejectModalOpen(true)}
              >
                <X size={15} /> Reject
              </button>
            </div>
          </div>

          {/* Exception Details Callout */}
          {request.isException && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px",
                borderRadius: "8px",
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#D97706", flexShrink: 0, marginTop: "1px" }} />
              <div>
                <div style={{ fontWeight: 700, color: "#92400E", fontSize: "12.5px" }}>
                  Cross-Department Exception Request
                </div>
                <div style={{ color: "#B45309", marginTop: "3px", fontSize: "11.5px", lineHeight: 1.45 }}>
                  <strong>Reason:</strong> {request.exceptionReason || "Project need outside standard department group"} <br />
                  <strong>Urgency:</strong> {request.urgency || "Standard"} ·{" "}
                  <strong>Required Until:</strong> {request.requiredUntil || "Indefinite"}
                </div>
              </div>
            </div>
          )}

          {/* Workflow Journey */}
          <div className="divider-label" style={{ marginBottom: "10px" }}>
            Workflow Journey
          </div>
          <Timeline steps={request.timeline || []} />

          {/* Request Metadata Grid */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label" style={{ marginBottom: "10px" }}>
              Request &amp; Applicant Details
            </div>
            <div className="field-grid">
              <div className="field">
                <span className="f-label">Requester</span>
                <span className="f-value">{request.requester?.name || request.requesterName}</span>
              </div>
              <div className="field">
                <span className="f-label">Beneficiary</span>
                <span className="f-value">{request.beneficiaryName}</span>
              </div>
              <div className="field">
                <span className="f-label">Provisioning Type</span>
                <span className="f-value">
                  {request.automation ? (
                    <span style={{ color: "#2563EB", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Zap size={11} /> Automated SCIM
                    </span>
                  ) : (
                    "Manual IT"
                  )}
                </span>
              </div>
              <div className="field">
                <span className="f-label">Submitted On</span>
                <span className="f-value">
                  {new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Justification */}
            <div style={{ marginTop: "14px" }}>
              <span className="f-label">Business Justification</span>
              <div
                style={{
                  marginTop: "5px",
                  padding: "10px 12px",
                  background: "#F8FAFC",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  color: "#334155",
                  lineHeight: "1.45",
                }}
              >
                {request.justification}
              </div>
            </div>
          </div>
        </div>

        {/* Reject Modal Sheet */}
        {rejectModalOpen && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "380px",
                background: "#FFFFFF",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 20px 45px rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <AlertCircle size={16} style={{ color: "#DC2626" }} />
                <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 700, color: "#0F172A" }}>
                  Reject Access Request
                </h4>
              </div>

              <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 12px", lineHeight: 1.4 }}>
                Select a standard rejection reason or provide custom feedback:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" }}>
                {PRESET_REJECTION_REASONS.map((r) => (
                  <label
                    key={r}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "11.5px",
                      color: "#334155",
                      cursor: "pointer",
                      padding: "5px 8px",
                      borderRadius: "6px",
                      background: rejectReason === r ? "#FEF2F2" : "#F8FAFC",
                      border: `1px solid ${rejectReason === r ? "#FECACA" : "#E2E8F0"}`,
                    }}
                  >
                    <input
                      type="radio"
                      name="rejectReason"
                      checked={rejectReason === r}
                      onChange={() => setRejectReason(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748B", display: "block", marginBottom: "4px" }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Provide additional context..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, height: "34px", fontSize: "12px" }}
                  onClick={() => setRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1.3, height: "34px", fontSize: "12px" }}
                  disabled={loading}
                  onClick={handleReject}
                >
                  {loading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
