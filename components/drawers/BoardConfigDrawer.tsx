"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Sliders, ToggleLeft, ToggleRight } from "lucide-react";
import StatusBadge from "../StatusBadge";

interface BoardConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  accessItem: any;
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
  onSaveConfig,
  onToggleAutomation,
}: BoardConfigDrawerProps) {
  const [approver, setApprover] = useState("");
  const [backupApprover, setBackupApprover] = useState("");
  const [provider, setProvider] = useState("");
  const [automation, setAutomation] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessItem) {
      setApprover(accessItem.approver || "");
      setBackupApprover(accessItem.backupApprover || "");
      setProvider(accessItem.provider || "");
      setAutomation(!!accessItem.automation);
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

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? "show" : ""}`}>
        <div className="drawer-head">
          <div>
            <h3>Manage Access Configuration</h3>
            <div className="sub">
              {accessItem.tool} – {accessItem.name}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Automation Switch */}
          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              background: automation ? "#EEF2FF" : "#F8FAFC",
              border: `1px solid ${automation ? "#C7D2FE" : "var(--border)"}`,
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1E1B4B" }}>
                Automated Provisioning
              </div>
              <div style={{ fontSize: "12px", color: "#6366F1", marginTop: "2px" }}>
                {automation
                  ? "Approved requests are automatically completed."
                  : "Approved requests route to the manual provisioning queue."}
              </div>
            </div>

            <button
              type="button"
              style={{
                border: "none",
                background: "transparent",
                color: automation ? "#4F46E5" : "#94A3B8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              onClick={handleToggle}
            >
              {automation ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="divider-label">Role Assignments</div>

            <div className="form-group">
              <label className="form-label">Primary Approver</label>
              <span className="form-sublabel">
                First recipient of all incoming access requests for this board.
              </span>
              <input
                type="text"
                className="form-input"
                value={approver}
                onChange={(e) => setApprover(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Backup Approver</label>
              <span className="form-sublabel">
                Can step in to approve if primary approver is out of office.
              </span>
              <input
                type="text"
                className="form-input"
                value={backupApprover}
                onChange={(e) => setBackupApprover(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Access Provider (IT Admin)</label>
              <span className="form-sublabel">
                Responsible for manual provisioning when automation is disabled.
              </span>
              <input
                type="text"
                className="form-input"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
              <div className="divider-label">Metadata & Governance</div>
              <div className="field-grid">
                <div className="field">
                  <span className="f-label">Access ID</span>
                  <span className="f-value mono">{accessItem.accessId || "Unassigned"}</span>
                </div>
                <div className="field">
                  <span className="f-label">Owning Group</span>
                  <span className="f-value">{accessItem.group}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1.5 }}
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
