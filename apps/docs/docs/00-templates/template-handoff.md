---
title: Handoff - <Feature Name>
sidebar_label: Handoff Template
sidebar_position: 3
authors: <Designer Name>, <PM Name>
tags: [handoff, ready-for-dev, design-system]
last_updated_date: 2025-12-30
---

import TOCInline from '@theme/TOCInline';
import Admonition from '@theme/Admonition';

<Admonition type="success" title="Status">
  **Approved**: Ready for Engineering Implementation.
</Admonition>

## 1. Resources & Links
| Resource | Link | Notes |
|----------|------|-------|
| **Figma File** | [Link] | Use "Dev Mode" |
| **Prototype** | [Link] | Check flow interaction |
| **Assets Folder** | [Link] | SVGs, Lotties optimized |
| **Copy Deck** | [Link] | Spreadsheet with EN/PT/ES translations |

## 2. Interaction Specifications
**Micro-interactions & Motion**
* **Hover:** Button lifts 2px (Ease-in-out, 200ms).
* **Transition:** Modal slides form bottom (Spring animation).
* **Loading:** Use `SkeletonLoader` component (not spinner) for initial load.

**Responsive Breakpoints**
* **Mobile (< 768px):** Stack columns, hide "Export" button behind menu.
* **Desktop (> 1024px):** 12-col grid, max-width 1200px.

## 3. Analytics Instrumentation (Dev Requirements)
*Developers must implement the following tracking events:*

| Event Name | Trigger | Properties to Send |
|------------|---------|--------------------|
| `button_clicked` | User clicks "Submit" | `button_id: 'submit_main'`, `form_valid: boolean` |
| `modal_viewed` | Modal fully renders | `source: 'dashboard'`, `load_time_ms: 120` |

## 4. Accessibility (A11y) Checklist
* [ ] **Keyboard Nav:** Tab order defined (Top-Left -> Bottom-Right).
* [ ] **Screen Reader:** `aria-label` defined for icon-only buttons.
* [ ] **Focus State:** Ensure visible focus ring on all inputs.
* [ ] **Contrast:** Text checks out with Stark plugin (AA Standard).

## 5. Edge Cases & States
* **Empty State:** What if the user has 0 items? (Show illustration + CTA).
* **Error State:** API 500 error (Show Toast Message: "Try again later").
* **Partial State:** User has data but no image avatar (Show Initials).
