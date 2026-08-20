"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Package, Check } from "lucide-react";
import StatusBadge from "../StatusBadge";
import Timeline from "../Timeline";

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

  const handleProvision = async () => {
    setLoading(true);
    await onProvision(request.id);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? "show" : ""}`}>
        <div className="drawer-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3>Manual Provisioning Task</h3>
              <StatusBadge status={request.status} />
            </div>
            <div className="sub">
              {request.accessLabel} · <span className="mono">{request.id}</span>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              marginBottom: "20px",
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
              <Package size={18} /> Ready for Manual Provisioning
            </div>
            <div style={{ fontSize: "12px", color: "#9A3412", marginTop: "4px", lineHeight: "1.4" }}>
              This request was approved by <strong>{request.approverName}</strong>. As the designated access provider, please grant the necessary permissions in the external tool and mark this task as provisioned.
            </div>
          </div>

          <div className="divider-label">Workflow Progress</div>
          <Timeline steps={request.timeline || []} />

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <div className="divider-label">Provisioning Targets</div>
            <div className="field-grid">
              <div className="field">
                <span className="f-label">Beneficiary</span>
                <span className="f-value font-bold">{request.beneficiaryName}</span>
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

            <div style={{ marginTop: "16px" }}>
              <span className="f-label">Requester Justification</span>
              <div
                style={{
                  marginTop: "6px",
                  padding: "12px",
                  background: "#F8FAFC",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#334155",
                }}
              >
                {request.justification}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "28px" }}>
            <button
              className="btn btn-primary btn-block"
              style={{ background: "#EA580C" }}
              onClick={handleProvision}
              disabled={loading}
            >
              <Check size={16} /> {loading ? "Updating..." : "Mark as Provisioned"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
