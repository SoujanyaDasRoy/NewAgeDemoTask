---
name: ui-ux-pro-max
description: >-
  Premier UI/UX Design & Usability Mastery skill. Applies Nielsen Norman heuristics,
  Apple Human Interface Guidelines, Linear/Stripe design aesthetics, 8pt spatial grid,
  optical typography, spring physics micro-interactions, and cognitive ergonomics.
---

# UI/UX Pro Max Design & Usability Skill

This skill guides the design, evaluation, and implementation of Tier-1 digital products and SaaS web applications with the visual craft of **Linear, Stripe, Vercel, and Apple**.

---

## 💎 Core Design Principles

### 1. 8pt Spatial Grid & Proportional Hierarchy
- **Base Unit:** 8px (with 4px half-steps for micro-spacing like badge padding and icon gaps).
- **Spacings:** `4px` (micro), `8px` (compact), `12px` (standard), `16px` (comfortable), `24px` (section gap), `32px` (major gap), `48px` (hero separation).
- **Component Heights:**
  - Control buttons / inputs: `36px` (compact), `40px` (standard), `44px` (prominent).
  - Avatar chips: `28px` (inline), `32px` (standard), `40px` (profile).

### 2. Optical Typography & Contrast
- **Tracking / Letter Spacing:**
  - Large headings (`> 20px`): `-0.02em` to `-0.01em` (tighter letter spacing prevents loose gaps).
  - Body text (`13px - 15px`): `0` to `-0.005em`.
  - Micro tags / Caps labels (`10px - 11px`): `+0.04em` to `+0.06em` (wider tracking enhances legibility).
- **Line Heights:**
  - Headings: `1.15` - `1.25`.
  - Body text: `1.45` - `1.55`.

### 3. Depth, Elevation & Border Luminance
- **Layered Ambient Shadows:**
  - Subtle card shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.04)`.
  - Floating modal / palette shadow: `0 20px 45px -10px rgba(15, 27, 51, 0.2), 0 0 0 1px rgba(15, 27, 51, 0.05)`.
- **Inner Light Edges (Inset Highlights):**
  - Use `inset 0 1px 0 rgba(255, 255, 255, 0.15)` on dark buttons/badges to simulate physical chamfered edges.

### 4. Micro-Interactions & Motion Physics
- **Easing:** Always use natural spring deceleration rather than linear:
  - `cubic-bezier(0.16, 1, 0.3, 1)` (Linear / Apple standard spring).
- **Hover Lift:** `-1px` to `-2px` on interactive cards with soft shadow spread.
- **Active Press:** `transform: scale(0.98)` for tactile button feel.
- **Status Beacons:** Ambient breathing pulse animations on live / active status dots (`@keyframes pulseDot`).

---

## ⚡ Usability & Cognitive Ergonomics (Nielsen Norman)

1. **Visibility of System Status:**
   - Every asynchronous action must have immediate visual feedback (e.g. `Saving...`, progress bar, or checkmark animation).
   - Zero-layout-shift shimmer skeletons (`.skeleton`) during data fetching.

2. **Error Prevention & Recovery:**
   - Confirm destructive actions (e.g. deleting users).
   - Auto-closing toasts with distinct error/success semantic palettes.

3. **Flexibility & Efficiency (Power Users):**
   - Global keyboard shortcuts (`⌘K` / `Ctrl+K` for search, `Esc` to dismiss all active overlays).
   - 1-click inline actions on recurring approval workflows.
