"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Clock, Calendar, CheckSquare } from "lucide-react";
import StatusBadge from "../StatusBadge";
import Timeline from "../Timeline";

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

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? "show" : ""}`}>
        <div className="drawer-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3>{request.accessLabel}</h3>
              <StatusBadge status={request.status} />
            </div>
            <div className="sub mono">
              {request.id} · Submitted {new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Part 4: Auto-Expiry and Extension Alert */}
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

              {onRequestExtension && (
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
                Please confirm with the beneficiary that their access is working, then close this request.
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

          <div className="divider-label">Request Progress</div>
          <Timeline steps={request.timeline || []} />

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label">Request Details</div>
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
                  {request.automation ? "Automated" : "Manual Provisioning"}
                </span>
              </div>
              <div className="field">
                <span className="f-label">Request Type</span>
                <span className="f-value">
                  {request.isException ? "Exception Request" : request.onBehalf ? "On-Behalf Request" : "Direct Request"}
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
