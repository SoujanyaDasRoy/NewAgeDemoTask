"use client";

import React, { useState } from "react";
import {
  X,
  Package,
  Check,
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ServiceLogo tool={toolName} size={24} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                  Manual IT Provisioning
                </h3>
                <StatusBadge status={request.status} />
              </div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "1px" }}>
                {request.accessLabel} · <span className="mono">{request.id}</span>
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Action Callout Card */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#F8FAFC",
              border: "1px solid var(--border)",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Package size={15} style={{ color: "#64748B" }} /> Ready for Manual Fulfillment
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px", lineHeight: "1.45" }}>
              Approved by <strong>{request.approverName}</strong>. Please create the account in {toolName} and confirm fulfillment below.
            </div>

            <button
              className="btn btn-primary btn-block"
              style={{
                marginTop: "12px",
                height: "38px",
                fontSize: "12.5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              onClick={handleProvision}
              disabled={loading}
            >
              <Check size={14} /> {loading ? "Provisioning..." : "Confirm Provisioning Complete"}
            </button>
          </div>

          {/* Workflow Journey */}
          <div className="divider-label" style={{ marginBottom: "10px" }}>
            Workflow Journey
          </div>
          <Timeline steps={request.timeline || []} />

          {/* Provisioning Target Grid */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label" style={{ marginBottom: "10px" }}>
              Provisioning Details
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
            <div style={{ marginTop: "14px" }}>
              <span className="f-label">Business Justification</span>
              <div
                style={{
                  marginTop: "4px",
                  padding: "10px 12px",
                  background: "#F8FAFC",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  color: "#334155",
                  lineHeight: "1.45",
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
