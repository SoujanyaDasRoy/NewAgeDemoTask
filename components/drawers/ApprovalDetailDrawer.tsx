"use client";

import React, { useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import StatusBadge from "../StatusBadge";
import Timeline from "../Timeline";

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
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? "show" : ""}`}>
        <div className="drawer-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3>Approval Review</h3>
              {request.isException && <span className="badge badge-amber">Exception</span>}
            </div>
            <div className="sub">
              {request.accessLabel} · <span className="mono">{request.id}</span>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {request.isException && (
            <div className="warn-box" style={{ marginBottom: "20px" }}>
              <AlertCircle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: "#92400E" }}>
                  Exception Request Details
                </div>
                <div style={{ color: "#B45309", marginTop: "2px", fontSize: "12px" }}>
                  <strong>Reason:</strong> {request.exceptionReason || "Project Need"} <br />
                  <strong>Urgency:</strong> {request.urgency || "Standard"} ·{" "}
                  <strong>Required Until:</strong> {request.requiredUntil || "Indefinite"}
                </div>
              </div>
            </div>
          )}

          <div className="divider-label">Workflow Progress</div>
          <Timeline steps={request.timeline || []} />

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label">Request Information</div>
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
                <span className="f-label">Access Provider</span>
                <span className="f-value">{request.providerName}</span>
              </div>
              <div className="field">
                <span className="f-label">Provisioning</span>
                <span className="f-value">
                  {request.automation ? "Automated on Approval" : "Manual by IT Admin"}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <span className="f-label">Justification</span>
              <div
                style={{
                  marginTop: "6px",
                  padding: "12px",
                  background: "#F8FAFC",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#334155",
                  lineHeight: "1.5",
                }}
              >
                {request.justification}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
            <button
              type="button"
              className="btn btn-danger"
              style={{ flex: 1 }}
              onClick={() => setRejectModalOpen(true)}
              disabled={loading}
            >
              Reject...
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={handleApprove}
              disabled={loading}
            >
              <Check size={16} /> {loading ? "Approving..." : "Approve Request"}
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#111827" }}>
                Reject Access Request
              </h3>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0" }}>
                Specify why this request is being rejected. The requester will be notified.
              </p>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div className="form-group">
                <label className="form-label">Pre-Set Reason Template</label>
                <select
                  className="form-select"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                >
                  {PRESET_REJECTION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: "14px" }}>
                <label className="form-label">Custom Note (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Additional context or instructions for the requester..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1.5 }}
                  onClick={handleReject}
                  disabled={loading}
                >
                  {loading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
