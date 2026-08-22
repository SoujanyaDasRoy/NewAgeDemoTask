"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendSlackNotification } from "@/lib/slack";
import { requireAdmin, getCurrentUser } from "./auth";
import { randomUUID } from "crypto";
import { notify } from "@/lib/notifications-engine";

/**
 * Generate a NAR-XXXXX request ID using a 4-byte random suffix. Avoids the
 * count+1 race that produced duplicate primary keys under concurrent submits.
 */
function newRequestId(): string {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `NAR-${suffix}`;
}

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

/**
 * 1. Submit Standard Access Request (Atomic Transaction)
 */
export async function submitRequest(opts: {
  accessItemId: string;
  beneficiary: string;
  onBehalf: boolean;
  justification: string;
  requesterName: string;
  requesterEmail: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const access = await tx.accessItem.findUnique({
        where: { id: opts.accessItemId },
      });

      if (!access) throw new Error("Access item not found");

      let requester = await tx.user.findUnique({
        where: { email: opts.requesterEmail },
      });

      if (!requester) {
        requester = await tx.user.findFirst({
          where: { name: opts.requesterName },
        });
      }

      if (!requester) {
        requester = await tx.user.create({
          data: {
            name: opts.requesterName,
            email: opts.requesterEmail || `user_${Date.now()}@newage.com`,
            department: "Product Team",
            initials: opts.requesterName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          },
        });
      }

      // Generate NAR ID atomically using a UUID-derived suffix to avoid the
      // count+1 race condition when two submits happen concurrently.
      const requestId = newRequestId();

      const nowFormatted = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const newReq = await tx.accessRequest.create({
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

      // Record audit log atomically
      await tx.auditLog.create({
        data: {
          action: "Request created",
          userId: requester.id,
          userName: opts.requesterName,
          detail: `${requestId} — ${access.tool} – ${access.name}`,
        },
      });

      // Push notification atomically
      if (access.approver !== opts.requesterName) {
        await notify({
          role: access.approver === "Rahul Sharma" ? "admin" : "employee",
          eventType: "REQUEST_SUBMITTED",
          text: `New access request ${requestId} from ${opts.requesterName} awaiting your approval.`,
          channel: "slack",
          tx,
        });
      }
      // Confirmation notification to requester (per-user, so only they see it)
      await notify({
        userId: requester.id,
        eventType: "REQUEST_SUBMITTED",
        text: `Request ${requestId} for ${access.tool} – ${access.name} submitted for approval.`,
        channel: "portal",
        tx,
      });

      return { requestId, access };
    });

    // Post-transaction notifications
    sendSlackNotification({
      requestId: result.requestId,
      accessLabel: `${result.access.tool} – ${result.access.name}`,
      requesterName: opts.requesterName,
      beneficiaryName: opts.beneficiary,
      isException: false,
      justification: opts.justification,
      approverName: result.access.approver,
      automation: result.access.automation,
      status: "Pending Approval",
    }).catch((e) => console.error("[Slack] Async notification error:", e));

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, requestId: result.requestId };
  } catch (error: any) {
    console.error("Failed to submit request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Submit Exception Access Request (Atomic Transaction)
 */
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
    const result = await prisma.$transaction(async (tx) => {
      const access = await tx.accessItem.findUnique({
        where: { id: opts.accessItemId },
      });

      if (!access) throw new Error("Access item not found");

      let requester = await tx.user.findFirst({
        where: { name: opts.requesterName },
      });

      if (!requester) {
        requester = await tx.user.create({
          data: {
            name: opts.requesterName,
            email: opts.requesterEmail || `user_${Date.now()}@newage.com`,
            department: "Product Team",
            initials: opts.requesterName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
          },
        });
      }

      const requestId = newRequestId();

      const nowFormatted = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      await tx.accessRequest.create({
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
      await tx.auditLog.create({
        data: {
          action: "Exception request created",
          userId: requester.id,
          userName: opts.requesterName,
          detail: `${requestId} — ${access.tool} – ${access.name} (outside ${access.group})`,
        },
      });

      // Notification
      await notify({
        role: access.approver === "Rahul Sharma" ? "admin" : "employee",
        eventType: "REQUEST_SUBMITTED",
        text: `Access exception request ${requestId} from ${opts.requesterName} awaiting your review.`,
        channel: "slack",
        tx,
      });
      // Confirmation notification to requester (per-user)
      await notify({
        userId: requester.id,
        eventType: "REQUEST_SUBMITTED",
        text: `Exception request ${requestId} for ${access.tool} – ${access.name} submitted for review.`,
        channel: "portal",
        tx,
      });

      return { requestId, access };
    });

    sendSlackNotification({
      requestId: result.requestId,
      accessLabel: `${result.access.tool} – ${result.access.name}`,
      requesterName: opts.requesterName,
      beneficiaryName: opts.requesterName,
      isException: true,
      urgency: opts.urgency,
      justification: `[${opts.reason}] ${opts.justification}`,
      approverName: result.access.approver,
      automation: result.access.automation,
      status: "Pending Exception Approval",
    }).catch((e) => console.error("[Slack] Async notification error:", e));

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, requestId: result.requestId };
  } catch (error: any) {
    console.error("Failed to submit exception request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Approve Request (Atomic Transaction)
 */
export async function approveRequest(requestId: string, actingUserName: string) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return { success: false, error: "Not authenticated." };
    }
    const outcome = await prisma.$transaction(async (tx) => {
      const r = await tx.accessRequest.findUnique({
        where: { id: requestId },
        include: {
          timeline: { orderBy: { orderIndex: "asc" } },
          accessItem: true,
        },
      });
      if (!r) throw new Error(`Request ${requestId} not found`);
      if (current.role !== "ADMIN" && r.approverName !== current.name) {
        throw new Error("Only the assigned approver or an admin can approve this request.");
      }

      if (!r) throw new Error(`Request ${requestId} not found`);

      const nowFormatted = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      if (r.automation) {
        const finalStatus = r.onBehalf ? "ACCESS_PROVISIONED" : "COMPLETED";

        await tx.accessRequest.update({
          where: { id: requestId },
          data: { status: finalStatus },
        });

        // Update timeline atomically
        await tx.timelineStep.deleteMany({ where: { requestId } });
        await tx.timelineStep.createMany({
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
              actor: actingUserName || r.approverName,
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

        // Notification to requester
        await notify({
          userId: r.requesterId,
          eventType: "PROVISIONED",
          text: `Access automatically provisioned for ${requestId} — ${r.accessLabel}.`,
          channel: "portal",
          tx,
        });
      } else {
        // Manual flow
        await tx.accessRequest.update({
          where: { id: requestId },
          data: { status: "PENDING_MANUAL_PROVISIONING" },
        });

        await tx.timelineStep.deleteMany({ where: { requestId } });
        await tx.timelineStep.createMany({
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
              actor: actingUserName || r.approverName,
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
        await notify({
          role: "admin",
          eventType: "REQUEST_APPROVED",
          text: `${requestId} (${r.accessLabel}) approved and ready for manual provisioning.`,
          channel: "portal",
          tx,
        });
      }

      // Audit log atomically
      await tx.auditLog.create({
        data: {
          action: "Request approved",
          userName: actingUserName || r.approverName,
          detail: `${requestId} — ${r.accessLabel}`,
        },
      });

      return {
        autoCompleted: r.automation && !r.onBehalf,
        onBehalf: r.automation && r.onBehalf,
      };
    });

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, ...outcome };
  } catch (error: any) {
    console.error("Failed to approve request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Batch Approve Requests (Atomic Transaction)
 */
export async function batchApproveRequests(
  requestIds: string[],
  actingUserName: string
) {
  try {
    if (!requestIds || requestIds.length === 0) {
      return { success: true, count: 0, requestIds: [] };
    }

    const result = await prisma.$transaction(async (tx) => {
      const nowFormatted = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      let approvedCount = 0;

      for (const requestId of requestIds) {
        const r = await tx.accessRequest.findUnique({
          where: { id: requestId },
          include: {
            timeline: { orderBy: { orderIndex: "asc" } },
            accessItem: true,
          },
        });

        if (!r) continue;

        if (r.automation) {
          const finalStatus = r.onBehalf ? "ACCESS_PROVISIONED" : "COMPLETED";

          await tx.accessRequest.update({
            where: { id: requestId },
            data: { status: finalStatus },
          });

          await tx.timelineStep.deleteMany({ where: { requestId } });
          await tx.timelineStep.createMany({
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
                label: "Approved (Batch)",
                actor: actingUserName || r.approverName,
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

          await notify({
            role: "employee",
            eventType: "PROVISIONED",
            text: `Access automatically provisioned for ${requestId} — ${r.accessLabel} (Batch Approval).`,
            channel: "portal",
            tx,
          });
        } else {
          // Manual provisioning path
          await tx.accessRequest.update({
            where: { id: requestId },
            data: { status: "PENDING_MANUAL_PROVISIONING" },
          });

          await tx.timelineStep.deleteMany({ where: { requestId } });
          await tx.timelineStep.createMany({
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
                label: "Approved (Batch)",
                actor: actingUserName || r.approverName,
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

          await notify({
            role: "admin",
            eventType: "REQUEST_APPROVED",
            text: `${requestId} (${r.accessLabel}) batch-approved and queued for manual provisioning.`,
            channel: "portal",
            tx,
          });
        }

        // Audit log
        await tx.auditLog.create({
          data: {
            action: "Request approved (Batch)",
            userName: actingUserName || r.approverName,
            detail: `${requestId} — ${r.accessLabel} [Batch Operator: ${actingUserName}]`,
          },
        });

        approvedCount++;
      }

      return approvedCount;
    });

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, count: result, requestIds };
  } catch (error: any) {
    console.error("Failed to batch approve requests:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Reject Request (Atomic Transaction)
 */
export async function rejectRequest(
  requestId: string,
  reason: string,
  actingUserName: string
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return { success: false, error: "Not authenticated." };
    }
    const finalReason = (reason || "Not specified").trim();
    const finalActor = (actingUserName || "Approver").trim();
    await prisma.$transaction(async (tx) => {
      const r = await tx.accessRequest.findUnique({
        where: { id: requestId },
        include: { timeline: { orderBy: { orderIndex: "asc" } } },
      });

      if (!r) throw new Error(`Request ${requestId} not found`);
      if (current.role !== "ADMIN" && r.approverName !== current.name) {
        throw new Error("Only the assigned approver or an admin can reject this request.");
      }

      const nowFormatted = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      await tx.accessRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          rejectionReason: finalReason,
        },
      });

      // Update timeline atomically
      await tx.timelineStep.deleteMany({ where: { requestId } });
      await tx.timelineStep.createMany({
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
            label: `Rejected: ${finalReason}`,
            actor: finalActor || r.approverName,
            timestamp: nowFormatted,
            state: "DONE",
            orderIndex: 1,
          },
        ],
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: "Request rejected",
          userName: finalActor || r.approverName,
          detail: `${requestId} — Reason: ${finalReason}`,
        },
      });

      // Notification to requester
      await notify({
        userId: r.requesterId,
        eventType: "REQUEST_REJECTED",
        text: `Your request ${requestId} was rejected by ${finalActor || r.approverName}.`,
        channel: "portal",
        tx,
      });
    });

    try {
      revalidatePath("/");
    } catch {}

    return { success: true };
  } catch (error: any) {
    console.error("Failed to reject request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 6. Provision Manually (Atomic Transaction)
 */
export async function provisionManually(requestId: string, actingUserName: string) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return { success: false, error: "Admin role required to provision access." };
    }
    const outcome = await prisma.$transaction(async (tx) => {
      const r = await tx.accessRequest.findUnique({
        where: { id: requestId },
        include: { timeline: { orderBy: { orderIndex: "asc" } } },
      });

      if (!r) throw new Error(`Request ${requestId} not found`);

      const nowFormatted = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const finalStatus = r.onBehalf ? "ACCESS_PROVISIONED" : "COMPLETED";

      await tx.accessRequest.update({
        where: { id: requestId },
        data: { status: finalStatus },
      });

      await tx.timelineStep.deleteMany({ where: { requestId } });
      await tx.timelineStep.createMany({
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
      await tx.auditLog.create({
        data: {
          action: "Access provisioned (manual)",
          userName: actingUserName,
          detail: `${requestId} — ${r.accessLabel}`,
        },
      });

      // Notification to requester
      await notify({
        userId: r.requesterId,
        eventType: "PROVISIONED",
        text: `Access has been manually provisioned for ${requestId} (${r.accessLabel}).`,
        channel: "portal",
        tx,
      });

      return { onBehalf: r.onBehalf };
    });

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, ...outcome };
  } catch (error: any) {
    console.error("Failed to provision manually:", error);
    return { success: false, error: error.message };
  }
}

// Alias provisionRequest to provisionManually for full naming consistency
export const provisionRequest = provisionManually;

/**
 * 7. Close Request Action (Atomic Transaction)
 */
export async function closeRequestAction(requestId: string, actingUserName: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const r = await tx.accessRequest.findUnique({
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

      await tx.accessRequest.update({
        where: { id: requestId },
        data: { status: "COMPLETED" },
      });

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

      await tx.timelineStep.deleteMany({ where: { requestId } });
      await tx.timelineStep.createMany({ data: steps });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: "Request closed",
          userName: actingUserName,
          detail: `${requestId} — closed on behalf of ${r.beneficiaryName}`,
        },
      });
    });

    try {
      revalidatePath("/");
    } catch {}

    return { success: true };
  } catch (error: any) {
    console.error("Failed to close request:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 8. Auto-expire requests past their requiredUntil date (Atomic per expired item)
 */
export async function autoExpireRequests() {
  try {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const toExpire = await prisma.accessRequest.findMany({
      where: {
        requiredUntil: { not: null },
        status: { notIn: ["COMPLETED", "REJECTED", "EXPIRED"] },
      },
    });

    const expired = toExpire.filter(
      (r) => r.requiredUntil !== null && r.requiredUntil < today
    );

    if (expired.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const r of expired) {
          await tx.accessRequest.update({
            where: { id: r.id },
            data: { status: "EXPIRED" },
          });
          await tx.auditLog.create({
            data: {
              action: "Access auto-expired",
              userName: "System",
              detail: `${r.id} — ${r.accessLabel}`,
            },
          });
          await notify({
            userId: r.requesterId,
            eventType: "REQUEST_AUTO_EXPIRED",
            text: `Access ${r.id} (${r.accessLabel}) has auto-expired.`,
            channel: "portal",
            tx,
          });
        }
      });
      try {
        revalidatePath("/");
      } catch {}
    }

    return { expiredCount: expired.length };
  } catch (error: any) {
    console.error("Failed to auto-expire requests:", error);
    return { expiredCount: 0 };
  }
}

/**
 * 9. Request 14-Day Extension (Atomic Transaction)
 */
export async function requestExtension(
  requestId: string,
  days: number = 14,
  actingUserName: string
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const r = await tx.accessRequest.findUnique({
        where: { id: requestId },
      });

      if (!r) throw new Error("Request not found");

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

      await tx.accessRequest.update({
        where: { id: requestId },
        data: {
          requiredUntil: newDateStr,
          status: "PENDING_EXCEPTION_APPROVAL",
        },
      });

      await tx.timelineStep.create({
        data: {
          requestId,
          label: `Extension Requested (+${days} days until ${newDateStr})`,
          actor: actingUserName,
          timestamp: nowFormatted,
          state: "DONE",
          orderIndex: 99,
        },
      });

      await tx.auditLog.create({
        data: {
          action: `Access extension requested (+${days} days)`,
          userName: actingUserName,
          detail: `${requestId} — Extended to ${newDateStr}`,
        },
      });

      await notify({
        role: "admin",
        eventType: "REQUEST_EXTENSION",
        text: `Extension request for ${requestId} (${r.accessLabel}) awaiting review.`,
        channel: "portal",
        tx,
      });

      return newDateStr;
    });

    try {
      revalidatePath("/");
    } catch {}

    return { success: true, newDate: result };
  } catch (error: any) {
    console.error("Failed to request extension:", error);
    return { success: false, error: error.message };
  }
}


