"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Shield,
  Search,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Layers,
} from "lucide-react";

export interface AuditLogEntry {
  id: string;
  action: string;
  userId?: string | null;
  userName: string;
  detail: string;
  createdAt: string | Date;
  user?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    avatarTone?: string;
    initials?: string;
  } | null;
}

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
  onRefresh?: () => Promise<void> | void;
}

type FilterCategory = "ALL" | "REQUEST_CREATED" | "APPROVAL" | "AUTOMATION" | "ROLES" | "PROVISIONING";

export default function AuditLogDrawer({
  isOpen,
  onClose,
  auditLogs = [],
  onRefresh,
}: AuditLogDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (isOpen && auditLogs.length === 0 && onRefresh) {
      onRefresh();
    }
  }, [isOpen, auditLogs.length, onRefresh]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefreshClick = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const getCategory = (log: AuditLogEntry): FilterCategory => {
    const act = log.action.toLowerCase();
    const detail = log.detail.toLowerCase();

    if (act.includes("approved") || act.includes("reject") || act.includes("closed")) {
      return "APPROVAL";
    }
    if (act.includes("auto") || detail.includes("scim") || detail.includes("automated")) {
      return "AUTOMATION";
    }
    if (act.includes("role") || act.includes("user") || act.includes("permission") || act.includes("department")) {
      return "ROLES";
    }
    if (act.includes("provision") || act.includes("manual")) {
      return "PROVISIONING";
    }
    if (act.includes("create") || act.includes("submit") || act.includes("request") || act.includes("extension")) {
      return "REQUEST_CREATED";
    }
    return "REQUEST_CREATED";
  };

  const counts = useMemo(() => {
    const res: Record<FilterCategory, number> = {
      ALL: auditLogs.length,
      REQUEST_CREATED: 0,
      APPROVAL: 0,
      AUTOMATION: 0,
      ROLES: 0,
      PROVISIONING: 0,
    };
    for (const log of auditLogs) {
      const cat = getCategory(log);
      res[cat] = (res[cat] || 0) + 1;
    }
    return res;
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return auditLogs.filter((log) => {
      if (selectedCategory !== "ALL") {
        const cat = getCategory(log);
        if (cat !== selectedCategory) return false;
      }
      if (!q) return true;
      const matchAction = log.action.toLowerCase().includes(q);
      const matchUser = log.userName.toLowerCase().includes(q);
      const matchDetail = log.detail.toLowerCase().includes(q);
      const matchId = log.id.toLowerCase().includes(q);
      return matchAction || matchUser || matchDetail || matchId;
    });
  }, [auditLogs, selectedCategory, searchQuery]);

  const getActionBadgeStyle = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("approved")) {
      return { className: "badge-green", icon: CheckCircle2 };
    }
    if (a.includes("reject")) {
      return { className: "badge-red", icon: XCircle };
    }
    if (a.includes("auto") || a.includes("automated")) {
      return { className: "badge-blue", icon: Zap };
    }
    if (a.includes("exception") || a.includes("extension")) {
      return { className: "badge-amber", icon: AlertTriangle };
    }
    if (a.includes("role") || a.includes("user")) {
      return { className: "badge-purple", icon: Shield };
    }
    return { className: "badge-gray", icon: Layers };
  };

  const formatTimestamp = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return { dateStr: "Just now", timeStr: "", relative: "Recent" };

    const dateStr = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    let relative = "Just now";
    if (diffSec > 86400) {
      relative = `${Math.floor(diffSec / 86400)}d ago`;
    } else if (diffSec > 3600) {
      relative = `${Math.floor(diffSec / 3600)}h ago`;
    } else if (diffSec > 60) {
      relative = `${Math.floor(diffSec / 60)}m ago`;
    }

    return { dateStr, timeStr, relative };
  };

  const exportFilteredLogs = () => {
    const rows = [
      ["Event ID", "Timestamp", "Action", "Actor", "Detail"],
      ...filteredLogs.map((l) => [
        l.id,
        new Date(l.createdAt).toISOString(),
        l.action,
        l.userName,
        l.detail.replace(/"/g, '""'),
      ]),
    ];

    const csvContent = "\uFEFF" + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newage-audit-stream-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`drawer ${isOpen ? "show" : ""}`}
        style={{ width: "min(640px, 94vw)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Audit & Compliance Log Drawer"
      >
        {/* Header */}
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "var(--btn-primary-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--btn-primary-text)",
              }}
            >
              <Shield size={16} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text)" }}>
                  Live Audit Trail
                </h3>
                <span className="badge badge-green" style={{ fontSize: "10.5px" }}>
                  <span className="live-pulse-dot" /> Active Ledger
                </span>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "1px" }}>
                Immutable cryptographic ledger of access decisions and role updates
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {onRefresh && (
              <button
                type="button"
                className="icon-btn"
                onClick={handleRefreshClick}
                title="Refresh logs"
                style={{ width: "30px", height: "30px" }}
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              </button>
            )}
            <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Quick Metrics Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                background: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            >
              <div style={{ fontSize: "10.5px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Events</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginTop: "2px" }}>
                {auditLogs.length}
              </div>
            </div>
            <div
              style={{
                background: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            >
              <div style={{ fontSize: "10.5px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Approvals</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#4ADE80", marginTop: "2px" }}>
                {counts.APPROVAL}
              </div>
            </div>
            <div
              style={{
                background: "var(--surface-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            >
              <div style={{ fontSize: "10.5px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Automations</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent)", marginTop: "2px" }}>
                {counts.AUTOMATION}
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Filter by actor, NAR ID, or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "34px",
                  padding: "0 10px 0 30px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  fontSize: "12px",
                  outline: "none",
                  background: "var(--surface-input)",
                  color: "var(--text)",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    cursor: "pointer",
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={exportFilteredLogs}
              title="Export filtered audit trail to CSV"
              style={{
                height: "34px",
                fontSize: "11.5px",
                padding: "0 10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                flexShrink: 0,
              }}
            >
              <FileSpreadsheet size={13} /> Export CSV
            </button>
          </div>

          {/* Category Filter Pills */}
          <div
            className="filter-pills-row"
            style={{
              marginBottom: "12px",
              paddingBottom: "2px",
              overflowX: "auto",
              display: "flex",
              gap: "5px",
            }}
          >
            {(
              [
                { id: "ALL", label: `All (${counts.ALL})` },
                { id: "APPROVAL", label: `Approvals (${counts.APPROVAL})` },
                { id: "REQUEST_CREATED", label: `Requests (${counts.REQUEST_CREATED})` },
                { id: "AUTOMATION", label: `Auto (${counts.AUTOMATION})` },
                { id: "PROVISIONING", label: `Provisioning (${counts.PROVISIONING})` },
                { id: "ROLES", label: `Roles (${counts.ROLES})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`filter-pill ${selectedCategory === tab.id ? "active" : ""}`}
                style={{ fontSize: "11px", padding: "3px 9px", whiteSpace: "nowrap" }}
                onClick={() => setSelectedCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Audit Stream List */}
          {filteredLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <div className="circle">
                <Shield size={18} />
              </div>
              <div className="title">No audit logs found</div>
              <div className="sub">
                {searchQuery
                  ? `No logs match "${searchQuery}".`
                  : "No events recorded in this category yet."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredLogs.map((log) => {
                const badgeStyle = getActionBadgeStyle(log.action);
                const BadgeIcon = badgeStyle.icon;
                const { dateStr, timeStr, relative } = formatTimestamp(log.createdAt);
                const eventShortId = `evt_${log.id.slice(-8)}`;

                const initials = (log.userName || "System")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const isSystem = log.userName.toLowerCase() === "system" || log.action.toLowerCase().includes("auto");

                return (
                  <div
                    key={log.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      boxShadow: "var(--shadow-card)",
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* User Avatar */}
                    <div
                      className="avatar"
                      style={{
                        width: "28px",
                        height: "28px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: isSystem ? "#0F172A" : log.user?.avatarTone || "#2563EB",
                        color: "#FFFFFF",
                        flexShrink: 0,
                        marginTop: "1px",
                      }}
                    >
                      {isSystem ? <Zap size={13} /> : initials}
                    </div>

                    {/* Content Section */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "6px",
                          flexWrap: "wrap",
                          marginBottom: "3px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                          <span
                            className={`badge ${badgeStyle.className}`}
                            style={{
                              fontSize: "10.5px",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            <BadgeIcon size={10} /> {log.action}
                          </span>

                          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text)" }}>
                            {log.userName}
                          </span>
                        </div>

                        {/* Monospace Event ID & Copy */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button
                            type="button"
                            onClick={() => handleCopy(log.id, log.id)}
                            title="Click to copy full event hash"
                            style={{
                              background: copiedId === log.id ? "rgba(34, 197, 94, 0.15)" : "var(--surface-subtle)",
                              color: copiedId === log.id ? "#4ADE80" : "var(--muted)",
                              border: `1px solid ${copiedId === log.id ? "rgba(34, 197, 94, 0.3)" : "var(--border)"}`,
                              borderRadius: "4px",
                              padding: "1px 5px",
                              fontSize: "10px",
                              fontFamily: "monospace",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              cursor: "pointer",
                            }}
                          >
                            {copiedId === log.id ? <Check size={9} /> : <Copy size={9} />}
                            {eventShortId}
                          </button>
                        </div>
                      </div>

                      {/* Detail Text */}
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          lineHeight: "1.4",
                          wordBreak: "break-word",
                        }}
                      >
                        {log.detail}
                      </div>

                      {/* Exact Timestamp */}
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: "var(--muted)",
                          marginTop: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={10} /> {dateStr} at {timeStr}
                        </span>
                        <span>·</span>
                        <span style={{ fontWeight: 500, color: "var(--muted)" }}>{relative}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
