"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  LogOut,
  Users,
  Shield,
  Trash2,
  User,
  ChevronDown,
  FileSpreadsheet,
  Check,
  X,
  Layers,
  AlertTriangle,
  Sun,
  Moon,
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
import AuditLogDrawer from "@/components/drawers/AuditLogDrawer";
import SlackNotifCard from "@/components/SlackNotifCard";
import SlackPreviewModal from "@/components/SlackPreviewModal";

import {
  getCurrentUser,
  logout,
  getAllUsers,
  updateUserRole,
  deleteUser,
  SessionUser,
} from "@/lib/actions/auth";
import { getDashboardData } from "@/lib/actions/dashboard";
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
  batchApproveRequests,
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

function PortalDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [directoryFilter, setDirectoryFilter] = useState<"ALL" | "AUTOMATED" | "BOARDS" | "APPLICATIONS">("ALL");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userDeptFilter, setUserDeptFilter] = useState("ALL");

  // DOM Refs for Popovers & Dropdowns
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Multi-Select Batch Approvals State
  const [selectedApprovalIds, setSelectedApprovalIds] = useState<string[]>([]);
  const [batchApproving, setBatchApproving] = useState(false);

  // Modals & Drawers State
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [slackModalOpen, setSlackModalOpen] = useState(false);

  // Active drawers
  const [accessDetailsItem, setAccessDetailsItem] = useState<any>(null);
  const [requestFormItem, setRequestFormItem] = useState<any>(null);
  const [exceptionFormItem, setExceptionFormItem] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalRequest, setApprovalRequest] = useState<any>(null);
  const [adminProvisionRequest, setAdminProvisionRequest] = useState<any>(null);
  const [boardConfigItem, setBoardConfigItem] = useState<any>(null);
  const [accessIdItem, setAccessIdItem] = useState<any>(null);

  // ── THEME MANAGEMENT ─────────────────────────────────────────────────────
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as "light" | "dark";
    if (current) {
      setTheme(current);
    } else {
      const saved = localStorage.getItem("newage_theme") as "light" | "dark" | null;
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = saved || (prefersDark ? "dark" : "light");
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("newage_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // ── URL DEEP LINK SYNC ───────────────────────────────────────────────────
  const syncUrlParam = useCallback((key: string | null, value: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!key || !value) {
      url.search = "";
    } else {
      url.search = `?${key}=${encodeURIComponent(value)}`;
    }
    window.history.pushState({}, "", url.toString());
  }, []);

  // ── HIGH-SPEED CONSOLIDATED DATA LOADING ─────────────────────────────────
  const loadData = useCallback(async () => {
    const data = await getDashboardData();
    if (!data.authenticated || !data.currentUser) {
      router.push("/login");
      return;
    }
    setCurrentUser(data.currentUser);
    setCatalog(data.catalog);
    setRequests(data.requests);
    setAccessIdQueue(data.accessIdQueue);
    setNotifications(data.notifications);
    setAuditLogs(data.auditLogs);
    setAllUsers(data.allUsers);
    setLoadingUser(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── INITIAL DEEP LINK ROUTING ───────────────────────────────────────────
  useEffect(() => {
    if (!catalog.length && !requests.length) return;

    const reqId = searchParams.get("request");
    const apprvId = searchParams.get("approval");
    const boardId = searchParams.get("board");
    const tab = searchParams.get("tab");

    if (reqId) {
      const match = requests.find((r) => r.id.toLowerCase() === reqId.toLowerCase());
      if (match) setSelectedRequest(match);
    } else if (apprvId) {
      const match = requests.find((r) => r.id.toLowerCase() === apprvId.toLowerCase());
      if (match) setApprovalRequest(match);
    } else if (boardId) {
      const match = catalog.find(
        (c) => c.id.toLowerCase() === boardId.toLowerCase() || (c.accessId && c.accessId.toLowerCase() === boardId.toLowerCase())
      );
      if (match) setAccessDetailsItem(match);
    }

    if (tab) {
      const el = document.getElementById(tab);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams, catalog, requests]);

  // ── BROWSER HISTORY POPSTATE HANDLER ────────────────────────────────────
  useEffect(() => {
    const handlePopState = () => {
      setSelectedRequest(null);
      setApprovalRequest(null);
      setAccessDetailsItem(null);
      setRequestFormItem(null);
      setExceptionFormItem(null);
      setAdminProvisionRequest(null);
      setBoardConfigItem(null);
      setAccessIdItem(null);
      setNotifOpen(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
        syncUrlParam(null, null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [syncUrlParam]);

  // ── CLICK OUTSIDE LISTENER FOR DROPDOWNS ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── SEARCH & DIRECTORY HANDLER ───────────────────────────────────────────
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    const results = catalog.filter((item) => {
      const matchesText =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.tool.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        (item.accessId && item.accessId.toLowerCase().includes(q));

      if (!matchesText) return false;
      if (directoryFilter === "AUTOMATED") return item.automation;
      if (directoryFilter === "BOARDS") return item.category === "BOARD";
      if (directoryFilter === "APPLICATIONS") return item.category === "APPLICATION";
      return true;
    });
    setSearchResults(results);
  }, [searchQuery, catalog, directoryFilter]);

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

  // ── BATCH ACTIONS & SELECTION ─────────────────────────────────────────────
  const toggleSelectApproval = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedApprovalIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllApprovals = () => {
    if (selectedApprovalIds.length === pendingApprovals.length) {
      setSelectedApprovalIds([]);
    } else {
      setSelectedApprovalIds(pendingApprovals.map((r) => r.id));
    }
  };

  const handleBatchApprove = async () => {
    if (!currentUser || selectedApprovalIds.length === 0) return;
    setBatchApproving(true);
    try {
      const res = await batchApproveRequests(selectedApprovalIds, currentUser.name);
      if (res.success) {
        pushToast(`⚡ Successfully approved ${res.count} requests in atomic batch!`);
        setSelectedApprovalIds([]);
        await loadData();
      } else {
        pushToast(res.error || "Failed to batch approve requests", "error");
      }
    } catch (err: any) {
      pushToast(err.message || "Batch approval error", "error");
    } finally {
      setBatchApproving(false);
    }
  };

  // ── 1-CLICK SOC2/ISO-27001 COMPLIANCE CSV EXPORT ──────────────────────────
  const handleExportComplianceCSV = () => {
    const headers = [
      "Request ID",
      "Access Item",
      "Tool",
      "Category",
      "Access ID",
      "Requester Name",
      "Requester Email",
      "Beneficiary Name",
      "Department",
      "Status",
      "Approver Name",
      "Provider Name",
      "Provisioning Method",
      "Is Exception",
      "Exception Reason",
      "Urgency",
      "Required Until",
      "Business Justification",
      "Created Date",
      "Updated Date",
      "SOC2 / ISO-27001 Compliance Status",
    ];

    const rows = requests.map((r) => [
      r.id,
      r.accessItem?.name || r.accessLabel,
      r.accessItem?.tool || "Tool",
      r.accessItem?.category || "BOARD",
      r.accessItem?.accessId || "N/A",
      r.requester?.name || "Unknown",
      r.requester?.email || "Unknown",
      r.beneficiaryName,
      r.requester?.department || "General",
      r.status,
      r.approverName,
      r.providerName,
      r.automation ? "Automated SCIM" : "Manual Provisioning",
      r.isException ? "YES" : "NO",
      r.exceptionReason || "N/A",
      r.urgency || "STANDARD",
      r.requiredUntil || "Indefinite",
      (r.justification || "").replace(/"/g, '""').replace(/\n/g, " "),
      new Date(r.createdAt).toISOString(),
      new Date(r.updatedAt || r.createdAt).toISOString(),
      "COMPLIANT & LOGGED",
    ]);

    const csvString =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\r\n");

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newage-soc2-iso27001-compliance-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    pushToast("📥 SOC2 / ISO-27001 Compliance CSV exported successfully!");
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
          {/* Brand */}
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="brand-badge">NA</div>
            <div className="brand-title-wrap">
              <span className="brand-main-text">New Age</span>
              <span className="brand-divider">/</span>
              <span className="brand-sub-text">Access Portal</span>
            </div>
          </div>

          {/* Right side - Decluttered Precision Minimalist Header */}
          <div className="header-right">
            {/* Item 1: Pending Actions Quick Pill (if any pending approvals exist) */}
            {pendingApprovals.length > 0 && (
              <button
                type="button"
                className="header-review-badge"
                onClick={() => {
                  const el = document.getElementById("approvals-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                title="Pending approvals requiring your review"
              >
                <span className="header-review-dot" />
                <span>{pendingApprovals.length} to review</span>
              </button>
            )}

            {/* Item 2: Single Primary CTA Button */}
            <button
              type="button"
              className="header-primary-btn"
              onClick={() => {
                if (catalog.length > 0) {
                  setRequestFormItem(catalog[0]);
                }
              }}
              title="Submit a new access request"
            >
              <Plus size={14} strokeWidth={2.4} />
              <span>Request Access</span>
            </button>

            {/* Item 3: Theme Toggle Switch */}
            <button
              type="button"
              className="header-icon-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle Theme"
            >
              <div className="theme-toggle-icon-wrap">
                {theme === "dark" ? (
                  <Sun size={15} strokeWidth={2} style={{ color: "#FBBF24" }} />
                ) : (
                  <Moon size={15} strokeWidth={1.8} style={{ color: "#475569" }} />
                )}
              </div>
            </button>

            {/* Item 4: Notification Bell with Subtle Unread Dot */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                type="button"
                className={`header-icon-btn ${notifOpen ? "active" : ""}`}
                onClick={handleNotifClick}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={15} strokeWidth={1.8} />
                {unreadCount > 0 && <span className="header-notif-dot" />}
              </button>

              {/* Notification Panel */}
              <div className={`notif-panel ${notifOpen ? "show" : ""}`}>
                <div className="notif-panel-head">
                  <span>Notifications</span>
                  <span
                    style={{ fontSize: "11px", color: "var(--muted)", cursor: "pointer", fontWeight: 500 }}
                    onClick={async () => {
                      await markNotificationsRead();
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
                        color: "var(--muted)",
                        fontSize: "12.5px",
                      }}
                    >
                      No unread notifications
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

            {/* Item 5: Refined User Profile Pill & Rich Tools Dropdown */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                type="button"
                className={`user-profile-pill ${userMenuOpen ? "active" : ""}`}
                onClick={() => setUserMenuOpen((prev) => !prev)}
                title="Account Settings & Quick Tools"
                aria-expanded={userMenuOpen}
              >
                <div
                  className="avatar-sm"
                  style={{
                    background: currentUser.avatarTone || "#0F172A",
                  }}
                >
                  {currentUser.initials}
                </div>
                <div className="user-pill-meta">
                  <span className="user-pill-name">{currentUser.name}</span>
                  <span className="user-pill-dept">{currentUser.department}</span>
                </div>
                <ChevronDown
                  size={12}
                  className={`user-pill-chevron ${userMenuOpen ? "open" : ""}`}
                />
              </button>

              {/* User Menu Popover */}
              {userMenuOpen && (
                <div className="user-dropdown-popover">
                  {/* User Profile Summary */}
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{currentUser.name}</div>
                    <div className="user-dropdown-email">{currentUser.email}</div>
                    <div
                      className="user-dropdown-badge"
                      style={{
                        background: isRoleAdmin ? "var(--accent-light)" : "var(--surface-subtle)",
                        color: isRoleAdmin ? "var(--accent)" : "var(--text-secondary)",
                      }}
                    >
                      <Shield size={10} /> {isRoleAdmin ? "Board Admin" : "Employee"} · {currentUser.department}
                    </div>
                  </div>

                  <div className="user-dropdown-divider" />

                  {/* Appearance Switch */}
                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                  >
                    <span className="user-dropdown-item-left">
                      {theme === "dark" ? (
                        <Sun size={13} className="user-dropdown-icon" style={{ color: "#FBBF24" }} />
                      ) : (
                        <Moon size={13} className="user-dropdown-icon" />
                      )}
                      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </span>
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontFamily: "inherit",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: "var(--surface-subtle)",
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
                        fontWeight: 600,
                      }}
                    >
                      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                    </span>
                  </button>

                  <div className="user-dropdown-divider" />

                  {/* Quick Tools */}
                  <div className="user-dropdown-section-title">Quick Tools</div>

                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setCmdPaletteOpen(true);
                    }}
                  >
                    <span className="user-dropdown-item-left">
                      <Search size={13} className="user-dropdown-icon" />
                      <span>Spotlight Search</span>
                    </span>
                    <kbd className="user-dropdown-shortcut">⌘K</kbd>
                  </button>

                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setAuditDrawerOpen(true);
                    }}
                  >
                    <span className="user-dropdown-item-left">
                      <Shield size={13} className="user-dropdown-icon" />
                      <span>Live Audit Trail Stream</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setSlackModalOpen(true);
                    }}
                  >
                    <span className="user-dropdown-item-left">
                      <MessageSquare size={13} className="user-dropdown-icon text-slack" />
                      <span>Slack Integration Preview</span>
                    </span>
                  </button>

                  {isRoleAdmin && (
                    <button
                      type="button"
                      className="user-dropdown-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleExportComplianceCSV();
                      }}
                    >
                      <span className="user-dropdown-item-left">
                        <FileSpreadsheet size={13} className="user-dropdown-icon text-csv" />
                        <span>Export Compliance CSV</span>
                      </span>
                    </button>
                  )}

                  <div className="user-dropdown-divider" />

                  {/* Sign Out */}
                  <button
                    type="button"
                    className="user-dropdown-item danger"
                    onClick={() => logout()}
                  >
                    <span className="user-dropdown-item-left">
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-container">
        {/* ── 🌟 DYNAMIC CONTEXTUAL COMMAND HUB HERO ─────────────────── */}
        <div className="command-hero">
          {/* Left: Dynamic Title & Contextual Status */}
          <div className="command-hero-left">
            <div className="command-hero-title-row">
              <h1 className="command-hero-title">
                Welcome, {currentUser.name.split(" ")[0]}
              </h1>
              {pendingApprovals.length > 0 ? (
                <div
                  className="command-status-pill pending"
                  title={`${pendingApprovals.length} access request(s) awaiting your action`}
                >
                  <span className="command-status-dot amber pulse" />
                  <span>
                    {pendingApprovals.length} Approval
                    {pendingApprovals.length > 1 ? "s" : ""} Pending
                  </span>
                </div>
              ) : (
                <div
                  className="command-status-pill compliant"
                  title="All policy controls and access authorizations are fully verified"
                >
                  <span className="command-status-dot green" />
                  <span>100% Policy Compliant</span>
                </div>
              )}
            </div>

            <p className="command-hero-subtitle">
              {pendingApprovals.length > 0 ? (
                <>
                  ⚡ {pendingApprovals.length} access request
                  {pendingApprovals.length > 1 ? "s" : ""} require your review before sign-off.
                </>
              ) : (
                <>
                  All access permissions are up to date across {currentUser.department} tools.
                </>
              )}
            </p>
          </div>

          {/* Right: Sleek Quick Action Bar */}
          <div className="command-hero-actions">
            {/* ⌘K Search quick trigger button */}
            <button
              type="button"
              className="command-hero-btn secondary"
              onClick={() => setCmdPaletteOpen(true)}
              title="Quick Search & Command Palette (⌘K)"
            >
              <Search size={13} strokeWidth={2.2} />
              <span>Search</span>
              <kbd className="command-hero-kbd">⌘K</kbd>
            </button>

            {/* [+ Request Access] primary CTA */}
            <button
              type="button"
              className="command-hero-btn primary"
              onClick={() => {
                if (catalog.length > 0) setRequestFormItem(catalog[0]);
              }}
              title="Submit a new access request"
            >
              <Plus size={14} strokeWidth={2.4} />
              <span>Request Access</span>
            </button>

            {/* Department / Role Badge */}
            <div className="command-hero-role-badge">
              <Shield
                size={12}
                strokeWidth={2.2}
                style={{ color: isRoleAdmin ? "var(--accent)" : "#16A34A" }}
              />
              <span>
                {currentUser.department} · {isRoleAdmin ? "Board Admin" : "Employee"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 🌟 UNIFIED INTERACTIVE COMMAND STRIP ─────────────────── */}
        <div className="command-metrics-strip">
          {/* Segment 1: Enterprise Directory */}
          <div
            className="command-strip-segment"
            onClick={() => {
              const el = document.getElementById("search-directory-card");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            title="Browse enterprise catalog and boards"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                document.getElementById("search-directory-card")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <div className="command-strip-top">
              <div className="command-strip-title-wrap">
                <div className="command-strip-icon-box">
                  <Package size={14} strokeWidth={2} />
                </div>
                <span className="command-strip-label">Enterprise Directory</span>
              </div>
              <ChevronRight size={14} className="command-strip-arrow" />
            </div>
            <div className="command-strip-bottom">
              <div className="command-strip-val-wrap">
                <span className="command-strip-number">{catalog.length}</span>
                <span className="command-strip-unit">Tools</span>
              </div>
              <div className="command-strip-subtext">
                <span className="scim-count-pill">
                  <Zap size={10} strokeWidth={2.5} style={{ color: "var(--accent)" }} />
                  <span>{catalog.filter((c) => c.automation).length} Automated SCIM</span>
                </span>
                <span className="subtext-divider">·</span>
                <span>{catalog.filter((c) => !c.automation).length} Manual</span>
              </div>
            </div>
          </div>

          {/* Segment 2: My Requests */}
          <div
            className="command-strip-segment"
            onClick={() => {
              setRequestFilter("ALL");
              const el = document.getElementById("my-requests-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            title="View and filter your access requests"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setRequestFilter("ALL");
                document.getElementById("my-requests-section")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <div className="command-strip-top">
              <div className="command-strip-title-wrap">
                <div className="command-strip-icon-box">
                  <Activity size={14} strokeWidth={2} />
                </div>
                <span className="command-strip-label">My Requests</span>
              </div>
              <ChevronRight size={14} className="command-strip-arrow" />
            </div>
            <div className="command-strip-bottom">
              <div className="command-strip-val-wrap">
                <span className="command-strip-number">
                  {requests.filter((r) => !["COMPLETED", "REJECTED", "EXPIRED"].includes(r.status)).length}
                </span>
                <span className="command-strip-unit">Active</span>
              </div>
              <div className="command-strip-subtext">
                <span className="provisioned-count-pill">
                  <Check size={10} strokeWidth={2.5} style={{ color: "#16A34A" }} />
                  <span>{requests.filter((r) => r.status === "COMPLETED").length} Provisioned</span>
                </span>
              </div>
            </div>
          </div>

          {/* Segment 3: Approvals Queue */}
          <div
            className="command-strip-segment"
            onClick={() => {
              const el = document.getElementById("approvals-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            title="Review pending authorization approvals"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                document.getElementById("approvals-section")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <div className="command-strip-top">
              <div className="command-strip-title-wrap">
                <div className="command-strip-icon-box">
                  <CheckSquare size={14} strokeWidth={2} />
                </div>
                <span className="command-strip-label">Approvals Queue</span>
              </div>
              <ChevronRight size={14} className="command-strip-arrow" />
            </div>
            <div className="command-strip-bottom">
              <div className="command-strip-val-wrap">
                {pendingApprovals.length > 0 ? (
                  <span className="command-strip-badge-val amber">
                    <span className="command-strip-number">{pendingApprovals.length}</span>
                    <span className="command-strip-unit">Need Review</span>
                  </span>
                ) : (
                  <span className="command-strip-badge-val clear">
                    <span className="command-strip-number">0</span>
                    <span className="command-strip-unit">Pending</span>
                  </span>
                )}
              </div>
              <div className="command-strip-subtext">
                {pendingApprovals.length > 0 ? (
                  <span className="strip-status-pill amber">
                    <Zap size={10} strokeWidth={2.4} />
                    <span>⚡ Action Required</span>
                  </span>
                ) : (
                  <span className="strip-status-pill green">
                    <Check size={10} strokeWidth={2.5} />
                    <span>✓ All Clear</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Segment 4: Access Governance */}
          <div
            className="command-strip-segment"
            onClick={() => {
              if (isRoleAdmin) {
                const el = document.getElementById("governance-section");
                el?.scrollIntoView({ behavior: "smooth" });
              } else if (catalog.length > 0) {
                setAccessDetailsItem(catalog[0]);
              }
            }}
            title="Inspect Access ID governance & policy registry"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (isRoleAdmin) {
                  document.getElementById("governance-section")?.scrollIntoView({ behavior: "smooth" });
                } else if (catalog.length > 0) {
                  setAccessDetailsItem(catalog[0]);
                }
              }
            }}
          >
            <div className="command-strip-top">
              <div className="command-strip-title-wrap">
                <div className="command-strip-icon-box">
                  <Key size={14} strokeWidth={2} />
                </div>
                <span className="command-strip-label">Access Governance</span>
              </div>
              <ChevronRight size={14} className="command-strip-arrow" />
            </div>
            <div className="command-strip-bottom">
              <div className="command-strip-val-wrap">
                <span className="command-strip-number">{catalog.filter((c) => c.accessId).length}</span>
                <span className="command-strip-unit">Governed IDs</span>
              </div>
              <div className="command-strip-subtext">
                <span className="strip-status-pill green">
                  <Check size={10} strokeWidth={2.5} />
                  <span>✓ 100% Policy Bound</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SEARCH & DIRECTORY CARD ─────────────────── */}
        <div className="card" id="search-directory-card">
          <div className="section-head" style={{ borderBottom: "none", marginBottom: "8px" }}>
            <div className="section-head-left">
              <div className="section-icon">
                <Search size={15} />
              </div>
              <div>
                <div className="section-title">Find Access</div>
                <div className="section-sub">
                  Search across applications, boards, and tools available in the enterprise catalog.
                </div>
              </div>
            </div>
          </div>

          <div className="search-row" style={{ marginTop: "10px" }}>
            <div className="search-input-wrap">
              <div className="search-ico">
                <Search size={15} />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search by tool, board, team, or Access ID..."
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
              className="btn btn-primary"
              style={{
                fontSize: "12.5px",
                height: "42px",
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
              onClick={() => {
                if (catalog.length > 0) setRequestFormItem(catalog[0]);
              }}
            >
              <Plus size={14} strokeWidth={2.4} />
              <span>Request Access</span>
            </button>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="filter-pills-row" style={{ marginTop: "12px", marginBottom: "4px" }}>
            <button
              className={`filter-pill ${directoryFilter === "ALL" ? "active" : ""}`}
              onClick={() => setDirectoryFilter("ALL")}
            >
              All ({catalog.length})
            </button>
            <button
              className={`filter-pill ${directoryFilter === "AUTOMATED" ? "active" : ""}`}
              onClick={() => setDirectoryFilter("AUTOMATED")}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <Zap size={11} strokeWidth={2.2} />
              <span>Automated ({catalog.filter((c) => c.automation).length})</span>
            </button>
            <button
              className={`filter-pill ${directoryFilter === "BOARDS" ? "active" : ""}`}
              onClick={() => setDirectoryFilter("BOARDS")}
            >
              Boards ({catalog.filter((c) => c.category === "BOARD").length})
            </button>
            <button
              className={`filter-pill ${directoryFilter === "APPLICATIONS" ? "active" : ""}`}
              onClick={() => setDirectoryFilter("APPLICATIONS")}
            >
              Applications ({catalog.filter((c) => c.category === "APPLICATION").length})
            </button>
          </div>

          {/* Search Results */}
          {(searchQuery.trim() || directoryFilter !== "ALL") && searchResults.length === 0 ? (
            <div className="empty-state" style={{ padding: "28px 16px" }}>
              <div className="circle">
                <Search size={18} />
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
                  marginTop: "14px",
                }}
              >
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="result-row catalog-row"
                    onClick={() => setAccessDetailsItem(item)}
                  >
                    {/* Left: 38px Rounded Service Logo Container */}
                    <div className="catalog-logo-container">
                      <ServiceLogo tool={item.tool} size={20} />
                    </div>

                    {/* Center: Title, Chips, Description & Structured Metadata */}
                    <div className="catalog-content">
                      {/* Header Line */}
                      <div className="catalog-header-line">
                        <span className="result-title">
                          {item.name}
                        </span>
                        <span className="catalog-tool-chip">
                          {item.tool}
                        </span>
                        <span className={`catalog-category-tag ${item.category === "APPLICATION" ? "application" : "board"}`}>
                          {item.category === "APPLICATION" ? "Application" : "Board"}
                        </span>
                        {item.automation ? (
                          <span className="catalog-scim-pill automated">
                            <Zap size={11} strokeWidth={2.5} />
                            <span>Automated SCIM</span>
                          </span>
                        ) : (
                          <span className="catalog-scim-pill manual">
                            Manual
                          </span>
                        )}
                      </div>

                      {/* Description with High-Legibility Contrast */}
                      <div className="result-desc">{item.description}</div>

                      {/* Distinct Clean Badge Pills for Metadata */}
                      <div className="catalog-meta-pills">
                        <div className="catalog-meta-pill">
                          <span className="meta-pill-label">Group:</span>
                          <span className="meta-pill-val">{item.group}</span>
                        </div>

                        <div className="catalog-meta-pill">
                          <span className="meta-pill-label">Approver:</span>
                          <span className="meta-pill-val">{item.approver}</span>
                        </div>

                        {item.accessId && (
                          <div className="catalog-meta-pill">
                            <span className="meta-pill-label">ID:</span>
                            <span className="meta-pill-val mono">{item.accessId}</span>
                          </div>
                        )}

                        {item.isEligible ? (
                          <div className="catalog-status-pill status-eligible">
                            <Check size={12} strokeWidth={2.5} />
                            <span>Pre-Approved</span>
                          </div>
                        ) : (
                          <div className="catalog-status-pill status-exception">
                            <AlertTriangle size={12} strokeWidth={2.2} />
                            <span>Exception Required</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="catalog-actions-wrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary catalog-btn-info"
                        aria-label={`View details for ${item.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccessDetailsItem(item);
                        }}
                      >
                        Info
                      </button>
                      {item.isEligible ? (
                        <button
                          className="btn btn-primary catalog-btn-request"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRequestFormItem(item);
                          }}
                        >
                          <Plus size={13} strokeWidth={2.4} />
                          <span>Request Access</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="catalog-btn-exception"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExceptionFormItem(item);
                          }}
                        >
                          <AlertTriangle size={13} strokeWidth={2.2} />
                          <span>Request Exception</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* ── EMPLOYEE & ADMIN WORKSPACE VIEWS ────────────────────────────────────────── */}
        <div className="grid-2">
          {/* My Requests */}
          <div className="card" id="my-requests-section">
            <div className="section-head">
              <div className="section-head-left">
                <div className="section-icon">
                  <Package size={15} />
                </div>
                <div>
                  <div className="section-title">My Requests</div>
                  <div className="section-sub">
                    Requests you have raised for yourself or on behalf of colleagues.
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
                  <Package size={18} />
                </div>
                <div className="title">No requests found</div>
                <div className="sub">
                  {requestFilter === "ALL"
                    ? "Search for a tool or board above to submit a request."
                    : `No requests currently in '${requestFilter.toLowerCase()}' status.`}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--text)",
                          }}
                        >
                          {req.accessLabel}
                        </span>
                        <StatusBadge status={req.status} />
                        {req.isException && (
                          <span className="badge badge-amber" style={{ fontSize: "10.5px" }}>Exception</span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px",
                          marginTop: "5px",
                        }}
                      >
                        <div style={{ fontSize: "11.5px", color: "#64748B" }}>
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
                          fontSize: "11px",
                          height: "28px",
                          padding: "0 10px",
                          marginLeft: "8px",
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
          <div className="card" id="approvals-section">
            <div className="section-head">
              <div className="section-head-left">
                <div className="section-icon">
                  <CheckSquare size={15} />
                </div>
                <div>
                  <div className="section-title">Approvals Requiring Action</div>
                  <div className="section-sub">
                    Requests waiting for your decision as designated approver.
                  </div>
                </div>
              </div>
              {pendingApprovals.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSelectAllApprovals}
                    style={{
                      height: "26px",
                      fontSize: "11px",
                      padding: "0 8px",
                      fontWeight: 600,
                    }}
                  >
                    {selectedApprovalIds.length === pendingApprovals.length
                      ? "Deselect All"
                      : `Select All (${pendingApprovals.length})`}
                  </button>
                  <span className="badge badge-amber">
                    {pendingApprovals.length} pending
                  </span>
                </div>
              )}
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="empty-state">
                <div className="circle">
                  <CheckSquare size={18} />
                </div>
                <div className="title">All clear</div>
                <div className="sub">No requests pending your approval right now.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {pendingApprovals.map((req) => {
                  const isSelected = selectedApprovalIds.includes(req.id);
                  return (
                    <div
                      key={req.id}
                      className="list-row"
                      style={{
                        background: isSelected ? "var(--accent-light)" : "var(--surface)",
                        borderColor: isSelected ? "var(--accent)" : "var(--border)",
                      }}
                      onClick={() => setApprovalRequest(req)}
                    >
                      {/* Multi-Select Checkbox */}
                      <div
                        onClick={(e) => toggleSelectApproval(req.id, e)}
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          border: isSelected ? "1.5px solid #16A34A" : "1.5px solid var(--border)",
                          background: isSelected ? "#16A34A" : "var(--surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                        title={isSelected ? "Deselect request" : "Select request for batch approval"}
                      >
                        {isSelected && <Check size={12} style={{ color: "#FFFFFF", strokeWidth: 3 }} />}
                      </div>

                      <div
                        className="avatar"
                        style={{
                          width: "28px",
                          height: "28px",
                          fontSize: "10.5px",
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
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "var(--text)",
                            }}
                          >
                            {req.accessLabel}
                          </span>
                          <StatusBadge status={req.status} />
                          {req.isException && (
                            <span className="badge badge-amber" style={{ fontSize: "10px" }}>
                              Exception
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "var(--muted)", marginTop: "3px" }}>
                          <span className="mono">{req.id}</span> ·{" "}
                          {req.requester?.name || req.beneficiaryName} ·{" "}
                          {new Date(req.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
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
                          <Check size={12} strokeWidth={2.5} /> Approve
                        </button>
                        <button
                          className="quick-action-btn quick-action-reject"
                          title="Reject"
                          onClick={() => setApprovalRequest(req)}
                        >
                          <X size={12} strokeWidth={2.5} /> Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── MY BOARDS / ACCESSIBLE SERVICES ─────────────────────────────────── */}
        <div className="card">
          <div className="section-head">
            <div className="section-head-left">
              <div className="section-icon">
                <LayoutDashboard size={15} />
              </div>
              <div>
                <div className="section-title">
                  {isRoleAdmin ? "Managed Boards & Accounts" : "My Boards & Access"}
                </div>
                <div className="section-sub">
                  {isRoleAdmin
                    ? "Boards and applications configured under your administration."
                    : "Boards and applications you have active permissions for."}
                </div>
              </div>
            </div>
          </div>
          <div className="grid-3">
            {catalog.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="board-card"
                onClick={() => {
                  if (isRoleAdmin) {
                    setBoardConfigItem(item);
                  } else {
                    setAccessDetailsItem(item);
                  }
                }}
              >
                <div className="board-card-body">
                  {/* Top Row: Service Logo + Tool Name + Automation Pill */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ServiceLogo tool={item.tool} size={16} />
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>
                        {item.tool}
                      </span>
                    </div>
                    {item.automation ? (
                      <span className="badge badge-blue" style={{ fontSize: "10.5px" }}>
                        <Zap size={10} /> Auto
                      </span>
                    ) : (
                      <span className="badge badge-gray" style={{ fontSize: "10.5px" }}>Manual</span>
                    )}
                  </div>

                  {/* Primary Board Title */}
                  <div className="board-title-primary">
                    {item.name}
                  </div>

                  {/* 2-Column Key Metadata Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "10px" }}>
                    <div style={{ background: "var(--surface-subtle)", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                        Eligibility
                      </div>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, marginTop: "2px" }}>
                        {item.isEligible ? (
                          <span style={{ color: "#1A7F37", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <Check size={11} strokeWidth={2.5} /> Eligible
                          </span>
                        ) : (
                          <span style={{ color: "#9A6700", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <AlertTriangle size={11} strokeWidth={2.2} /> Exception Req.
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ background: "var(--surface-subtle)", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "3px" }}>
                        <Key size={10} /> Access ID
                      </div>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text)", marginTop: "2px" }} className="mono">
                        {item.accessId || <span style={{ color: "var(--muted-2)" }}>—</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="manage-link">
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {isRoleAdmin ? <Settings size={12} /> : <ExternalLink size={12} />}
                    {isRoleAdmin ? "Manage Configuration" : "View Board Details"}
                  </span>
                  <ChevronRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ADMIN ONLY SECTIONS ──────────────────────────────────────────── */}
        {isRoleAdmin && (
          <>
            {/* Provisioning Queue & Access ID Governance */}
            <div className="grid-2" id="governance-section">
              {/* Requests Requiring Admin Provisioning */}
              <div className="card">
                <div className="section-head">
                  <div className="section-head-left">
                    <div className="section-icon">
                      <Package size={15} />
                    </div>
                    <div>
                      <div className="section-title">Manual Provisioning Queue</div>
                      <div className="section-sub">
                        Approved requests waiting for manual IT account creation.
                      </div>
                    </div>
                  </div>
                  {manualProvisionQueue.length > 0 && (
                    <span className="badge badge-amber">
                      {manualProvisionQueue.length} pending
                    </span>
                  )}
                </div>

                {manualProvisionQueue.length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <Package size={18} />
                    </div>
                    <div className="title">Queue is empty</div>
                    <div className="sub">
                      No approved requests are waiting for manual provisioning.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "var(--text)",
                              }}
                            >
                              {req.accessLabel}
                            </span>
                            <StatusBadge status={req.status} />
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "3px" }}>
                            <span className="mono">{req.id}</span> · For: {req.beneficiaryName}
                          </div>
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{
                            fontSize: "11px",
                            height: "28px",
                            padding: "0 10px",
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
              <div className="card">
                <div className="section-head">
                  <div className="section-head-left">
                    <div className="section-icon">
                      <Key size={15} />
                    </div>
                    <div>
                      <div className="section-title">Access ID Governance</div>
                      <div className="section-sub">
                        {accessIdQueue.filter((q) => q.status === "Pending Governance Review").length}{" "}
                        pending reviews
                      </div>
                    </div>
                  </div>
                </div>

                {accessIdQueue.filter((q) => q.status === "Pending Governance Review").length === 0 ? (
                  <div className="empty-state">
                    <div className="circle">
                      <Key size={18} />
                    </div>
                    <div className="title">All clear</div>
                    <div className="sub">No Access ID creations currently pending review.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {accessIdQueue
                      .filter((q) => q.status === "Pending Governance Review")
                      .map((item) => (
                        <div key={item.id} className="list-row">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "var(--text)",
                              }}
                            >
                              {item.accessItem?.name || item.accessItemId}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                              Requested by: {item.requestedBy}
                            </div>
                          </div>
                          <button
                            className="btn btn-primary"
                            style={{
                              fontSize: "11px",
                              height: "28px",
                              padding: "0 10px",
                              flexShrink: 0,
                            }}
                            onClick={() => handleApproveAccessId(item.id)}
                          >
                            Issue ID
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* User & Role Management */}
            <div className="card">
              <div className="section-head">
                <div className="section-head-left">
                  <div className="section-icon">
                    <Users size={15} />
                  </div>
                  <div>
                    <div className="section-title">User &amp; Role Management</div>
                    <div className="section-sub">
                      Manage team roles, departments, and administrative permissions ({allUsers.length} total users).
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleExportComplianceCSV}
                    style={{
                      fontSize: "11.5px",
                      height: "30px",
                      padding: "0 10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                    title="Export Compliance CSV"
                  >
                    <FileSpreadsheet size={13} style={{ color: "#16A34A" }} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ flex: 1, minWidth: "200px", position: "relative", display: "flex", alignItems: "center" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", color: "var(--muted)" }} />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
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
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {["ALL", "IT Support", "Engineering", "Product", "Marketing", "Sales", "Security & Compliance"].map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      className={`filter-pill ${userDeptFilter === dept ? "active" : ""}`}
                      style={{ fontSize: "11px", padding: "4px 9px" }}
                      onClick={() => setUserDeptFilter(dept)}
                    >
                      {dept === "ALL" ? "All Departments" : dept}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  background: "var(--surface)",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12.5px",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr style={{ background: "var(--surface-subtle)", borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                      <th style={{ padding: "10px 14px", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>User</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Email</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Department</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Role</th>
                      <th style={{ padding: "10px 14px", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      .filter((u) => {
                        const q = userSearchQuery.toLowerCase().trim();
                        const matchesQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                        const matchesDept = userDeptFilter === "ALL" || u.department.toLowerCase().includes(userDeptFilter.toLowerCase());
                        return matchesQ && matchesDept;
                      })
                      .map((u) => (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                        }}
                      >
                        <td style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            className="avatar"
                            style={{
                              width: "26px",
                              height: "26px",
                              fontSize: "10px",
                              background: u.avatarTone || "#0F172A",
                            }}
                          >
                            {u.initials || "U"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text)" }}>{u.name}</div>
                            {u.id === currentUser.id && (
                              <span className="badge badge-blue" style={{ fontSize: "9.5px", padding: "1px 5px", marginTop: "1px" }}>
                                Current User
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", color: "var(--muted)" }}>{u.email}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <select
                            value={u.department}
                            onChange={(e) => handleUserDeptChange(u.id, e.target.value, u.role)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "5px",
                              border: "1px solid var(--border)",
                              fontSize: "11.5px",
                              background: "var(--surface-input)",
                              color: "var(--text)",
                              outline: "none",
                              cursor: "pointer",
                            }}
                          >
                            <option value="Product Team">Product Team</option>
                            <option value="Marketing Team">Marketing Team</option>
                            <option value="Sales Team">Sales Team</option>
                            <option value="Support Team">Support Team</option>
                            <option value="Finance Team">Finance Team</option>
                            <option value="IT Support">IT Support</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Security & Compliance">Security &amp; Compliance</option>
                          </select>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleUserRoleChange(u.id, e.target.value as any)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "5px",
                              border: "1px solid var(--border)",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              background: u.role === "ADMIN" ? "var(--accent-light)" : "var(--surface-input)",
                              color: u.role === "ADMIN" ? "var(--accent)" : "var(--text)",
                              outline: "none",
                              cursor: "pointer",
                            }}
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="ADMIN">Board Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => handleUserDelete(u.id)}
                              title="Delete user account"
                              aria-label={`Delete user account ${u.name}`}
                              style={{
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "#EF4444",
                                cursor: "pointer",
                                padding: "4px 6px",
                                borderRadius: "5px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Trash2 size={12} />
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
          users={allUsers}
          onClose={() => setRequestFormItem(null)}
          onSubmit={async (data) => {
            let res;
            if (data.isException) {
              res = await submitExceptionRequest({
                accessItemId: data.accessItemId,
                reason: data.exceptionReason || "Cross-department exception",
                justification: data.justification,
                requiredUntil: data.requiredUntil || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
                urgency: data.urgency || "STANDARD",
                requesterName: currentUser.name,
                requesterEmail: currentUser.email,
              });
            } else {
              res = await submitRequest({
                accessItemId: data.accessItemId,
                beneficiary: data.beneficiary,
                onBehalf: data.onBehalf,
                justification: data.justification,
                requesterName: currentUser.name,
                requesterEmail: currentUser.email,
              });
            }

            if (res.success) {
              pushToast(data.isException ? "Exception request submitted for review!" : "Access request submitted successfully!");
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
          onClose={() => {
            setSelectedRequest(null);
            syncUrlParam(null, null);
          }}
          onCloseRequest={async (id) => handleCloseRequest(id)}
          onRequestExtension={async (id) => handleExtension(id, 14, "Project extension requested")}
        />
      )}

      {approvalRequest && (
        <ApprovalDetailDrawer
          isOpen={!!approvalRequest}
          request={approvalRequest}
          actingUserName={currentUser.name}
          onClose={() => {
            setApprovalRequest(null);
            syncUrlParam(null, null);
          }}
          onApprove={async (id) => handleApprove(id)}
          onReject={async (id, reason) => handleReject(id, reason)}
        />
      )}

      {adminProvisionRequest && (
        <AdminRequestDetailDrawer
          isOpen={!!adminProvisionRequest}
          request={adminProvisionRequest}
          onClose={() => {
            setAdminProvisionRequest(null);
            syncUrlParam(null, null);
          }}
          onProvision={async (id) => handleProvision(id)}
        />
      )}

      {boardConfigItem && (
        <BoardConfigDrawer
          isOpen={!!boardConfigItem}
          accessItem={boardConfigItem}
          users={allUsers}
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

      {/* ── ⚡ FLOATING BATCH APPROVAL BAR (Multi-Select) ─────────────────── */}
      {selectedApprovalIds.length > 0 && (
        <div
          className="floating-batch-bar"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            background: "#0F172A",
            color: "#FFFFFF",
            padding: "8px 14px",
            borderRadius: "10px",
            boxShadow: "0 16px 36px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                background: "#2563EB",
                borderRadius: "5px",
                width: "22px",
                height: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {selectedApprovalIds.length}
            </div>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#E2E8F0" }}>
              {selectedApprovalIds.length} selected
            </span>
          </div>

          <div style={{ width: "1px", height: "18px", background: "rgba(255, 255, 255, 0.2)" }} />

          <button
            type="button"
            onClick={handleSelectAllApprovals}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#CBD5E1",
              fontSize: "11.5px",
              fontWeight: 600,
              borderRadius: "5px",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            {selectedApprovalIds.length === pendingApprovals.length ? "Deselect All" : "Select All"}
          </button>

          <button
            type="button"
            disabled={batchApproving}
            onClick={handleBatchApprove}
            className="btn btn-primary"
            style={{
              background: "#16A34A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Zap size={13} className={batchApproving ? "animate-spin" : ""} />
            {batchApproving ? "Approving..." : `Approve Selected (${selectedApprovalIds.length})`}
          </button>

          <button
            type="button"
            onClick={() => setSelectedApprovalIds([])}
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              padding: "3px",
              display: "flex",
              alignItems: "center",
            }}
            title="Dismiss selection"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── LIVE AUDIT TRAIL STREAM DRAWER ─────────────────────── */}
      <AuditLogDrawer
        isOpen={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
        auditLogs={auditLogs}
        onRefresh={loadData}
      />

      {/* ── INTERACTIVE SLACK WEBHOOK SIMULATOR ─────────────────── */}
      <SlackPreviewModal
        isOpen={slackModalOpen}
        onClose={() => setSlackModalOpen(false)}
        requests={requests}
        onApprove={handleApprove}
        onReject={handleReject}
        onTriggerToast={pushToast}
      />

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

export default function PortalPage() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <PortalDashboard />
    </Suspense>
  );
}
