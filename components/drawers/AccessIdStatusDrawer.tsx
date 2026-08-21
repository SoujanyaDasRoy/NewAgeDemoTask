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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ServiceLogo tool={accessItem.tool} size={28} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F1B33" }}>
                  Access ID Governance
                </h3>
                {queueItem && <StatusBadge status={queueItem.status} />}
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
                {accessItem.tool} · {accessItem.name}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {!accessItem.accessId ? (
            <>
              {/* Governance Inspection Card */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
                  border: "1px solid #DDD6FE",
                  marginBottom: "22px",
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
                  <Key size={17} /> Unique Access ID Required
                </div>
                <div style={{ fontSize: "12px", color: "#6D28D9", marginTop: "4px", lineHeight: "1.45" }}>
                  This board requires an official Access ID before automated SCIM provisioning can be activated.
                </div>
              </div>

              {/* Identity & Duplicate Verification */}
              <div style={{ marginBottom: "20px" }}>
                <div className="divider-label" style={{ marginBottom: "10px" }}>
                  Identity Registry Verification
                </div>
                {dupLoading ? (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12.5px",
                      color: "#64748B",
                    }}
                  >
                    <Loader2 size={15} className="animate-spin" /> Verifying against global identity catalog...
                  </div>
                ) : dupCheck?.isDuplicate ? (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#991B1B",
                      fontSize: "12.5px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <strong>Duplicate Detected:</strong> Matches existing Access ID {dupCheck.existingId}.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                      color: "#166534",
                      fontSize: "12.5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: "#16A34A" }} /> Verified: No namespace collisions in directory.
                  </div>
                )}
              </div>

              {isAdmin && queueItem && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    height: "42px",
                    background: "#6D28D9",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  disabled={loading || !canApprove}
                  onClick={handleApprove}
                >
                  <Check size={16} /> {loading ? "Issuing ID..." : "Approve & Issue Access ID"}
                </button>
              )}
            </>
          ) : (
            /* Active Access ID Display */
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "999px",
                  background: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#166534" }}>
                Active &amp; Governed Access ID
              </div>
              <div className="mono" style={{ fontSize: "20px", fontWeight: 800, color: "#0F1B33", margin: "8px 0" }}>
                {accessItem.accessId}
              </div>
              <div style={{ fontSize: "12px", color: "#15803D" }}>
                Synchronized with identity provider and automated provisioning engine.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
