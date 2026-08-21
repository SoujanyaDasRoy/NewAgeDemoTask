"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Calendar,
  CheckSquare,
  MessageSquare,
  Zap,
  AlertCircle,
  Copy,
  CheckCheck,
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import Timeline from "../Timeline";
import ServiceLogo from "../ServiceLogo";

interface RequestDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  currentUserName: string;
  onCloseRequest?: (requestId: string) => Promise<void>;
  onRequestExtension?: (requestId: string) => Promise<void>;
}

export default function RequestDetailDrawer({
  isOpen,
  onClose,
  request,
  currentUserName,
  onCloseRequest,
  onRequestExtension,
}: RequestDetailDrawerProps) {
  const [extending, setExtending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  // Calculate days left if requiredUntil is set
  let daysRemaining: number | null = null;
  let isExpired = false;
  if (request.requiredUntil) {
    const target = new Date(request.requiredUntil);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 0) isExpired = true;
  }

  const isAwaitingClosure =
    request.onBehalf &&
    request.status === "ACCESS_PROVISIONED" &&
    request.requester?.name === currentUserName;

  const isPendingApproval = ["PENDING_APPROVAL", "PENDING_EXCEPTION_APPROVAL"].includes(
    request.status
  );

  const handleClose = async () => {
    if (!onCloseRequest) return;
    setClosing(true);
    await onCloseRequest(request.id);
    setClosing(false);
  };

  const handleExtension = async () => {
    if (!onRequestExtension) return;
    setExtending(true);
    await onRequestExtension(request.id);
    setExtending(false);
  };

  const handleSlackNudge = () => {
    setNudged(true);
    setTimeout(() => setNudged(false), 3000);
  };

  const copyRequestId = () => {
    navigator.clipboard.writeText(request.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toolName = request.accessItem?.tool || request.accessLabel.split(" – ")[0] || "Tool";

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Request Details Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ServiceLogo tool={toolName} size={26} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F1B33" }}>
                  {request.accessLabel}
                </h3>
                <StatusBadge status={request.status} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                <span className="mono" style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>
                  {request.id}
                </span>
                <button
                  type="button"
                  onClick={copyRequestId}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: copied ? "#16A34A" : "#94A3B8",
                    padding: "0",
                    display: "flex",
                  }}
                  title="Copy Request ID"
                >
                  {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                </button>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>·</span>
                <span style={{ fontSize: "12px", color: "#64748B" }}>
                  Submitted {new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* SLA / Nudge Status Banner (If Pending) */}
          {isPendingApproval && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px",
                borderRadius: "10px",
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400E", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={14} /> Awaiting {request.approverName}&apos;s Approval
                </div>
                <div style={{ fontSize: "11.5px", color: "#B45309", marginTop: "2px" }}>
                  Estimated Turnaround: Typically reviewed within 2 hours.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSlackNudge}
                style={{
                  border: "1px solid #F59E0B",
                  background: nudged ? "#FEF3C7" : "#FFFFFF",
                  color: "#92400E",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={12} /> {nudged ? "Nudge Sent via Slack!" : "Ping on Slack"}
              </button>
            </div>
          )}

          {/* Auto-Expiry and Extension Alert */}
          {request.requiredUntil && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px",
                borderRadius: "10px",
                background: isExpired ? "#FEF2F2" : "#F0FDF4",
                border: `1px solid ${isExpired ? "#FECACA" : "#BBF7D0"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: isExpired ? "#991B1B" : "#166534",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Calendar size={15} />
                  {isExpired ? "Access Expired" : `Access Valid Until ${request.requiredUntil}`}
                </div>
                <div style={{ fontSize: "11.5px", color: isExpired ? "#B91C1C" : "#15803D", marginTop: "2px" }}>
                  {isExpired
                    ? "This temporary exception has elapsed."
                    : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining before auto-expiry.`}
                </div>
              </div>

              {onRequestExtension && !isExpired && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: "12px", height: "32px", padding: "0 12px" }}
                  onClick={handleExtension}
                  disabled={extending}
                >
                  {extending ? "Requesting..." : "+14 Days"}
                </button>
              )}
            </div>
          )}

          {/* On-behalf handover closure alert */}
          {isAwaitingClosure && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px",
                borderRadius: "10px",
                background: "#F5F3FF",
                border: "1px solid #DDD6FE",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#5B21B6" }}>
                Access Provisioned for {request.beneficiaryName}
              </div>
              <div style={{ fontSize: "12px", color: "#6D28D9", marginTop: "2px" }}>
                Please confirm with the colleague that their account access is active, then close this ticket.
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: "12px", width: "100%", background: "#6D28D9" }}
                onClick={handleClose}
                disabled={closing}
              >
                <CheckSquare size={16} /> {closing ? "Closing..." : "Confirm & Close Request"}
              </button>
            </div>
          )}

          {/* Progress Timeline */}
          <div className="divider-label" style={{ marginBottom: "12px" }}>
            Multi-Step Audit Journey
          </div>
          <Timeline steps={request.timeline || []} />

          {/* Detailed Metadata Grid */}
          <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label" style={{ marginBottom: "12px" }}>
              Request Metadata
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
                <span className="f-label">Approver</span>
                <span className="f-value">{request.approverName}</span>
              </div>
              <div className="field">
                <span className="f-label">Access Provider</span>
                <span className="f-value">{request.providerName}</span>
              </div>
              <div className="field">
                <span className="f-label">Provisioning Mode</span>
                <span className="f-value">
                  {request.automation ? (
                    <span style={{ color: "#2563EB", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Zap size={11} /> Automated SCIM
                    </span>
                  ) : (
                    "Manual IT Provisioning"
                  )}
                </span>
              </div>
              <div className="field">
                <span className="f-label">Request Type</span>
                <span className="f-value">
                  {request.isException ? "Exception Request" : request.onBehalf ? "On-Behalf Request" : "Direct Request"}
                </span>
              </div>
            </div>

            {/* Justification Box */}
            <div style={{ marginTop: "16px" }}>
              <span className="f-label">Business Justification</span>
              <div
                style={{
                  marginTop: "6px",
                  padding: "12px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#334155",
                  lineHeight: "1.5",
                }}
              >
                {request.justification}
              </div>
            </div>

            {/* Rejection Reason if any */}
            {request.rejectionReason && (
              <div style={{ marginTop: "16px" }}>
                <span className="f-label" style={{ color: "#DC2626" }}>Rejection Feedback</span>
                <div
                  style={{
                    marginTop: "6px",
                    padding: "12px",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#991B1B",
                  }}
                >
                  {request.rejectionReason}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
