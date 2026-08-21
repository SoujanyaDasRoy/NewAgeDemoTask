"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Zap,
  User,
  Shield,
  Copy,
  CheckCheck,
  Building,
  Key,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import ServiceLogo from "../ServiceLogo";

interface BoardConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessItem: any;
  users?: any[];
  onSaveConfig: (
    accessId: string,
    changes: { approver: string; backupApprover: string; provider: string }
  ) => Promise<void>;
  onToggleAutomation: (accessId: string) => Promise<void>;
}

export default function BoardConfigDrawer({
  isOpen,
  onClose,
  accessItem,
  users = [],
  onSaveConfig,
  onToggleAutomation,
}: BoardConfigDrawerProps) {
  const [approver, setApprover] = useState("");
  const [backupApprover, setBackupApprover] = useState("");
  const [provider, setProvider] = useState("");
  const [automation, setAutomation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (accessItem) {
      setApprover(accessItem.approver || "");
      setBackupApprover(accessItem.backupApprover || "");
      setProvider(accessItem.provider || "");
      setAutomation(!!accessItem.automation);
      setCopied(false);
    }
  }, [accessItem]);

  if (!isOpen || !accessItem) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSaveConfig(accessItem.id, {
      approver,
      backupApprover,
      provider,
    });
    setLoading(false);
    onClose();
  };

  const handleToggle = async () => {
    setAutomation(!automation);
    await onToggleAutomation(accessItem.id);
  };

  const copyAccessId = () => {
    if (accessItem.accessId) {
      navigator.clipboard.writeText(accessItem.accessId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Compile unique user names for selection
  const teamMemberOptions = Array.from(
    new Set([
      "Master Admin",
      "Soujanya Das Roy",
      "Arjun Mehta",
      "Priya Sharma",
      "Rahul Verma",
      ...users.map((u) => u.name),
    ])
  ).filter(Boolean);

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Manage Access Configuration Drawer"
      >
        {/* Drawer Header */}
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ServiceLogo tool={accessItem.tool} size={26} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F1B33" }}>
                  Manage Configuration
                </h3>
                <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                  {accessItem.tool}
                </span>
              </div>
              <div className="sub" style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
                {accessItem.name}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Automated Provisioning Switch Card */}
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: automation
                ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
                : "#F8FAFC",
              border: `1px solid ${automation ? "#BFDBFE" : "#E2E8F0"}`,
              marginBottom: "24px",
              boxShadow: automation ? "0 4px 14px rgba(37, 99, 235, 0.08)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: automation ? "#1E3A8A" : "#1E293B" }}>
                    Automated Provisioning
                  </span>
                  {automation ? (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "#2563EB",
                        color: "#FFFFFF",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <Zap size={10} /> Active
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "#E2E8F0",
                        color: "#64748B",
                      }}
                    >
                      Manual Queue
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: automation ? "#1E40AF" : "#64748B",
                    marginTop: "4px",
                    lineHeight: 1.45,
                  }}
                >
                  {automation
                    ? "Approved requests instantly trigger zero-touch automated API provisioning."
                    : "Approved requests route to IT Admin for manual account creation."}
                </div>
              </div>

              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: automation ? "#2563EB" : "#94A3B8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "0",
                  transition: "transform 0.15s ease",
                }}
                onClick={handleToggle}
                title={automation ? "Disable automation" : "Enable automation"}
              >
                {automation ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
              </button>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="divider-label" style={{ marginBottom: "14px" }}>
              Role Assignments &amp; Workflow
            </div>

            {/* Primary Approver */}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={13} style={{ color: "#2563EB" }} /> Primary Approver
              </label>
              <span className="form-sublabel">
                First recipient of all incoming access requests for this board.
              </span>
              <div style={{ position: "relative", marginTop: "6px" }}>
                <select
                  className="form-input"
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  style={{ cursor: "pointer", appearance: "auto" }}
                  required
                >
                  {teamMemberOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Backup Approver */}
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Shield size={13} style={{ color: "#D97706" }} /> Backup Approver
              </label>
              <span className="form-sublabel">
                Can step in to approve if the primary approver is out of office.
              </span>
              <div style={{ position: "relative", marginTop: "6px" }}>
                <select
                  className="form-input"
                  value={backupApprover}
                  onChange={(e) => setBackupApprover(e.target.value)}
                  style={{ cursor: "pointer", appearance: "auto" }}
                  required
                >
                  {teamMemberOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Access Provider (IT Admin) */}
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Building size={13} style={{ color: "#64748B" }} /> Access Provider (IT Admin)
              </label>
              <span className="form-sublabel">
                Responsible for manual provisioning when automation is disabled.
              </span>
              <div style={{ position: "relative", marginTop: "6px" }}>
                <select
                  className="form-input"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{ cursor: "pointer", appearance: "auto" }}
                  required
                >
                  {teamMemberOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metadata & Governance Card */}
            <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border)" }}>
              <div className="divider-label" style={{ marginBottom: "10px" }}>
                Metadata &amp; Governance
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  background: "#F8FAFC",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Key size={11} /> Access ID
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span className="mono" style={{ fontSize: "13px", fontWeight: 700, color: "#0F1B33" }}>
                      {accessItem.accessId || "Unassigned"}
                    </span>
                    {accessItem.accessId && (
                      <button
                        type="button"
                        onClick={copyAccessId}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: copied ? "#16A34A" : "#94A3B8",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                        }}
                        title="Copy Access ID"
                      >
                        {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Building size={11} /> Owning Group
                  </span>
                  <div style={{ marginTop: "4px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "#F1F5F9",
                        color: "#334155",
                      }}
                    >
                      {accessItem.group}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, height: "40px" }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1.5, height: "40px" }}
                disabled={loading}
              >
                <Check size={16} /> {loading ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
