"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Key,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Zap,
  Building,
  Check,
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import ServiceLogo from "../ServiceLogo";
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

  useEffect(() => {
    if (!isOpen || !accessItem || !isAdmin) return;
    if (accessItem.accessId) return;

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
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Access ID Governance Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ServiceLogo tool={accessItem.tool} size={24} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  Access ID Governance
                </h3>
                {queueItem && <StatusBadge status={queueItem.status} />}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "1px" }}>
                {accessItem.tool} · {accessItem.name}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {!accessItem.accessId ? (
            <>
              {/* Governance Inspection Card */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Key size={15} style={{ color: "var(--muted)" }} /> Unique Access ID Required
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px", lineHeight: "1.45" }}>
                  This board requires an official Access ID before automated SCIM provisioning can be activated.
                </div>
              </div>

              {/* Identity & Duplicate Verification */}
              <div style={{ marginBottom: "18px" }}>
                <div className="divider-label" style={{ marginBottom: "8px" }}>
                  Identity Registry Verification
                </div>
                {dupLoading ? (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      color: "var(--muted)",
                    }}
                  >
                    <Loader2 size={14} className="animate-spin" /> Verifying against global identity catalog...
                  </div>
                ) : dupCheck?.isDuplicate ? (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#F87171",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <strong>Duplicate Detected:</strong> Matches existing Access ID {dupCheck.existingId}.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "rgba(63, 185, 80, 0.1)",
                      border: "1px solid rgba(63, 185, 80, 0.35)",
                      color: "#1A7F37",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <ShieldCheck size={15} style={{ color: "#1A7F37" }} /> Verified: No namespace collisions in directory.
                  </div>
                )}
              </div>

              {isAdmin && queueItem && (
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  style={{
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  disabled={loading || !canApprove}
                  onClick={handleApprove}
                >
                  <Check size={15} /> {loading ? "Issuing ID..." : "Approve & Issue Access ID"}
                </button>
              )}
            </>
          ) : (
            /* Active Access ID Display */
            <div
              style={{
                padding: "18px",
                borderRadius: "10px",
                background: "rgba(63, 185, 80, 0.1)",
                border: "1px solid rgba(63, 185, 80, 0.35)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "999px",
                  background: "rgba(63, 185, 80, 0.2)",
                  color: "#1A7F37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1A7F37" }}>
                Active &amp; Governed Access ID
              </div>
              <div className="mono" style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", margin: "6px 0" }}>
                {accessItem.accessId}
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                Synchronized with identity provider and automated provisioning engine.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
