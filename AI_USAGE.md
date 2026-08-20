# AI Usage Disclosure

## Summary

This project was built using **Antigravity (AI coding assistant)** as a pair-programming partner for the majority of the implementation. This document is a transparent disclosure of AI involvement, the nature of the prompts used, and the manual engineering decisions made.

---

## AI-Assisted Components

### Scaffolding & Configuration
- **What AI did**: Generated `prisma/schema.prisma` based on the PRD data model requirements, configured `prisma/seed.ts` with seed data extracted from the prototype HTML, set up the `package.json` prisma seed command, and resolved Prisma v7 vs v6 compatibility issues (`url` in schema file no longer supported in v7 — AI identified this and downgraded to v6).
- **Manual review**: Verified all model relationships, enum values, and seed data match the exact prototype state (NAR IDs, dates, approver names, status values).

### Server Actions (`lib/actions/`)
- **What AI did**: Generated the full set of server actions: `getCatalog`, `submitRequest`, `submitExceptionRequest`, `approveRequest`, `rejectRequest`, `provisionManually`, `closeRequestAction`, `requestExtension`, `autoExpireRequests`, `checkDuplicateAccessId`, `approveAccessId`, `getNotifications`, `getAuditLogs`.
- **Manual review**: Carefully reviewed all state machine logic (automated vs. manual pipeline branching, on-behalf closure flow, timeline step generation), corrected missing `requiredUntil` date filtering (JS-side filter for SQLite string comparisons), and verified audit log entries match the prototype's behavior exactly.

### UI Components
- **What AI did**: Generated boilerplate for all 8 drawer components, `Timeline.tsx`, `StatusBadge.tsx`, `SlackNotifCard.tsx`, and the full `app/page.tsx` portal page.
- **Manual review**: Reviewed all JSX for correctness, ensured the CSS class names matched `globals.css` (e.g. `badge-amber`, `card-tinted-orange`, `drawer`, `btn-primary`), verified the drawer open/close lifecycle, corrected the `onBehalf` closure flow in `RequestDetailDrawer`, and tuned the `SlackNotifCard` detection logic.

### CSS Design System
- **What AI did**: Translated the CSS variables from `access-management.html` (`:root` block, badge classes, timeline, drawer, toast, notification panel) into the new `app/globals.css`.
- **Manual review**: Side-by-side comparison with the prototype to ensure pixel-accurate token values (`--navy: #0F1B33`, `--accent: #2F6FED`, all 9 badge color sets, control heights, border radii).

### PRD & Documentation
- **What AI did**: Generated the initial PRD outline and the `PART4_REPORT.md` improvement writeups.
- **Manual review**: Verified all functional requirements against the original Notion task page, adjusted API route table, added correct seed data matrix, refined improvement descriptions with accurate code references.

---

## Manual Engineering (No AI)

The following decisions and fixes were made manually:

1. **Prisma version downgrade** — Identified that `prisma@7` removed `url` in schema files. Manually decided to pin to `prisma@6.x` rather than adopting the new `prisma.config.ts` approach, to avoid additional configuration overhead.

2. **SQLite `.lt()` workaround** — Prisma's SQLite driver doesn't support date-field `lt` filtering reliably for string-stored dates. Wrote the JS-side filter in `autoExpireRequests()` manually after the AI's initial Prisma query didn't produce correct results.

3. **`checkDuplicateAccessId` guard placement** — Manually decided to add the duplicate guard inside `requestAccessIdCreation()` as well as in the drawer UI to prevent server-side bypass.

4. **Notification-to-request matching heuristic** — The Slack card detection logic (`n.text.includes(r.id)`) was designed manually. The AI initially proposed a separate `requestId` field on the `Notification` model, but this was skipped to avoid a schema migration.

5. **Admin My Boards IIFE pattern** — Used an immediately-invoked function expression (`{(() => { ... })()}`) in JSX to scope the `myAdminBoards` derivation cleanly without adding a separate state variable. This pattern was chosen manually.

6. **Persona switcher design** — The top-bar persona switcher (employee ↔ admin toggle) was a deliberate evaluator-convenience design decision made before any coding started, documented in the PRD. Not AI-generated.

---

## AI Tool Used

- **Tool**: Antigravity (Google DeepMind)
- **Model**: Claude Sonnet 4.6 / Gemini Flash (mixed, session-dependent)
- **Session**: Single continuous session (~3 hrs of active coding)

## Prompt Patterns Used

- `"Read this and tell me the Project Requirements"` — initial task ingestion
- `"Make a PRD"` — structured requirements generation
- `"Start Phase 1"` / `"Implement it"` — sequential phase execution
- `"Which requirements have not been met yet"` — gap analysis
- `"Plan how to implement the critical missing features"` — implementation planning
- `"Add it into the full plan"` — plan consolidation
- `"Start Implementation"` — execution of critical features

---

## Estimated Time Breakdown

| Activity | AI | Manual |
|---|---|---|
| Initial prototype analysis & PRD | 30 min | 15 min |
| Prisma schema + seed | 10 min | 20 min |
| Server actions (all 15 actions) | 20 min | 30 min |
| UI components + drawers (8 drawers) | 25 min | 25 min |
| Main page (page.tsx, 1100 lines) | 15 min | 20 min |
| CSS design system | 10 min | 15 min |
| Critical missing features (4 features) | 20 min | 25 min |
| Documentation (README, PART4, AI_USAGE) | 10 min | 15 min |
| **Total** | **~2.5 hrs** | **~2.5 hrs** |
