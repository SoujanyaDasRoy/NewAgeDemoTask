---
name: postgres-prisma-architecture
description: >-
  PostgreSQL & Prisma ORM Architecture Mastery skill. Enforces atomic transactions,
  Neon Serverless connection pooling, immutable audit trails, relational indexing,
  and high-concurrency query optimization.
---

# PostgreSQL & Prisma ORM Architecture Skill

This skill guides high-performance database design, relational query optimization, and transaction safety for **PostgreSQL (Neon Cloud Serverless)** and **Prisma ORM**.

---

## 🗄️ Core Database Architecture Principles

### 1. Atomic Multi-Table Transactions
Always wrap multi-stage workflows in an atomic `prisma.$transaction()` to prevent partial failures and race conditions:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Update request status
  const updatedReq = await tx.accessRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });

  // 2. Append Timeline Step
  await tx.timelineStep.create({
    data: {
      requestId,
      label: "Approved by Lead",
      actor: actingUser,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      state: "DONE",
      orderIndex: 1,
    },
  });

  // 3. Append Immutable Audit Log
  await tx.auditLog.create({
    data: {
      action: "REQUEST_APPROVED",
      userName: actingUser,
      detail: `Approved request ${requestId}`,
    },
  });

  return updatedReq;
});
```

---

### 2. Neon Serverless Connection Pooling
- **Connection Limit:** Use pooled connection strings with SSL enabled (`sslmode=require`).
- **Prisma Client Singleton:** Maintain a single globally shared `PrismaClient` instance across Next.js Server Actions to avoid connection leakage during hot reloading:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### 3. Immutable Compliance Audit Trails
- Tables storing compliance records (`AuditLog`, `TimelineStep`) must follow append-only patterns.
- Never update or overwrite historical audit rows.

---

### 4. Query Optimization & Selective Projection
- Use `select` or indexed relational `include` to avoid over-fetching large relation graphs.
- Add composite indexes on frequent query filters: `[requesterId, status]`, `[approverName, status]`.
