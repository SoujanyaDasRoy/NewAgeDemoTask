# 🎬 Complete 7-Minute Loom Walkthrough Script

**Candidate:** Soujanya Das Roy  
**Live URL:** [https://new-age-demo.vercel.app](https://new-age-demo.vercel.app)  
**Target Time:** 6:30 – 7:30 minutes  

---

### Step 1: Introduction & Architecture Overview (0:00 – 0:35)
- **On Screen:** Login page (`/login`).
- **What to Say:**
  > *"Hi everyone, my name is Soujanya Das Roy. Today, I'm excited to present the New Age Access Governance and Provisioning Portal. We built this as a full-stack, enterprise-grade application powered by Next.js 16 with Turbopack, Neon Cloud PostgreSQL, Prisma ORM with strict ACID transactions, and a custom Linear-inspired design system. In this walkthrough, I’ll demonstrate an end-to-end access request lifecycle, role-based workflows, automated versus manual fulfillment pipelines, and our two high-impact architecture improvements."*

---

### Step 2: Employee Sign-In & Command Hub (0:35 – 1:10)
- **On Screen:** Click the **`📊 Priya (Product)`** 1-click demo button $\rightarrow$ click **`Sign In to Portal →`**.
- **What to Say:**
  > *"Let's sign in as an employee: Priya Sharma from the Product Team. On the main dashboard, we see our functional Command Hub with a live policy compliance badge, real-time contextual reminders, and an interactive 4-metric strip summarizing enterprise tools, active requests, pending items, and governed Access IDs."*

---

### Step 3: Catalog Search, Eligibility & Details (1:10 – 1:45)
- **On Screen:** Click the search bar (or press `⌘K`), type `"Salesforce"`, then click **`Info`** on the Salesforce CRM card.
- **What to Say:**
  > *"In our directory, I'll search for 'Salesforce'. Notice how the catalog filters in real time. Clicking 'Info' opens our Access Details Drawer. We can see that Salesforce is managed by the Sales Team, requires manual IT provisioning, and is bound to SOC-2 Access ID AC-4350. Because Priya is in Product, this routes for standard cross-department review."*
- **On Screen:** Close the drawer.

---

### Step 4: Submit Time-Bound Request (1:45 – 2:25)
- **On Screen:** Click **`+ Request Access`** on Salesforce $\rightarrow$ select **`For Myself`** $\rightarrow$ select **`90 Days`** duration pill $\rightarrow$ click preset chip **`Daily Sprint & Project Delivery`** $\rightarrow$ click **`Submit Request`**.
- **What to Say:**
  > *"Let's submit a request. Notice our clean, non-alarming form: it shows a calm routing note that this routes to Soujanya for approval. We select 'For Myself', choose a time-bound 90-day duration, standard urgency, and select a one-click business justification preset. Now we submit the request."*
- **On Screen:** Show confirmation screen with Request ID (`NAR-XXXXXX`) $\rightarrow$ click **`Done`**.

---

### Step 5: "My Requests" Workspace & SLA Timeline (2:25 – 2:50)
- **On Screen:** Scroll down to the left card **My Requests** $\rightarrow$ point out the pending ticket and click it to open `RequestDetailDrawer`.
- **What to Say:**
  > *"Instantly in our My Requests workspace, our new ticket appears in 'Pending Approval' status with an active SLA countdown timer. Opening the ticket reveals the chronological timeline step-by-step: Request Submitted with exact timestamps and actor tracking."*
- **On Screen:** Close drawer.

---

### Step 6: Switch to Admin & Instant Approval (2:50 – 3:45)
- **On Screen:** Top-right profile menu $\rightarrow$ switch to **`Soujanya Das Roy (Admin)`**.
- **What to Say:**
  > *"Now let's switch to the Board Admin and IT Access Provider, Soujanya Das Roy. The UI immediately unlocks the Admin Governance toolbar and manual provisioning queue. On the right card, 'Approvals Requiring Action', we see Priya's pending request. We can use multi-select batch approvals, or open the ticket to review the justification and target expiration date. I'll click 'Approve Access'."*
- **On Screen:** Click **`✓ Approve Access`** $\rightarrow$ point out the emerald green toast in the bottom-right corner and the instant 0ms optimistic UI update!

---

### Step 7: Manual IT Provisioning Queue (3:45 – 4:25)
- **On Screen:** Scroll down to the **Board Admin & Governance** section $\rightarrow$ show the **Manual Provisioning Queue** card.
- **What to Say:**
  > *"Here is where our architecture distinguishes between automated and manual provisioning: For automated tools like Monday.com, SCIM webhooks provision access instantly upon approval. But for manual tools like Salesforce, approving routes the ticket directly to IT Support in the Manual Provisioning Queue in 'Pending Manual Provisioning' status. Once IT provisions the account, the admin clicks 'Mark Provisioned'."*
- **On Screen:** Click **`Mark Provisioned`** $\rightarrow$ show the card clearing to empty and the green confirmation toast at the bottom right.

---

### Step 8: Return to Employee & Completed Timeline (4:25 – 5:00)
- **On Screen:** Top-right profile menu $\rightarrow$ switch back to **`Priya Sharma`** $\rightarrow$ in **My Requests**, open the completed Salesforce ticket.
- **What to Say:**
  > *"Switching back to Priya, the request is now in green 'Completed' status. Opening the ticket displays the complete immutable timeline: Request Created $\rightarrow$ Approved by Admin $\rightarrow$ Manually Provisioned by IT. The full journey is persisted in our PostgreSQL database."*

---

### Step 9: Improvement #1 — 2-Way Slack Webhooks (5:00 – 5:50)
- **On Screen:** Top-right profile menu $\rightarrow$ click **`💬 Slack Integration Preview`** $\rightarrow$ show the Slack Block-Kit card and click **`🚀 Dispatch Live Webhook`**. Open your Slack channel to show the live card!
- **What to Say:**
  > *"Now let me highlight our two high-impact architecture improvements. First: Our Real-Time 2-Way Slack Webhook Integration. Instead of forcing approvers into the web portal, every request dispatches an interactive 8-field Block-Kit card to Slack with direct 'Approve' and 'Reject' buttons and localized timestamps. Approvals in Slack execute an atomic backend transaction secured with cryptographic HMAC-SHA256 signature verification."*

---

### Step 10: Improvement #2 — Auto-Expiry & 14-Day Extension (5:50 – 6:35)
- **On Screen:** In **My Requests**, open any active ticket $\rightarrow$ point out the **`⏳ Required Until`** date and the **`+ Request 14-Day Extension`** button.
- **What to Say:**
  > *"Second: Our SOC-2 & ISO-27001 Time-Bound Auto-Expiry Engine. To eliminate privilege creep, every permission is bound to an expiration date. Our background worker auto-expires overdue access to revoke permissions while preserving audit history. Requesters can also request a 1-click 14-day extension before expiry for auditable manager renewal."*

---

### Step 11: Live Compliance Audit Trail & 48/48 Test Suite Wrap-Up (6:35 – 7:15)
- **On Screen:** Top-right profile menu $\rightarrow$ click **`🛡️ Live Audit Trail Stream`** $\rightarrow$ show the 190+ chronological ledger entries with category pills (Approvals, Auto, Roles) $\rightarrow$ click **`Export CSV`**. Show terminal with `48 PASSED / 0 FAILED`.
- **What to Say:**
  > *"Finally, we maintain an immutable Audit Trail Stream with category filtering and 1-click SOC-2 compliance CSV exports. Our automated test suite features 48 passing tests covering 100% of workflows, SCIM pipelines, and security edge cases. The code is fully documented and deployed live on Vercel at new-age-demo.vercel.app. Thank you!"*
