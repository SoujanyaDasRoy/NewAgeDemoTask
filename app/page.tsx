"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Users,
  Shield,
  Trash2,
  User,
  ChevronDown,
} from "lucide-react";

import StatusBadge from "@/components/StatusBadge";
import Timeline from "@/components/Timeline";
import ServiceLogo from "@/components/ServiceLogo";
import CommandPalette from "@/components/CommandPalette";
import RequestMiniStepper from "@/components/RequestMiniStepper";
import SkeletonLoader from "@/components/SkeletonLoader";
import AccessDetailsDrawer from "@/components/drawers/AccessDetailsDrawer";
import RequestFormDrawer from "@/components/drawers/RequestFormDrawer";
import ExceptionFormDrawer from "@/components/drawers/ExceptionFormDrawer";
import RequestDetailDrawer from "@/components/drawers/RequestDetailDrawer";
import ApprovalDetailDrawer from "@/components/drawers/ApprovalDetailDrawer";
import AdminRequestDetailDrawer from "@/components/drawers/AdminRequestDetailDrawer";
import BoardConfigDrawer from "@/components/drawers/BoardConfigDrawer";
import AccessIdStatusDrawer from "@/components/drawers/AccessIdStatusDrawer";
import SlackNotifCard from "@/components/SlackNotifCard";

import {
  getCurrentUser,
  logout,
  getAllUsers,
  updateUserRole,
  deleteUser,
  SessionUser,
} from "@/lib/actions/auth";
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

// ── TOAST ────────────────────────────────────────────────────────────────────
interface Toast {
  id: number;
  text: string;
  type?: "success" | "error";
}

let toastCounter = 0;

export default function PortalPage() {
  const router = useRouter();

  // Active Authenticated User Session
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Data
  const [catalog, setCatalog] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [accessIdQueue, setAccessIdQueue] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [requestFilter, setRequestFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "COMPLETED" | "EXCEPTIONS">("ALL");

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
    // 1. Verify user session
    const user = await getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    setLoadingUser(false);

    // 2. Auto-expire any requests whose requiredUntil date has passed
    await autoExpireRequests();

    const isAdm = user.role === "ADMIN";
    const [cat, reqs, idQueue, notifs, logs, usersList] = await Promise.all([
      getCatalog(user.department),
      getRequests(),
      getAccessIdQueue(),
      getNotifications(isAdm ? "admin" : "employee"),
      getAuditLogs(8),
      isAdm ? getAllUsers() : Promise.resolve([]),
    ]);

    setCatalog(cat);
    setRequests(reqs);
    setAccessIdQueue(idQueue);
    setNotifications(notifs);
    setAuditLogs(logs);
    if (usersList) setAllUsers(usersList);
  }, [router]);

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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCmdPaletteOpen(false);
        setUserMenuOpen(false);
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

  // ── SEARCH HANDLER ────────────────────────────────────────────────────────
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
        item.group.toLowerCase().includes(q) ||
        (item.accessId && item.accessId.toLowerCase().includes(q))
    );
    setSearchResults(results);
  }, [searchQuery, catalog]);

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = async () => {
    setNotifOpen((prev) => !prev);
  };

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    if (!currentUser) return;
    const res = (await approveRequest(id, currentUser.name)) as any;
    if (res.success) {
      if (res.autoCompleted) {
        pushToast("Approved! Automated provisioning completed instantly.");
      } else if (res.onBehalf) {
        pushToast("Approved! Request is provisioned and ready for requester closure.");
      } else {
        pushToast("Request approved and moved to manual provisioning queue.");
      }
      setApprovalRequest(null);
      await loadData();
    } else {
      pushToast(res.error || "Failed to approve request", "error");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    if (!currentUser) return;
    const res = await rejectRequest(id, currentUser.name, reason);
    if (res.success) {
      pushToast("Request rejected and requester notified.");
      setApprovalRequest(null);
      await loadData();
    } else {
      pushToast(res.error || "Failed to reject request", "error");
    }
  };

  const handleProvision = async (id: string) => {
    if (!currentUser) return;
    const res = (await provisionManually(id, currentUser.name)) as any;
    if (res.success) {
      if (res.onBehalf) {
        pushToast("Access marked provisioned. Requester can now review and close.");
      } else {
        pushToast("Access provisioned successfully. Request completed!");
      }
      setAdminProvisionRequest(null);
      await loadData();
    } else {
      pushToast(res.error || "Failed to mark provisioned", "error");
    }
  };

  const handleCloseRequest = async (id: string) => {
    if (!currentUser) return;
    const res = await closeRequestAction(id, currentUser.name);
    if (res.success) {
      pushToast("Request successfully closed and completed!");
      setSelectedRequest(null);
      await loadData();
    } else {
      pushToast(res.error || "Failed to close request", "error");
    }
  };

  const handleExtension = async (id: string, days: number, reason: string) => {
    const res = await requestExtension(id, days, reason);
    if (res.success) {
      pushToast(`Extension of ${days} days requested successfully!`);
      setSelectedRequest(null);
      await loadData();
    } else {
      pushToast(res.error || "Failed to request extension", "error");
    }
  };

  const handleSaveBoardConfig = async (
    id: string,
    updates: { approver: string; backupApprover: string; provider: string }
  ) => {
    if (!currentUser) return;
    const res = await updateAccessConfig(id, updates, currentUser.name);
    if (res.success) {
      pushToast("Board configuration saved successfully!");
      setBoardConfigItem(null);
      await loadData();
    } else {
      pushToast(res.error || "Failed to update configuration", "error");
    }
  };

  const handleToggleAuto = async (id: string) => {
    if (!currentUser) return;
    const res = await toggleAutomation(id, currentUser.name);
    if (res.success) {
      pushToast(
        `Automation turned ${res.automation ? "ON (Instant auto-provisioning enabled)" : "OFF (Manual provisioning required)"}`
      );
      await loadData();
    } else {
      pushToast(res.error || "Failed to toggle automation", "error");
    }
  };

  const handleRequestAccessId = async (accessItemId: string) => {
    if (!currentUser) return;
    const res = await requestAccessIdCreation(accessItemId, currentUser.name);
    if (res.success) {
      pushToast("Access ID request submitted to Governance team!");
      setAccessIdItem(null);
      await loadData();
    } else {
      pushToast(res.error || "Failed to request Access ID", "error");
    }
  };

  const handleApproveAccessId = async (queueId: string) => {
    if (!currentUser) return;
    const res = await approveAccessId(queueId, currentUser.name);
    if (res.success) {
      pushToast(`Access ID ${res.accessId} generated and bound to board!`);
      await loadData();
    } else {
      pushToast(res.error || "Failed to approve Access ID", "error");
    }
  };

  // ── USER ROLE MANAGEMENT ACTIONS ─────────────────────────────────────────
  const handleUserRoleChange = async (userId: string, newRole: "EMPLOYEE" | "ADMIN") => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      pushToast(`Role updated to ${newRole === "ADMIN" ? "Board Admin" : "Employee"}!`);
      await loadData();
    } else {
      pushToast(res.error || "Failed to update role", "error");
    }
  };

  const handleUserDeptChange = async (userId: string, newDept: string, currentRole: "EMPLOYEE" | "ADMIN") => {
    const res = await updateUserRole(userId, currentRole, newDept);
    if (res.success) {
      pushToast(`Department updated to ${newDept}!`);
      await loadData();
    } else {
      pushToast(res.error || "Failed to update department", "error");
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (confirm("Are you sure you want to remove this user account?")) {
      const res = await deleteUser(userId);
      if (res.success) {
        pushToast("User account removed successfully.");
        await loadData();
      } else {
        pushToast(res.error || "Failed to delete user", "error");
      }
    }
  };

  if (loadingUser || !currentUser) {
    return <SkeletonLoader />;
  }

  const isRoleAdmin = currentUser.role === "ADMIN";

  // Filter requests based on user & filter tab
  const allMyRequests = requests.filter(
    (r) =>
      r.requesterId === currentUser.id ||
      r.requester?.email === currentUser.email ||
      r.beneficiaryName === currentUser.name ||
      isRoleAdmin
  );

  const myRequests = allMyRequests.filter((r) => {
    if (requestFilter === "ALL") return true;
    if (requestFilter === "PENDING") {
      return ["PENDING_APPROVAL", "PENDING_EXCEPTION_APPROVAL"].includes(r.status);
    }
    if (requestFilter === "APPROVED") {
      return ["APPROVED", "PENDING_MANUAL_PROVISIONING", "PROVISIONING", "ACCESS_PROVISIONED"].includes(r.status);
    }
    if (requestFilter === "COMPLETED") {
      return r.status === "COMPLETED";
    }
    if (requestFilter === "EXCEPTIONS") {
      return r.isException;
    }
    return true;
  });

  const pendingApprovals = requests.filter(
    (r) =>
      ["PENDING_APPROVAL", "PENDING_EXCEPTION_APPROVAL"].includes(r.status) &&
      (r.approverName === currentUser.name || isRoleAdmin)
  );

  const manualProvisionQueue = requests.filter((r) =>
    ["PENDING_MANUAL_PROVISIONING", "PROVISIONING"].includes(r.status)
  );

  return (
    <div className="portal-app">
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          {/* Brand with Breadcrumb */}
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="brand-badge">NA</div>
            <div className="brand-title-wrap">
              <span className="brand-main-text">New Age</span>
              <span className="brand-divider">/</span>
              <span className="brand-sub-text">Access Portal</span>
            </div>
          </div>

          {/* Right side */}
          <div className="header-right">
            {/* Pending Actions Quick Pill (if any) */}
            {pendingApprovals.length > 0 && (
              <span
                className="badge badge-amber"
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "11.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                onClick={() => {
                  const el = document.querySelector(".card-tinted-amber");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                title="Pending approvals requiring your action"
              >
                <Zap size={11} /> {pendingApprovals.length} Pending
              </span>
            )}

            {/* Role Badge with Live Pulse Dot */}
            <span
              className={isRoleAdmin ? "badge badge-blue" : "badge badge-gray"}
              style={{ fontWeight: 600, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span className="live-pulse-dot" />
              {isRoleAdmin ? "Board Admin" : "Employee"}
            </span>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button className="icon-btn" onClick={handleNotifClick} title="Notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
              </button>

              {/* Notification Panel */}
              <div className={`notif-panel ${notifOpen ? "show" : ""}`}>
                <div className="notif-panel-head">
                  <span>Notifications</span>
                  <span
                    style={{ fontSize: "11px", color: "#9CA3AF", cursor: "pointer" }}
                    onClick={async () => {
                      await markNotificationsRead(isRoleAdmin ? "admin" : "employee");
                      await loadData();
                    }}
                  >
                    Mark all read
                  </span>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "#9CA3AF",
                        fontSize: "13px",
                      }}
                    >
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const matchedRequest =
                        n.channel === "slack"
                          ? requests.find(
                              (r) =>
                                n.text.includes(r.id) &&
                                ["PENDING_APPROVAL", "PENDING_EXCEPTION_APPROVAL"].includes(
                                  r.status
                                ) &&
                                r.approverName === currentUser.name
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
                                  <>
                                    <MessageSquare size={11} /> Slack
                                  </>
                                ) : (
                                  <>
                                    <Bell size={11} /> Portal
                                  </>
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

            {/* Interactive User Profile Dropdown Menu */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                title="Account Settings"
              >
                <div
                  className="avatar"
                  style={{
                    width: "32px",
                    height: "32px",
                    fontSize: "11px",
                    background: currentUser.avatarTone || "#0F1B33",
                  }}
                >
                  {currentUser.initials}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="name" style={{ fontSize: "12.5px", fontWeight: 600, color: "#0F1B33" }}>
                    {currentUser.name}
                  </div>
                  <div className="role" style={{ fontSize: "10.5px", color: "#64748B" }}>
                    {currentUser.department}
                  </div>
                </div>
                <ChevronDown
                  size={13}
                  style={{
                    color: "#94A3B8",
                    transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                  }}
                />
              </button>

              {/* User Menu Popover */}
              {userMenuOpen && (
                <div className="user-dropdown-popover">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{currentUser.name}</div>
                    <div className="user-dropdown-email">{currentUser.email}</div>
                    <div
                      className="user-dropdown-badge"
                      style={{
                        background: isRoleAdmin ? "#EFF6FF" : "#F1F5F9",
                        color: isRoleAdmin ? "#1D4ED8" : "#475569",
                      }}
                    >
                      <Shield size={10} /> {isRoleAdmin ? "Board Admin" : "Employee"} · {currentUser.department}
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button
                    className="user-dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setCmdPaletteOpen(true);
                    }}
                  >
                    <Search size={14} /> Spotlight Search (⌘K)
                  </button>
                  <div className="user-dropdown-divider" />
                  <button
                    className="user-dropdown-item danger"
                    onClick={() => logout()}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-container">
        {/* Welcome Hero */}
        <div className="welcome">
          {isRoleAdmin ? (
            <>
              <h1>Board Admin · {currentUser.name}</h1>
              <p>
                Manage the boards you administer, provision access, govern Access IDs, and manage team member roles.
              </p>
            </>
          ) : (
            <>
              <h1>Welcome back, {currentUser.name.split(" ")[0]}</h1>
              <p>
                Search for access, track your requests, and act on anything awaiting your approval — all in one place.
              </p>
            </>
          )}
        </div>

        {/* SEARCH CARD WITH SPOTLIGHT SHORTCUT */}
        <div className="card">
          <div className="section-head" style={{ borderBottom: "none", paddingBottom: "4px" }}>
            <div>
              <div className="section-title">Find access</div>
              <div className="section-sub">
                Search by tool, board, or team — you don&apos;t need to know the exact internal name.
              </div>
            </div>
          </div>

          <div className="search-row" style={{ marginTop: "12px" }}>
            <div className="search-input-wrap">
              <div className="search-ico">
                <Search size={16} />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search for an application, tool, account or board..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="search-kbd-btn"
                onClick={() => setCmdPaletteOpen(true)}
                title="Open Spotlight Search (⌘K / Ctrl+K)"
              >
                ⌘K
              </button>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (catalog.length > 0) setAccessDetailsItem(catalog[0]);
              }}
            >
              Browse directory
            </button>
          </div>

          {/* Search Results */}
          {searchQuery.trim() && searchResults.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 20px" }}>
              <div className="circle">
                <Search size={20} />
              </div>
              <div className="title">No matching tools or boards</div>
              <div className="sub">
                Try searching for &quot;Monday&quot;, &quot;Salesforce&quot;, &quot;Zendesk&quot;, or &quot;Marketing&quot;.
              </div>
            </div>
          ) : (
            searchResults.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="result-row"
                    onClick={() => setAccessDetailsItem(item)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <ServiceLogo tool={item.tool} size={18} />
                          <span className="result-title">
                            {item.name}
                          </span>
                          <span className="board-tool-chip" style={{ fontSize: "11px" }}>
                            {item.tool}
                          </span>
                        </div>
                        <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                          {item.category === "APPLICATION" ? "Application" : "Board"}
                        </span>
                        {item.automation ? (
                          <span className="badge badge-blue">
                            <Zap size={10} /> Auto
                          </span>
                        ) : (
                          <span className="badge badge-gray">Manual</span>
                        )}
                      </div>
                      <div className="result-desc">{item.description}</div>
                      <div className="result-meta">
                        <span>Group: {item.group}</span>
                        <span>Approver: {item.approver}</span>
                        {item.accessId && <span className="mono">ID: {item.accessId}</span>}
                        <span>
                          {item.isEligible ? (
                            <span style={{ color: "#15803D", fontWeight: 600 }}>✓ Eligible</span>
                          ) : (
                            <span style={{ color: "#B45309", fontWeight: 600 }}>
                              Exception Required
                            </span>
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
            )
          )}
        </div>

        {/* ── EMPLOYEE VIEW ────────────────────────────────────────── */}
        {!isRoleAdmin && (
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
                        Requests you&apos;ve raised, for yourself or on behalf of other employees.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="filter-pills-row">
                  <button
                    className={`filter-pill ${requestFilter === "ALL" ? "active" : ""}`}
                    onClick={() => setRequestFilter("ALL")}
                  >
                    All ({allMyRequests.length})
                  </button>
                  <button
                    className={`filter-pill ${requestFilter === "PENDING" ? "active" : ""}`}
                    onClick={() => setRequestFilter("PENDING")}
                  >
                    Pending ({allMyRequests.filter((r) => ["PENDING_APPROVAL", "PENDING_EXCEPTION_APPROVAL"].includes(r.status)).length})
                  </button>
                  <button
                    className={`filter-pill ${requestFilter === "APPROVED" ? "active" : ""}`}
                    onClick={() => setRequestFilter("APPROVED")}
                  >
                    In-Progress ({allMyRequests.filter((r) => ["APPROVED", "PENDING_MANUAL_PROVISIONING", "PROVISIONING", "ACCESS_PROVISIONED"].includes(r.status)).length})
                  </button>
                  <button
                    className={`filter-pill ${requestFilter === "COMPLETED" ? "active" : ""}`}
                    onClick={() => setRequestFilter("COMPLETED")}
                  >
                    Completed ({allMyRequests.filter((r) => r.status === "COMPLETED").length})
                  </button>
                  <button
                    className={`filter-pill ${requestFilter === "EXCEPTIONS" ? "active" : ""}`}
                    onClick={() => setRequestFilter("EXCEPTIONS")}
                  >
                    Exceptions ({allMyRequests.filter((r) => r.isException).length})
                  </button>
                </div>

                {myRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <Package size={20} />
                    </div>
                    <div className="title">No requests found</div>
                    <div className="sub">
                      {requestFilter === "ALL"
                        ? "Search for a board or tool above to request access."
                        : `No requests currently in '${requestFilter.toLowerCase()}' status.`}
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 600,
                                color: "#0F1B33",
                              }}
                            >
                              {req.accessLabel}
                            </span>
                            <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                              {req.accessItem?.category === "APPLICATION" ? "Application" : "Board"}
                            </span>
                            <StatusBadge status={req.status} />
                            {req.isException && (
                              <span className="badge badge-amber">Exception</span>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "12px",
                              marginTop: "6px",
                            }}
                          >
                            <div style={{ fontSize: "12px", color: "#64748B" }}>
                              <span className="mono">{req.id}</span> · Updated{" "}
                              {new Date(req.updatedAt || req.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <RequestMiniStepper status={req.status} />
                          </div>
                        </div>
                        {/* Quick-decision for on-behalf provisioned */}
                        {req.status === "ACCESS_PROVISIONED" && req.onBehalf && (
                          <button
                            className="btn btn-primary"
                            style={{
                              fontSize: "12px",
                              height: "30px",
                              padding: "0 12px",
                              background: "#0F1B33",
                              marginLeft: "12px",
                            }}
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

              {/* Approvals Requiring My Action */}
              <div className="card card-tinted-amber">
                <div className="section-head">
                  <div className="section-head-left">
                    <div
                      className="section-icon"
                      style={{ background: "#FEF3C7", color: "#D97706" }}
                    >
                      <CheckSquare size={18} />
                    </div>
                    <div>
                      <div className="section-title">Approvals Requiring My Action</div>
                      <div className="section-sub">
                        You&apos;re the configured approver (or backup) for these requests.
                      </div>
                    </div>
                  </div>
                  {pendingApprovals.length > 0 && (
                    <span className="badge badge-amber" style={{ fontWeight: 600 }}>
                      {pendingApprovals.length} pending
                    </span>
                  )}
                </div>

                {pendingApprovals.length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <CheckSquare size={20} />
                    </div>
                    <div className="title">All clear</div>
                    <div className="sub">No requests pending your approval right now.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {pendingApprovals.map((req) => (
                      <div
                        key={req.id}
                        className="list-row"
                        style={{ borderLeft: "3px solid #D97706" }}
                        onClick={() => setApprovalRequest(req)}
                      >
                        <div
                          className="avatar"
                          style={{
                            width: "32px",
                            height: "32px",
                            fontSize: "11px",
                            background: "#0F1B33",
                            color: "#fff",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {(req.requester?.name || req.beneficiaryName || "NA")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 600,
                                color: "#0F1B33",
                              }}
                            >
                              {req.accessLabel}
                            </span>
                            <StatusBadge status={req.status} />
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                            <span className="mono">{req.id}</span> ·{" "}
                            {req.requester?.name || req.beneficiaryName} ·{" "}
                            {new Date(req.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>

                        {/* Inline Quick Action Buttons */}
                        <div className="quick-action-wrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="quick-action-btn quick-action-approve"
                            title="1-Click Approve"
                            onClick={() => handleApprove(req.id)}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="quick-action-btn quick-action-reject"
                            title="Reject"
                            onClick={() => setApprovalRequest(req)}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My Boards */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <div className="section-title">My Boards</div>
                    <div className="section-sub">Boards and applications you have access to</div>
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
                      {/* Top Row: Service Logo + Tool Name + Automation Pill */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <ServiceLogo tool={item.tool} size={18} />
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                            {item.tool}
                          </span>
                        </div>
                        {item.automation ? (
                          <span className="badge badge-blue">
                            <Zap size={11} /> Automated
                          </span>
                        ) : (
                          <span className="badge badge-gray">Manual</span>
                        )}
                      </div>

                      {/* Primary Board Title */}
                      <div className="board-title-primary">
                        {item.name}
                      </div>

                      {/* 2-Column Key Metadata Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px" }}>
                        <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: "8px", border: "1px solid #F1F5F9" }}>
                          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 500 }}>
                            Eligibility
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: 600, marginTop: "3px" }}>
                            {item.isEligible ? (
                              <span style={{ color: "#15803D" }}>✓ Eligible</span>
                            ) : (
                              <span style={{ color: "#B45309" }}>Exception Req.</span>
                            )}
                          </div>
                        </div>

                        <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: "8px", border: "1px solid #F1F5F9" }}>
                          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                            <Key size={11} /> Access ID
                          </div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#0F1B33", marginTop: "3px" }} className="mono">
                            {item.accessId || <span style={{ color: "#94A3B8" }}>—</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="manage-link">
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ExternalLink size={13} /> View Board Details
                      </span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── ADMIN VIEW ──────────────────────────────────────────── */}
        {isRoleAdmin && (
          <>
            {/* 1. Admin's My Requests */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon">
                    <Package size={18} />
                  </div>
                  <div>
                    <div className="section-title">My Requests</div>
                    <div className="section-sub">
                      Requests you&apos;ve raised, for yourself or on behalf of other employees.
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="filter-pills-row">
                <button
                  className={`filter-pill ${requestFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setRequestFilter("ALL")}
                >
                  All ({allMyRequests.length})
                </button>
                <button
                  className={`filter-pill ${requestFilter === "PENDING" ? "active" : ""}`}
                  onClick={() => setRequestFilter("PENDING")}
                >
                  Pending ({allMyRequests.filter((r) => ["PENDING_APPROVAL", "PENDING_EXCEPTION_APPROVAL"].includes(r.status)).length})
                </button>
                <button
                  className={`filter-pill ${requestFilter === "APPROVED" ? "active" : ""}`}
                  onClick={() => setRequestFilter("APPROVED")}
                >
                  In-Progress ({allMyRequests.filter((r) => ["APPROVED", "PENDING_MANUAL_PROVISIONING", "PROVISIONING", "ACCESS_PROVISIONED"].includes(r.status)).length})
                </button>
                <button
                  className={`filter-pill ${requestFilter === "COMPLETED" ? "active" : ""}`}
                  onClick={() => setRequestFilter("COMPLETED")}
                >
                  Completed ({allMyRequests.filter((r) => r.status === "COMPLETED").length})
                </button>
                <button
                  className={`filter-pill ${requestFilter === "EXCEPTIONS" ? "active" : ""}`}
                  onClick={() => setRequestFilter("EXCEPTIONS")}
                >
                  Exceptions ({allMyRequests.filter((r) => r.isException).length})
                </button>
              </div>

              {myRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="circle">
                    <Package size={20} />
                  </div>
                  <div className="title">No requests found</div>
                  <div className="sub">
                    {requestFilter === "ALL"
                      ? "Search for a board or tool above to request access."
                      : `No requests currently in '${requestFilter.toLowerCase()}' status.`}
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13.5px",
                              fontWeight: 600,
                              color: "#0F1B33",
                            }}
                          >
                            {req.accessLabel}
                          </span>
                          <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                            {req.accessItem?.category === "APPLICATION" ? "Application" : "Board"}
                          </span>
                          <StatusBadge status={req.status} />
                          {req.isException && (
                            <span className="badge badge-amber">Exception</span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "12px",
                            marginTop: "6px",
                          }}
                        >
                          <div style={{ fontSize: "12px", color: "#64748B" }}>
                            <span className="mono">{req.id}</span> · Updated{" "}
                            {new Date(req.updatedAt || req.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <RequestMiniStepper status={req.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. My Boards / Access */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon">
                    <LayoutDashboard size={18} />
                  </div>
                  <div>
                    <div className="section-title">My Boards / Access</div>
                    <div className="section-sub">
                      Boards and accounts you administer as the access provider.
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid-3">
                {catalog.slice(0, 3).map((item) => (
                  <div key={item.id} className="board-card" onClick={() => setBoardConfigItem(item)}>
                    <div className="board-card-body">
                      {/* Top Row: Service Logo + Tool Name + Automation Pill */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <ServiceLogo tool={item.tool} size={18} />
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                            {item.tool}
                          </span>
                        </div>
                        {item.automation ? (
                          <span className="badge badge-blue">
                            <Zap size={11} /> Automated
                          </span>
                        ) : (
                          <span className="badge badge-gray">Manual</span>
                        )}
                      </div>

                      {/* Primary Board Title */}
                      <div className="board-title-primary">
                        {item.name}
                      </div>

                      {/* 2-Column Key Metadata Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "14px" }}>
                        <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: "8px", border: "1px solid #F1F5F9" }}>
                          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                            <Key size={11} /> Access ID
                          </div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#0F1B33", marginTop: "3px" }} className="mono">
                            {item.accessId ? (
                              item.accessId
                            ) : (
                              <span style={{ color: "#D97706", fontSize: "11px" }}>Needs Issue</span>
                            )}
                          </div>
                        </div>

                        <div style={{ background: "#F8FAFC", padding: "8px 10px", borderRadius: "8px", border: "1px solid #F1F5F9" }}>
                          <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                            <User size={11} /> Approver
                          </div>
                          <div
                            style={{
                              fontSize: "12.5px",
                              fontWeight: 600,
                              color: "#0F1B33",
                              marginTop: "3px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={item.approver}
                          >
                            {item.approver}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clean Action Footer */}
                    <div className="manage-link">
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Settings size={13} /> Manage configuration
                      </span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Requests Requiring Admin Action & Access ID Governance */}
            <div className="grid-2">
              <div className="card card-tinted-orange">
                <div className="section-head">
                  <div className="section-head-left">
                    <div
                      className="section-icon"
                      style={{ background: "#FFF0E6", color: "#C2410C" }}
                    >
                      <Package size={18} />
                    </div>
                    <div>
                      <div className="section-title">Requests Requiring Admin Action</div>
                      <div className="section-sub">
                        Approved requests that need manual provisioning.
                      </div>
                    </div>
                  </div>
                  {manualProvisionQueue.length > 0 && (
                    <span className="badge badge-orange" style={{ fontWeight: 600 }}>
                      {manualProvisionQueue.length} pending
                    </span>
                  )}
                </div>

                {manualProvisionQueue.length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <Package size={20} />
                    </div>
                    <div className="title">Queue is empty</div>
                    <div className="sub">
                      No approved requests are waiting for manual provisioning.
                    </div>
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 600,
                                color: "#0F1B33",
                              }}
                            >
                              {req.accessLabel}
                            </span>
                            <StatusBadge status={req.status} />
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                            <span className="mono">{req.id}</span> · For: {req.beneficiaryName}
                          </div>
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{
                            fontSize: "11.5px",
                            height: "28px",
                            padding: "0 10px",
                            background: "#0F1B33",
                            flexShrink: 0,
                          }}
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

              {/* Access ID Governance */}
              <div className="card card-tinted-violet">
                <div className="section-head">
                  <div className="section-head-left">
                    <div
                      className="section-icon"
                      style={{ background: "#EDE9FE", color: "#6D28D9" }}
                    >
                      <Key size={18} />
                    </div>
                    <div>
                      <div className="section-title">Access ID Governance</div>
                      <div className="section-sub">
                        {accessIdQueue.filter((q) => q.status === "Pending Governance Review").length}{" "}
                        pending review
                      </div>
                    </div>
                  </div>
                </div>

                {accessIdQueue.filter((q) => q.status === "Pending Governance Review").length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <Key size={20} />
                    </div>
                    <div className="title">All clear</div>
                    <div className="sub">No Access ID creations currently pending review.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {accessIdQueue
                      .filter((q) => q.status === "Pending Governance Review")
                      .map((item) => (
                        <div key={item.id} className="list-row">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "13.5px",
                                fontWeight: 600,
                                color: "#0F1B33",
                              }}
                            >
                              {item.accessItem?.name || item.accessItemId}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>
                              Requested by: {item.requestedBy}
                            </div>
                          </div>
                          <button
                            className="btn btn-primary"
                            style={{
                              fontSize: "11px",
                              height: "28px",
                              padding: "0 10px",
                              background: "#6D28D9",
                              flexShrink: 0,
                            }}
                            onClick={() => handleApproveAccessId(item.id)}
                          >
                            Approve & Issue ID
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. 👥 USER & ROLE MANAGEMENT (Admin Only) */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="section-title">User & Role Management</div>
                    <div className="section-sub">
                      Control employee access tiers and assign Board Admin permissions ({allUsers.length} registered users)
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "10px 12px", fontWeight: 600 }}>User</th>
                      <th style={{ padding: "10px 12px", fontWeight: 600 }}>Email</th>
                      <th style={{ padding: "10px 12px", fontWeight: 600 }}>Department</th>
                      <th style={{ padding: "10px 12px", fontWeight: 600 }}>Role</th>
                      <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            className="avatar"
                            style={{
                              width: "28px",
                              height: "28px",
                              fontSize: "11px",
                              background: u.avatarTone || "#0F1B33",
                            }}
                          >
                            {u.initials || "U"}
                          </div>
                          <span style={{ fontWeight: 600, color: "#0F1B33" }}>{u.name}</span>
                        </td>
                        <td style={{ padding: "12px", color: "#64748B" }}>{u.email}</td>
                        <td style={{ padding: "12px" }}>
                          <select
                            value={u.department}
                            onChange={(e) => handleUserDeptChange(u.id, e.target.value, u.role)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid #CBD5E1",
                              fontSize: "12px",
                              background: "#fff",
                              color: "#0F1B33",
                              outline: "none",
                            }}
                          >
                            <option value="Product Team">Product Team</option>
                            <option value="Marketing Team">Marketing Team</option>
                            <option value="Sales Team">Sales Team</option>
                            <option value="Support Team">Support Team</option>
                            <option value="Finance Team">Finance Team</option>
                            <option value="IT Support">IT Support</option>
                          </select>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value as any)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid #CBD5E1",
                              fontSize: "12px",
                              fontWeight: 600,
                              background: u.role === "ADMIN" ? "#EFF6FF" : "#F8FAFC",
                              color: u.role === "ADMIN" ? "#1D4ED8" : "#334155",
                              outline: "none",
                            }}
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="ADMIN">Board Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => handleUserDelete(u.id)}
                              title="Delete user"
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#EF4444",
                                cursor: "pointer",
                                padding: "4px",
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* DRAWERS */}
      {accessDetailsItem && (
        <AccessDetailsDrawer
          isOpen={!!accessDetailsItem}
          accessItem={accessDetailsItem}
          currentUserName={currentUser.name}
          onClose={() => setAccessDetailsItem(null)}
          onRequestAccess={(item) => {
            setAccessDetailsItem(null);
            setRequestFormItem(item);
          }}
          onRequestException={(item) => {
            setAccessDetailsItem(null);
            setExceptionFormItem(item);
          }}
          onRequestAccessId={() => {
            setAccessDetailsItem(null);
            setAccessIdItem(accessDetailsItem);
          }}
          onViewAccessIdStatus={() => {
            setAccessDetailsItem(null);
            setAccessIdItem(accessDetailsItem);
          }}
        />
      )}

      {requestFormItem && (
        <RequestFormDrawer
          isOpen={!!requestFormItem}
          accessItem={requestFormItem}
          currentUserName={currentUser.name}
          onClose={() => setRequestFormItem(null)}
          onSubmit={async (data) => {
            const res = await submitRequest({
              accessItemId: data.accessItemId,
              beneficiary: data.beneficiary,
              onBehalf: data.onBehalf,
              justification: data.justification,
              requesterName: currentUser.name,
              requesterEmail: currentUser.email,
            });
            if (res.success) {
              pushToast("Access request submitted successfully!");
              setRequestFormItem(null);
              await loadData();
              return res.requestId || null;
            } else {
              pushToast(res.error || "Failed to submit request", "error");
              return null;
            }
          }}
        />
      )}

      {exceptionFormItem && (
        <ExceptionFormDrawer
          isOpen={!!exceptionFormItem}
          accessItem={exceptionFormItem}
          currentUserName={currentUser.name}
          onClose={() => setExceptionFormItem(null)}
          onSubmit={async (data) => {
            const res = await submitExceptionRequest({
              accessItemId: data.accessItemId,
              reason: data.reason,
              justification: data.justification,
              requiredUntil: data.requiredUntil,
              urgency: data.urgency,
              requesterName: currentUser.name,
              requesterEmail: currentUser.email,
            });
            if (res.success) {
              pushToast("Exception request submitted for review!");
              setExceptionFormItem(null);
              await loadData();
              return res.requestId || null;
            } else {
              pushToast(res.error || "Failed to submit exception request", "error");
              return null;
            }
          }}
        />
      )}

      {selectedRequest && (
        <RequestDetailDrawer
          isOpen={!!selectedRequest}
          request={selectedRequest}
          currentUserName={currentUser.name}
          onClose={() => setSelectedRequest(null)}
          onCloseRequest={async (id) => handleCloseRequest(id)}
          onRequestExtension={async (id) => handleExtension(id, 14, "Project extension requested")}
        />
      )}

      {approvalRequest && (
        <ApprovalDetailDrawer
          isOpen={!!approvalRequest}
          request={approvalRequest}
          actingUserName={currentUser.name}
          onClose={() => setApprovalRequest(null)}
          onApprove={async (id) => handleApprove(id)}
          onReject={async (id, reason) => handleReject(id, reason)}
        />
      )}

      {adminProvisionRequest && (
        <AdminRequestDetailDrawer
          isOpen={!!adminProvisionRequest}
          request={adminProvisionRequest}
          onClose={() => setAdminProvisionRequest(null)}
          onProvision={async (id) => handleProvision(id)}
        />
      )}

      {boardConfigItem && (
        <BoardConfigDrawer
          isOpen={!!boardConfigItem}
          accessItem={boardConfigItem}
          onClose={() => setBoardConfigItem(null)}
          onSaveConfig={async (id, changes) => handleSaveBoardConfig(id, changes)}
          onToggleAutomation={async (id) => handleToggleAuto(id)}
        />
      )}

      {accessIdItem && (
        <AccessIdStatusDrawer
          isOpen={!!accessIdItem}
          accessItem={accessIdItem}
          queueItem={accessIdQueue.find((q) => q.accessItemId === accessIdItem?.id)}
          currentUserName={currentUser.name}
          onClose={() => setAccessIdItem(null)}
          onApproveAccessId={async (queueId) => handleApproveAccessId(queueId)}
          isAdmin={isRoleAdmin}
        />
      )}

      {/* COMMAND PALETTE SPOTLIGHT MODAL (⌘K / Ctrl+K) */}
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        catalog={catalog}
        requests={requests}
        onSelectItem={(item) => setAccessDetailsItem(item)}
        onSelectRequest={(req) => setSelectedRequest(req)}
        isAdmin={isRoleAdmin}
      />

      {/* TOAST CONTAINER */}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === "error" ? "toast-error" : ""}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
