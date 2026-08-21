import "dotenv/config";
import { PrismaClient, Role, AccessCategory, Urgency, RequestStatus, StepState } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populating New Age Portal with rich, realistic demo & test data...");

  // 1. Clean slate
  await prisma.timelineStep.deleteMany({});
  await prisma.accessRequest.deleteMany({});
  await prisma.accessIdQueue.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.accessItem.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Previous database tables wiped cleanly.");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 2. Create Users
  const soujanya = await prisma.user.create({
    data: {
      id: "usr-soujanya",
      name: "Soujanya Das Roy",
      email: "soujanyadasroy@gmail.com",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      department: "IT Support",
      initials: "SR",
      avatarTone: "#1E3A8A",
    },
  });

  const arjun = await prisma.user.create({
    data: {
      id: "usr-arjun",
      name: "Arjun Mehta",
      email: "arjun.mehta@newage.com",
      passwordHash: defaultPasswordHash,
      role: Role.EMPLOYEE,
      department: "Engineering",
      initials: "AM",
      avatarTone: "#0F766E",
    },
  });

  const priya = await prisma.user.create({
    data: {
      id: "usr-priya",
      name: "Priya Sharma",
      email: "priya.sharma@newage.com",
      passwordHash: defaultPasswordHash,
      role: Role.EMPLOYEE,
      department: "Product",
      initials: "PS",
      avatarTone: "#7C3AED",
    },
  });

  const rahul = await prisma.user.create({
    data: {
      id: "usr-rahul",
      name: "Rahul Verma",
      email: "rahul.verma@newage.com",
      passwordHash: defaultPasswordHash,
      role: Role.EMPLOYEE,
      department: "Marketing",
      initials: "RV",
      avatarTone: "#D97706",
    },
  });

  const ananya = await prisma.user.create({
    data: {
      id: "usr-ananya",
      name: "Ananya Sen",
      email: "ananya.sen@newage.com",
      passwordHash: defaultPasswordHash,
      role: Role.EMPLOYEE,
      department: "Sales",
      initials: "AS",
      avatarTone: "#E11D48",
    },
  });

  const vikram = await prisma.user.create({
    data: {
      id: "usr-vikram",
      name: "Vikram Patel",
      email: "vikram.patel@newage.com",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      department: "Security & Compliance",
      initials: "VP",
      avatarTone: "#4338CA",
    },
  });

  console.log("👥 6 Demo Users Created (Admins & Employees across IT, Eng, Product, Marketing, Sales, Security).");

  // 3. Create Access Items (Tools & Boards Catalog)
  const mondayMarketing = await prisma.accessItem.create({
    data: {
      id: "acc-monday-marketing",
      tool: "Monday.com",
      name: "Marketing Operations Board",
      category: AccessCategory.BOARD,
      description: "Campaign timelines, content calendar, and creative asset approval tracking for Marketing & Growth teams.",
      accessId: "AC-1042",
      creator: "Soujanya Das Roy",
      group: "Marketing Team",
      eligibleGroups: JSON.stringify(["Marketing Team", "Product Team", "IT Support"]),
      approver: "Rahul Verma",
      backupApprover: "Soujanya Das Roy",
      provider: "Soujanya Das Roy",
      automation: true,
      requestType: "Board Access Request",
    },
  });

  const mondayProduct = await prisma.accessItem.create({
    data: {
      id: "acc-monday-product",
      tool: "Monday.com",
      name: "Product Roadmap 2026",
      category: AccessCategory.BOARD,
      description: "Quarterly feature roadmap planning, milestone tracking, and OKR alignment for the Core Product team.",
      accessId: "AC-2077",
      creator: "Soujanya Das Roy",
      group: "Product Team",
      eligibleGroups: JSON.stringify(["Product Team", "Engineering", "IT Support"]),
      approver: "Priya Sharma",
      backupApprover: "Arjun Mehta",
      provider: "Soujanya Das Roy",
      automation: true,
      requestType: "Board Access Request",
    },
  });

  const salesforceCRM = await prisma.accessItem.create({
    data: {
      id: "acc-salesforce-crm",
      tool: "Salesforce",
      name: "Global Enterprise CRM",
      category: AccessCategory.APPLICATION,
      description: "Core sales pipeline, Fortune 500 account data, contract management, and ARR revenue forecasting.",
      accessId: "AC-4350",
      creator: "Soujanya Das Roy",
      group: "Sales Team",
      eligibleGroups: JSON.stringify(["Sales Team", "IT Support"]),
      approver: "Ananya Sen",
      backupApprover: "Soujanya Das Roy",
      provider: "Soujanya Das Roy",
      automation: false,
      requestType: "Application Access Request",
    },
  });

  const salesforceAPAC = await prisma.accessItem.create({
    data: {
      id: "acc-salesforce-apac",
      tool: "Salesforce",
      name: "APAC Deals & Pipeline",
      category: AccessCategory.BOARD,
      description: "Dedicated regional deal desk, partner commissions, and pipeline board for Asia-Pacific enterprise expansion.",
      accessId: "AC-5112",
      creator: "Soujanya Das Roy",
      group: "Sales Team",
      eligibleGroups: JSON.stringify(["Sales Team", "Marketing Team", "IT Support"]),
      approver: "Ananya Sen",
      backupApprover: "Rahul Verma",
      provider: "Soujanya Das Roy",
      automation: true,
      requestType: "Board Access Request",
    },
  });

  const zendeskHelpdesk = await prisma.accessItem.create({
    data: {
      id: "acc-zendesk-helpdesk",
      tool: "Zendesk",
      name: "Enterprise Support Helpdesk",
      category: AccessCategory.APPLICATION,
      description: "Customer ticket management, SLA monitoring, agent macros, and omnichannel customer communication.",
      accessId: "AC-3301",
      creator: "Soujanya Das Roy",
      group: "IT Support",
      eligibleGroups: JSON.stringify(["IT Support", "Engineering", "Product Team"]),
      approver: "Soujanya Das Roy",
      backupApprover: "Vikram Patel",
      provider: "Soujanya Das Roy",
      automation: true,
      requestType: "Application Access Request",
    },
  });

  const zendeskVIP = await prisma.accessItem.create({
    data: {
      id: "acc-zendesk-vip",
      tool: "Zendesk",
      name: "VIP Customer Escalations",
      category: AccessCategory.BOARD,
      description: "Tier-3 high priority escalation queue for strategic tier-1 enterprise accounts.",
      accessId: "AC-3309",
      creator: "Soujanya Das Roy",
      group: "Customer Success",
      eligibleGroups: JSON.stringify(["Customer Success", "IT Support"]),
      approver: "Priya Sharma",
      backupApprover: "Soujanya Das Roy",
      provider: "Soujanya Das Roy",
      automation: false,
      requestType: "Board Access Request",
    },
  });

  const datadogAPM = await prisma.accessItem.create({
    data: {
      id: "acc-datadog-apm",
      tool: "Datadog",
      name: "Production Infrastructure & APM",
      category: AccessCategory.APPLICATION,
      description: "Live cluster telemetry, distributed tracing, Kubernetes metric dashboards, and real-time incident alerting.",
      accessId: "AC-9044",
      creator: "Soujanya Das Roy",
      group: "Engineering",
      eligibleGroups: JSON.stringify(["Engineering", "IT Support", "Security & Compliance"]),
      approver: "Arjun Mehta",
      backupApprover: "Vikram Patel",
      provider: "Soujanya Das Roy",
      automation: true,
      requestType: "Application Access Request",
    },
  });

  const figmaDesign = await prisma.accessItem.create({
    data: {
      id: "acc-figma-design",
      tool: "Figma",
      name: "Enterprise Design System",
      category: AccessCategory.APPLICATION,
      description: "Master UI/UX component library, design tokens, brand illustrations, and product prototyping workspaces.",
      accessId: null, // Needs Access ID Issue (demonstrates Governance)
      creator: "Arjun Mehta",
      group: "Product Team",
      eligibleGroups: JSON.stringify(["Product Team", "Engineering", "Marketing Team"]),
      approver: "Priya Sharma",
      backupApprover: "Soujanya Das Roy",
      provider: "Soujanya Das Roy",
      automation: false,
      requestType: "Application Access Request",
    },
  });

  console.log("📦 8 Access Items (Tools & Boards) seeded.");

  // 4. Create Access ID Queue Item (For Access ID Governance demo)
  await prisma.accessIdQueue.create({
    data: {
      id: "aiq-figma",
      accessItemId: figmaDesign.id,
      status: "Pending Governance Review",
      requestedBy: "Arjun Mehta",
    },
  });

  // 5. Create Realistic Access Requests Across Various Lifecycles
  // Request 1: Pending Approval for Soujanya (Rahul requesting Salesforce CRM)
  const req1 = await prisma.accessRequest.create({
    data: {
      id: "REQ-1042",
      accessItemId: salesforceCRM.id,
      accessLabel: "Salesforce – Global Enterprise CRM",
      requesterId: rahul.id,
      beneficiaryName: "Rahul Verma",
      onBehalf: false,
      isException: true,
      exceptionReason: "Cross-Department Exception: Marketing requesting direct access to Sales CRM",
      requiredUntil: "2026-12-31",
      urgency: Urgency.STANDARD,
      justification: "Need cross-functional view of Q3 Enterprise deal stages to coordinate ABM field marketing campaigns with Sales AEs.",
      status: RequestStatus.PENDING_APPROVAL,
      approverName: "Soujanya Das Roy",
      providerName: "Soujanya Das Roy",
      automation: false,
    },
  });

  await prisma.timelineStep.createMany({
    data: [
      {
        requestId: req1.id,
        label: "Request Submitted",
        actor: "Rahul Verma",
        timestamp: "Today, 10:15 AM",
        state: StepState.DONE,
        orderIndex: 0,
      },
      {
        requestId: req1.id,
        label: "Manager / Admin Approval",
        actor: "Soujanya Das Roy",
        timestamp: "Pending Decision",
        state: StepState.CURRENT,
        orderIndex: 1,
      },
      {
        requestId: req1.id,
        label: "Account Provisioning",
        actor: "IT Admin Provisioning Queue",
        timestamp: "Waiting",
        state: StepState.PENDING,
        orderIndex: 2,
      },
    ],
  });

  // Request 2: Pending Exception Approval (Ananya requesting Product Roadmap)
  const req2 = await prisma.accessRequest.create({
    data: {
      id: "REQ-1045",
      accessItemId: mondayProduct.id,
      accessLabel: "Monday.com – Product Roadmap 2026",
      requesterId: ananya.id,
      beneficiaryName: "Ananya Sen",
      onBehalf: false,
      isException: true,
      exceptionReason: "Cross-department exception for Sales AE to inspect quarterly product milestones",
      requiredUntil: "2026-11-30",
      urgency: Urgency.URGENT,
      justification: "Need to verify enterprise delivery commit dates for custom security features requested by a $200k ARR client.",
      status: RequestStatus.PENDING_EXCEPTION_APPROVAL,
      approverName: "Priya Sharma",
      providerName: "Soujanya Das Roy",
      automation: true,
    },
  });

  await prisma.timelineStep.createMany({
    data: [
      {
        requestId: req2.id,
        label: "Exception Request Submitted",
        actor: "Ananya Sen",
        timestamp: "Yesterday, 4:20 PM",
        state: StepState.DONE,
        orderIndex: 0,
      },
      {
        requestId: req2.id,
        label: "Product Lead Exception Approval",
        actor: "Priya Sharma",
        timestamp: "Pending Review",
        state: StepState.CURRENT,
        orderIndex: 1,
      },
      {
        requestId: req2.id,
        label: "Automated API Provisioning",
        actor: "Monday.com SCIM Webhook",
        timestamp: "Waiting",
        state: StepState.PENDING,
        orderIndex: 2,
      },
    ],
  });

  // Request 3: Pending Manual Provisioning (Priya approved for Salesforce, waiting for IT Admin Soujanya)
  const req3 = await prisma.accessRequest.create({
    data: {
      id: "REQ-1048",
      accessItemId: salesforceCRM.id,
      accessLabel: "Salesforce – Global Enterprise CRM",
      requesterId: priya.id,
      beneficiaryName: "Priya Sharma",
      onBehalf: false,
      isException: false,
      requiredUntil: "2026-10-15",
      urgency: Urgency.STANDARD,
      justification: "Product analytics integration to cross-reference product telemetry with sales accounts.",
      status: RequestStatus.PENDING_MANUAL_PROVISIONING,
      approverName: "Ananya Sen",
      providerName: "Soujanya Das Roy",
      automation: false,
    },
  });

  await prisma.timelineStep.createMany({
    data: [
      {
        requestId: req3.id,
        label: "Request Submitted",
        actor: "Priya Sharma",
        timestamp: "Aug 19, 2:10 PM",
        state: StepState.DONE,
        orderIndex: 0,
      },
      {
        requestId: req3.id,
        label: "Approved by Sales Lead",
        actor: "Ananya Sen",
        timestamp: "Aug 19, 3:45 PM",
        state: StepState.DONE,
        orderIndex: 1,
      },
      {
        requestId: req3.id,
        label: "Manual IT Provisioning",
        actor: "Soujanya Das Roy",
        timestamp: "In IT Admin Queue",
        state: StepState.CURRENT,
        orderIndex: 2,
      },
    ],
  });

  // Request 4: Completed / Active (Arjun Mehta access to Datadog APM)
  const req4 = await prisma.accessRequest.create({
    data: {
      id: "REQ-1051",
      accessItemId: datadogAPM.id,
      accessLabel: "Datadog – Production Infrastructure & APM",
      requesterId: arjun.id,
      beneficiaryName: "Arjun Mehta",
      onBehalf: false,
      isException: false,
      requiredUntil: "2027-01-01",
      urgency: Urgency.CRITICAL,
      justification: "Core engineer on-call rotation requiring direct access to production APM tracing & latency monitors.",
      status: RequestStatus.COMPLETED,
      approverName: "Arjun Mehta",
      providerName: "Soujanya Das Roy",
      automation: true,
    },
  });

  await prisma.timelineStep.createMany({
    data: [
      {
        requestId: req4.id,
        label: "Request Submitted",
        actor: "Arjun Mehta",
        timestamp: "Aug 18, 9:00 AM",
        state: StepState.DONE,
        orderIndex: 0,
      },
      {
        requestId: req4.id,
        label: "Lead Approval Auto-Verified",
        actor: "Policy Match Engine",
        timestamp: "Aug 18, 9:01 AM",
        state: StepState.DONE,
        orderIndex: 1,
      },
      {
        requestId: req4.id,
        label: "Automated Provisioning Completed",
        actor: "Datadog SCIM API",
        timestamp: "Aug 18, 9:02 AM",
        state: StepState.DONE,
        orderIndex: 2,
      },
    ],
  });

  // Request 5: On-Behalf Request (Soujanya requested for Ananya on Monday Marketing)
  const req5 = await prisma.accessRequest.create({
    data: {
      id: "REQ-1055",
      accessItemId: mondayMarketing.id,
      accessLabel: "Monday.com – Marketing Operations Board",
      requesterId: soujanya.id,
      beneficiaryName: "Ananya Sen",
      onBehalf: true,
      isException: false,
      requiredUntil: "2026-12-15",
      urgency: Urgency.STANDARD,
      justification: "Raised on-behalf of Sales Executive Ananya Sen for customer webinar follow-ups.",
      status: RequestStatus.ACCESS_PROVISIONED,
      approverName: "Rahul Verma",
      providerName: "Soujanya Das Roy",
      automation: true,
    },
  });

  await prisma.timelineStep.createMany({
    data: [
      {
        requestId: req5.id,
        label: "On-Behalf Request Submitted",
        actor: "Soujanya Das Roy",
        timestamp: "Aug 20, 11:30 AM",
        state: StepState.DONE,
        orderIndex: 0,
      },
      {
        requestId: req5.id,
        label: "Approved by Marketing Lead",
        actor: "Rahul Verma",
        timestamp: "Aug 20, 12:05 PM",
        state: StepState.DONE,
        orderIndex: 1,
      },
      {
        requestId: req5.id,
        label: "Access Provisioned (Awaiting Closure)",
        actor: "Monday.com Automated Provisioner",
        timestamp: "Aug 20, 12:06 PM",
        state: StepState.DONE,
        orderIndex: 2,
      },
    ],
  });

  console.log("📋 5 Detailed Access Requests & Multi-Step Timelines Seeded.");

  // 6. Seed Interactive Notifications (Slack & Portal)
  await prisma.notification.createMany({
    data: [
      {
        role: "admin",
        text: "REQ-1042: Rahul Verma submitted request for Salesforce – Global Enterprise CRM (Requires your approval)",
        channel: "slack",
        read: false,
        userId: soujanya.id,
      },
      {
        role: "employee",
        text: "REQ-1045: Ananya Sen submitted Exception Request for Monday.com – Product Roadmap 2026",
        channel: "slack",
        read: false,
        userId: priya.id,
      },
      {
        role: "admin",
        text: "Access ID AC-1042 successfully synced with Okta Governance directory.",
        channel: "portal",
        read: false,
        userId: soujanya.id,
      },
      {
        role: "employee",
        text: "Access Active: Datadog APM access has been provisioned for Arjun Mehta.",
        channel: "portal",
        read: true,
        userId: arjun.id,
      },
    ],
  });

  // 7. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: "REQUEST_CREATED",
        userName: "Rahul Verma",
        userId: rahul.id,
        detail: "Created Exception Request REQ-1042 for Salesforce – Global Enterprise CRM",
      },
      {
        action: "AUTOMATION_PROVISION",
        userName: "System Bot",
        detail: "Auto-provisioned access to Datadog APM for Arjun Mehta via SCIM Webhook (REQ-1051)",
      },
      {
        action: "ROLE_UPDATED",
        userName: "Soujanya Das Roy",
        userId: soujanya.id,
        detail: "Promoted Vikram Patel to Board Admin role in Security & Compliance department",
      },
      {
        action: "CONFIG_UPDATED",
        userName: "Soujanya Das Roy",
        userId: soujanya.id,
        detail: "Enabled Zero-Touch Automated Provisioning on Monday.com Marketing Operations Board",
      },
    ],
  });

  console.log("✨ Seed completed successfully! All demo users, catalog items, requests, timelines, and audit logs are ready.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
