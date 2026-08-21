---
name: frontend-design-system
description: >-
  Frontend Architecture & Modern Component Design System skill. Covers 3-tier design
  tokens, Radix/Shadcn component patterns, accessibility (WCAG AAA, ARIA), React 19 /
  Next.js optimization, glassmorphism, and responsive CSS architectures.
---

# Frontend Design System & Component Architecture Skill

This skill enforces best practices for building scalable, high-performance, accessible frontend component architectures in React and Next.js.

---

## 🏗️ 3-Tier Design Token Architecture

```
1. Global Tokens (Raw Values)
   └── --color-blue-600: #2563EB;
   └── --color-slate-900: #0F172A;

2. Semantic Tokens (Intent & Meaning)
   └── --color-primary: var(--color-blue-600);
   └── --surface-canvas: var(--color-slate-900);
   └── --text-secondary: var(--color-slate-500);

3. Component Tokens (Element Specific)
   └── --button-bg: var(--color-primary);
   └── --card-border: var(--border-subtle);
```

---

## 🎨 Component State Checklist

Every production UI component must account for these 6 states:

| State | Implementation Requirement |
| :--- | :--- |
| **1. Default / Idle** | Clean typography, subtle 1px border, high contrast ratio. |
| **2. Hover** | `-1px` transform, soft shadow spread, colored border tint. |
| **3. Active / Pressed** | `scale(0.98)`, border compression. |
| **4. Focus-Visible** | High-contrast `3px` focus ring with `rgba(37, 99, 235, 0.15)`. |
| **5. Loading / Shimmer** | Skeleton gradient shimmer animation (`@keyframes shimmer`). |
| **6. Empty / Error** | Illustrated empty card with actionable resolution CTA. |

---

## ♿ Accessibility & Standards (WCAG AAA)

- **Color Contrast:** Text-to-background contrast must meet at least `4.5:1` for normal text and `3:1` for large headings.
- **Keyboard Trapping & Dismissal:**
  - Modals and drawers must capture focus and listen for `Escape` to close.
  - Interactive elements must be reachable via `Tab` with visible focus rings.
- **Semantic HTML:**
  - Use `<button>` for actions and `<a>` for navigations.
  - Use `aria-modal="true"`, `aria-label`, and `role="status"` for toast notifications.
