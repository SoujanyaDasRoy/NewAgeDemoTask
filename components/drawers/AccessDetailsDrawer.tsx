"use client";

import React, { useState } from "react";
import {
  X,
  Zap,
  Copy,
  CheckCheck,
  Building2,
  ArrowRight,
} from "lucide-react";
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
        <div className="drawer-head" style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="drawer-logo-lightbox">
              <ServiceLogo tool={accessItem.tool} size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                  {accessItem.name}
                </h3>
                <span className={`badge ${accessItem.category === "APPLICATION" ? "badge-teal" : "badge-purple"}`} style={{ fontSize: "11px", fontWeight: 600, padding: "2.5px 8px" }}>
                  {accessItem.category === "APPLICATION" ? "Application" : "Board"}
                </span>
                {!isEligible && (
                  <span className="badge badge-neutral" style={{ fontSize: "11px", fontWeight: 600, padding: "2.5px 8px" }}>
                    🏢 Cross-Department
                  </span>
                )}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--muted)", marginTop: "2px" }}>
                {accessItem.tool} · Owned by {accessItem.group}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body" style={{ padding: "22px" }}>
          {/* Sleek Elegant Neutral Routing Note */}
          <div className="drawer-routing-note">
            <Building2 size={16} className="drawer-routing-note-icon" />
            <div>
              <div className="drawer-routing-note-title">
                {isEligible
                  ? "Standard Policy Match"
                  : `Managed by ${accessItem.group || "Marketing Team"}`}
              </div>
              <div className="drawer-routing-note-desc">
                {isEligible
                  ? `You belong to an authorized department. Requests route directly to ${accessItem.approver} for fulfillment.`
                  : `Routes to ${accessItem.approver} (Owner) for cross-team approval.`}
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", margin: "0 0 20px" }}>
            {accessItem.description}
          </p>

          {/* Access Details Metadata Grid */}
          <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
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
                          color: copied ? "#4ADE80" : "var(--muted)",
                          padding: "0",
                          display: "flex",
                        }}
                        title="Copy Access ID"
                      >
                        {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "#F59E0B", fontStyle: "italic", fontSize: "11.5px" }}>Governance Review</span>
                  )}
                </span>
              </div>
              <div className="field">
                <span className="f-label">Provisioning Type</span>
                <span className="f-value">
                  {accessItem.automation ? (
                    <span style={{ color: "var(--accent)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <Zap size={11} /> Automated SCIM
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
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{
                height: "40px",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              onClick={() => {
                onClose();
                onRequestAccess(accessItem);
              }}
            >
              Request Access to {accessItem.name} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

