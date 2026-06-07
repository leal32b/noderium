---
title: Design tokens & themes
description: The semantic CSS-variable token system — surfaces, text, borders, accent, feedback, elevation — and how light/dark/density swap instantly.
---

All color, elevation, and spacing come from **semantic CSS variables** defined in
`apps/desktop/frontend/src/app/styles/theme.css`. UnoCSS maps utility classes to these
variables, so the app re-themes by swapping a single attribute — no rebuild.

:::note[Expanded soon]
The full token tables (with the exact values from `theme.css`) and live swatches are
added in the design-and-diagrams phase. This page captures the model.
:::

## How theming works

```html
<!-- swap either attribute; the UI updates instantly -->
<html data-theme="dark" data-density="compact">
```

- **`data-theme`** — `light` | `dark` (or resolved from `system`).
- **`data-density`** — `comfortable` | `compact` (scales rhythm + control heights).

Never hardcode a hex value — always reference a token.

## Token categories

| Category | Examples |
| --- | --- |
| Surfaces | `--surface-background`, `--surface-raised`, `--surface-sunken`, `--surface-overlay`, `--surface-hover` |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-on-accent` |
| Borders | `--border-subtle`, `--border-default`, `--border-strong` |
| Accent (indigo) | `--accent-default`, `--accent-hover`, `--accent-active`, `--accent-subtle-bg` |
| Feedback | `--feedback-success-*`, `--feedback-danger-*`, `--feedback-warning-text` |
| Elevation | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Density | `--density-space`, `--control-height` |

## The surface model

Chrome = base tone, content = raised — consistent in **elevation** across light and
dark, not absolute lightness ([Principles](/design/principles/)). In light mode the
canvas is a soft grey and content is white; in dark mode the canvas is near-black and
content is a raised dark grey.
