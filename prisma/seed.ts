import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Resetting and initializing clean production catalog...");

  // Clear any existing dummy requests, notifications, and accessIdQueue
  await prisma.timelineStep.deleteMany({});
  await prisma.accessRequest.deleteMany({});
  await prisma.accessIdQueue.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ All previous users and test data wiped. Ready for fresh user signup.");

  // 2. Create core access catalog items (clean directory)
  await prisma.accessItem.upsert({
    where: { id: "acc-1" },
    update: {},
    create: {
      id: "acc-1",
      tool: "Monday.com",
      name: "Marketing Operations Board",
      category: "BOARD",
      description:
        "Campaign timelines, content calendar, and creative sign-off tracking for the Marketing team.",
      accessId: "AC-1042",
      creator: "Master Admin",
      group: "Marketing Team",
      eligibleGroups: JSON.stringify(["Marketing Team", "Product Team"]),
      approver: "Master Admin",
      backupApprover: "Master Admin",
      provider: "Master Admin",
      automation: true,
      requestType: "Board Access Request",
    },
  });

  await prisma.accessItem.upsert({
    where: { id: "acc-2" },
    update: {},
    create: {
      id: "acc-2",
      tool: "Salesforce",
      name: "Sales Operations",
      category: "APPLICATION",
      description:
        "Pipeline, opportunity, and account data for the Sales Operations team.",
      accessId: "AC-2077",
      creator: "Master Admin",
      group: "Sales Team",
      eligibleGroups: JSON.stringify(["Sales Team", "Product Team"]),
      approver: "Master Admin",
      backupApprover: "Master Admin",
      provider: "Master Admin",
      automation: false,
      requestType: "Application Access Request",
    },
  });

  await prisma.accessItem.upsert({
    where: { id: "acc-3" },
    update: {},
    create: {
      id: "acc-3",
      tool: "Monday.com",
      name: "Product Roadmap Board",
      category: "BOARD",
      description:
        "Quarterly roadmap planning and feature prioritization board for the Product team.",
      accessId: null, // Triggers Access ID Governance flow
      creator: "Master Admin",
      group: "Product Team",
      eligibleGroups: JSON.stringify(["Product Team"]),
      approver: "Master Admin",
      backupApprover: "Master Admin",
      provider: "Master Admin",
      automation: false,
      requestType: "Board Access Request",
    },
  });

  await prisma.accessItem.upsert({
    where: { id: "acc-4" },
    update: {},
    create: {
      id: "acc-4",
      tool: "Zendesk",
      name: "Customer Support Queue",
      category: "APPLICATION",
      description: "Live customer ticket queue for the Support team.",
      accessId: "AC-3311",
      creator: "Master Admin",
      group: "Support Team",
      eligibleGroups: JSON.stringify(["Support Team"]),
      approver: "Master Admin",
      backupApprover: "Master Admin",
      provider: "Master Admin",
      automation: false,
      requestType: "Application Access Request",
    },
  });

  await prisma.accessItem.upsert({
    where: { id: "acc-5" },
    update: {},
    create: {
      id: "acc-5",
      tool: "Monday.com",
      name: "Finance Tracker",
      category: "BOARD",
      description:
        "Vendor invoices, budget tracking, and expense approvals board for Finance.",
      accessId: "AC-1590",
      creator: "Master Admin",
      group: "Finance Team",
      eligibleGroups: JSON.stringify(["Finance Team"]),
      approver: "Master Admin",
      backupApprover: "Master Admin",
      provider: "Master Admin",
      automation: true,
      requestType: "Board Access Request",
    },
  });

  console.log("✅ Core Access Catalog items created (5 items)");

  // 3. Create initial clean audit log
  await prisma.auditLog.create({
    data: {
      action: "System initialized",
      userName: "Master Admin",
      detail: "Clean production database initialized with Master Admin and 5 access items.",
    },
  });

  console.log("🎉 Clean database initialization complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
