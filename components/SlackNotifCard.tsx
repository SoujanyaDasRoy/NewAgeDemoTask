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
    setDecided("approved");
    onApprove(matchedRequest.id);
    onClosePanel?.();
  };

  const handleReject = async (reason: string) => {
    setRejectOpen(false);
    setDecided("rejected");
    onReject(matchedRequest.id, reason);
    onClosePanel?.();
  };

  const justificationPreview =
    matchedRequest?.justification?.length > 90
      ? matchedRequest.justification.slice(0, 90) + "…"
      : matchedRequest?.justification || "—";

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "visible",
        margin: "12px 14px",
        boxShadow: "var(--shadow-sm)",
        fontFamily: "inherit",
        background: "var(--surface)",
      }}
    >
      {/* Slack-style header bar */}
      <div
        style={{
          background: "#1A1D21",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderTopLeftRadius: "11px",
          borderTopRightRadius: "11px",
        }}
      >
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            background: "#E01E5A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <MessageSquare size={13} style={{ color: "#fff" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>
            New Age Access Bot
          </span>
          <span style={{ fontSize: "11px", color: "#9BA8B9" }}>
            #access-requests
          </span>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#9BA8B9",
            background: "#2D3139",
            padding: "2.5px 7px",
            borderRadius: "4px",
            letterSpacing: "0.05em",
          }}
        >
          SLACK
        </span>
      </div>

      {/* Card body */}
      <div
        style={{
          padding: "16px",
          background: "var(--surface)",
          borderBottomLeftRadius: "11px",
          borderBottomRightRadius: "11px",
        }}
      >
        {/* Left accent bar + content */}
        <div style={{ display: "flex", gap: "12px" }}>
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
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text)", lineHeight: "1.35" }}>
              🔔 Access Request — {matchedRequest?.accessLabel}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 16px",
                marginTop: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Request ID
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", fontFamily: "monospace", marginTop: "2px" }}>
                  {matchedRequest?.id}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  From
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginTop: "2px" }}>
                  {matchedRequest?.requester?.name || matchedRequest?.beneficiaryName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Provisioning
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginTop: "2px" }}>
                  {matchedRequest?.automation ? "⚡ Automated" : "🛠️ Manual"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Type
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: matchedRequest?.isException ? "#F59E0B" : "var(--text)", marginTop: "2px" }}>
                  {matchedRequest?.isException ? "⚠️ Cross-Team" : "Standard"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Business Justification
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.45" }}>
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
              color: "#16A34A",
            }}
          >
            <Check size={16} strokeWidth={2.5} /> Approved via Slack
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
              color: "#EF4444",
            }}
          >
            <X size={16} strokeWidth={2.5} /> Rejected via Slack
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", position: "relative" }}>
            {/* Approve button */}
            <button
              onClick={handleApprove}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#16A34A",
                color: "#fff",
                fontSize: "12.5px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                boxShadow: "0 1px 2px rgba(22, 163, 74, 0.25)",
                whiteSpace: "nowrap",
              }}
            >
              <Check size={14} strokeWidth={2.5} /> Approve
            </button>

            {/* Reject dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setRejectOpen((v) => !v)}
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  background: "var(--surface)",
                  color: "#EF4444",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <X size={14} strokeWidth={2.5} /> Reject
                <ChevronDown size={13} style={{ color: "var(--muted)", marginLeft: "2px" }} />
              </button>

              {rejectOpen && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "calc(100% + 6px)",
                    background: "var(--surface-popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    boxShadow: "var(--shadow-popover)",
                    zIndex: 100,
                    minWidth: "220px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid var(--border)",
                      background: "var(--surface-subtle)",
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
                        fontSize: "12px",
                        color: "var(--text)",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--border-subtle)",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
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
