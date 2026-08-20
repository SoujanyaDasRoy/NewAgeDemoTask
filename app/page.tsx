"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Search,
  ChevronRight,
  LayoutDashboard,
  Package,
  CheckSquare,
  Settings,
  Clock,
  Activity,
  Key,
  Zap,
  MessageSquare,
  Plus,
  ExternalLink,
  AlignJustify,
  LogOut,
} from "lucide-react";

import StatusBadge from "@/components/StatusBadge";
import Timeline from "@/components/Timeline";
import AccessDetailsDrawer from "@/components/drawers/AccessDetailsDrawer";
import RequestFormDrawer from "@/components/drawers/RequestFormDrawer";
import ExceptionFormDrawer from "@/components/drawers/ExceptionFormDrawer";
import RequestDetailDrawer from "@/components/drawers/RequestDetailDrawer";
import ApprovalDetailDrawer from "@/components/drawers/ApprovalDetailDrawer";
import AdminRequestDetailDrawer from "@/components/drawers/AdminRequestDetailDrawer";
import BoardConfigDrawer from "@/components/drawers/BoardConfigDrawer";
import AccessIdStatusDrawer from "@/components/drawers/AccessIdStatusDrawer";
import SlackNotifCard from "@/components/SlackNotifCard";

import { getCurrentUser, logout, switchSessionUser } from "@/lib/actions/auth";
import { getCatalog } from "@/lib/actions/catalog";
import { updateAccessConfig, toggleAutomation } from "@/lib/actions/catalog";
import {
  getRequests,
  submitRequest,
  submitExceptionRequest,
  approveRequest,
  rejectRequest,
  provisionManually,
  closeRequestAction,
  requestExtension,
  autoExpireRequests,
} from "@/lib/actions/requests";
import {
  getAccessIdQueue,
  requestAccessIdCreation,
  approveAccessId,
} from "@/lib/actions/access-id";
import { getNotifications, markNotificationsRead } from "@/lib/actions/notifications";
import { getAuditLogs } from "@/lib/actions/audit";

// ── PERSONAS ────────────────────────────────────────────────────────────────
const PERSONAS = {
  employee: {
    name: "Master Admin",
    role: "Employee",
    dept: "Product Team",
    email: "admin@newage.com",
    initials: "MA",
    avatarTone: "#0F1B33",
  },
  admin: {
    name: "Master Admin",
    role: "Master Admin",
    dept: "IT Support",
    email: "admin@newage.com",
    initials: "MA",
    avatarTone: "#0F1B33",
  },
};

type View = "employee" | "admin";

// ── TOAST ────────────────────────────────────────────────────────────────────
interface Toast {
  id: number;
  text: string;
  type?: "success" | "error";
}

let toastCounter = 0;

export default function PortalPage() {
  const [view, setView] = useState<View>("employee");
  const persona = PERSONAS[view];

  // Data
  const [catalog, setCatalog] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [accessIdQueue, setAccessIdQueue] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Active drawers
  const [accessDetailsItem, setAccessDetailsItem] = useState<any>(null);
  const [requestFormItem, setRequestFormItem] = useState<any>(null);
  const [exceptionFormItem, setExceptionFormItem] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalRequest, setApprovalRequest] = useState<any>(null);
  const [adminProvisionRequest, setAdminProvisionRequest] = useState<any>(null);
  const [boardConfigItem, setBoardConfigItem] = useState<any>(null);
  const [accessIdItem, setAccessIdItem] = useState<any>(null);

  // ── DATA LOADING ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    // Auto-expire any requests whose requiredUntil date has passed
    await autoExpireRequests();

    const [cat, reqs, idQueue, notifs, logs] = await Promise.all([
      getCatalog(persona.dept),
      getRequests(),
      getAccessIdQueue(),
      getNotifications(view),
      getAuditLogs(8),
    ]);
    setCatalog(cat);
    setRequests(reqs);
    setAccessIdQueue(idQueue);
    setNotifications(notifs);
    setAuditLogs(logs);
  }, [view, persona.dept]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── TOAST HELPER ─────────────────────────────────────────────────────────
  const pushToast = (text: string, type: "success" | "error" = "success") => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // ── KEYBOARD SHORTCUTS & ACCESSIBILITY ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAccessDetailsItem(null);
        setRequestFormItem(null);
        setExceptionFormItem(null);
        setSelectedRequest(null);
        setApprovalRequest(null);
        setAdminProvisionRequest(null);
        setBoardConfigItem(null);
        setAccessIdItem(null);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── SEARCH ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = catalog.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.tool.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
    setSearchResults(results);
  }, [searchQuery, catalog]);

  // ── ACTIONS ──────────────────────────────────────────────────────────────
  const handleSubmitRequest = async (data: any): Promise<string | null> => {
    const res = await submitRequest({
      ...data,
      requesterName: persona.name,
      requesterEmail: persona.email,
    });
    if (res.success) {
      await loadData();
      pushToast(`Access request ${res.requestId} submitted.`);
      return res.requestId!;
    } else {
      pushToast(res.error || "Failed to submit request.", "error");
      return null;
    }
  };

  const handleSubmitException = async (data: any): Promise<string | null> => {
    const res = await submitExceptionRequest({
      ...data,
      requesterName: persona.name,
      requesterEmail: persona.email,
    });
    if (res.success) {
      await loadData();
      pushToast(`Exception request ${res.requestId} submitted.`);
      return res.requestId!;
    } else {
      pushToast(res.error || "Failed to submit exception.", "error");
      return null;
    }
  };

  const handleApprove = async (requestId: string) => {
    const res = await approveRequest(requestId, persona.name);
    if (res.success) {
      await loadData();
      pushToast(`Request ${requestId} approved.`);
    } else {
      pushToast(res.error || "Failed to approve.", "error");
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    const res = await rejectRequest(requestId, reason, persona.name);
    if (res.success) {
      await loadData();
      pushToast(`Request ${requestId} rejected.`);
    } else {
      pushToast(res.error || "Failed to reject.", "error");
    }
  };

  const handleProvision = async (requestId: string) => {
    const res = await provisionManually(requestId, persona.name);
    if (res.success) {
      await loadData();
      pushToast(`Request ${requestId} provisioned.`);
    } else {
      pushToast(res.error || "Failed to provision.", "error");
    }
  };

  const handleCloseRequest = async (requestId: string) => {
    const res = await closeRequestAction(requestId, persona.name);
    if (res.success) {
      await loadData();
      pushToast(`Request ${requestId} closed.`);
    } else {
      pushToast(res.error || "Failed to close.", "error");
    }
  };

  const handleExtension = async (requestId: string) => {
    const res = await requestExtension(requestId, 14, persona.name);
    if (res.success) {
      await loadData();
      pushToast(`14-day extension requested for ${requestId}.`);
    } else {
      pushToast(res.error || "Failed to request extension.", "error");
    }
  };

  const handleSaveConfig = async (
    accessId: string,
    changes: { approver: string; backupApprover: string; provider: string }
  ) => {
    const res = await updateAccessConfig(accessId, changes, persona.name);
    if (res.success) {
      await loadData();
      pushToast("Access configuration updated.");
    } else {
      pushToast(res.error || "Failed to update config.", "error");
    }
  };

  const handleToggleAutomation = async (accessId: string) => {
    const res = await toggleAutomation(accessId, persona.name);
    if (res.success) {
      await loadData();
      pushToast(`Automation ${res.automation ? "enabled" : "disabled"}.`);
    } else {
      pushToast(res.error || "Failed to toggle automation.", "error");
    }
  };

  const handleRequestAccessId = async (accessItemId: string) => {
    const res = await requestAccessIdCreation(accessItemId, persona.name);
    if (res.success) {
      await loadData();
      pushToast("Access ID creation request submitted to IT Admin.");
    } else {
      pushToast(res.error || "Failed to request Access ID.", "error");
    }
  };

  const handleApproveAccessId = async (queueId: string) => {
    const res = await approveAccessId(queueId, persona.name);
    if (res.success) {
      await loadData();
      pushToast(`Access ID ${res.accessId} created successfully.`);
    } else {
      pushToast(res.error || "Failed to approve Access ID.", "error");
    }
  };

  // ── DERIVED DATA ─────────────────────────────────────────────────────────
  const myRequests = requests.filter(
    (r) => r.requester?.name === persona.name || r.beneficiaryName === persona.name
  );

  const pendingApprovals = requests.filter(
    (r) =>
      (r.status === "PENDING_APPROVAL" || r.status === "PENDING_EXCEPTION_APPROVAL") &&
      r.approverName === persona.name
  );

  const manualProvisionQueue = requests.filter(
    (r) => r.status === "PENDING_MANUAL_PROVISIONING" && r.providerName === persona.name
  );

  const myBoards = catalog.filter((item) => item.automation && item.accessId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && unreadCount > 0) {
      await markNotificationsRead(view);
      await loadData();
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  const handleSwitchView = async (newView: View) => {
    setView(newView);
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          {/* Brand */}
          <div className="brand">
            <div className="brand-badge">NA</div>
            <div>
              <div className="brand-text-title">New Age</div>
              <div className="brand-text-sub">Access Management Portal</div>
            </div>
          </div>

          {/* Right side */}
          <div className="header-right">
            {/* View switcher */}
            <div className="view-toggle">
              <button
                className={view === "employee" ? "active" : ""}
                onClick={() => handleSwitchView("employee")}
              >
                Employee View
              </button>
              <button
                className={view === "admin" ? "active" : ""}
                onClick={() => handleSwitchView("admin")}
              >
                Board Admin View
              </button>
            </div>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button className="icon-btn" onClick={handleNotifClick} title="Notifications">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notif-dot">{unreadCount}</span>
                )}
              </button>

              {/* Notification Panel */}
              <div className={`notif-panel ${notifOpen ? "show" : ""}`}>
                <div className="notif-panel-head">
                  <span>Notifications</span>
                  <span
                    style={{ fontSize: "11px", color: "#9CA3AF", cursor: "pointer" }}
                    onClick={async () => {
                      await markNotificationsRead(view);
                      await loadData();
                    }}
                  >
                    Mark all read
                  </span>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => {
                      // Detect Slack notifications that match a pending approval request
                      const matchedRequest =
                        n.channel === "slack"
                          ? requests.find(
                              (r) =>
                                n.text.includes(r.id) &&
                                ["PENDING_APPROVAL", "PENDING_EXCEPTION_APPROVAL"].includes(r.status) &&
                                r.approverName === persona.name
                            )
                          : null;

                      if (matchedRequest) {
                        return (
                          <SlackNotifCard
                            key={n.id}
                            notification={n}
                            matchedRequest={matchedRequest}
                            onApprove={async (id) => {
                              await handleApprove(id);
                            }}
                            onReject={async (id, reason) => {
                              await handleReject(id, reason);
                            }}
                            onClosePanel={() => setNotifOpen(false)}
                          />
                        );
                      }

                      return (
                        <div key={n.id} className="notif-item">
                          <div className={`notif-unread-dot ${n.read ? "read" : ""}`} />
                          <div>
                            <div className="notif-text">{n.text}</div>
                            <div className="notif-sub">
                              <span className="notif-ts">
                                {new Date(n.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                              <span className="notif-channel">
                                {n.channel === "slack" ? (
                                  <><MessageSquare size={11} /> Slack</>
                                ) : (
                                  <><Bell size={11} /> Portal</>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })

                  )}
                </div>
              </div>
            </div>

            {/* User chip */}
            <div className="user-chip">
              <div
                className="avatar"
                style={{
                  width: "34px",
                  height: "34px",
                  fontSize: "12px",
                  background: persona.avatarTone,
                }}
              >
                {persona.initials}
              </div>
              <div>
                <div className="name">{persona.name}</div>
                <div className="role">{persona.dept}</div>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="icon-btn"
                style={{ width: "30px", height: "30px", marginLeft: "6px", color: "#9CA3AF" }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="main-container">
        {/* Welcome */}
        <div className="welcome">
          <h1>Good morning, {persona.name.split(" ")[0]} 👋</h1>
          <p>
            {view === "employee"
              ? "Search and request access to Monday.com boards, Salesforce instances, Zendesk queues, and other connected tools."
              : "Manage provisioning queues, board configuration, Access ID governance, and monitor the full request lifecycle."}
          </p>
        </div>

        {/* SEARCH */}
        <div className="card">
          <div className="section-head">
            <div className="section-head-left">
              <div className="section-icon">
                <Search size={18} />
              </div>
              <div>
                <div className="section-title">Find & Request Access</div>
                <div className="section-sub">Search across all connected tools and boards</div>
              </div>
            </div>
          </div>

          <div className="search-row">
            <div className="search-input-wrap">
              <div className="search-ico">
                <Search size={16} />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search by board name, tool, team, or access ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="browse-btn" onClick={() => setSearchQuery("")}>
              <AlignJustify size={15} /> Browse All
            </button>
          </div>

          {/* Search Results */}
          {searchQuery.trim() && searchResults.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <div className="circle">
                <Search size={22} />
              </div>
              <div className="title">No matching tools or boards</div>
              <div className="sub">
                No results found matching &ldquo;{searchQuery}&rdquo;. Try another tool or keyword.
              </div>
              <button
                className="btn btn-secondary"
                style={{ marginTop: "14px", height: "34px", fontSize: "12.5px" }}
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {(searchQuery.trim() ? searchResults : catalog).map((item) => (
                <div
                  key={item.id}
                  className="result-row"
                  onClick={() => setAccessDetailsItem(item)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setAccessDetailsItem(item);
                    }
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span className="result-title">{item.name}</span>
                      <span className="badge badge-gray">{item.tool}</span>
                      {item.automation && (
                        <span className="badge badge-blue">
                          <Zap size={11} /> Automated
                        </span>
                      )}
                      {!item.accessId && (
                        <span className="badge badge-amber">Needs Access ID</span>
                      )}
                    </div>
                    <div className="result-desc">{item.description}</div>
                    <div className="result-meta">
                      <span>Group: {item.group}</span>
                      <span>Approver: {item.approver}</span>
                      {item.accessId && (
                        <span className="mono">ID: {item.accessId}</span>
                      )}
                      <span>
                        {item.isEligible ? (
                          <span style={{ color: "#15803D", fontWeight: 600 }}>✓ Eligible</span>
                        ) : (
                          <span style={{ color: "#B45309", fontWeight: 600 }}>Exception Required</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "12px", height: "32px", padding: "0 12px", flexShrink: 0 }}
                    aria-label={`View details for ${item.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAccessDetailsItem(item);
                    }}
                  >
                    View <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EMPLOYEE VIEW */}
        {view === "employee" && (
          <>
            <div className="grid-2">
              {/* My Requests */}
              <div className="card">
                <div className="section-head">
                  <div className="section-head-left">
                    <div className="section-icon">
                      <Package size={18} />
                    </div>
                    <div>
                      <div className="section-title">My Requests</div>
                      <div className="section-sub">
                        {myRequests.length} request{myRequests.length !== 1 ? "s" : ""} total
                      </div>
                    </div>
                  </div>
                </div>

                {myRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <Package size={22} />
                    </div>
                    <div className="title">No requests yet</div>
                    <div className="sub">
                      Search for a board or tool above to request access.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {myRequests.map((req) => (
                      <div
                        key={req.id}
                        className="list-row"
                        onClick={() => setSelectedRequest(req)}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>
                              {req.accessLabel}
                            </span>
                            <StatusBadge status={req.status} />
                            {req.isException && <span className="badge badge-amber">Exception</span>}
                          </div>
                          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                            <span className="mono">{req.id}</span> · Approver: {req.approverName}
                          </div>
                        </div>
                        {/* Quick-decision for on-behalf provisioned */}
                        {req.status === "ACCESS_PROVISIONED" && req.onBehalf && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: "12px", height: "32px", padding: "0 12px", background: "#6D28D9" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseRequest(req.id);
                            }}
                          >
                            Close
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Approvals (employee as approver) */}
              <div className="card card-tinted-amber">
                <div className="section-head">
                  <div className="section-head-left">
                    <div className="section-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
                      <CheckSquare size={18} />
                    </div>
                    <div>
                      <div className="section-title">Pending Approvals</div>
                      <div className="section-sub">
                        {pendingApprovals.length} awaiting your decision
                      </div>
                    </div>
                  </div>
                </div>

                {pendingApprovals.length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <CheckSquare size={22} />
                    </div>
                    <div className="title">All clear</div>
                    <div className="sub">No requests pending your approval right now.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {pendingApprovals.map((req) => (
                      <div key={req.id} className="list-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>
                              {req.accessLabel}
                            </span>
                            <StatusBadge status={req.status} />
                          </div>
                          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                            <span className="mono">{req.id}</span> · From: {req.requester?.name || req.beneficiaryName}
                          </div>
                        </div>
                        {/* Part 4: Inline quick-decision buttons */}
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button
                            className="btn btn-danger"
                            style={{ fontSize: "11px", height: "28px", padding: "0 10px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(req.id, "Rejected by approver");
                            }}
                          >
                            Reject
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: "11px", height: "28px", padding: "0 10px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(req.id);
                            }}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: "11px", height: "28px", padding: "0 10px" }}
                            onClick={() => setApprovalRequest(req)}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Boards (access items with automation for employee) */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <div className="section-title">My Boards</div>
                    <div className="section-sub">Boards you have access to</div>
                  </div>
                </div>
              </div>
              <div className="grid-3">
                {catalog.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="board-card"
                    onClick={() => setAccessDetailsItem(item)}
                  >
                    <div className="board-card-body">
                      <div className="row1">
                        <div>
                          <div className="t">{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                            {item.tool}
                          </div>
                        </div>
                        {item.automation ? (
                          <span className="badge badge-blue">
                            <Zap size={11} /> Auto
                          </span>
                        ) : (
                          <span className="badge badge-gray">Manual</span>
                        )}
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "12px", color: "#9CA3AF" }}>
                        {item.isEligible ? (
                          <span style={{ color: "#15803D", fontWeight: 600 }}>✓ Eligible</span>
                        ) : (
                          <span style={{ color: "#B45309", fontWeight: 600 }}>Exception Required</span>
                        )}
                        {item.accessId && (
                          <span className="mono" style={{ marginLeft: "8px" }}>
                            {item.accessId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="manage-link">
                      <ExternalLink size={12} /> View Details
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ADMIN VIEW */}
        {view === "admin" && (
          <>
            {/* ── MY BOARDS (Admin personal scope) ────────────────────── */}
            {(() => {
              const myAdminBoards = catalog.filter(
                (item) => item.provider === persona.name || item.approver === persona.name
              );
              return (
                <div className="card">
                  <div className="section-head">
                    <div className="section-head-left">
                      <div className="section-icon">
                        <LayoutDashboard size={18} />
                      </div>
                      <div>
                        <div className="section-title">My Boards</div>
                        <div className="section-sub">
                          Boards you administer or provide access for ({myAdminBoards.length})
                        </div>
                      </div>
                    </div>
                  </div>
                  {myAdminBoards.length === 0 ? (
                    <div className="empty-state">
                      <div className="circle"><LayoutDashboard size={22} /></div>
                      <div className="title">No boards assigned</div>
                      <div className="sub">You are not listed as approver or provider for any board.</div>
                    </div>
                  ) : (
                    <div className="grid-3">
                      {myAdminBoards.map((item) => (
                        <div key={item.id} className="board-card">
                          <div className="board-card-body">
                            <div className="row1">
                              <div>
                                <div className="t">{item.name}</div>
                                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "3px" }}>{item.tool}</div>
                              </div>
                              {item.automation ? (
                                <span className="badge badge-blue"><Zap size={11} /> Auto</span>
                              ) : (
                                <span className="badge badge-gray">Manual</span>
                              )}
                            </div>
                            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "3px" }}>
                              <div style={{ fontSize: "11.5px", color: "#6B7280" }}>
                                {item.approver === persona.name ? (
                                  <span style={{ fontWeight: 700, color: "#2F6FED" }}>✓ You are Approver</span>
                                ) : (
                                  <span>Approver: <strong style={{ color: "#374151" }}>{item.approver}</strong></span>
                                )}
                              </div>
                              <div style={{ fontSize: "11.5px", color: "#6B7280" }}>
                                {item.provider === persona.name ? (
                                  <span style={{ fontWeight: 700, color: "#EA580C" }}>✓ You are Provider</span>
                                ) : (
                                  <span>Provider: <strong style={{ color: "#374151" }}>{item.provider}</strong></span>
                                )}
                              </div>
                              {item.accessId ? (
                                <span className="mono" style={{ fontSize: "11px", color: "#9CA3AF" }}>{item.accessId}</span>
                              ) : (
                                <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 600 }}>No Access ID</span>
                              )}
                            </div>
                          </div>
                          <div className="manage-link" style={{ cursor: "pointer" }} onClick={() => setBoardConfigItem(item)}>
                            <Settings size={12} /> Manage Configuration
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="grid-2">
              {/* Admin Queue - Manual Provisioning */}
              <div className="card card-tinted-orange">
                <div className="section-head">
                  <div className="section-head-left">
                    <div className="section-icon" style={{ background: "#FFF0E6", color: "#C2410C" }}>
                      <Package size={18} />
                    </div>
                    <div>
                      <div className="section-title">Provisioning Queue</div>
                      <div className="section-sub">
                        {manualProvisionQueue.length} request{manualProvisionQueue.length !== 1 ? "s" : ""} awaiting manual provisioning
                      </div>
                    </div>
                  </div>
                </div>

                {manualProvisionQueue.length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <Package size={22} />
                    </div>
                    <div className="title">Queue is empty</div>
                    <div className="sub">No approved requests are waiting for manual provisioning.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {manualProvisionQueue.map((req) => (
                      <div
                        key={req.id}
                        className="list-row"
                        onClick={() => setAdminProvisionRequest(req)}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>
                              {req.accessLabel}
                            </span>
                            <StatusBadge status={req.status} />
                          </div>
                          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                            <span className="mono">{req.id}</span> · For: {req.beneficiaryName}
                          </div>
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: "11px", height: "28px", padding: "0 10px", background: "#EA580C", flexShrink: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProvision(req.id);
                          }}
                        >
                          Provision
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Access ID Governance Queue */}
              <div className="card card-tinted-violet">
                <div className="section-head">
                  <div className="section-head-left">
                    <div className="section-icon" style={{ background: "#EDE9FE", color: "#6D28D9" }}>
                      <Key size={18} />
                    </div>
                    <div>
                      <div className="section-title">Access ID Governance</div>
                      <div className="section-sub">
                        {accessIdQueue.filter((q) => q.status === "Pending Governance Review").length} pending review
                      </div>
                    </div>
                  </div>
                </div>

                {accessIdQueue.length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <Key size={22} />
                    </div>
                    <div className="title">No Access ID requests</div>
                    <div className="sub">All boards have their Access IDs assigned.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {accessIdQueue.map((item) => (
                      <div
                        key={item.id}
                        className="list-row"
                        onClick={() => {
                          setAccessIdItem(catalog.find((c) => c.id === item.accessItemId));
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>
                              {item.accessItem?.name}
                            </span>
                            <StatusBadge status={item.status} />
                          </div>
                          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                            {item.accessItem?.tool} · Requested by: {item.requestedBy}
                          </div>
                        </div>
                        {item.status === "Pending Governance Review" && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: "11px", height: "28px", padding: "0 10px", background: "#6D28D9", flexShrink: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveAccessId(item.id);
                            }}
                          >
                            Create ID
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* All Boards (admin config) */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon">
                    <Settings size={18} />
                  </div>
                  <div>
                    <div className="section-title">Board Configuration</div>
                    <div className="section-sub">
                      Manage approvers, providers, and automation for all boards
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid-3">
                {catalog.map((item) => (
                  <div key={item.id} className="board-card">
                    <div className="board-card-body">
                      <div className="row1">
                        <div>
                          <div className="t">{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "3px" }}>
                            {item.tool}
                          </div>
                        </div>
                        {item.automation ? (
                          <span className="badge badge-blue">
                            <Zap size={11} /> Auto
                          </span>
                        ) : (
                          <span className="badge badge-gray">Manual</span>
                        )}
                      </div>
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "3px" }}>
                        <div style={{ fontSize: "11.5px", color: "#6B7280" }}>
                          Approver: <strong style={{ color: "#374151" }}>{item.approver}</strong>
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#6B7280" }}>
                          Provider: <strong style={{ color: "#374151" }}>{item.provider}</strong>
                        </div>
                        {item.accessId ? (
                          <span className="mono" style={{ fontSize: "11px", color: "#9CA3AF" }}>
                            {item.accessId}
                          </span>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#D97706", fontWeight: 600 }}>
                            No Access ID
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="manage-link"
                      style={{ cursor: "pointer" }}
                      onClick={() => setBoardConfigItem(item)}
                    >
                      <Settings size={12} /> Manage Configuration
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Requests (admin overview) */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon">
                    <AlignJustify size={18} />
                  </div>
                  <div>
                    <div className="section-title">All Access Requests</div>
                    <div className="section-sub">{requests.length} total requests</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="list-row"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>
                          {req.accessLabel}
                        </span>
                        <StatusBadge status={req.status} />
                        {req.isException && <span className="badge badge-amber">Exception</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                        <span className="mono">{req.id}</span> · {req.requester?.name} → {req.beneficiaryName}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Log + Recent Activity */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="section-title">Recent Activity</div>
                    <div className="section-sub">Audit trail across all boards and requests</div>
                  </div>
                </div>
              </div>
              <div>
                {auditLogs.map((log) => (
                  <div key={log.id} className="activity-row">
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                      <span className="activity-action">{log.action}</span>
                      <span className="activity-resource">{log.detail}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                      <span className="activity-meta">{log.userName}</span>
                      <span className="activity-meta">
                        {new Date(log.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── DRAWERS ────────────────────────────────────────────────────────── */}

      <AccessDetailsDrawer
        isOpen={!!accessDetailsItem}
        onClose={() => setAccessDetailsItem(null)}
        accessItem={accessDetailsItem}
        currentUserName={persona.name}
        onRequestAccess={(item) => {
          setAccessDetailsItem(null);
          setRequestFormItem(item);
        }}
        onRequestException={(item) => {
          setAccessDetailsItem(null);
          setExceptionFormItem(item);
        }}
        onRequestAccessId={async (accessItemId) => {
          await handleRequestAccessId(accessItemId);
          setAccessDetailsItem(null);
        }}
        onViewAccessIdStatus={(accessItemId) => {
          setAccessDetailsItem(null);
          setAccessIdItem(catalog.find((c) => c.id === accessItemId));
        }}
      />

      <RequestFormDrawer
        isOpen={!!requestFormItem}
        onClose={() => setRequestFormItem(null)}
        accessItem={requestFormItem}
        currentUserName={persona.name}
        onSubmit={handleSubmitRequest}
      />

      <ExceptionFormDrawer
        isOpen={!!exceptionFormItem}
        onClose={() => setExceptionFormItem(null)}
        accessItem={exceptionFormItem}
        currentUserName={persona.name}
        onSubmit={handleSubmitException}
      />

      <RequestDetailDrawer
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        currentUserName={persona.name}
        onCloseRequest={handleCloseRequest}
        onRequestExtension={handleExtension}
      />

      <ApprovalDetailDrawer
        isOpen={!!approvalRequest}
        onClose={() => setApprovalRequest(null)}
        request={approvalRequest}
        actingUserName={persona.name}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <AdminRequestDetailDrawer
        isOpen={!!adminProvisionRequest}
        onClose={() => setAdminProvisionRequest(null)}
        request={adminProvisionRequest}
        onProvision={handleProvision}
      />

      <BoardConfigDrawer
        isOpen={!!boardConfigItem}
        onClose={() => setBoardConfigItem(null)}
        accessItem={boardConfigItem}
        onSaveConfig={handleSaveConfig}
        onToggleAutomation={handleToggleAutomation}
      />

      <AccessIdStatusDrawer
        isOpen={!!accessIdItem}
        onClose={() => setAccessIdItem(null)}
        accessItem={accessIdItem}
        queueItem={accessIdQueue.find((q) => q.accessItemId === accessIdItem?.id)}
        currentUserName={persona.name}
        onApproveAccessId={handleApproveAccessId}
        isAdmin={view === "admin"}
      />

      {/* ── TOAST CONTAINER ────────────────────────────────────────────────── */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === "error" ? "error" : ""}`}>
            <span className="toast-icon">
              {t.type === "error" ? "✗" : "✓"}
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
