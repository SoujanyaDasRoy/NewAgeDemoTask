"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Package,
  Check,
  Zap,
  Key,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import StatusBadge from "../StatusBadge";
import Timeline from "../Timeline";
import ServiceLogo from "../ServiceLogo";

interface AdminRequestDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onProvision: (requestId: string) => Promise<void>;
}

export default function AdminRequestDetailDrawer({
  isOpen,
  onClose,
  request,
  onProvision,
}: AdminRequestDetailDrawerProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !request) return null;

  const toolName = request.accessItem?.tool || request.accessLabel.split(" – ")[0] || "Tool";

  const handleProvision = async () => {
    setLoading(true);
    await onProvision(request.id);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Manual Provisioning Task Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ServiceLogo tool={toolName} size={28} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F1B33" }}>
                  Manual IT Provisioning
                </h3>
                <StatusBadge status={request.status} />
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
                {request.accessLabel} · <span className="mono">{request.id}</span>
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Action Callout Card */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
              border: "1px solid #FED7AA",
              marginBottom: "22px",
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: "#C2410C",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Package size={17} /> Ready for Manual Fulfillment
            </div>
            <div style={{ fontSize: "12px", color: "#9A3412", marginTop: "4px", lineHeight: "1.45" }}>
              This request was approved by <strong>{request.approverName}</strong>. Please create the user account in {toolName} and mark this task completed.
            </div>

            <button
              className="btn btn-primary"
              style={{
                marginTop: "14px",
                width: "100%",
                height: "40px",
                background: "#0F1B33",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              onClick={handleProvision}
              disabled={loading}
            >
              <Check size={16} /> {loading ? "Provisioning..." : "✓ Confirm & Complete Provisioning"}
            </button>
          </div>

          {/* Workflow Journey */}
          <div className="divider-label" style={{ marginBottom: "12px" }}>
            Multi-Step Workflow Journey
          </div>
          <Timeline steps={request.timeline || []} />

          {/* Provisioning Target Grid */}
          <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label" style={{ marginBottom: "12px" }}>
              Provisioning Targets &amp; Details
            </div>
            <div className="field-grid">
              <div className="field">
                <span className="f-label">Beneficiary User</span>
                <span className="f-value" style={{ fontWeight: 700 }}>{request.beneficiaryName}</span>
              </div>
              <div className="field">
                <span className="f-label">Requester</span>
                <span className="f-value">{request.requester?.name || request.requesterName}</span>
              </div>
              <div className="field">
                <span className="f-label">Target Resource</span>
                <span className="f-value">{request.accessLabel}</span>
              </div>
              <div className="field">
                <span className="f-label">Approved By</span>
                <span className="f-value">{request.approverName}</span>
              </div>
            </div>

            {/* Justification Box */}
            <div style={{ marginTop: "16px" }}>
              <span className="f-label">Business Justification</span>
              <div
                style={{
                  marginTop: "6px",
                  padding: "12px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#334155",
                  lineHeight: "1.5",
                }}
              >
                {request.justification}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
