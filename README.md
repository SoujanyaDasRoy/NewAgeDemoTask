# 🛡️ New Age — Enterprise Access Governance & Provisioning Portal

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Turbopack](https://img.shields.io/badge/Turbopack-Sub--1s_Builds-blueviolet?style=flat)](https://turbo.build/)
[![Neon Cloud PostgreSQL](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=flat&logo=postgresql)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma_6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-48%2F48_Passing-brightgreen?style=flat)](https://github.com/SoujanyaDasRoy/NewAgeDemoTask)
[![Slack Integration](https://img.shields.io/badge/Slack-2--Way_Block_Kit-4A154B?style=flat&logo=slack)](https://slack.com/)

A production-ready, full-stack Enterprise Access Management & Governance Portal built with **Next.js 16 (App Router + Turbopack)**, **Neon Cloud PostgreSQL**, **Prisma ORM**, and a **Linear / Apple-grade design system**. 

Engineered for seamless multi-role access requests, real-time Slack 2-way webhook approvals, automated SCIM & manual IT fulfillment pipelines, SOC-2/ISO-27001 Access ID governance, and time-bound auto-expiry.

---

## 🌐 Live Production Deployment

- **Production URL:** [https://new-age-portal.vercel.app](https://new-age-portal.vercel.app)
- **GitHub Repository:** [https://github.com/SoujanyaDasRoy/NewAgeDemoTask](https://github.com/SoujanyaDasRoy/NewAgeDemoTask)

---

## 👥 Demo Personas & Credentials

| Persona | Role | Department | Email | Password | Quick Abilities |
|:---|:---|:---|:---|:---|:---|
| **Soujanya Das Roy** | **ADMIN** *(Board Admin)* | IT Support | `soujanyadasroy@gmail.com` | `password123` | Approves requests, manual IT fulfillment, toggles SCIM, issues Access IDs, exports SOC-2 CSV |
| **Manvi Mehta** | **EMPLOYEE** *(Product Owner)* | Product Team | `manvi@newage.com` | `password123` | Self & on-behalf requests, cross-team requests, team board approvals |
| **Rahul Verma** | **EMPLOYEE** *(Marketing Lead)* | Marketing Team | `rahul@newage.com` | `password123` | Marketing board ownership, cross-department sign-offs |

> 💡 **Tip:** Use the instant **Persona Switcher** in the top navbar or login page to switch between roles with a single click.

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js `20.x` or `24.x`
- npm `10.x+`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SoujanyaDasRoy/NewAgeDemoTask.git
cd NewAgeDemoTask/new-age-portal

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example or create .env:
DATABASE_URL="postgresql://user:password@ep-host.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET="newage-access-management-portal-secure-secret-key-32chars"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK_URL"

# 4. Generate Prisma Client & Run Seed
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# 5. Start Development Server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🧪 Comprehensive Automated Test Suite (48/48 PASS)

Run the full end-to-end backend and workflow test suite verifying all 13 enterprise suites:

```bash
npx tsx scripts/test-all-features.ts
```

```
=======================================================
🧪 STARTING FULL END-TO-END FEATURE TEST SUITE
=======================================================
  ✓ [PASS] Catalog > Returns all 8 access items
  ✓ [PASS] Requests > Self-request created successfully
  ✓ [PASS] Requests > On-behalf request created successfully
  ✓ [PASS] Automated Pipeline > Auto-transitioned to COMPLETED
  ✓ [PASS] Manual Pipeline > Manual request entered PENDING_MANUAL_PROVISIONING
  ✓ [PASS] Provisioning > Admin manually marked request as provisioned
  ✓ [PASS] On-Behalf Flow > Pauses at ACCESS_PROVISIONED awaiting closure
  ✓ [PASS] Rejections > Rejection reason saved correctly
  ✓ [PASS] Auto-Expiry > autoExpireRequests expired overdue requests
  ✓ [PASS] Access ID > Admin approved and issued AC-XXXX
  ✓ [PASS] Board Config > Toggled automation & saved to DB
  ✓ [PASS] Auth > Login, session switch, & duplicate signup rejection
  ✓ [PASS] Magic Link > Token dispatch & enumeration protection
  ✓ [PASS] Notification Prefs > 8 event toggles & quiet hours
=======================================================
🏁 TEST SUITE COMPLETE: 48 PASSED / 0 FAILED (Total: 48)
=======================================================
```

---

## 🏛️ Architecture & System Design

```mermaid
flowchart TB
    subgraph UI ["Frontend (Next.js 16 + React 19)"]
        Hero["Command Hero & Live Metrics"]
        Directory["Search & Live Catalog Grid"]
        Workspace["Side-by-Side Symmetric Workspace\n(My Requests | Approvals Queue)"]
        Drawers["High-Craft Drawers\n(Request, Review, Governance, IT Manual)"]
    end

    subgraph Actions ["Next.js Server Actions Layer (ACID Transactions)"]
        AuthAction["auth.ts (Better-Auth + Magic Link)"]
        ReqAction["requests.ts (Lifecycle & Batch Approvals)"]
        CatAction["catalog.ts (SCIM Toggles & Rules)"]
        GovAction["access-id.ts (Governance Queue & Keys)"]
        NotifEngine["notifications-engine.ts (Pref & Quiet Hours)"]
    end

    subgraph Integrations ["External Services"]
        NeonDB[("Neon Cloud PostgreSQL")]
        SlackAPI["Slack Incoming Webhook & Interactive Block Kit"]
    end

    UI --> Actions
    Actions --> NeonDB
    Actions --> SlackAPI
```

---

## 🚀 Part 4 — High-Impact Improvements

### 1. Real-Time 2-Way Interactive Slack Webhook & Decision Engine
- **What was identified:** Enterprise approvers experience context-switching fatigue when forced to open a web portal for simple routine approvals.
- **Why it matters:** Slashes mean time to approve (MTTA) from hours to under 30 seconds.
- **What was changed:** Built authentic Slack Block-Kit message dispatchers with interactive `[✓ Approve Access]` and `[✕ Reject]` buttons wired directly to the backend database with HMAC-SHA256 signature verification.
- **What was intentionally not done:** Did not force full Slack App Directory installation requiring tenant-level enterprise admin permissions; used webhook URLs for instant zero-friction deployment.

### 2. Time-Bound Access Auto-Expiry & 1-Click Extension Engine (SOC-2/ISO-27001)
- **What was identified:** Standing, indefinite access permissions lead to dangerous privilege creep and compliance audit failures.
- **Why it matters:** Enforces the principle of least privilege (PoLP) and satisfies SOC-2 / ISO-27001 access certification requirements.
- **What was changed:** Implemented duration presets (30d, 90d, 6mo, Permanent), automatic background expiry worker (`autoExpireRequests()`), and in-app 14-day extension workflow.
- **What was intentionally not done:** Avoided hard-deleting access records upon expiration; status transitions to `EXPIRED` while preserving immutable audit logs.

---

## 📄 License
MIT License. Built with precision for the New Age Access Governance Assessment.
