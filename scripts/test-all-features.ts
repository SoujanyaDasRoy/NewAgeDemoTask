import { prisma } from "../lib/prisma";
import { getCatalog, updateAccessConfig, toggleAutomation } from "../lib/actions/catalog";
import {
  getRequests,
  submitRequest,
  submitExceptionRequest,
  approveRequest,
  rejectRequest,
  provisionManually,
  closeRequestAction,
  requestExtension,
  autoExpireRequests,
} from "../lib/actions/requests";
import {
  getAccessIdQueue,
  requestAccessIdCreation,
  checkDuplicateAccessId,
  approveAccessId,
} from "../lib/actions/access-id";
import { getNotifications, markNotificationsRead } from "../lib/actions/notifications";
import { getAuditLogs } from "../lib/actions/audit";
import { login, signup, switchSessionUser } from "../lib/actions/auth";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  detail?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, detail?: any) {
  if (condition) {
    results.push({ suite, name, passed: true, detail });
    console.log(`  ✓ [PASS] ${suite} > ${name}`);
  } else {
    results.push({ suite, name, passed: false, error: "Assertion failed", detail });
    console.error(`  ✗ [FAIL] ${suite} > ${name}`);
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("🧪 STARTING FULL END-TO-END FEATURE TEST SUITE");
  console.log("=======================================================\n");

  // Ensure fresh test baseline
  await prisma.timelineStep.deleteMany({});
  await prisma.accessRequest.deleteMany({});
  await prisma.accessIdQueue.deleteMany({});
  await prisma.accessItem.update({ where: { id: "acc-3" }, data: { accessId: null } });
  await prisma.accessItem.update({ where: { id: "acc-2" }, data: { automation: false } });

  // ── TEST SUITE 1: Access Catalog & Dynamic Eligibility ───────────────────
  console.log("📁 SUITE 1: Access Catalog & Dynamic Eligibility");
  const catalogProduct = await getCatalog("Product Team");
  assert(catalogProduct.length === 5, "Catalog", "Returns all 5 access items", { count: catalogProduct.length });

  const eligibleItem = catalogProduct.find((i) => i.id === "acc-1");
  assert(eligibleItem?.isEligible === true, "Catalog", "acc-1 is eligible for Product Team");

  const supportOnlyItem = catalogProduct.find((i) => i.id === "acc-4");
  assert(supportOnlyItem?.isEligible === false, "Catalog", "acc-4 requires exception for Product Team");

  const missingAccessIdItem = catalogProduct.find((i) => i.id === "acc-3");
  assert(missingAccessIdItem?.accessId === null, "Catalog", "acc-3 correctly has null Access ID");

  // ── TEST SUITE 2: Standard Access Request Lifecycle (Self & On-Behalf) ───
  console.log("\n📁 SUITE 2: Request Submission (Self & On-Behalf)");
  const selfReqRes = await submitRequest({
    accessItemId: "acc-1",
    beneficiary: "Manvi Mehta",
    onBehalf: false,
    justification: "Need marketing metrics board access for Q3 roadmap alignment.",
    requesterName: "Manvi Mehta",
    requesterEmail: "manvi@newage.com",
  });
  assert(selfReqRes.success === true && !!selfReqRes.requestId, "Requests", "Self-request created successfully", selfReqRes);
  const selfReqId = selfReqRes.requestId!;

  const onBehalfRes = await submitRequest({
    accessItemId: "acc-2",
    beneficiary: "Vanshika Sharma",
    onBehalf: true,
    justification: "Onboarding new marketing manager into sales pipeline review.",
    requesterName: "Manvi Mehta",
    requesterEmail: "manvi@newage.com",
  });
  assert(onBehalfRes.success === true && !!onBehalfRes.requestId, "Requests", "On-behalf request created successfully", onBehalfRes);
  const onBehalfReqId = onBehalfRes.requestId!;

  // ── TEST SUITE 3: Exception Request Submission ────────────────────────────
  console.log("\n📁 SUITE 3: Out-of-Policy Exception Requests");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 30);
  const requiredUntil = tomorrow.toISOString().split("T")[0];

  const exceptionRes = await submitExceptionRequest({
    accessItemId: "acc-4", // Zendesk
    reason: "Cross-team Project Collaboration",
    justification: "Debugging customer onboarding crash in staging environment.",
    requiredUntil,
    urgency: "URGENT",
    requesterName: "Manvi Mehta",
    requesterEmail: "manvi@newage.com",
  });
  assert(exceptionRes.success === true && !!exceptionRes.requestId, "Exceptions", "Exception request created", exceptionRes);
  const exceptionReqId = exceptionRes.requestId!;

  // ── TEST SUITE 4: Automated Provisioning Pipeline ────────────────────────
  console.log("\n📁 SUITE 4: Automated Provisioning Pipeline (acc-1)");
  const autoApproveRes = await approveRequest(selfReqId, "Manvi Mehta");
  assert(autoApproveRes.success === true, "Approvals", "Automated request approved successfully");

  const selfReqDb = await prisma.accessRequest.findUnique({
    where: { id: selfReqId },
    include: { timeline: true },
  });
  assert(selfReqDb?.status === "COMPLETED", "Automated Pipeline", "Automated request auto-transitioned to COMPLETED", { status: selfReqDb?.status });
  assert(!!selfReqDb?.timeline.some((t) => t.label.includes("Automatically Provisioned")), "Automated Pipeline", "Timeline step indicates automated provisioning");

  // ── TEST SUITE 5: Manual Provisioning Pipeline & Admin Queue ──────────────
  console.log("\n📁 SUITE 5: Manual Provisioning Pipeline (acc-2 / on-behalf)");
  const manualApproveRes = await approveRequest(onBehalfReqId, "Neha Kapoor");
  assert(manualApproveRes.success === true, "Approvals", "Manual request approved by Neha Kapoor");

  const onBehalfPreProv = await prisma.accessRequest.findUnique({ where: { id: onBehalfReqId } });
  assert(onBehalfPreProv?.status === "PENDING_MANUAL_PROVISIONING", "Manual Pipeline", "Manual request entered PENDING_MANUAL_PROVISIONING");

  // Admin executes manual provisioning
  const provRes = await provisionManually(onBehalfReqId, "Rahul Sharma");
  assert(provRes.success === true, "Provisioning", "Admin manually marked request as provisioned");

  const onBehalfPostProv = await prisma.accessRequest.findUnique({ where: { id: onBehalfReqId } });
  assert(onBehalfPostProv?.status === "ACCESS_PROVISIONED", "On-Behalf Flow", "On-behalf pauses at ACCESS_PROVISIONED awaiting closure");

  // Requester closes on-behalf request
  const closeRes = await closeRequestAction(onBehalfReqId, "Manvi Mehta");
  assert(closeRes.success === true, "On-Behalf Flow", "Requester successfully marked request as closed");

  const onBehalfFinal = await prisma.accessRequest.findUnique({ where: { id: onBehalfReqId } });
  assert(onBehalfFinal?.status === "COMPLETED", "On-Behalf Flow", "On-behalf request final status is COMPLETED");

  // ── TEST SUITE 6: Rejection Engine with Preset Templates ─────────────────
  console.log("\n📁 SUITE 6: Rejection Engine with Templates");
  const rejectRes = await rejectRequest(exceptionReqId, "Role / department mismatch for requested permission", "Manvi Mehta");
  assert(rejectRes.success === true, "Rejections", "Request rejected with preset reason template");

  const rejectedDb = await prisma.accessRequest.findUnique({ where: { id: exceptionReqId } });
  assert(rejectedDb?.status === "REJECTED", "Rejections", "Status updated to REJECTED");
  assert(rejectedDb?.rejectionReason === "Role / department mismatch for requested permission", "Rejections", "Rejection reason saved correctly");

  // ── TEST SUITE 7: Part 4 — 14-Day Extension & Auto-Expiry ────────────────
  console.log("\n📁 SUITE 7: Part 4 — Auto-Expiry & Extension Flow");
  // Test Extension
  const extRes = await requestExtension(exceptionReqId, 14, "Manvi Mehta");
  assert(extRes.success === true && !!extRes.newDate, "Extensions", "14-day extension requested successfully", extRes);

  // Test Auto-Expiry on an expired request
  const expiredReqId = "NAR-TEST-EXPIRED";
  await prisma.accessRequest.create({
    data: {
      id: expiredReqId,
      accessItemId: "acc-4",
      accessLabel: "Zendesk – Customer Support Queue",
      requesterId: (await prisma.user.findFirst())!.id,
      beneficiaryName: "Test User",
      requiredUntil: "2025-01-01", // Past date
      status: "PENDING_APPROVAL",
      approverName: "Manvi Mehta",
      providerName: "Rahul Sharma",
      justification: "Expired test request",
    },
  });

  const autoExpRes = await autoExpireRequests();
  assert(autoExpRes.expiredCount >= 1, "Auto-Expiry", "autoExpireRequests identified and expired overdue requests", autoExpRes);

  const expiredDb = await prisma.accessRequest.findUnique({ where: { id: expiredReqId } });
  assert(expiredDb?.status === "EXPIRED", "Auto-Expiry", "Overdue request status set to EXPIRED");

  // Cleanup test expired req
  await prisma.accessRequest.delete({ where: { id: expiredReqId } });

  // ── TEST SUITE 8: Access ID Governance & Duplicate Verification ──────────
  console.log("\n📁 SUITE 8: Access ID Governance & Duplicate Check");
  // Check duplicate for item with no ID (acc-3)
  const dupCheckAcc3 = await checkDuplicateAccessId("acc-3");
  assert(dupCheckAcc3.isDuplicate === false, "Access ID", "acc-3 has no duplicate Access ID initially");

  // Request Access ID creation
  const idReqRes = await requestAccessIdCreation("acc-3", "Manvi Mehta");
  assert(idReqRes.success === true && !!idReqRes.queueId, "Access ID", "Access ID request queued", idReqRes);

  // Check duplicate while in queue -> should detect pending
  const dupCheckPending = await checkDuplicateAccessId("acc-3");
  assert(dupCheckPending.isDuplicate === true, "Access ID", "Duplicate check catches already-queued request");

  // Admin approves Access ID
  const approveIdRes = await approveAccessId(idReqRes.queueId!, "Rahul Sharma");
  assert(approveIdRes.success === true && !!approveIdRes.accessId, "Access ID", "Admin approved and issued AC-XXXX", approveIdRes);

  const acc3Updated = await prisma.accessItem.findUnique({ where: { id: "acc-3" } });
  assert(acc3Updated?.accessId?.startsWith("AC-") === true, "Access ID", `acc-3 now has valid ID ${acc3Updated?.accessId}`);

  // Re-check duplicate on now-assigned item
  const dupCheckCompleted = await checkDuplicateAccessId("acc-3");
  assert(dupCheckCompleted.isDuplicate === true, "Access ID", "Duplicate check detects active Access ID on board");

  // ── TEST SUITE 9: Board Configuration & Automation Toggle ────────────────
  console.log("\n📁 SUITE 9: Board Configuration & Automation Toggle");
  const toggleRes = await toggleAutomation("acc-2", "Rahul Sharma");
  assert(toggleRes.success === true, "Board Config", "Toggled automation on acc-2", toggleRes);

  const configRes = await updateAccessConfig(
    "acc-2",
    {
      approver: "Arjun Mehta",
      backupApprover: "Neha Kapoor",
      provider: "Rahul Sharma",
    },
    "Rahul Sharma"
  );
  assert(configRes.success === true, "Board Config", "Updated board approver to Arjun Mehta");

  const acc2Updated = await prisma.accessItem.findUnique({ where: { id: "acc-2" } });
  assert(acc2Updated?.approver === "Arjun Mehta", "Board Config", "Board configuration saved to DB");

  // ── TEST SUITE 10: Notifications & Audit Log ─────────────────────────────
  console.log("\n📁 SUITE 10: Notifications & Audit Log Trail");
  const notifs = await getNotifications("employee");
  assert(notifs.length > 0, "Notifications", "Fetched employee notifications", { count: notifs.length });

  const markReadRes = await markNotificationsRead("employee");
  assert(markReadRes.success === true, "Notifications", "Marked notifications as read");

  const auditLogs = await getAuditLogs(10);
  assert(auditLogs.length >= 5, "Audit Logs", "Audit logs captured chronological events", { count: auditLogs.length });

  // ── TEST SUITE 11: Authentication & Credential Verification ──────────────
  console.log("\n📁 SUITE 11: Authentication & Credentials");
  const loginValidRes = await login({ email: "admin@newage.com", password: "password123" });
  assert(loginValidRes.success === true && loginValidRes.user?.name === "Master Admin", "Auth", "Login with valid credentials succeeded", loginValidRes.user);

  const loginAdminRes = await login({ email: "admin@newage.com", password: "password123" });
  assert(loginAdminRes.success === true && loginAdminRes.user?.role === "ADMIN", "Auth", "Admin login succeeded with ADMIN role", loginAdminRes.user);

  const loginInvalidRes = await login({ email: "unknown@newage.com", password: "wrongpassword" });
  assert(loginInvalidRes.success === false, "Auth", "Login with invalid user correctly rejected");

  const switchRes = await switchSessionUser("admin@newage.com");
  assert(switchRes.success === true, "Auth", "Session switch succeeded");

  // Test Signup
  const testSignupEmail = `newuser_${Date.now()}@newage.com`;
  const signupRes = await signup({
    name: "Priya Menon",
    email: testSignupEmail,
    password: "password123",
    department: "Support Team",
    role: "EMPLOYEE",
  });
  assert(signupRes.success === true && signupRes.user?.name === "Priya Menon", "Auth", "New user signup succeeded with hashed password", signupRes.user);

  // Test duplicate signup rejection
  const dupSignupRes = await signup({
    name: "Priya Menon",
    email: testSignupEmail,
    password: "password123",
    department: "Support Team",
  });
  assert(dupSignupRes.success === false, "Auth", "Duplicate signup correctly rejected");

  // Cleanup test user
  await prisma.user.deleteMany({ where: { email: testSignupEmail } });

  // ── FINAL SUMMARY ────────────────────────────────────────────────────────
  console.log("\n=======================================================");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`🏁 TEST SUITE COMPLETE: ${passed} PASSED / ${failed} FAILED (Total: ${results.length})`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((e) => {
    console.error("Test runner encountered error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
