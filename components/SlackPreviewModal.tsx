"use client";

import React, { useState } from "react";
import {
  X,
  MessageSquare,
  Check,
  Zap,
  Send,
  Code,
  Eye,
  AlertTriangle,
  Lock,
  Hash,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Shield,
  Clock,
  Terminal,
} from "lucide-react";

interface SlackPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: any[];
  onApprove?: (requestId: string) => Promise<void>;
  onReject?: (requestId: string, reason: string) => Promise<void>;
  onTriggerToast?: (text: string, type?: "success" | "error") => void;
}

export default function SlackPreviewModal({
  isOpen,
  onClose,
  requests = [],
  onApprove,
  onReject,
  onTriggerToast,
}: SlackPreviewModalProps) {
  const [selectedReqId, setSelectedReqId] = useState<string>(
    requests.length > 0 ? requests[0].id : "demo-exception"
  );
  const [activeTab, setActiveTab] = useState<"preview" | "payload">("preview");
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [actionState, setActionState] = useState<"approved" | "rejected" | null>(null);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);

  if (!isOpen) return null;

  // Selected request or fallback demo
  const selectedReq =
    requests.find((r) => r.id === selectedReqId) ||
    (requests.length > 0
      ? requests[0]
      : {
          id: "NAR-10488",
          accessLabel: "Monday.com – Enterprise Workspace",
          requester: { name: "Ananya Patel", email: "ananya@newage.com" },
          beneficiaryName: "Ananya Patel",
          isException: true,
          exceptionReason: "Cross-functional Q3 growth initiative",
          urgency: "CRITICAL",
          justification: "Need workspace admin permissions to configure automated customer onboarding boards.",
          approverName: "Rahul Sharma",
          providerName: "Rahul Sharma",
          automation: true,
          status: "PENDING_EXCEPTION_APPROVAL",
          createdAt: new Date().toISOString(),
        });

  const toolName = selectedReq.accessItem?.tool || selectedReq.accessLabel?.split(" – ")[0] || "Tool";
  const itemName = selectedReq.accessItem?.name || selectedReq.accessLabel?.split(" – ")[1] || selectedReq.accessLabel;

  // Generate real Slack Block-Kit JSON
  const blockKitPayload = {
    channel: "#access-approvals",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🔔 New Access Request: ${selectedReq.accessLabel}`,
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Request ID:*\n\`${selectedReq.id}\``,
          },
          {
            type: "mrkdwn",
            text: `*Requester:*\n${selectedReq.requester?.name || selectedReq.beneficiaryName}`,
          },
          {
            type: "mrkdwn",
            text: `*For Employee:*\n${selectedReq.beneficiaryName}`,
          },
          {
            type: "mrkdwn",
            text: `*Type:*\n${selectedReq.isException ? "⚠️ *Exception Request*" : "Standard Policy"}`,
          },
          {
            type: "mrkdwn",
            text: `*Approver:*\n${selectedReq.approverName}`,
          },
          {
            type: "mrkdwn",
            text: `*Provisioning:*\n${selectedReq.automation ? "⚡ Automated SCIM" : "🛠️ Manual IT"}`,
          },
        ],
      },
      ...(selectedReq.isException
        ? [
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `⚠️ *Exception Reason:* ${selectedReq.exceptionReason || "Department exception"} • *Urgency:* ${selectedReq.urgency || "STANDARD"}`,
                },
              ],
            },
          ]
        : []),
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Business Justification:*\n>${(selectedReq.justification || "No justification provided").replace(/\n/g, "\n>")}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "✓ Approve Access", emoji: true },
            style: "primary",
            value: `approve_${selectedReq.id}`,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "✕ Reject", emoji: true },
            style: "danger",
            value: `reject_${selectedReq.id}`,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "Review in Portal", emoji: true },
            url: `https://portal.newage.internal/?request=${selectedReq.id}`,
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `New Age Access Management Portal • Status: *${selectedReq.status || "Pending Approval"}*`,
          },
        ],
      },
    ],
  };

  const handleSimulatedApprove = async () => {
    setActionLoading("approve");
    try {
      if (onApprove && selectedReq.id && !selectedReq.id.startsWith("demo-")) {
        await onApprove(selectedReq.id);
      }
      setActionState("approved");
      onTriggerToast?.(`⚡ Slack Webhook Action: ${selectedReq.id} approved successfully!`);
    } catch (e: any) {
      onTriggerToast?.(`Failed to approve: ${e.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSimulatedReject = async () => {
    setActionLoading("reject");
    try {
      if (onReject && selectedReq.id && !selectedReq.id.startsWith("demo-")) {
        await onReject(selectedReq.id, "Rejected via Slack interactive button");
      }
      setActionState("rejected");
      onTriggerToast?.(`✕ Slack Webhook Action: ${selectedReq.id} rejected.`);
    } catch (e: any) {
      onTriggerToast?.(`Failed to reject: ${e.message}`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDispatchSimulation = async () => {
    setSimulatingWebhook(true);
    try {
      const res = await fetch("/api/slack/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedReq.id,
          accessLabel: selectedReq.accessLabel,
          requesterName: selectedReq.requester?.name || selectedReq.beneficiaryName,
          beneficiaryName: selectedReq.beneficiaryName,
          isException: selectedReq.isException,
          urgency: selectedReq.urgency,
          justification: selectedReq.justification,
          approverName: selectedReq.approverName,
          automation: selectedReq.automation,
          status: selectedReq.status,
        }),
      });
      const data = await res.json();
      if (data.webhookStatus === 200 || data.success) {
        onTriggerToast?.(`🚀 Live Slack message posted to #access-approvals!`);
      } else {
        onTriggerToast?.(`Slack Webhook posted (Status: ${data.webhookStatus || 200})`);
      }
    } catch (e: any) {
      onTriggerToast?.(`Error posting to Slack: ${e.message}`, "error");
    } finally {
      setSimulatingWebhook(false);
    }
  };

  return (
    <>
      <div className="overlay show" onClick={onClose} aria-hidden="true" style={{ zIndex: 60 }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Slack Webhook Interactive Simulator"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(720px, 94vw)",
          maxHeight: "90vh",
          background: "var(--surface-popover)",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-popover)",
          zIndex: 70,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Top App Control Bar */}
        <div
          style={{
            background: "#1A1D21",
            color: "#FFFFFF",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #2C3136",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "6px",
                background: "#E01E5A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <MessageSquare size={15} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 800, fontSize: "13.5px" }}>Slack Webhook Simulator</span>
                <span
                  style={{
                    background: "#363A3E",
                    color: "#D1D2D3",
                    fontSize: "10.5px",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontWeight: 600,
                  }}
                >
                  Block Kit 2.0
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handleDispatchSimulation}
              disabled={simulatingWebhook}
              className="btn btn-secondary"
              style={{
                background: "#2C3136",
                color: "#FFFFFF",
                borderColor: "#3E4348",
                height: "30px",
                fontSize: "11.5px",
                padding: "0 10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Send size={12} className={simulatingWebhook ? "animate-spin" : ""} />
              {simulatingWebhook ? "Dispatching..." : "Simulate Webhook"}
            </button>

            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#ABACAE",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Simulator Options Sub-Bar */}
        <div
          style={{
            background: "var(--surface-subtle)",
            borderBottom: "1px solid var(--border)",
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Request Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>
              Preview Request:
            </label>
            <select
              value={selectedReqId}
              onChange={(e) => {
                setSelectedReqId(e.target.value);
                setActionState(null);
              }}
              style={{
                height: "32px",
                padding: "0 8px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                fontSize: "12px",
                background: "var(--surface-input)",
                color: "var(--text)",
                outline: "none",
                fontWeight: 600,
              }}
            >
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} · {r.accessLabel} ({r.isException ? "Exception" : "Standard"})
                </option>
              ))}
              {requests.length === 0 && (
                <option value="demo-exception">NAR-10488 · Monday.com (Exception)</option>
              )}
            </select>
          </div>

          {/* View Mode Toggle (Visual vs JSON Payload) */}
          <div style={{ display: "flex", gap: "4px", background: "var(--surface-subtle)", border: "1px solid var(--border)", padding: "2px", borderRadius: "6px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              style={{
                background: activeTab === "preview" ? "var(--surface)" : "transparent",
                color: activeTab === "preview" ? "var(--text)" : "var(--muted)",
                border: "none",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "11.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: activeTab === "preview" ? "var(--shadow-xs)" : "none",
              }}
            >
              <Eye size={12} /> Block-Kit Visual
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payload")}
              style={{
                background: activeTab === "payload" ? "var(--surface)" : "transparent",
                color: activeTab === "payload" ? "var(--text)" : "var(--muted)",
                border: "none",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "11.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: activeTab === "payload" ? "var(--shadow-xs)" : "none",
              }}
            >
              <Code size={12} /> JSON Payload
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {activeTab === "preview" ? (
            /* Slack Window Frame */
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "var(--shadow-card)",
                fontFamily: "inherit",
              }}
            >
              {/* Channel Header */}
              <div
                style={{
                  background: "var(--surface-subtle)",
                  borderBottom: "1px solid var(--border)",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Hash size={16} style={{ color: "var(--muted)" }} />
                  <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--text)" }}>
                    access-approvals
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "12px", marginLeft: "8px" }}>
                    🔒 Automated Access &amp; Exception Approvals • New Age Governance
                  </span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--muted)", fontWeight: 500 }}>
                  24 members
                </div>
              </div>

              {/* Slack Message Item */}
              <div style={{ padding: "16px 20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                {/* Bot Avatar */}
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #0F172A 0%, #2563EB 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "13px",
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  NA
                </div>

                {/* Message Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Sender line */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--text)" }}>
                      New Age Access Bot
                    </span>
                    <span
                      style={{
                        background: "var(--surface-subtle)",
                        color: "var(--muted)",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "1px 4px",
                        borderRadius: "3px",
                        textTransform: "uppercase",
                      }}
                    >
                      APP
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>Today at 2:48 PM</span>
                  </div>

                  {/* Slack Attachment / Card Block */}
                  <div
                    style={{
                      borderRadius: "0 8px 8px 0",
                      padding: "12px 14px",
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--border)",
                      borderLeftWidth: "4px",
                      borderLeftColor: selectedReq.isException ? "#F59E0B" : "var(--accent)",
                    }}
                  >
                    {/* Header */}
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text)", marginBottom: "10px" }}>
                      🔔 New Access Request: {selectedReq.accessLabel}
                    </div>

                    {/* 2-Column Fields Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px 16px",
                        fontSize: "12.5px",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <div style={{ color: "var(--muted)", fontWeight: 700 }}>Request ID:</div>
                        <div style={{ fontFamily: "monospace", color: "var(--text)", fontWeight: 600 }}>
                          `{selectedReq.id}`
                        </div>
                      </div>

                      <div>
                        <div style={{ color: "var(--muted)", fontWeight: 700 }}>Requester:</div>
                        <div style={{ color: "var(--text)", fontWeight: 600 }}>
                          {selectedReq.requester?.name || selectedReq.beneficiaryName}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: "var(--muted)", fontWeight: 700 }}>For Employee:</div>
                        <div style={{ color: "var(--text)", fontWeight: 600 }}>
                          {selectedReq.beneficiaryName}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: "var(--muted)", fontWeight: 700 }}>Type:</div>
                        <div>
                          {selectedReq.isException ? (
                            <span style={{ color: "#F59E0B", fontWeight: 700 }}>
                              ⚠️ Exception Request
                            </span>
                          ) : (
                            <span style={{ color: "#4ADE80", fontWeight: 600 }}>Standard</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: "var(--muted)", fontWeight: 700 }}>Approver:</div>
                        <div style={{ color: "var(--text)", fontWeight: 600 }}>
                          {selectedReq.approverName}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: "var(--muted)", fontWeight: 700 }}>Provisioning:</div>
                        <div style={{ color: "var(--text)", fontWeight: 600 }}>
                          {selectedReq.automation ? "⚡ Automated SCIM" : "🛠️ Manual IT"}
                        </div>
                      </div>
                    </div>

                    {/* Justification Blockquote */}
                    <div style={{ marginBottom: "14px" }}>
                      <div style={{ color: "var(--muted)", fontWeight: 700, fontSize: "12px", marginBottom: "4px" }}>
                        Business Justification:
                      </div>
                      <div
                        style={{
                          borderLeft: "3px solid var(--border)",
                          paddingLeft: "10px",
                          color: "var(--text-secondary)",
                          fontSize: "12.5px",
                          lineHeight: "1.45",
                          fontStyle: "italic",
                        }}
                      >
                        {selectedReq.justification || "No justification provided."}
                      </div>
                    </div>

                    {/* Interactive Action Buttons */}
                    {actionState ? (
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "6px",
                          background: actionState === "approved" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          border: `1px solid ${actionState === "approved" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                          color: actionState === "approved" ? "#4ADE80" : "#F87171",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {actionState === "approved" ? (
                          <>
                            <Check size={16} /> Approved by you via Slack! Access granted.
                          </>
                        ) : (
                          <>
                            <X size={16} /> Rejected by you via Slack. Requester notified.
                          </>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          type="button"
                          onClick={handleSimulatedApprove}
                          disabled={actionLoading !== null}
                          style={{
                            background: "#059669",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "5px",
                            padding: "6px 14px",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Check size={14} />
                          {actionLoading === "approve" ? "Approving..." : "Approve Access"}
                        </button>

                        <button
                          type="button"
                          onClick={handleSimulatedReject}
                          disabled={actionLoading !== null}
                          style={{
                            background: "#DC2626",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "5px",
                            padding: "6px 14px",
                            fontSize: "12.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <X size={14} />
                          {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onTriggerToast?.("Navigating to request review drawer in portal...");
                          }}
                          style={{
                            background: "var(--surface)",
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                            borderRadius: "5px",
                            padding: "6px 12px",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Review in Portal <ExternalLink size={12} />
                        </button>
                      </div>
                    )}

                    {/* Context Footer */}
                    <div style={{ marginTop: "12px", fontSize: "11px", color: "var(--muted)" }}>
                      New Age Access Management Portal • Status: <strong>{selectedReq.status}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* JSON Block-Kit Payload Inspector */
            <div
              style={{
                background: "#090D16",
                color: "#E2E8F0",
                borderRadius: "10px",
                padding: "16px",
                fontFamily: "monospace",
                fontSize: "12px",
                maxHeight: "440px",
                overflowY: "auto",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ color: "var(--muted)" }}>// POST https://hooks.slack.com/services/...</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(blockKitPayload, null, 2));
                    onTriggerToast?.("JSON Block-Kit payload copied to clipboard!");
                  }}
                  style={{
                    background: "var(--surface-subtle)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Copy JSON
                </button>
              </div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(blockKitPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            background: "var(--surface-subtle)",
            borderTop: "1px solid var(--border)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={14} style={{ color: "var(--accent)" }} />
            Clicking simulated buttons tests real state changes with live toast notifications.
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ height: "34px", fontSize: "12.5px" }}
          >
            Close Simulator
          </button>
        </div>
      </div>
    </>
  );
}
