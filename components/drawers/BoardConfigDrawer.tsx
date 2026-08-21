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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ServiceLogo tool={accessItem.tool} size={24} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0F172A" }}>
                  Manage Configuration
                </h3>
                <span className="badge badge-gray" style={{ fontSize: "10.5px" }}>
                  {accessItem.tool}
                </span>
              </div>
              <div className="sub" style={{ fontSize: "12px", color: "#64748B", marginTop: "1px" }}>
                {accessItem.name}
              </div>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Automated Provisioning Switch Card */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#FFFFFF",
              border: "1px solid var(--border)",
              marginBottom: "20px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0F172A" }}>
                    Automated SCIM Provisioning
                  </span>
                  {automation ? (
                    <span className="badge badge-blue">
                      <Zap size={10} /> Active
                    </span>
                  ) : (
                    <span className="badge badge-gray">
                      Manual Queue
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    marginTop: "3px",
                    lineHeight: 1.4,
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
                  color: automation ? "#0F172A" : "#CBD5E1",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "0",
                }}
                onClick={handleToggle}
                title={automation ? "Disable automation" : "Enable automation"}
              >
                {automation ? <ToggleRight size={34} style={{ color: "#2563EB" }} /> : <ToggleLeft size={34} />}
              </button>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="divider-label" style={{ marginBottom: "12px" }}>
              Role Assignments &amp; Workflow
            </div>

            {/* Primary Approver */}
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <User size={13} style={{ color: "#64748B" }} /> Primary Approver
              </label>
              <span className="form-sublabel">
                First recipient of all incoming access requests for this board.
              </span>
              <div style={{ marginTop: "4px" }}>
                <select
                  className="form-input"
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  style={{ cursor: "pointer", height: "36px" }}
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
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Shield size={13} style={{ color: "#64748B" }} /> Backup Approver
              </label>
              <span className="form-sublabel">
                Can step in to approve if the primary approver is unavailable.
              </span>
              <div style={{ marginTop: "4px" }}>
                <select
                  className="form-input"
                  value={backupApprover}
                  onChange={(e) => setBackupApprover(e.target.value)}
                  style={{ cursor: "pointer", height: "36px" }}
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
            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Building size={13} style={{ color: "#64748B" }} /> Access Provider (IT Admin)
              </label>
              <span className="form-sublabel">
                Responsible for manual provisioning when automation is disabled.
              </span>
              <div style={{ marginTop: "4px" }}>
                <select
                  className="form-input"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={{ cursor: "pointer", height: "36px" }}
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
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <div className="divider-label" style={{ marginBottom: "8px" }}>
                Metadata &amp; Governance
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  background: "#F8FAFC",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <span style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", textTransform: "uppercase" }}>
                    <Key size={11} /> Access ID
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                    <span className="mono" style={{ fontSize: "12.5px", fontWeight: 700, color: "#0F172A" }}>
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
                        {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", textTransform: "uppercase" }}>
                    <Building size={11} /> Owning Group
                  </span>
                  <div style={{ marginTop: "3px" }}>
                    <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                      {accessItem.group}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, height: "38px" }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1.5, height: "38px" }}
                disabled={loading}
              >
                <Check size={14} /> {loading ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
