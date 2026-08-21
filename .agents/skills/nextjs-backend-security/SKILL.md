---
name: nextjs-backend-security
description: >-
  Next.js 16 Backend & Server Action Security skill. Covers RBAC server boundaries,
  session verification, idempotent webhook delivery (Slack/SCIM), lifecycle auto-expiry,
  and zero-trust input sanitization.
---

# Next.js Backend Architecture & Security Skill

This skill enforces best practices for Next.js App Router Server Actions, Role-Based Access Control (RBAC), webhook integrations, and lifecycle automation.

---

## 🛡️ Security & Architecture Mandates

### 1. Server-Side RBAC & Authorization Guardrails
Never rely on client-side state for role enforcement. Every sensitive Server Action must independently verify the active user's session and permissions:

```typescript
export async function elevateUserToAdmin(targetUserId: string) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    throw new Error("403 Forbidden: Insufficient administrative privileges.");
  }
  // Proceed with safe mutation...
}
```

---

### 2. Idempotent & Non-Blocking Webhook Delivery
- External webhooks (e.g. Slack Incoming Webhooks, SCIM API calls) must never block or crash the primary database transaction.
- Wrap external HTTP requests in async non-blocking catch blocks:

```typescript
sendSlackNotification(payload).catch((err) => {
  console.error("[Webhook Error] Non-blocking Slack delivery failure:", err);
});
```

---

### 3. Lifecycle Automation & Access Expiration
- Automate temporal access controls.
- Regularly verify and transition expired records:

```typescript
export async function autoExpireRequests() {
  const nowStr = new Date().toISOString().split("T")[0];
  await prisma.accessRequest.updateMany({
    where: {
      requiredUntil: { lt: nowStr },
      status: { in: ["ACCESS_PROVISIONED", "COMPLETED"] },
    },
    data: { status: "EXPIRED" },
  });
}
```

---

### 4. Zero-Trust Input Validation & Sanitization
- Validate data types, string length bounds, and valid enum values for all incoming Server Action parameters.
- Sanitize multi-line justifications to prevent markdown/HTML injection in downstream webhook blocks.
