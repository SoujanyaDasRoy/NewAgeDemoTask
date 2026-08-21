"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Lock,
  Clock,
  Key,
  AlertTriangle,
  Zap,
  Copy,
  CheckCheck,
  Building,
  Shield,
  User,
  ArrowRight,
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import ServiceLogo from "../ServiceLogo";

interface AccessDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessItem: any;
  currentUserName: string;
  onRequestAccess: (accessItem: any) => void;
  onRequestException: (accessItem: any) => void;
  onRequestAccessId: (accessItemId: string) => void;
  onViewAccessIdStatus: (accessItemId: string) => void;
}

export default function AccessDetailsDrawer({
  isOpen,
  onClose,
  accessItem,
  currentUserName,
  onRequestAccess,
  onRequestException,
  onRequestAccessId,
  onViewAccessIdStatus,
}: AccessDetailsDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !accessItem) return null;

  const isEligible = accessItem.isEligible;
  const hasAccessId = !!accessItem.accessId;
  const isPendingAccessId = accessItem.pendingAccessIdReq;

  const copyAccessId = () => {
    if (accessItem.accessId) {
      navigator.clipboard.writeText(accessItem.accessId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${accessItem.name} Details`}
      >
        {/* Drawer Header */}
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ServiceLogo tool={accessItem.tool} size={28} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F1B33" }}>
                  {accessItem.name}
                </h3>
                <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                  {accessItem.category}
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
                {accessItem.tool} · Owned by {accessItem.group}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Policy Matching Status Card */}
          <div
            style={{
              padding: "14px",
              borderRadius: "12px",
              background: isEligible ? "#F0FDF4" : "#FFFBEB",
              border: `1px solid ${isEligible ? "#BBF7D0" : "#FDE68A"}`,
              color: isEligible ? "#166534" : "#92400E",
              fontSize: "12.5px",
              lineHeight: 1.45,
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {isEligible ? (
              <Zap size={17} style={{ color: "#16A34A", flexShrink: 0, marginTop: "1px" }} />
            ) : (
              <AlertTriangle size={17} style={{ color: "#D97706", flexShrink: 0, marginTop: "1px" }} />
            )}
            <div>
              <strong>{isEligible ? "Standard Policy Match:" : "Cross-Department Exception:"}</strong>{" "}
              {isEligible
                ? `You belong to an authorized department. Requests are fast-tracked to ${accessItem.approver}.`
                : `This tool is restricted to ${accessItem.group}. You can submit a business exception request for review.`}
            </div>
          </div>

          <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.6", margin: "0 0 20px" }}>
            {accessItem.description}
          </p>

          {/* Access Details Metadata Grid */}
          <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label" style={{ marginBottom: "12px" }}>
              Directory &amp; Policy Metadata
            </div>
            <div className="field-grid">
              <div className="field">
                <span className="f-label">Access ID</span>
                <span className="f-value mono" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {accessItem.accessId ? (
                    <>
                      <span>{accessItem.accessId}</span>
                      <button
                        type="button"
                        onClick={copyAccessId}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: copied ? "#16A34A" : "#94A3B8",
                          padding: "0",
                          display: "flex",
                        }}
                        title="Copy Access ID"
                      >
                        {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#D97706", fontStyle: "italic" }}>Governance Review</span>
                  )}
                </span>
              </div>
              <div className="field">
                <span className="f-label">Provisioning Type</span>
                <span className="f-value">
                  {accessItem.automation ? (
                    <span style={{ color: "#2563EB", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Zap size={11} /> ⚡ Automated SCIM
                    </span>
                  ) : (
                    "Manual IT Provisioning"
                  )}
                </span>
              </div>
              <div className="field">
                <span className="f-label">Primary Approver</span>
                <span className="f-value">{accessItem.approver}</span>
              </div>
              <div className="field">
                <span className="f-label">Backup Approver</span>
                <span className="f-value">{accessItem.backupApprover || "None"}</span>
              </div>
              <div className="field">
                <span className="f-label">Owning Group</span>
                <span className="f-value">{accessItem.group}</span>
              </div>
              <div className="field">
                <span className="f-label">Request Flow</span>
                <span className="f-value">{accessItem.requestType}</span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div style={{ marginTop: "28px" }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: "100%",
                height: "44px",
                fontSize: "13.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onClick={() => {
                onClose();
                onRequestAccess(accessItem);
              }}
            >
              Request Access to {accessItem.name} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
