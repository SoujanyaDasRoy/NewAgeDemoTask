"use client";

import React, { useEffect, useState } from "react";
import { X, Key, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import StatusBadge from "../StatusBadge";
import { checkDuplicateAccessId } from "@/lib/actions/access-id";

interface DupCheck {
  isDuplicate: boolean;
  existingId?: string;
  reason?: string;
}

interface AccessIdStatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessItem: any;
  queueItem: any;
  currentUserName: string;
  onApproveAccessId?: (queueId: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function AccessIdStatusDrawer({
  isOpen,
  onClose,
  accessItem,
  queueItem,
  currentUserName,
  onApproveAccessId,
  isAdmin = false,
}: AccessIdStatusDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [dupCheck, setDupCheck] = useState<DupCheck | null>(null);
  const [dupLoading, setDupLoading] = useState(false);

  // Run duplicate check whenever the drawer opens (admin only)
  useEffect(() => {
    if (!isOpen || !accessItem || !isAdmin) return;
    if (accessItem.accessId) return; // already has one, no need to check

    setDupCheck(null);
    setDupLoading(true);
    checkDuplicateAccessId(accessItem.id).then((result) => {
      setDupCheck(result);
      setDupLoading(false);
    });
  }, [isOpen, accessItem, isAdmin]);

  if (!isOpen || !accessItem) return null;

  const handleApprove = async () => {
    if (!queueItem || !onApproveAccessId) return;
    setLoading(true);
    await onApproveAccessId(queueItem.id);
    setLoading(false);
    onClose();
  };

  const canApprove = dupCheck !== null && !dupCheck.isDuplicate;

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? "show" : ""}`}>
        <div className="drawer-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3>Access ID Governance</h3>
              {queueItem && <StatusBadge status={queueItem.status} />}
            </div>
            <div className="sub">
              {accessItem.tool} – {accessItem.name}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {!accessItem.accessId ? (
            <>
              <div
                style={{
                  padding: "18px",
                  borderRadius: "10px",
                  background: "#F5F3FF",
                  border: "1px solid #DDD6FE",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "#5B21B6",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Key size={18} /> Access ID Pending Creation
                </div>
                <div style={{ fontSize: "12.5px", color: "#6D28D9", marginTop: "4px", lineHeight: "1.5" }}>
                  This board doesn't have an Access ID yet. An ID is required before access requests
                  can be processed. The Board Admin will review and assign one.
                </div>
              </div>

              {queueItem && (
                <div>
                  <div className="divider-label">Governance Queue Item</div>
                  <div className="field-grid">
                    <div className="field">
                      <span className="f-label">Status</span>
                      <StatusBadge status={queueItem.status} />
                    </div>
                    <div className="field">
                      <span className="f-label">Requested By</span>
                      <span className="f-value">{queueItem.requestedBy}</span>
                    </div>
                    <div className="field">
                      <span className="f-label">Requested On</span>
                      <span className="f-value">
                        {new Date(queueItem.requestedTs).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="field">
                      <span className="f-label">Board Group</span>
                      <span className="f-value">{accessItem.group}</span>
                    </div>
                  </div>

                  {/* Duplicate Check Panel — admin only */}
                  {isAdmin && queueItem.status === "Pending Governance Review" && (
                    <div style={{ marginTop: "20px" }}>
                      <div className="divider-label">Duplicate Verification</div>

                      {dupLoading ? (
                        <div
                          style={{
                            padding: "12px 14px",
                            borderRadius: "9px",
                            background: "#F8FAFC",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            fontSize: "13px",
                            color: "#6B7280",
                          }}
                        >
                          <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                          Checking for duplicate Access IDs…
                        </div>
                      ) : dupCheck?.isDuplicate ? (
                        <div className="warn-box">
                          <AlertTriangle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, color: "#374151" }}>
                              Duplicate Found — Cannot Issue New ID
                            </div>
                            <div style={{ color: "#B45309", marginTop: "2px" }}>
                              {dupCheck.reason}
                              {dupCheck.existingId && (
                                <span className="mono" style={{ marginLeft: "6px", fontWeight: 700 }}>
                                  ({dupCheck.existingId})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : dupCheck && !dupCheck.isDuplicate ? (
                        <div className="success-box">
                          <CheckCircle2 size={16} />
                          <span>
                            Verified — No duplicate Access ID found for this board. Safe to proceed.
                          </span>
                        </div>
                      ) : null}

                      <button
                        className="btn btn-primary btn-block"
                        style={{ marginTop: "16px" }}
                        onClick={handleApprove}
                        disabled={loading || !canApprove || dupLoading}
                      >
                        <Key size={16} />{" "}
                        {loading ? "Creating…" : !canApprove ? "Cannot Approve — Duplicate Exists" : "Approve & Create Access ID"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="success-box" style={{ marginBottom: "24px" }}>
                <CheckCircle2 size={18} />
                <div>
                  <div style={{ fontWeight: 700 }}>Access ID Active</div>
                  <div style={{ fontSize: "12px", marginTop: "1px" }}>
                    This board has a valid Access ID. Requests can now be processed.
                  </div>
                </div>
              </div>

              <div className="field-grid">
                <div className="field">
                  <span className="f-label">Access ID</span>
                  <span className="f-value mono" style={{ color: "#1D4ED8", fontWeight: 700 }}>
                    {accessItem.accessId}
                  </span>
                </div>
                <div className="field">
                  <span className="f-label">Board</span>
                  <span className="f-value">{accessItem.name}</span>
                </div>
                <div className="field">
                  <span className="f-label">Approver</span>
                  <span className="f-value">{accessItem.approver}</span>
                </div>
                <div className="field">
                  <span className="f-label">Provisioning</span>
                  <span className="f-value">{accessItem.automation ? "Automated" : "Manual"}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
