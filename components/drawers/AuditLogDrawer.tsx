"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Shield,
  Search,
  Filter,
  Clock,
  User,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Lock,
  ArrowUpRight,
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

  // Helper to categorize an audit log
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

  // Categorized counts
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

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return auditLogs.filter((log) => {
      // Category check
      if (selectedCategory !== "ALL") {
        const cat = getCategory(log);
        if (cat !== selectedCategory) return false;
      }
      // Text search check
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
      return { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0", icon: CheckCircle2 };
    }
    if (a.includes("reject")) {
      return { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA", icon: XCircle };
    }
    if (a.includes("auto") || a.includes("automated")) {
      return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", icon: Zap };
    }
    if (a.includes("exception") || a.includes("extension")) {
      return { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", icon: AlertTriangle };
    }
    if (a.includes("role") || a.includes("user")) {
      return { bg: "#FAF5FF", color: "#7E22CE", border: "#E9D5FF", icon: Shield };
    }
    return { bg: "#F8FAFC", color: "#334155", border: "#E2E8F0", icon: Layers };
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
        style={{ width: "min(680px, 94vw)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Audit & Compliance Log Drawer"
      >
        {/* Header */}
        <div className="drawer-head" style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(15, 27, 51, 0.2)",
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F1B33" }}>
                  Live Audit Trail &amp; Stream
                </h3>
                <span
                  className="badge"
                  style={{
                    background: "#ECFDF5",
                    color: "#059669",
                    border: "1px solid #A7F3D0",
                    fontWeight: 700,
                    fontSize: "11px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "2px 8px",
                  }}
                >
                  <span className="live-pulse-dot" style={{ background: "#10B981" }} /> Live Stream
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                Immutable cryptographic ledger of access decisions, SCIM automations, and role updates
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {onRefresh && (
              <button
                type="button"
                className="icon-btn"
                onClick={handleRefreshClick}
                title="Refresh logs"
                style={{ width: "32px", height: "32px" }}
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              </button>
            )}
            <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="drawer-body" style={{ padding: "20px 22px" }}>
          {/* Quick Metrics Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>Total Events</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0F1B33", marginTop: "2px" }}>
                {auditLogs.length}
              </div>
            </div>
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <div style={{ fontSize: "11px", color: "#166534", fontWeight: 600 }}>Approvals &amp; Actions</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#15803D", marginTop: "2px" }}>
                {counts.APPROVAL}
              </div>
            </div>
            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <div style={{ fontSize: "11px", color: "#1E40AF", fontWeight: 600 }}>Automations</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#2563EB", marginTop: "2px" }}>
                {counts.AUTOMATION}
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={15} style={{ position: "absolute", left: "12px", color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Filter by actor, NAR ID, action, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0 12px 0 34px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "12.5px",
                  outline: "none",
                  background: "#FFFFFF",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={exportFilteredLogs}
              title="Export filtered audit trail to CSV"
              style={{
                height: "36px",
                fontSize: "12px",
                padding: "0 12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <FileSpreadsheet size={14} /> Export CSV
            </button>
          </div>

          {/* Category Filter Pills */}
          <div
            className="filter-pills-row"
            style={{
              marginBottom: "16px",
              paddingBottom: "4px",
              overflowX: "auto",
              display: "flex",
              gap: "6px",
            }}
          >
            {(
              [
                { id: "ALL", label: `All Events (${counts.ALL})` },
                { id: "APPROVAL", label: `Approvals (${counts.APPROVAL})` },
                { id: "REQUEST_CREATED", label: `Requests (${counts.REQUEST_CREATED})` },
                { id: "AUTOMATION", label: `⚡ Automation (${counts.AUTOMATION})` },
                { id: "PROVISIONING", label: `Provisioning (${counts.PROVISIONING})` },
                { id: "ROLES", label: `Roles & Users (${counts.ROLES})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`filter-pill ${selectedCategory === tab.id ? "active" : ""}`}
                style={{ fontSize: "11.5px", padding: "5px 11px", whiteSpace: "nowrap" }}
                onClick={() => setSelectedCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Audit Stream List */}
          {filteredLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="circle">
                <Shield size={22} />
              </div>
              <div className="title">No audit logs found</div>
              <div className="sub">
                {searchQuery
                  ? `No logs match "${searchQuery}". Try a different search term.`
                  : "No events recorded in this category yet."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredLogs.map((log) => {
                const badgeStyle = getActionBadgeStyle(log.action);
                const BadgeIcon = badgeStyle.icon;
                const { dateStr, timeStr, relative } = formatTimestamp(log.createdAt);
                const eventShortId = `evt_${log.id.slice(-8)}`;

                // Generate initials for avatar
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
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      boxShadow: "0 1px 3px rgba(15, 27, 51, 0.02)",
                      transition: "all 0.15s ease",
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* User Avatar / System Icon */}
                    <div
                      className="avatar"
                      style={{
                        width: "34px",
                        height: "34px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: isSystem ? "#0F172A" : log.user?.avatarTone || "#2563EB",
                        color: "#FFFFFF",
                        flexShrink: 0,
                        marginTop: "2px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      {isSystem ? <Zap size={15} /> : initials}
                    </div>

                    {/* Content Section */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Top Row: Action Badge + Actor + Event ID + Relative Timestamp */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginBottom: "4px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                              border: `1px solid ${badgeStyle.border}`,
                              borderRadius: "6px",
                              padding: "2px 7px",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <BadgeIcon size={11} /> {log.action}
                          </span>

                          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0F1B33" }}>
                            {log.userName}
                          </span>
                        </div>

                        {/* Monospace Event ID & Copy */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => handleCopy(log.id, log.id)}
                            title="Click to copy full immutable event hash"
                            style={{
                              background: copiedId === log.id ? "#ECFDF5" : "#F1F5F9",
                              color: copiedId === log.id ? "#047857" : "#475569",
                              border: `1px solid ${copiedId === log.id ? "#A7F3D0" : "#E2E8F0"}`,
                              borderRadius: "5px",
                              padding: "2px 6px",
                              fontSize: "10.5px",
                              fontFamily: "monospace",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {copiedId === log.id ? <Check size={10} /> : <Copy size={10} />}
                            {eventShortId}
                          </button>
                        </div>
                      </div>

                      {/* Detail Text with highlighted NAR Request ID */}
                      <div
                        style={{
                          fontSize: "12.5px",
                          color: "#334155",
                          lineHeight: "1.45",
                          wordBreak: "break-word",
                        }}
                      >
                        {log.detail}
                      </div>

                      {/* Exact Timestamp */}
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          marginTop: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <Clock size={11} /> {dateStr} at {timeStr}
                        </span>
                        <span>·</span>
                        <span style={{ fontWeight: 600, color: "#64748B" }}>{relative}</span>
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
