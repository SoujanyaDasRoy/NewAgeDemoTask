"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRequests(filters?: {
  requesterName?: string;
  approverName?: string;
  providerName?: string;
}) {
  try {
    const requests = await prisma.accessRequest.findMany({
      include: {
        timeline: {
          orderBy: { orderIndex: "asc" },
        },
        accessItem: true,
        requester: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    return [];
  }
}

export async function submitRequest(opts: {
  accessItemId: string;
  beneficiary: string;
  onBehalf: boolean;
  justification: string;
  requesterName: string;
  requesterEmail: string;
}) {
  try {
    const access = await prisma.accessItem.findUnique({
      where: { id: opts.accessItemId },
    });

    if (!access) throw new Error("Access item not found");

    let requester = await prisma.user.findUnique({
      where: { email: opts.requesterEmail },
    });

    if (!requester) {
      requester = await prisma.user.findFirst({
        where: { name: opts.requesterName },
      });
    }

    if (!requester) {
      requester = await prisma.user.create({
        data: {
          name: opts.requesterName,
          email: opts.requesterEmail || `user_${Date.now()}@newage.com`,
          department: "Product Team",
          initials: opts.requesterName.split(" ").map((n) => n[0]).join("").slice(0, 2),
        },
      });
    }

    // Generate NAR ID
    const count = await prisma.accessRequest.count();
    const requestId = `NAR-${10480 + count + 1}`;

    const nowFormatted = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const newReq = await prisma.accessRequest.create({
      data: {
        id: requestId,
        accessItemId: access.id,
        accessLabel: `${access.tool} – ${access.name}`,
        requesterId: requester.id,
        beneficiaryName: opts.beneficiary,
        onBehalf: opts.onBehalf,
        isException: false,
        justification: opts.justification,
        status: "PENDING_APPROVAL",
        approverName: access.approver,
        providerName: access.provider,
        automation: access.automation,
        timeline: {
          create: [
            {
              label: "Request Submitted",
              actor: opts.requesterName,
              timestamp: nowFormatted,
              state: "DONE",
              orderIndex: 0,
            },
            {
              label: "Pending Approval",
              actor: access.approver,
              timestamp: "—",
              state: "CURRENT",
              orderIndex: 1,
            },
            {
              label: access.automation ? "Provisioning" : "Pending Manual Provisioning",
              actor: "",
              timestamp: "",
              state: "PENDING",
              orderIndex: 2,
            },
            {
              label: opts.onBehalf ? "Access Provisioned" : "Completed",
              actor: "",
              timestamp: "",
              state: "PENDING",
              orderIndex: 3,
            },
          ],
        },
      },
    });

    // Record audit
    await prisma.auditLog.create({
      data: {
        action: "Request created",
        userName: opts.requesterName,
        detail: `${requestId} — ${access.tool} – ${access.name}`,
      },
    });

    // Push notification to approver
    if (access.approver !== opts.requesterName) {
      await prisma.notification.create({
        data: {
          role: access.approver === "Rahul Sharma" ? "admin" : "employee",
          text: `New access request ${requestId} from ${opts.requesterName} awaiting your approval.`,
          channel: "slack",
        },
      });
    }

    revalidatePath("/");
    return { success: true, requestId };
  } catch (error: any) {
    console.error("Failed to submit request:", error);
    return { success: false, error: error.message };
  }
}

export async function submitExceptionRequest(opts: {
  accessItemId: string;
  reason: string;
  justification: string;
  requiredUntil: string;
  urgency: "STANDARD" | "URGENT" | "CRITICAL";
  requesterName: string;
  requesterEmail: string;
}) {
  try {
    const access = await prisma.accessItem.findUnique({
      where: { id: opts.accessItemId },
    });

    if (!access) throw new Error("Access item not found");

    let requester = await prisma.user.findFirst({
      where: { name: opts.requesterName },
    });

    if (!requester) {
      requester = await prisma.user.create({
        data: {
          name: opts.requesterName,
          email: opts.requesterEmail || `user_${Date.now()}@newage.com`,
          department: "Product Team",
          initials: opts.requesterName.split(" ").map((n) => n[0]).join("").slice(0, 2),
        },
      });
    }

    const count = await prisma.accessRequest.count();
    const requestId = `NAR-${10480 + count + 1}`;

    const nowFormatted = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    await prisma.accessRequest.create({
      data: {
        id: requestId,
        accessItemId: access.id,
        accessLabel: `${access.tool} – ${access.name}`,
        requesterId: requester.id,
        beneficiaryName: opts.requesterName,
        onBehalf: false,
        isException: true,
        exceptionReason: opts.reason,
        requiredUntil: opts.requiredUntil,
        urgency: opts.urgency,
        justification: opts.justification,
        status: "PENDING_EXCEPTION_APPROVAL",
        approverName: access.approver,
        providerName: access.provider,
        automation: access.automation,
        timeline: {
          create: [
            {
              label: "Exception Request Submitted",
              actor: opts.requesterName,
              timestamp: nowFormatted,
              state: "DONE",
              orderIndex: 0,
            },
            {
              label: "Pending Exception Approval",
              actor: access.approver,
              timestamp: "—",
              state: "CURRENT",
              orderIndex: 1,
            },
            {
              label: access.automation ? "Provisioning" : "Pending Manual Provisioning",
              actor: "",
              timestamp: "",
              state: "PENDING",
              orderIndex: 2,
            },
            {
              label: "Completed",
              actor: "",
              timestamp: "",
              state: "PENDING",
              orderIndex: 3,
            },
          ],
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "Exception request created",
        userName: opts.requesterName,
        detail: `${requestId} — ${access.tool} – ${access.name} (outside ${access.group})`,
      },
    });

    // Notification
    await prisma.notification.create({
      data: {
        role: access.approver === "Rahul Sharma" ? "admin" : "employee",
        text: `Access exception request ${requestId} from ${opts.requesterName} awaiting your review.`,
        channel: "slack",
      },
    });

    revalidatePath("/");
    return { success: true, requestId };
  } catch (error: any) {
    console.error("Failed to submit exception request:", error);
    return { success: false, error: error.message };
  }
}

export async function approveRequest(requestId: string, actingUserName: string) {
  try {
    const r = await prisma.accessRequest.findUnique({
      where: { id: requestId },
      include: { timeline: { orderBy: { orderIndex: "asc" } }, accessItem: true },
    });

    if (!r) throw new Error("Request not found");

    const nowFormatted = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    if (r.automation) {
      const finalStatus = r.onBehalf ? "ACCESS_PROVISIONED" : "COMPLETED";

      await prisma.accessRequest.update({
        where: { id: requestId },
        data: { status: finalStatus },
      });

      // Update timeline
      await prisma.timelineStep.deleteMany({ where: { requestId } });
      await prisma.timelineStep.createMany({
        data: [
          {
            requestId,
            label: r.timeline[0]?.label || "Request Submitted",
            actor: r.timeline[0]?.actor || "Requester",
            timestamp: r.timeline[0]?.timestamp || nowFormatted,
            state: "DONE",
            orderIndex: 0,
          },
          {
            requestId,
            label: "Approved",
            actor: r.approverName,
            timestamp: nowFormatted,
            state: "DONE",
            orderIndex: 1,
          },
          {
            requestId,
            label: "Access Automatically Provisioned",
            actor: "Automated Provisioning",
            timestamp: nowFormatted,
            state: "DONE",
            orderIndex: 2,
          },
          {
            requestId,
            label: r.onBehalf ? "Access Provisioned — awaiting closure" : "Completed",
            actor: r.onBehalf ? "" : "System",
            timestamp: r.onBehalf ? "" : nowFormatted,
            state: r.onBehalf ? "CURRENT" : "DONE",
            orderIndex: 3,
          },
        ],
      });

      // Notification
      await prisma.notification.create({
        data: {
          role: "employee",
          text: `Access automatically provisioned for ${requestId} — ${r.accessLabel}.`,
          channel: "portal",
        },
      });
    } else {
      // Manual flow
      await prisma.accessRequest.update({
        where: { id: requestId },
        data: { status: "PENDING_MANUAL_PROVISIONING" },
      });

      await prisma.timelineStep.deleteMany({ where: { requestId } });
      await prisma.timelineStep.createMany({
        data: [
          {
            requestId,
            label: r.timeline[0]?.label || "Request Submitted",
            actor: r.timeline[0]?.actor || "Requester",
            timestamp: r.timeline[0]?.timestamp || nowFormatted,
            state: "DONE",
            orderIndex: 0,
          },
          {
            requestId,
            label: "Approved",
            actor: r.approverName,
            timestamp: nowFormatted,
            state: "DONE",
            orderIndex: 1,
          },
          {
            requestId,
            label: "Pending Manual Provisioning",
            actor: r.providerName,
            timestamp: "—",
            state: "CURRENT",
            orderIndex: 2,
          },
          {
            requestId,
            label: r.onBehalf ? "Access Provisioned" : "Completed",
            actor: "",
            timestamp: "",
            state: "PENDING",
            orderIndex: 3,
          },
        ],
      });

      // Notification to Admin
      await prisma.notification.create({
        data: {
          role: "admin",
          text: `${requestId} (${r.accessLabel}) is ready for manual provisioning.`,
          channel: "portal",
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "Request approved",
        userName: actingUserName || r.approverName,
        detail: `${requestId} — ${r.accessLabel}`,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve request:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectRequest(
  requestId: string,
  reason: string,
  actingUserName: string
) {
  try {
    const r = await prisma.accessRequest.findUnique({
      where: { id: requestId },
      include: { timeline: { orderBy: { orderIndex: "asc" } } },
    });

    if (!r) throw new Error("Request not found");

    const nowFormatted = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    await prisma.accessRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        rejectionReason: reason || "Not specified",
      },
    });

    // Update timeline
    await prisma.timelineStep.deleteMany({ where: { requestId } });
    await prisma.timelineStep.createMany({
      data: [
        {
          requestId,
          label: r.timeline[0]?.label || "Request Submitted",
          actor: r.timeline[0]?.actor || "Requester",
          timestamp: r.timeline[0]?.timestamp || nowFormatted,
          state: "DONE",
          orderIndex: 0,
        },
        {
          requestId,
          label: `Rejected: ${reason || "Not specified"}`,
          actor: actingUserName || r.approverName,
          timestamp: nowFormatted,
          state: "DONE",
          orderIndex: 1,
        },
      ],
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "Request rejected",
        userName: actingUserName || r.approverName,
        detail: `${requestId} — Reason: ${reason || "Not specified"}`,
      },
    });

    // Notification
    await prisma.notification.create({
      data: {
        role: "employee",
        text: `Your request ${requestId} was rejected by ${actingUserName || r.approverName}.`,
        channel: "portal",
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reject request:", error);
    return { success: false, error: error.message };
  }
}

export async function provisionManually(requestId: string, actingUserName: string) {
  try {
    const r = await prisma.accessRequest.findUnique({
      where: { id: requestId },
      include: { timeline: { orderBy: { orderIndex: "asc" } } },
    });

    if (!r) throw new Error("Request not found");

    const nowFormatted = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const finalStatus = r.onBehalf ? "ACCESS_PROVISIONED" : "COMPLETED";

    await prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: finalStatus },
    });

    await prisma.timelineStep.deleteMany({ where: { requestId } });
    await prisma.timelineStep.createMany({
      data: [
        {
          requestId,
          label: r.timeline[0]?.label || "Request Submitted",
          actor: r.timeline[0]?.actor || "Requester",
          timestamp: r.timeline[0]?.timestamp || nowFormatted,
          state: "DONE",
          orderIndex: 0,
        },
        {
          requestId,
          label: "Approved",
          actor: r.approverName,
          timestamp: r.timeline[1]?.timestamp || nowFormatted,
          state: "DONE",
          orderIndex: 1,
        },
        {
          requestId,
          label: "Access Provisioned",
          actor: actingUserName || r.providerName,
          timestamp: nowFormatted,
          state: "DONE",
          orderIndex: 2,
        },
        {
          requestId,
          label: r.onBehalf ? "Access Provisioned — awaiting closure" : "Completed",
          actor: r.onBehalf ? "" : "System",
          timestamp: r.onBehalf ? "" : nowFormatted,
          state: r.onBehalf ? "CURRENT" : "DONE",
          orderIndex: 3,
        },
      ],
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "Access provisioned (manual)",
        userName: actingUserName,
        detail: `${requestId} — ${r.accessLabel}`,
      },
    });

    // Notification
    await prisma.notification.create({
      data: {
        role: "employee",
        text: `Access has been manually provisioned for ${requestId} (${r.accessLabel}).`,
        channel: "portal",
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to provision manually:", error);
    return { success: false, error: error.message };
  }
}

export async function closeRequestAction(requestId: string, actingUserName: string) {
  try {
    const r = await prisma.accessRequest.findUnique({
      where: { id: requestId },
      include: { timeline: { orderBy: { orderIndex: "asc" } } },
    });

    if (!r) throw new Error("Request not found");

    const nowFormatted = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    await prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: "COMPLETED" },
    });

    // Replace awaiting closure step with Request Closed
    const steps = r.timeline.map((s) => ({
      requestId,
      label: s.state === "CURRENT" ? "Access Provisioned" : s.label,
      actor: s.actor,
      timestamp: s.timestamp,
      state: "DONE" as const,
      orderIndex: s.orderIndex,
    }));

    steps.push({
      requestId,
      label: "Request Closed",
      actor: actingUserName,
      timestamp: nowFormatted,
      state: "DONE" as const,
      orderIndex: steps.length,
    });

    await prisma.timelineStep.deleteMany({ where: { requestId } });
    await prisma.timelineStep.createMany({ data: steps });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "Request closed",
        userName: actingUserName,
        detail: `${requestId} — closed on behalf of ${r.beneficiaryName}`,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to close request:", error);
    return { success: false, error: error.message };
  }
}

// PART 4 IMPROVEMENT: Auto-expire requests past their requiredUntil date
export async function autoExpireRequests() {
  try {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const toExpire = await prisma.accessRequest.findMany({
      where: {
        requiredUntil: { not: null },
        status: { notIn: ["COMPLETED", "REJECTED", "EXPIRED"] },
      },
    });

    // Filter in JS since SQLite string comparison works for ISO dates
    const expired = toExpire.filter(
      (r) => r.requiredUntil !== null && r.requiredUntil < today
    );

    for (const r of expired) {
      await prisma.accessRequest.update({
        where: { id: r.id },
        data: { status: "EXPIRED" },
      });
      await prisma.auditLog.create({
        data: {
          action: "Access auto-expired",
          userName: "System",
          detail: `${r.id} — ${r.accessLabel}`,
        },
      });
    }

    if (expired.length > 0) revalidatePath("/");
    return { expiredCount: expired.length };
  } catch (error: any) {
    console.error("Failed to auto-expire requests:", error);
    return { expiredCount: 0 };
  }
}

// PART 4 IMPROVEMENT: Request 14-Day Extension
export async function requestExtension(
  requestId: string,
  days: number = 14,
  actingUserName: string
) {
  try {
    const r = await prisma.accessRequest.findUnique({
      where: { id: requestId },
    });

    if (!r) throw new Error("Request not found");

    // Calculate new requiredUntil date
    const baseDate = r.requiredUntil ? new Date(r.requiredUntil) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    const newDateStr = baseDate.toISOString().split("T")[0];

    const nowFormatted = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    await prisma.accessRequest.update({
      where: { id: requestId },
      data: {
        requiredUntil: newDateStr,
        status: "PENDING_EXCEPTION_APPROVAL",
      },
    });

    await prisma.timelineStep.create({
      data: {
        requestId,
        label: `Extension Requested (+${days} days until ${newDateStr})`,
        actor: actingUserName,
        timestamp: nowFormatted,
        state: "DONE",
        orderIndex: 99,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: `Access extension requested (+${days} days)`,
        userName: actingUserName,
        detail: `${requestId} — Extended to ${newDateStr}`,
      },
    });

    await prisma.notification.create({
      data: {
        role: "admin",
        text: `Extension request for ${requestId} (${r.accessLabel}) awaiting review.`,
        channel: "portal",
      },
    });

    revalidatePath("/");
    return { success: true, newDate: newDateStr };
  } catch (error: any) {
    console.error("Failed to request extension:", error);
    return { success: false, error: error.message };
  }
}
