# 🤖 AI Usage & Human Judgment Report

**Candidate:** Soujanya Das Roy  
**Project:** New Age Access Governance & Provisioning Portal  
**Repository:** [https://github.com/SoujanyaDasRoy/NewAgeDemoTask](https://github.com/SoujanyaDasRoy/NewAgeDemoTask)  
**Live Deployment:** [https://new-age-demo.vercel.app](https://new-age-demo.vercel.app)  

---

## 1. 🛠️ AI Tools Used

| Tool | Primary Purpose & Area of Application |
|:---|:---|
| **Antigravity (Google DeepMind / Gemini 2.5 Pro)** | Full-stack architecture, subagent orchestration, Neon PostgreSQL transaction design, and automated 48-suite test pipeline construction. |
| **Claude 3.5 Sonnet** | Interactive Slack Block-Kit JSON formatting, Next.js 16 App Router Suspense optimization, and typography fine-tuning. |

---

## 2. 💬 Important Prompts & Directives

Here are the exact high-impact prompts used to steer the AI away from generic outputs toward production-grade code:

1. **Anti-AI-Slop & Visual Taste Directive:**
   > *"Eliminate all AI slop: no floating raw zeros, no mismatched pastel cards, no scary warning triangles on standard cross-team requests. Enforce a clean Linear/Apple obsidian palette with precise typography and subtle 1px borders."*

2. **Database ACID Resilience:**
   > *"Wrap all database mutations in Prisma `$transaction` blocks so audit logs, notifications, timeline steps, and access request updates succeed or fail atomically together. No partial writes."*

3. **Enterprise Terminology & Human Copy:**
   > *"Replace confusing jargon like 'Exception Warning' with calm, professional language: '🏢 Cross-Department Resource · Managed by Marketing Team · Routes to Rahul Verma for approval'."*

4. **Security & Session Hardening:**
   > *"Enforce duplicate account signup rejection with friendly error messaging. Implement constant-time cryptographic HMAC-SHA256 signature verification (`crypto.timingSafeEqual`) on all incoming Slack webhooks."*

---

## 3. ⚙️ What the AI Generated

- **Initial Scaffolding:** Base Prisma schema definitions (`schema.prisma`) and initial database migrations.
- **CSS Design Tokens:** CSS variable palette structure (`[data-theme="dark"]` and `:root`).
- **CRUD Server Action Stubs:** Initial server action outlines for `submitRequest`, `approveRequest`, and `getNotifications`.
- **Test Matrix Skeleton:** Initial structure for the 13 feature test suites.

---

## 4. ✍️ What You Edited & Implemented Manually

1. **Session Context Abstraction for CLI Tests (`lib/actions/auth.ts`):**
   - *Problem:* Next.js App Router's `cookies()` function throws fatal runtime errors when executed outside an active HTTP request context (such as running `npx tsx scripts/test-all-features.ts` from terminal).
   - *Manual Solution:* Engineered a safe test session abstraction (`setSessionForTesting`) that injects mock session context in non-production environments, enabling all 48 test suites to verify live PostgreSQL database state.

2. **Refactored Terminology & Removed Alarming Alerts:**
   - *Problem:* The AI generated alarming amber warning banners, exclamation icons, and scary *"Exception Alarm"* text whenever an employee selected an out-of-department tool.
   - *Manual Solution:* Rebuilt the entire drawer hierarchy with calm, neutral slate cards (`Building2` and `Users` icons) and clear routing explanations.

3. **Resolved Windows High-DPI Button Text Wrapping:**
   - *Problem:* On Windows high-DPI displays (125%–150% scaling), catalog action buttons wrapped text into two awkward lines (`Request` / `Access`).
   - *Manual Solution:* Refactored button design tokens with `white-space: nowrap`, fixed min-widths, and standardized flex alignment across catalog rows.

4. **Slack Cryptographic HMAC-SHA256 Verification (`lib/slack.ts`):**
   - *Problem:* The initial AI draft used a basic string equality comparison (`signature === calculatedSignature`), which is vulnerable to timing attacks.
   - *Manual Solution:* Rewrote verification using `crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))` with replay-attack protection (5-minute timestamp window check).

---

## 5. 🧠 Where Human Judgment Changed the AI Output

| AI Suggestion / Output | Human Architectural Decision | Rationale |
|:---|:---|:---|
| **Client-Side Polling:** AI suggested setting up a 3-second `setInterval` to check for approval updates. | **0ms Optimistic UI + Server Actions:** Overrode with immediate local state transitions and background ACID persistence. | Polling causes unnecessary server load and database connection pool exhaustion on serverless Neon Postgres. |
| **OAuth Slack App Directory Install:** AI proposed building a full multi-tenant Slack App with OAuth 2.0 flow. | **Incoming Webhook + Interactive Endpoint:** Architected with standard webhooks and interactive Block-Kit endpoints. | Enterprise Slack App directory installs require global IT workspace admin rights. Webhooks allow instant 60-second setup. |
| **Hard-Deleting Overdue Access:** AI suggested `prisma.accessRequest.deleteMany()` for auto-expiry. | **State Transition (`EXPIRED`) + Audit Ledger:** Overrode with non-destructive status updates and permanent audit logging. | Deleting records violates SOC-2 (CC6.1) and ISO-27001 audit trail retention requirements. |
| **Pastel Background Gradients:** AI generated multiple colorful background blobs. | **Pure Minimal Obsidian (`#0C0D0E`):** Overrode with monochromatic graphite surfaces and high-contrast text. | Enterprise tools (Linear, Vercel, Stripe) prioritize focus, scannability, and zero cognitive fatigue. |
