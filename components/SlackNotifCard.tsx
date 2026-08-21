"use client";

import React, { useState } from "react";
import { Check, X, ChevronDown, MessageSquare } from "lucide-react";

const QUICK_REJECT_REASONS = [
  "Duplicate request",
  "Role / department mismatch",
  "Needs Director sign-off",
];

interface SlackNotifCardProps {
  notification: any;
  matchedRequest: any;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string, reason: string) => Promise<void>;
  onClosePanel?: () => void;
}

export default function SlackNotifCard({
  notification,
  matchedRequest,
  onApprove,
  onReject,
  onClosePanel,
}: SlackNotifCardProps) {
  const [decided, setDecided] = useState<"approved" | "rejected" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(matchedRequest.id);
    setDecided("approved");
    setLoading(false);
    setTimeout(() => onClosePanel?.(), 1200);
  };

  const handleReject = async (reason: string) => {
    setLoading(true);
    setRejectOpen(false);
    await onReject(matchedRequest.id, reason);
    setDecided("rejected");
    setLoading(false);
    setTimeout(() => onClosePanel?.(), 1200);
  };

  const justificationPreview =
    matchedRequest?.justification?.length > 80
      ? matchedRequest.justification.slice(0, 80) + "…"
      : matchedRequest?.justification || "—";

  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        overflow: "hidden",
        margin: "10px 12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        fontFamily: "inherit",
      }}
    >
      {/* Slack-style header bar */}
      <div
        style={{
          background: "#1A1D21",
          padding: "9px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "5px",
            background: "#E01E5A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MessageSquare size={12} style={{ color: "#fff" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#fff" }}>
            New Age Access Bot
          </span>
          <span style={{ fontSize: "11px", color: "#9BA8B9", marginLeft: "6px" }}>
            #access-requests
          </span>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#9BA8B9",
            background: "#2D3139",
            padding: "2px 7px",
            borderRadius: "4px",
            letterSpacing: "0.05em",
          }}
        >
          SLACK
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: "14px", background: "var(--surface)" }}>
        {/* Left accent bar + content */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              width: "4px",
              borderRadius: "2px",
              background: matchedRequest?.isException ? "#F59E0B" : "var(--accent)",
              flexShrink: 0,
              alignSelf: "stretch",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", lineHeight: "1.3" }}>
              🔔 Access Request — {matchedRequest?.accessLabel}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 16px",
                marginTop: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Request ID
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)", fontFamily: "monospace" }}>
                  {matchedRequest?.id}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  From
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>
                  {matchedRequest?.requester?.name || matchedRequest?.beneficiaryName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Provisioning
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>
                  {matchedRequest?.automation ? "Automated" : "Manual"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Type
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: matchedRequest?.isException ? "#F59E0B" : "var(--text)" }}>
                  {matchedRequest?.isException ? "Exception" : "Standard"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "10px" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Justification
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "3px", lineHeight: "1.45" }}>
                {justificationPreview}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)", margin: "14px 0 12px" }} />

        {/* Action area */}
        {decided === "approved" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "rgba(34, 197, 94, 0.15)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#4ADE80",
            }}
          >
            <Check size={16} /> Approved via Slack
          </div>
        ) : decided === "rejected" ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.15)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#F87171",
            }}
          >
            <X size={16} /> Rejected via Slack
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            {/* Approve button */}
            <button
              onClick={handleApprove}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "7px",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Check size={14} /> Approve
            </button>

            {/* Reject dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setRejectOpen((v) => !v)}
                disabled={loading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "7px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-subtle)",
                  color: "var(--text)",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <X size={14} style={{ color: "#EF4444" }} /> Reject
                <ChevronDown size={13} style={{ color: "var(--muted)" }} />
              </button>

              {rejectOpen && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "38px",
                    background: "var(--surface-popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "9px",
                    boxShadow: "var(--shadow-popover)",
                    zIndex: 10,
                    minWidth: "220px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    Select Reason
                  </div>
                  {QUICK_REJECT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => handleReject(reason)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 14px",
                        background: "transparent",
                        border: "none",
                        textAlign: "left",
                        fontSize: "12.5px",
                        color: "var(--text)",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--border)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
