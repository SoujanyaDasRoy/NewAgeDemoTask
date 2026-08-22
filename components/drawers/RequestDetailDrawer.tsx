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
    Boolean(request.onBehalf) && request.status === "ACCESS_PROVISIONED";

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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="tool-logo-badge">
              <ServiceLogo tool={toolName} size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  {request.accessLabel}
                </h3>
                <StatusBadge status={request.status} />
                {request.isException && (
                  <span className="badge badge-amber" style={{ fontSize: "10.5px" }}>Cross-Team</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span className="mono" style={{ fontSize: "11.5px", color: "var(--muted)", fontWeight: 600 }}>
                  {request.id}
                </span>
                <button
                  type="button"
                  onClick={copyRequestId}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: copied ? "#4ADE80" : "var(--muted)",
                    padding: "0",
                    display: "flex",
                  }}
                  title="Copy Request ID"
                >
                  {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                </button>
                <span style={{ fontSize: "11px", color: "var(--border)" }}>·</span>
                <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                  Submitted {new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {/* SLA / Nudge Status Banner (If Pending) */}
          {isPendingApproval && (
            <div
              style={{
                background: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", color: "var(--text)" }}>
                  <Clock size={14} style={{ color: "var(--accent)" }} /> Awaiting {request.approverName}&apos;s Decision
                </div>
                <div style={{ fontSize: "11.5px", marginTop: "2px", color: "var(--muted)" }}>
                  Estimated Turnaround: Typically reviewed within 2 hours.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSlackNudge}
                style={{
                  border: "1px solid var(--border)",
                  background: nudged ? "var(--surface-subtle)" : "var(--surface)",
                  color: "var(--text)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={12} /> {nudged ? "Ping Sent!" : "Ping on Slack"}
              </button>
            </div>
          )}

          {/* Auto-Expiry and Extension Alert */}
          {request.requiredUntil && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                borderRadius: "8px",
                background: isExpired ? "rgba(248, 81, 73, 0.1)" : "rgba(63, 185, 80, 0.1)",
                border: `1px solid ${isExpired ? "rgba(248, 81, 73, 0.35)" : "rgba(63, 185, 80, 0.35)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: isExpired ? "#CF222E" : "#1A7F37",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Calendar size={14} />
                  {isExpired ? "Access Expired" : `Valid Until ${request.requiredUntil}`}
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "1px" }}>
                  {isExpired
                    ? "This temporary exception has elapsed."
                    : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining before auto-expiry.`}
                </div>
              </div>

              {onRequestExtension && !isExpired && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: "11.5px", height: "30px", padding: "0 10px" }}
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
                marginBottom: "18px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <CheckCircle2 size={16} style={{ color: "#16A34A" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
                  Access Granted to Beneficiary
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.45, marginBottom: "12px" }}>
                Access has been provisioned for <strong>{request.beneficiaryName}</strong>. Please verify and confirm to complete this ticket.
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                style={{
                  height: "36px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
                onClick={handleClose}
                disabled={closing}
              >
                <CheckSquare size={14} /> {closing ? "Closing..." : "✓ Confirm & Close Request"}
              </button>
            </div>
          )}

          {/* Progress Timeline */}
          <div className="divider-label" style={{ marginBottom: "10px" }}>
            Audit Journey
          </div>
          <Timeline steps={request.timeline || []} />

          {/* Detailed Metadata Grid */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label" style={{ marginBottom: "10px" }}>
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
                    <span style={{ color: "var(--accent)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Zap size={11} /> Automated SCIM
                    </span>
                  ) : (
                    "Manual IT"
                  )}
                </span>
              </div>
              <div className="field">
                <span className="f-label">Request Type</span>
                <span className="f-value">
                  {request.isException ? "Cross-Team" : request.onBehalf ? "On-Behalf" : "Direct"}
                </span>
              </div>
            </div>

            {/* Justification Box */}
            <div style={{ marginTop: "14px" }}>
              <span className="f-label">Business Justification</span>
              <div
                style={{
                  marginTop: "4px",
                  padding: "10px 12px",
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.45",
                }}
              >
                {request.justification}
              </div>
            </div>

            {/* Rejection Reason if any */}
            {request.rejectionReason && (
              <div style={{ marginTop: "14px" }}>
                <span className="f-label" style={{ color: "#EF4444" }}>Rejection Feedback</span>
                <div
                  style={{
                    marginTop: "4px",
                    padding: "10px 12px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    color: "#F87171",
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
