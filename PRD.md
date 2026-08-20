# Product Requirements Document (PRD)
# Project: New Age Enterprise Access Management & Governance Portal
# Target Stack: Next.js (App Router) + TypeScript + TailwindCSS + Prisma (SQLite / PostgreSQL)
# Evaluation Scope: 48-Hour Full-Stack Intern Task

---

## 1. Executive Summary & Objective
Convert the provided single-file prototype (`access-management.html`) into a robust, functional, production-ready full-stack application. The system serves as an enterprise Access Management & Governance Portal that empowers employees to discover tools, request self or delegated access, request out-of-policy exceptions, and track live request lifecycles. Meanwhile, Board Admins and Access Providers review requests, provision access (automated vs. manual), configure board policies, and audit system activities.

---

## 2. Personas & Authorization Matrix

### 2.1 Personas & Roles
1. **Employee / Requester (`employee`)**
   - **Default Demo Persona:** `Manvi Mehta` (Project Manager, Department: `Product Team`, Initials: `MM`, Tone: `#2563EB`)
   - **Capabilities:**
     - Search & browse available access items in the Access Directory.
     - View detailed access metadata (approver, backup approver, provider, category, eligibility).
     - Request access for **Self**.
     - Request access **On Behalf Of** another employee (from pre-configured directory: `Vanshika Sharma`, `Rohit Malhotra`, `Ananya Rao`, `Kabir Singh`, `Priya Menon`).
     - Request **Access Exception** when user is not part of the `eligibleGroups`.
     - Request **Access ID Creation** when a board does not yet have an issued `AC-XXXX` code.
     - Track active and historical requests in "My Requests" with visual step-by-step timelines.
     - Close completed on-behalf requests after beneficiary confirms access.
2. **Board Admin / Access Provider (`admin`)**
   - **Default Demo Persona:** `Rahul Sharma` (IT Support · Access Provider / Board Admin, Department: `IT Support`, Initials: `RS`, Tone: `#334155`)
   - **Capabilities:**
     - All employee capabilities.
     - View and manage "My Boards / Access" administered by the provider.
     - Open "Manage Configuration" drawer to edit Primary Approver, Backup Approver, Access Provider, and toggle automated provisioning switch.
     - Execute **Manual Provisioning** from the "Requests Requiring Admin Action" queue.
     - Review **Access ID Requests** in the governance queue (with duplicate check verification) and issue new `AC-XXXX` codes.
     - View chronological **Audit Log** of governed actions across the company.
3. **Approver / Team Lead**
   - **Profiles:** `Neha Kapoor` (Sales Team), `Manvi Mehta` (Product Team), `Muskan Kohli` (Finance Team), `Sandeep Verma` (Product Team).
   - **Capabilities:** Review pending requests in "Approvals Requiring My Action", approve or reject with feedback reasons.

---

## 3. Data Models & Database Schema (Prisma)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  EMPLOYEE
  ADMIN
}

enum AccessCategory {
  BOARD
  APPLICATION
}

enum Urgency {
  STANDARD
  URGENT
  CRITICAL
}

enum RequestStatus {
  PENDING_APPROVAL
  PENDING_EXCEPTION_APPROVAL
  APPROVED
  PROVISIONING
  PENDING_MANUAL_PROVISIONING
  ACCESS_PROVISIONED
  COMPLETED
  REJECTED
  EXPIRED
}

enum StepState {
  DONE
  CURRENT
  PENDING
}

model User {
  id           String          @id @default(cuid())
  name         String
  email        String          @unique
  passwordHash String?
  role         Role            @default(EMPLOYEE)
  department   String
  initials     String
  avatarTone   String          @default("#2563EB")
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  
  requests      AccessRequest[] @relation("Requester")
  auditLogs     AuditLog[]
  notifications Notification[]
}

model AccessItem {
  id              String          @id @default(cuid())
  tool            String          // e.g. "Monday.com", "Salesforce", "Zendesk"
  name            String          // e.g. "Marketing Operations Board"
  category        AccessCategory  @default(BOARD)
  description     String
  accessId        String?         // e.g. "AC-1042" (null if not yet created)
  creator         String
  group           String          // Owning department, e.g. "Marketing Team"
  eligibleGroups  String          // JSON array string: ["Marketing Team", "Product Team"]
  approver        String          // Name of primary approver
  backupApprover  String          // Name of backup approver
  provider        String          // Name of IT access provider
  automation      Boolean         @default(false)
  requestType     String          @default("Board Access Request")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  requests        AccessRequest[]
  idQueueItems    AccessIdQueue[]
}

model AccessRequest {
  id              String          @id // e.g. "NAR-10481"
  accessItemId    String
  accessItem      AccessItem      @relation(fields: [accessItemId], references: [id])
  accessLabel     String          // Cached label: "Monday.com – Marketing Operations Board"
  requesterId     String
  requester       User            @relation("Requester", fields: [requesterId], references: [id])
  beneficiaryName String          // Name of person receiving access
  onBehalf        Boolean         @default(false)
  isException     Boolean         @default(false)
  exceptionReason String?
  requiredUntil   String?         // Expiry date string (YYYY-MM-DD)
  urgency         Urgency         @default(STANDARD)
  justification   String
  status          RequestStatus   @default(PENDING_APPROVAL)
  approverName    String
  providerName    String
  automation      Boolean         @default(false)
  rejectionReason String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  timeline        TimelineStep[]
}

model TimelineStep {
  id         String        @id @default(cuid())
  requestId  String
  request    AccessRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  label      String        // e.g. "Request Submitted", "Approved", "Completed"
  actor      String        // e.g. "Manvi Mehta", "Automated Provisioning", "System"
  timestamp  String        // Formatted date string
  state      StepState     // DONE, CURRENT, PENDING
  orderIndex Int
}

model AccessIdQueue {
  id           String     @id @default(cuid()) // e.g. "idq-1"
  accessItemId String
  accessItem   AccessItem @relation(fields: [accessItemId], references: [id])
  status       String     @default("Pending Governance Review")
  requestedBy  String
  requestedTs  DateTime   @default(now())
  approvedTs   DateTime?
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String   // e.g. "Request created", "Request approved", "Automation enabled"
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  userName  String   // Display name
  detail    String
  createdAt DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  role      String   // "employee" | "admin"
  text      String
  channel   String   @default("portal") // "portal" | "slack"
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 4. Initial Seed Data Matrix

### 4.1 Seed Access Items (Catalog)
| ID | Tool | Name | Category | Access ID | Group | Eligible Groups | Approver | Backup | Provider | Automation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `acc-1` | Monday.com | Marketing Operations Board | Board | AC-1042 | Marketing Team | Marketing Team, Product Team | Manvi Mehta | Sarah Thomas | Rahul Sharma | Yes (True) |
| `acc-2` | Salesforce | Sales Operations | Application | AC-2077 | Sales Team | Sales Team, Product Team | Neha Kapoor | Arjun Mehta | Rahul Sharma | No (False) |
| `acc-3` | Monday.com | Product Roadmap Board | Board | *null* | Product Team | Product Team | Sandeep Verma | Apoorva Singh | Rahul Sharma | No (False) |
| `acc-4` | Zendesk | Customer Support Queue | Application | AC-3311 | Support Team | Support Team | Manvi Mehta | Christian Fernandes | Varsha Nair | No (False) |
| `acc-5` | Monday.com | Finance Tracker | Board | AC-1590 | Finance Team | Finance Team | Muskan Kohli | Nivi Rao | Nivi Rao | Yes (True) |

### 4.2 Seed Requests
- **`NAR-10469`**: Zendesk – Customer Support Queue | Requester: `Rahul Sharma` | Status: `Completed` | Automation: `false`
- **`NAR-10471`**: Zendesk – Customer Support Queue | Requester: `Ananya Rao` | Status: `Pending Approval` | Approver: `Manvi Mehta` | Automation: `false`
- **`NAR-10475`**: Monday.com – Finance Tracker | Requester: `Manvi Mehta` | Status: `Completed` | Automation: `true`
- **`NAR-10478`**: Salesforce – Sales Operations | Requester: `Manvi Mehta` | Status: `Pending Manual Provisioning` | Approver: `Neha Kapoor` | Provider: `Rahul Sharma`

---

## 5. Functional Requirements & Core Workflows

### 5.1 Authentication & Multi-Role View Switcher
- Persistent session authentication (e.g. JWT cookies / NextAuth).
- **Instant Persona Switcher:** Top bar contains a segmented toggle between **Employee View** (`Manvi Mehta`) and **Board Admin View** (`Rahul Sharma`) to permit effortless testing of different permission scopes.

### 5.2 Access Directory & Real-Time Search
- Real-time search by tool, board/app name, department group, or category.
- **Dynamic Eligibility Verification:**
  - If requester's department is in `eligibleGroups` $\rightarrow$ Green badge `Eligible` + `Request Access` button.
  - If requester's department is NOT in `eligibleGroups` $\rightarrow$ Gray badge `Not eligible` + Amber `Request Access Exception` button.
  - If `accessId` is missing $\rightarrow$ Grayed button `Access ID required first` + `Request Access ID Creation` button.

### 5.3 Request Submission Workflows
1. **Self-Request (`onBehalf = false`):** Captures business justification.
2. **On-Behalf Request (`onBehalf = true`):** Selects recipient from employee roster (`Vanshika Sharma`, `Rohit Malhotra`, `Ananya Rao`, `Kabir Singh`, `Priya Menon`) and captures justification.
3. **Exception Request (`isException = true`):** Captures exception reason, target duration (`requiredUntil`), urgency rating (`Standard`, `Urgent`, `Critical`), and justification.
4. **Access ID Governed Request:** Submits request to Board Admin queue. Performs duplicate check before issuing new `AC-XXXX`.

### 5.4 Multi-Stage Approval & Decision Engine
- Approvers view requests awaiting their action in a dedicated amber-tinted tile.
- Approver can:
  - **Approve:** Automatically routes into automated or manual provisioning pipeline.
  - **Reject:** Prompts for rejection reason and updates timeline with rejection timestamp and reason.

### 5.5 Provisioning Pipeline
- **Automated Pipeline (`automation = true`):**
  `Request Submitted` $\rightarrow$ `Approved` $\rightarrow$ `Access Automatically Provisioned` $\rightarrow$ `Completed`.
- **Manual Pipeline (`automation = false`):**
  `Request Submitted` $\rightarrow$ `Approved` $\rightarrow$ `Pending Manual Provisioning` $\rightarrow$ Admin clicks *"Mark as Provisioned"* $\rightarrow$ `Completed`.
- **On-Behalf Request Closure:**
  On-behalf requests pause at `Access Provisioned` until the requester marks the handover as closed (`Request Closed`).

### 5.6 Admin Governance & Board Configuration
- **My Boards Tile:** Summarizes all boards owned by the active provider.
- **Manage Configuration Drawer:** Live updates for primary approver, backup approver, provider, and automation toggle.
- **Access ID Review Drawer:** Admin verifies duplicate check and generates new `AC-XXXX` IDs.
- **Audit Log Feed:** Logs every critical action (requests created, approvals, rejections, manual provisioning, config changes) with timestamp and user.

---

## 6. Part 4: High-Impact Improvements

### 6.1 Improvement #1: Time-Bound (Auto-Expiring) Access Lifecycle & Extension Flow
- **Identified Problem:** Temporary exception access often remains open indefinitely once projects conclude, creating security compliance liabilities and unnecessary SaaS license costs.
- **Implementation:**
  - Automated check on `requiredUntil` dates marking expired requests as `Expired`.
  - Expiry banner indicator in the request details drawer (*"Access expires in X days"*).
  - One-click *"Request 14-Day Extension"* button submitting an extension for manager re-approval.
- **Intentional Tradeoff / Boundary:** Avoids complex external SCIM API dependencies, maintaining a reliable, testable internal state machine.

### 6.2 Improvement #2: One-Click Quick Decision Slack Cards & Pre-Set Rejection Reasons
- **Identified Problem:** Opening modal drawers for every routine request creates cognitive fatigue for approvers and delays turnaround times.
- **Implementation:**
  - Direct quick-action buttons on approval cards (1-click Approve, dropdown Reject with templates: *"Duplicate Request"*, *"Requires Director Sign-off"*, *"Role Mismatch"*).
  - Simulated interactive Slack notification card inside the notification drawer allowing direct decision-making.
- **Intentional Tradeoff / Boundary:** Keeps Slack webhooks simulated internally to ensure examiners can test without external webhook setup.

---

## 7. UI / Styling Tokens (1:1 Prototype Fidelity)

- **Colors:**
  - Navy: `#0F1B33` | Navy Soft: `#16233F`
  - Accent: `#2F6FED` | Accent Dark: `#1E4FC7`
  - Background: `#F5F6F8` | Card Border: `#E5E7EB` | Primary Text: `#111827`
  - Muted: `#6B7280` | Muted Light: `#9CA3AF`
- **Component Radii & Dimensions:**
  - Container Radius: `12px` (`var(--radius-container)`)
  - Control Radius: `9px` (`var(--radius-control)`)
  - Control Height: `40px` (`var(--ctrl-h)`)
- **Status Badge Map:**
  - `Pending Approval` / `Pending Exception Approval` $\rightarrow$ Amber (`badge-amber`)
  - `Approved` / `Provisioning` $\rightarrow$ Blue (`badge-blue`)
  - `Pending Manual Provisioning` $\rightarrow$ Orange (`badge-orange`)
  - `Access Provisioned` $\rightarrow$ Teal (`badge-teal`)
  - `Completed` $\rightarrow$ Green (`badge-green`)
  - `Rejected` $\rightarrow$ Red (`badge-red`)
  - `Pending Governance Review` $\rightarrow$ Violet (`badge-violet`)

---

## 8. REST / Server Action API Routes

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/catalog` | `GET` | Retrieve catalog items with computed eligibility |
| `/api/catalog/[id]/config` | `PATCH` | Update approvers, provider, or automation flag |
| `/api/requests` | `GET` | List requests filtered by user / role |
| `/api/requests` | `POST` | Submit new access / exception request |
| `/api/requests/[id]/approve` | `POST` | Approve request (advances automated or manual pipeline) |
| `/api/requests/[id]/reject` | `POST` | Reject request with reason |
| `/api/requests/[id]/provision` | `POST` | Admin completes manual provisioning |
| `/api/requests/[id]/close` | `POST` | Requester marks on-behalf request as closed |
| `/api/access-id/request` | `POST` | Submit Access ID creation request |
| `/api/access-id/[id]/approve` | `POST` | Admin approves and generates `AC-XXXX` |
| `/api/audit-logs` | `GET` | Fetch chronological audit trail |
| `/api/notifications` | `GET` | Fetch notifications & unread counts |
| `/api/notifications/mark-read` | `POST` | Mark notifications as read |

---

## 9. Submission Deliverables
- [x] Complete PRD document (`PRD.md`)
- [ ] Working GitHub Repository with full source code
- [ ] Live Vercel Deployment Link
- [ ] `README.md` with 1-step local setup instructions
- [ ] `PART4_REPORT.md` (Part 4 Improvements & Tradeoffs)
- [ ] `AI_USAGE.md` (AI prompts, workflows, and manual engineering edits)
- [ ] 5–10 minute Loom video walkthrough
