"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

export async function getCatalog(userDepartment: string = "Product Team") {
  try {
    const items = await prisma.accessItem.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        idQueueItems: {
          where: { status: "Pending Governance Review" },
        },
      },
    });

    return items.map((item) => {
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
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return [];
  }
}

export async function updateAccessConfig(
  accessId: string,
  changes: {
    approver: string;
    backupApprover: string;
    provider: string;
  },
  actingUserName: string = "Admin"
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return { success: false, error: "Admin role required to update access configuration." };
    }
    const access = await prisma.accessItem.findUnique({
      where: { id: accessId },
    });

    if (!access) throw new Error("Access item not found");

    const diffs: string[] = [];
    if (access.approver !== changes.approver) {
      diffs.push(`Approver: ${access.approver} → ${changes.approver}`);
    }
    if (access.backupApprover !== changes.backupApprover) {
      diffs.push(`Backup approver: ${access.backupApprover} → ${changes.backupApprover}`);
    }
    if (access.provider !== changes.provider) {
      diffs.push(`Access provider: ${access.provider} → ${changes.provider}`);
    }

    await prisma.accessItem.update({
      where: { id: accessId },
      data: {
        approver: changes.approver,
        backupApprover: changes.backupApprover,
        provider: changes.provider,
      },
    });

    // Record audit
    await prisma.auditLog.create({
      data: {
        action: "Access configuration updated",
        userName: actingUserName,
        detail: `${access.tool} – ${access.name}${diffs.length ? " — " + diffs.join(", ") : ""}`,
      },
    });

    try { revalidatePath("/"); } catch {}
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update config:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleAutomation(accessId: string, actingUserName: string = "Admin") {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return { success: false, error: "Admin role required to toggle automation." };
    }
    const access = await prisma.accessItem.findUnique({
      where: { id: accessId },
    });

    if (!access) throw new Error("Access item not found");

    const newAutomation = !access.automation;

    await prisma.accessItem.update({
      where: { id: accessId },
      data: { automation: newAutomation },
    });

    // Record audit
    await prisma.auditLog.create({
      data: {
        action: newAutomation ? "Automation enabled" : "Automation disabled",
        userName: actingUserName,
        detail: `${access.tool} – ${access.name}`,
      },
    });

    try { revalidatePath("/"); } catch {}
    return { success: true, automation: newAutomation };
  } catch (error: any) {
    console.error("Failed to toggle automation:", error);
    return { success: false, error: error.message };
  }
}

