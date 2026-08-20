"use server";

import { prisma } from "@/lib/prisma";

export async function getAuditLogs(limit: number = 10) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return logs;
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
}

