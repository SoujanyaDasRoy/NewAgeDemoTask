---
name: taste-skill
description: >-
  Leonxlnx Taste-Skill: Anti-AI-Slop Frontend Design System. Prevents generic,
  repetitive AI boilerplate UI. Enforces high visual taste, intentional typography,
  spotlight borders, spring physics, mathematical spacing, and boutique craft.
---

# 🎨 Leonxlnx Taste-Skill: Anti-AI-Slop Frontend Design

> **Core Mandate:** Eradicate generic "AI Slop" — cookie-cutter purple gradients, uncalibrated cards, floating low-contrast text, and lifeless boilerplate interfaces. Produce bespoke, intentional, human-crafted software design.

---

## 🚫 The Anti-AI Slop Checklist (Strict Prohibitions)

1. **NO Default Generic Purple/Indigo Gradients:** Ban the cliché `#8B5CF6` to `#EC4899` background mesh unless explicitly requested. Use deep chromatic slates, obsidian tones, warm neutrals, or bespoke brand palettes.
2. **NO Centered Monotonous Cards:** Break away from 3 identical centered white boxes with identical shadow blur. Use asymmetric visual weight, 2-column density grids, and hierarchy-driven cards.
3. **NO Floating Low-Contrast Text:** Never use `#94A3B8` on pure white for crucial metadata. Ensure WCAG AAA contrast with calibrated opacity.
4. **NO Raw Hex Values in Component Code:** Enforce semantic design tokens (`--color-surface-elevated`, `--color-border-subtle`).
5. **NO Lifeless CSS Easing:** Ban `transition: all 0.3s ease`. Use spring deceleration curves: `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 💎 Taste-Skill Design Architecture

### 1. Visual Variance & Density
- **Parameter:** `DESIGN_VARIANCE = HIGH`
- Mix high-density data tables with spacious hero showcases.
- Contrast micro-labels (`10px` uppercase tracked `+0.05em`) with bold tabular numerals (`15px - 22px` font-weight `700`).

### 2. True Glassmorphism & Spotlight Borders
- Inset light edges: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85)`.
- Layered ambient shadows: Soft diffusion + tight grounding shadow.
- Glowing hover border accents that respond to pointer focus.

### 3. Tactile Spring Micro-Interactions
- Physical button press: `transform: scale(0.98)` with instantaneous response (`0.1s`).
- Hover card lift: `transform: translateY(-2px)` with shadow bloom.
- Status indicators: Organic breathing pulse dots (`@keyframes pulseDot`).

### 4. Usability & Cognitive Ergonomics
- Instant feedback on every mutation (loading spinners, copy checkmarks, dynamic counter increments).
- Deep-linkable state via URL query params (`?request=ID`, `?approval=ID`).
- Zero-layout-shift skeleton shimmers.
