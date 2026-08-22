"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

/**
 * Returns the notifications visible to the current session. Filters by userId
 * when set, OR by role broadcast (e.g. admin-wide alert). Without the userId
 * filter we'd leak every employee's notifications to every other employee.
 */
export async function getNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null, role: user.role === "ADMIN" ? "admin" : "employee" },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markNotificationsRead() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };
    await prisma.notification.updateMany({
      where: {
        read: false,
        OR: [
          { userId: user.id },
          { userId: null },
        ],
      },
      data: { read: true },
    });
    try { revalidatePath("/"); } catch {}
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notifications read:", error);
    return { success: false };
  }
}

export async function clearAllNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId: user.id },
          { userId: null },
        ],
      },
    });
    try { revalidatePath("/"); } catch {}
    return { success: true };
  } catch (error) {
    console.error("Failed to clear notifications:", error);
    return { success: false };
  }
}

