"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications(role: "employee" | "admin") {
  try {
    const notifications = await prisma.notification.findMany({
      where: { role },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markNotificationsRead(role: "employee" | "admin") {
  try {
    await prisma.notification.updateMany({
      where: { role, read: false },
      data: { read: true },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notifications read:", error);
    return { success: false };
  }
}
