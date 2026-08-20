# New Age — Access Management & Governance Portal

A full-stack enterprise access management portal built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **Prisma + SQLite**. Converts a single-file HTML prototype into a production-grade application.

## Quick Start

```bash
npm install && npm run dev
```

→ Open **http://localhost:3000**

> That's it. The database is auto-configured and seeded on first run.

---

## Demo Personas

Use the **persona switcher** in the top bar to switch between views instantly:

| Persona | Role | Email | Password |
|---|---|---|---|
| **Manvi Mehta** | Employee / Approver | manvi@newage.com | password123 |
| **Rahul Sharma** | IT Admin / Access Provider | rahul@newage.com | password123 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Custom CSS tokens |
| Database | SQLite via Prisma 6 |
| Runtime | Node.js 24 |
| Icons | Lucide React |

---

## Project Structure

```
new-age-portal/
├── app/
│   ├── layout.tsx          # Root layout (Geist font, metadata)
│   └── page.tsx            # Full portal page (client component)
├── components/
│   ├── StatusBadge.tsx     # Status → badge color map
│   ├── Timeline.tsx        # DONE/CURRENT/PENDING step renderer
│   ├── SlackNotifCard.tsx  # Slack block-kit interactive notification card
│   └── drawers/
│       ├── AccessDetailsDrawer.tsx
│       ├── RequestFormDrawer.tsx
│       ├── ExceptionFormDrawer.tsx
│       ├── RequestDetailDrawer.tsx
│       ├── ApprovalDetailDrawer.tsx
│       ├── AdminRequestDetailDrawer.tsx
│       ├── BoardConfigDrawer.tsx
│       └── AccessIdStatusDrawer.tsx
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   └── actions/
│       ├── catalog.ts      # getCatalog, updateAccessConfig, toggleAutomation
│       ├── requests.ts     # Full request lifecycle + autoExpireRequests
│       ├── access-id.ts    # Governance queue + duplicate check
│       ├── notifications.ts
│       └── audit.ts
├── prisma/
│   ├── schema.prisma       # Full schema (7 models)
│   └── seed.ts             # Seed: 2 users, 5 boards, 4 requests
└── PRD.md                  # Product Requirements Document
```

---

## Seed Data

Pre-loaded on first `npm run dev`:

**Access Catalog (5 items):**
- Monday.com / Marketing Operations Board — `AC-1042` — Automated
- Salesforce / Sales Operations — `AC-2077` — Manual
- Monday.com / Product Roadmap Board — *No Access ID* — Manual
- Zendesk / Customer Support Queue — `AC-3311` — Manual
- Monday.com / Finance Tracker — `AC-1590` — Automated

**Seed Requests (4 items):**
- `NAR-10469` — Zendesk (Completed)
- `NAR-10471` — Zendesk (Pending Approval → Manvi Mehta)
- `NAR-10475` — Finance Tracker (Completed, automated)
- `NAR-10478` — Salesforce (Pending Manual Provisioning → Rahul Sharma)

---

## Key Features

- **Access Directory** — Real-time search with live eligibility verification
- **Request Workflows** — Self, On-Behalf, Exception, Access ID Governed
- **Multi-stage Approval** — Automated and manual provisioning pipelines
- **Admin Dashboard** — My Boards, Provisioning Queue, Access ID Governance, Board Config, Audit Log
- **Part 4 Improvements** — Auto-expiry, Slack interactive cards, inline quick-decisions, preset rejection reasons

## Reset Database

```bash
npx prisma db push --force-reset && npx prisma db seed
```
