"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin, getCurrentUser } from "./auth";
import { randomUUID } from "crypto";
import { notify } from "@/lib/notifications-engine";

/**
 * Generate the next sequential AC-XXXX code by scanning existing codes and
 * picking max+1. Safe because AC-XXXX is stored as a unique field and we
 * rely on the DB to reject any collision (unique index).
 */
async function nextAccessCode(): Promise<string> {
  const existing = await prisma.accessItem.findMany({
    where: { accessId: { not: null } },
    select: { accessId: true },
  });
  let max = 4000;
  for (const row of existing) {
    const m = row.accessId?.match(/^AC-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `AC-${max + 1}`;
}

export async function getAccessIdQueue() {
  try {
    const queue = await prisma.accessIdQueue.findMany({
      include: { accessItem: true },
      orderBy: { requestedTs: "desc" },
    });
    return queue;
  } catch (error) {
    console.error("Failed to fetch Access ID queue:", error);
    return [];
  }
}

export async function checkDuplicateAccessId(accessItemId: string) {
  try {
    const item = await prisma.accessItem.findUnique({
      where: { id: accessItemId },
    });
    if (item?.accessId) {
      return {
        isDuplicate: true,
        existingId: item.accessId,
        reason: "Board already has an active Access ID",
      };
    }
    const openQueue = await prisma.accessIdQueue.findFirst({
      where: { accessItemId, status: "Pending Governance Review" },
    });
    if (openQueue) {
      return {
        isDuplicate: true,
        reason: "A pending Access ID request already exists for this board",
      };
    }
    return { isDuplicate: false };
  } catch (error: any) {
    return { isDuplicate: false };
  }
}

export async function requestAccessIdCreation(accessItemId: string, actingUserName: string) {
  try {
    const access = await prisma.accessItem.findUnique({
      where: { id: accessItemId },
    });

    if (!access) throw new Error("Access item not found");

    // Duplicate guard
    const dupCheck = await checkDuplicateAccessId(accessItemId);
    if (dupCheck.isDuplicate) {
      return {
        success: false,
        isDuplicate: true,
        error: dupCheck.reason || "Duplicate Access ID request",
      };
    }

    const count = await prisma.accessIdQueue.count();
    // Use count + 1 with a random suffix to dodge concurrent collisions.
    // Real production would use a DB sequence or autoincrement column.
    const queueId = `idq-${count + 1}-${Math.random().toString(36).slice(2, 6)}`;

    const newQueueItem = await prisma.accessIdQueue.create({
      data: {
        id: queueId,
        accessItemId,
        status: "Pending Governance Review",
        requestedBy: actingUserName,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "Access ID creation requested",
        userName: actingUserName,
        detail: `${access.tool} – ${access.name}`,
      },
    });

    // Notification to admin
    await notify({
      role: "admin",
      eventType: "ACCESS_ID_REQUESTED",
      text: `Access ID creation requested for ${access.tool} – ${access.name}.`,
      channel: "portal",
    });

    try { revalidatePath("/"); } catch {}
    return { success: true, queueId: newQueueItem.id };
  } catch (error: any) {
    console.error("Failed to request Access ID:", error);
    return { success: false, error: error.message };
  }
}

export async function approveAccessId(queueId: string, actingUserName: string) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return { success: false, error: "Admin role required to approve Access ID." };
    }
    const queueItem = await prisma.accessIdQueue.findUnique({
      where: { id: queueId },
      include: { accessItem: true },
    });

    if (!queueItem) throw new Error("Queue item not found");

    // Generate unique Access ID serially. DB unique constraint catches
    // collisions if two admins approve in the same tick.
    const newAccessIdCode = await nextAccessCode();

    await prisma.accessIdQueue.update({
      where: { id: queueId },
      data: {
        status: "Access ID Created",
        approvedTs: new Date(),
      },
    });

    await prisma.accessItem.update({
      where: { id: queueItem.accessItemId },
      data: {
        accessId: newAccessIdCode,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "Access ID created",
        userName: actingUserName,
        detail: `${queueItem.accessItem.tool} – ${queueItem.accessItem.name} — ${newAccessIdCode}`,
      },
    });

    // Notification to requester
    await notify({
      role: "employee",
      eventType: "ACCESS_ID_ISSUED",
      text: `Access ID created for ${queueItem.accessItem.tool} – ${queueItem.accessItem.name} (${newAccessIdCode}). You can continue your request.`,
      channel: "portal",
    });

    try { revalidatePath("/"); } catch {}
    return { success: true, accessId: newAccessIdCode };
  } catch (error: any) {
    console.error("Failed to approve Access ID:", error);
    return { success: false, error: error.message };
  }
}

