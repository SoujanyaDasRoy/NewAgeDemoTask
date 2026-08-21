"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, SessionUser } from "./auth";

export interface DashboardDataPayload {
  authenticated: boolean;
  currentUser: SessionUser | null;
  catalog: any[];
  requests: any[];
  accessIdQueue: any[];
  notifications: any[];
  auditLogs: any[];
  allUsers: any[];
}

export async function getDashboardData(): Promise<DashboardDataPayload> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        authenticated: false,
        currentUser: null,
        catalog: [],
        requests: [],
        accessIdQueue: [],
        notifications: [],
        auditLogs: [],
        allUsers: [],
      };
    }

    const isAdm = user.role === "ADMIN";
    const userDepartment = user.department || "Product Team";

    // Run all database fetches in parallel directly on the server
    const [rawCatalog, requests, idQueue, notifications, auditLogs, allUsers] =
      await Promise.all([
        // 1. Catalog items with pending governance reviews
        prisma.accessItem.findMany({
          orderBy: { createdAt: "asc" },
          include: {
            idQueueItems: {
              where: { status: "Pending Governance Review" },
              select: { id: true, status: true },
            },
          },
        }),

        // 2. All requests with timeline & requester data
        prisma.accessRequest.findMany({
          include: {
            timeline: {
              orderBy: { orderIndex: "asc" },
            },
            accessItem: true,
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                role: true,
                initials: true,
                avatarTone: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        // 3. Access ID Governance Queue
        prisma.accessIdQueue.findMany({
          include: {
            accessItem: true,
          },
          orderBy: { requestedTs: "desc" },
        }),

        // 4. Notifications
        prisma.notification.findMany({
          where: {
            OR: [
              { role: isAdm ? "admin" : "employee" },
              { userId: user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),

        // 5. Audit logs
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        }),

        // 6. All users (for admin dropdowns & user table)
        prisma.user.findMany({
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            initials: true,
            avatarTone: true,
            createdAt: true,
          },
        }),
      ]);

    // Compute catalog eligibility
    const catalog = rawCatalog.map((item) => {
      let eligibleGroups: string[] = [];
      try {
        eligibleGroups = JSON.parse(item.eligibleGroups);
      } catch {
        eligibleGroups = [];
      }
      const isEligible = eligibleGroups.includes(userDepartment);
      const pendingAccessIdReq = item.idQueueItems.length > 0;

      return {
        ...item,
        eligibleGroupsArray: eligibleGroups,
        isEligible,
        pendingAccessIdReq,
      };
    });

    return {
      authenticated: true,
      currentUser: user,
      catalog,
      requests,
      accessIdQueue: idQueue,
      notifications,
      auditLogs,
      allUsers,
    };
  } catch (error) {
    console.error("[Dashboard] High-speed data aggregation error:", error);
    return {
      authenticated: false,
      currentUser: null,
      catalog: [],
      requests: [],
      accessIdQueue: [],
      notifications: [],
      auditLogs: [],
      allUsers: [],
    };
  }
}
