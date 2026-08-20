# Part 4 Report — High-Impact Improvements

## Overview

This document describes the four improvements made beyond the core prototype replication. Each improvement identifies a real compliance or UX problem from the prototype, describes the implementation approach, and documents intentional tradeoffs.

---

## Improvement 1: Time-Bound (Auto-Expiring) Access Lifecycle & Extension Flow

### Problem Identified
In the original prototype, temporary exception access (e.g. cross-team project collaboration) had no mechanism to auto-revoke or even flag expiry. Once an exception was granted, it remained `COMPLETED` indefinitely — creating security compliance liability and unnecessary SaaS license costs for access no longer needed.

Evidence in prototype: the `exceptionReason`, `requiredUntil`, and `urgency` fields existed in the state object but were never acted upon after provisioning.

### Implementation
- **`autoExpireRequests()` server action** (`lib/actions/requests.ts`): Runs on every page load. Scans all non-terminal requests where `requiredUntil < today` and sets `status = "EXPIRED"`, recording a `"Access auto-expired"` audit log entry with actor `"System"`.
- **Expiry banner in `RequestDetailDrawer`**: Shows a color-coded countdown (`Access expires in X days` / `Access Expired`) for any request with `requiredUntil` set.
- **One-click `+14 Days` extension button**: Submits a `requestExtension()` action that advances the expiry date and re-opens the request as `PENDING_EXCEPTION_APPROVAL` for manager review.

### How to Test
1. Open any request detail from My Requests
2. Exception requests will show the expiry banner with countdown
3. Click "+14 Days" — the status changes to `Pending Exception Approval` and a timeline entry is added
4. To test auto-expiry: open `prisma/seed.ts`, change a request's `requiredUntil` to a past date, re-seed (`npm run seed`), then reload the page — the status updates to `EXPIRED`

### Intentional Tradeoffs
- **No external SCIM/LDAP revocation**: Expiry marks the internal record as `EXPIRED` and logs it, but does not make external API calls to revoke live tool access. This keeps the system self-contained and testable without external webhook infrastructure.
- **Page-load check instead of cron**: Uses a server action called on every `loadData()` rather than a separate cron job. Sufficient for the demo and avoids the need for a background job scheduler.

---

## Improvement 2: Inline Quick-Decision Buttons on Approval Cards

### Problem Identified
In the original prototype, every approval decision required opening a full drawer, reading the full request detail, and then clicking Approve/Reject. For high-volume approvers reviewing 10+ routine requests daily, this creates cognitive fatigue and slows turnaround time significantly.

Evidence in prototype: the approval card in `renderApprovalsSection` was a simple clickable row with no in-place action — every decision required a full drawer open-close cycle.

### Implementation
- **Inline Approve + Reject buttons** directly on each approval card row in the "Pending Approvals" tile (both Employee and Admin views)
- **Approve** triggers the full state machine immediately with a single click
- **Reject** uses the same modal with preset reason templates (see Improvement 3) but can also be triggered from the card with a default reason
- **Review button** still opens the full `ApprovalDetailDrawer` for cases where more context is needed before deciding

### How to Test
1. Switch to Employee View (Manvi Mehta)
2. NAR-10471 (Zendesk, from Ananya Rao) appears in Pending Approvals
3. Click the inline **Approve** button directly — no drawer needed
4. The card disappears and the request moves to `Pending Manual Provisioning`

### Intentional Tradeoffs
- The inline Reject button uses a hardcoded default reason ("Rejected by approver") for true 1-click rejection. For a custom reason, the "Review →" button opens the full modal with preset templates — balancing speed with control.

---

## Improvement 3: Pre-Set Rejection Reason Templates

### Problem Identified
When rejecting requests in the prototype, approvers had to type a free-text rejection reason from scratch every time. This introduced inconsistency in rejection language, slowed down decisions, and made audit logs harder to aggregate and analyze.

### Implementation
- **5 preset rejection reason templates** in `ApprovalDetailDrawer`:
  1. Duplicate access request
  2. Role / department mismatch for requested permission
  3. Requires additional security & governance sign-off
  4. Insufficient business justification provided
  5. Temporary project duration expired
- Approver selects from a dropdown, optionally adds a custom note, and confirms
- The reason is stored in `rejectionReason` on the request and shown in the requester's `RequestDetailDrawer` with a red callout box
- **In `SlackNotifCard`** (see Improvement 4): 3 quick-reject chips (`Duplicate`, `Role Mismatch`, `Needs Director Sign-off`) allow rejection with a single click directly from the notification panel

### How to Test
1. In Employee View, click **Review** on a pending approval card
2. Click **Reject...** — the modal opens with the preset dropdown
3. Select a reason, optionally add a note, confirm
4. Open the rejected request's detail — the rejection reason is displayed

### Intentional Tradeoffs
- Templates are hardcoded rather than admin-configurable to keep the scope focused. In production, these would be stored in a `RejectionTemplate` table and editable by admins.

---

## Improvement 4: Simulated Slack Interactive Decision Cards

### Problem Identified
The original prototype had a notification system but all notifications were passive read-only text. In enterprise access management, approval velocity is critical — approvers are often in Slack, not the portal, and context-switching to approve a routine request adds unnecessary friction.

Evidence in prototype: `renderHeader()` included `channel: "slack"` on notifications but had no distinct Slack-like rendering — just a generic bell icon with the same UI as portal notifications.

### Implementation
- **`SlackNotifCard` component** (`components/SlackNotifCard.tsx`): A visually distinct card mimicking Slack's block-kit message format with:
  - Dark header bar showing channel name (`#access-requests`) and workspace (`New Age Access Bot`)
  - Blue left-border accent block with request details (ID, requester, type, justification preview)
  - **Approve** button → instantly approves and shows a green "Approved via Slack" confirmation state
  - **Reject ▾** dropdown → expands 3 quick-reject reason chips → selecting one rejects and shows red "Rejected via Slack" state
- **Automatic detection**: When the notification panel renders, it inspects each Slack-channel notification for a matching pending request (by request ID in the text + status check + approver match). If found, it renders `SlackNotifCard` instead of a plain text row.

### How to Test
1. Switch to **Employee View** (Manvi Mehta — she is the approver for Zendesk requests)
2. Click the notification bell — NAR-10471 should appear as a Slack card
3. Click **Approve** — card shows "Approved via Slack", panel closes, request moves forward
4. Re-seed the DB to restore the request: `npm run seed`
5. Try **Reject ▾** → select "Duplicate request" → card shows "Rejected via Slack"

### Intentional Tradeoffs
- **No real Slack webhook**: The Slack card is rendered inside the portal's notification panel. Actual Slack integration would require a Bolt app, OAuth, and webhook infrastructure not testable by evaluators without setup. This approach gives full visual and functional fidelity of the concept.
- **Session-scoped confirmation state**: After approving/rejecting via the card, the confirmed state is held in local React state (not persisted separately). The underlying request status IS updated in the DB.
