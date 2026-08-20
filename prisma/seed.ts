import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const passwordHash = await bcrypt.hash("password123", 10);

  const manvi = await prisma.user.upsert({
    where: { email: "manvi@newage.com" },
    update: {},
    create: {
      name: "Manvi Mehta",
      email: "manvi@newage.com",
      passwordHash,
      role: "EMPLOYEE",
      department: "Product Team",
      initials: "MM",
      avatarTone: "#2563EB",
    },
  });

  const rahul = await prisma.user.upsert({
    where: { email: "rahul@newage.com" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "rahul@newage.com",
      passwordHash,
      role: "ADMIN",
      department: "IT Support",
      initials: "RS",
      avatarTone: "#334155",
    },
  });

  await prisma.user.upsert({
    where: { email: "ananya@newage.com" },
    update: {},
    create: {
      name: "Ananya Rao",
      email: "ananya@newage.com",
      passwordHash,
      role: "EMPLOYEE",
      department: "Support Team",
      initials: "AR",
      avatarTone: "#7C3AED",
    },
  });

  await prisma.user.upsert({
    where: { email: "vanshika@newage.com" },
    update: {},
    create: {
      name: "Vanshika Sharma",
      email: "vanshika@newage.com",
      passwordHash,
      role: "EMPLOYEE",
      department: "Marketing Team",
      initials: "VS",
      avatarTone: "#059669",
    },
  });

  console.log("✅ Users created");

  // Create access items
  const acc1 = await prisma.accessItem.upsert({
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
      creator: "Sarah Thomas",
      group: "Marketing Team",
      eligibleGroups: JSON.stringify(["Marketing Team", "Product Team"]),
      approver: "Manvi Mehta",
      backupApprover: "Sarah Thomas",
      provider: "Rahul Sharma",
      automation: true,
      requestType: "Board Access Request",
    },
  });

  const acc2 = await prisma.accessItem.upsert({
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
      creator: "Neha Kapoor",
      group: "Sales Team",
      eligibleGroups: JSON.stringify(["Sales Team", "Product Team"]),
      approver: "Neha Kapoor",
      backupApprover: "Arjun Mehta",
      provider: "Rahul Sharma",
      automation: false,
      requestType: "Application Access Request",
    },
  });

  const acc3 = await prisma.accessItem.upsert({
    where: { id: "acc-3" },
    update: {},
    create: {
      id: "acc-3",
      tool: "Monday.com",
      name: "Product Roadmap Board",
      category: "BOARD",
      description:
        "Quarterly roadmap planning and feature prioritization board for the Product team.",
      accessId: null,
      creator: "Apoorva Singh",
      group: "Product Team",
      eligibleGroups: JSON.stringify(["Product Team"]),
      approver: "Sandeep Verma",
      backupApprover: "Apoorva Singh",
      provider: "Rahul Sharma",
      automation: false,
      requestType: "Board Access Request",
    },
  });

  const acc4 = await prisma.accessItem.upsert({
    where: { id: "acc-4" },
    update: {},
    create: {
      id: "acc-4",
      tool: "Zendesk",
      name: "Customer Support Queue",
      category: "APPLICATION",
      description: "Live customer ticket queue for the Support team.",
      accessId: "AC-3311",
      creator: "Varsha Nair",
      group: "Support Team",
      eligibleGroups: JSON.stringify(["Support Team"]),
      approver: "Manvi Mehta",
      backupApprover: "Christian Fernandes",
      provider: "Varsha Nair",
      automation: false,
      requestType: "Application Access Request",
    },
  });

  const acc5 = await prisma.accessItem.upsert({
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
      creator: "Nivi Rao",
      group: "Finance Team",
      eligibleGroups: JSON.stringify(["Finance Team"]),
      approver: "Muskan Kohli",
      backupApprover: "Nivi Rao",
      provider: "Nivi Rao",
      automation: true,
      requestType: "Board Access Request",
    },
  });

  console.log("✅ Access items created");

  // Create seed requests
  // NAR-10469: Completed manual request (Rahul -> Zendesk)
  await prisma.accessRequest.upsert({
    where: { id: "NAR-10469" },
    update: {},
    create: {
      id: "NAR-10469",
      accessItemId: acc4.id,
      accessLabel: "Zendesk – Customer Support Queue",
      requesterId: rahul.id,
      beneficiaryName: "Rahul Sharma",
      onBehalf: false,
      isException: false,
      justification:
        "Need ticket visibility to debug a provisioning issue reported by Support.",
      status: "COMPLETED",
      approverName: "Manvi Mehta",
      providerName: "Varsha Nair",
      automation: false,
      createdAt: new Date("2026-08-02T09:40:00Z"),
      updatedAt: new Date("2026-08-03T10:05:00Z"),
      timeline: {
        create: [
          {
            label: "Request Submitted",
            actor: "Rahul Sharma",
            timestamp: "2 Aug 2026, 9:40 AM",
            state: "DONE",
            orderIndex: 0,
          },
          {
            label: "Approved",
            actor: "Manvi Mehta",
            timestamp: "2 Aug 2026, 1:15 PM",
            state: "DONE",
            orderIndex: 1,
          },
          {
            label: "Access Provisioned",
            actor: "Varsha Nair",
            timestamp: "3 Aug 2026, 10:05 AM",
            state: "DONE",
            orderIndex: 2,
          },
          {
            label: "Completed",
            actor: "System",
            timestamp: "3 Aug 2026, 10:05 AM",
            state: "DONE",
            orderIndex: 3,
          },
        ],
      },
    },
  });

  // NAR-10471: Pending Approval (Ananya -> Zendesk)
  await prisma.accessRequest.upsert({
    where: { id: "NAR-10471" },
    update: {},
    create: {
      id: "NAR-10471",
      accessItemId: acc4.id,
      accessLabel: "Zendesk – Customer Support Queue",
      requesterId: manvi.id,
      beneficiaryName: "Ananya Rao",
      onBehalf: false,
      isException: false,
      justification: "Joining the Support rotation next week and need queue access.",
      status: "PENDING_APPROVAL",
      approverName: "Manvi Mehta",
      providerName: "Varsha Nair",
      automation: false,
      createdAt: new Date("2026-08-16T11:20:00Z"),
      updatedAt: new Date("2026-08-16T11:20:00Z"),
      timeline: {
        create: [
          {
            label: "Request Submitted",
            actor: "Ananya Rao",
            timestamp: "16 Aug 2026, 11:20 AM",
            state: "DONE",
            orderIndex: 0,
          },
          {
            label: "Pending Approval",
            actor: "Manvi Mehta",
            timestamp: "—",
            state: "CURRENT",
            orderIndex: 1,
          },
          {
            label: "Pending Manual Provisioning",
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

  // NAR-10475: Completed automated request (Manvi -> Finance Tracker)
  await prisma.accessRequest.upsert({
    where: { id: "NAR-10475" },
    update: {},
    create: {
      id: "NAR-10475",
      accessItemId: acc5.id,
      accessLabel: "Monday.com – Finance Tracker",
      requesterId: manvi.id,
      beneficiaryName: "Manvi Mehta",
      onBehalf: false,
      isException: false,
      justification:
        "Tracking marketing budget spend against the Q3 vendor invoices.",
      status: "COMPLETED",
      approverName: "Muskan Kohli",
      providerName: "Nivi Rao",
      automation: true,
      createdAt: new Date("2026-08-10T09:12:00Z"),
      updatedAt: new Date("2026-08-10T11:41:00Z"),
      timeline: {
        create: [
          {
            label: "Request Submitted",
            actor: "Manvi Mehta",
            timestamp: "10 Aug 2026, 9:12 AM",
            state: "DONE",
            orderIndex: 0,
          },
          {
            label: "Approved",
            actor: "Muskan Kohli",
            timestamp: "10 Aug 2026, 11:40 AM",
            state: "DONE",
            orderIndex: 1,
          },
          {
            label: "Access Provisioned",
            actor: "Automated Provisioning",
            timestamp: "10 Aug 2026, 11:41 AM",
            state: "DONE",
            orderIndex: 2,
          },
          {
            label: "Completed",
            actor: "System",
            timestamp: "10 Aug 2026, 11:41 AM",
            state: "DONE",
            orderIndex: 3,
          },
        ],
      },
    },
  });

  // NAR-10478: Pending Manual Provisioning (Manvi -> Salesforce)
  await prisma.accessRequest.upsert({
    where: { id: "NAR-10478" },
    update: {},
    create: {
      id: "NAR-10478",
      accessItemId: acc2.id,
      accessLabel: "Salesforce – Sales Operations",
      requesterId: manvi.id,
      beneficiaryName: "Manvi Mehta",
      onBehalf: false,
      isException: false,
      justification:
        "Reviewing pipeline coverage for the New Age Portal launch account list.",
      status: "PENDING_MANUAL_PROVISIONING",
      approverName: "Neha Kapoor",
      providerName: "Rahul Sharma",
      automation: false,
      createdAt: new Date("2026-08-15T14:05:00Z"),
      updatedAt: new Date("2026-08-16T10:20:00Z"),
      timeline: {
        create: [
          {
            label: "Request Submitted",
            actor: "Manvi Mehta",
            timestamp: "15 Aug 2026, 2:05 PM",
            state: "DONE",
            orderIndex: 0,
          },
          {
            label: "Approved",
            actor: "Neha Kapoor",
            timestamp: "16 Aug 2026, 10:20 AM",
            state: "DONE",
            orderIndex: 1,
          },
          {
            label: "Pending Manual Provisioning",
            actor: "Rahul Sharma",
            timestamp: "—",
            state: "CURRENT",
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

  console.log("✅ Seed requests created");

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: "Access ID created — AC-1042",
        userName: "Rahul Sharma",
        detail: "Monday.com – Marketing Operations Board",
        createdAt: new Date("2026-06-20T10:40:00Z"),
      },
      {
        action: "Backup approver changed",
        userName: "Rahul Sharma",
        detail: "Monday.com – Marketing Operations Board",
        createdAt: new Date("2026-07-05T05:32:00Z"),
      },
      {
        action: "Automation enabled",
        userName: "Rahul Sharma",
        detail: "Monday.com – Marketing Operations Board",
        createdAt: new Date("2026-07-28T10:15:00Z"),
      },
      {
        action: "Automation enabled",
        userName: "Rahul Sharma",
        detail: "Monday.com – Finance Tracker",
        createdAt: new Date("2026-08-02T07:45:00Z"),
      },
      {
        action: "Request created",
        userName: "Rahul Sharma",
        detail: "NAR-10469 — Zendesk – Customer Support Queue",
        createdAt: new Date("2026-08-02T09:40:00Z"),
      },
      {
        action: "Request approved",
        userName: "Manvi Mehta",
        detail: "NAR-10469 — Zendesk – Customer Support Queue",
        createdAt: new Date("2026-08-02T13:15:00Z"),
      },
      {
        action: "Access provisioned (manual)",
        userName: "Varsha Nair",
        detail: "NAR-10469 — Zendesk – Customer Support Queue",
        createdAt: new Date("2026-08-03T10:05:00Z"),
      },
    ],
  });

  console.log("✅ Audit logs created");

  // Seed notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: manvi.id,
        role: "employee",
        text: "Your request NAR-10478 was approved by Neha Kapoor.",
        channel: "portal",
        read: true,
        createdAt: new Date("2026-08-16T10:20:00Z"),
      },
      {
        userId: manvi.id,
        role: "employee",
        text: "Ananya Rao raised a request for Zendesk – Customer Support Queue awaiting your approval.",
        channel: "slack",
        read: false,
        createdAt: new Date("2026-08-16T11:20:00Z"),
      },
      {
        userId: rahul.id,
        role: "admin",
        text: "NAR-10478 (Salesforce – Sales Operations) is ready for manual provisioning.",
        channel: "portal",
        read: false,
        createdAt: new Date("2026-08-16T10:20:00Z"),
      },
    ],
  });

  console.log("✅ Notifications created");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
