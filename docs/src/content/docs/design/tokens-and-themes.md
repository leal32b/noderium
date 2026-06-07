---
title: Design tokens & themes
description: The semantic CSS-variable token system — surfaces, text, borders, accent, feedback, elevation — and how light/dark/density swap instantly.
---

All color, elevation, and spacing come from **semantic CSS variables** defined in
`apps/desktop/frontend/src/app/styles/theme.css`. UnoCSS maps utility classes to those
variables (`uno.config.ts`), so the app re-themes by swapping a single attribute — no
rebuild. **Never hardcode a hex value; always reference a token.**

## How theming works

```html
<!-- swap either attribute; the UI updates instantly -->
<html data-theme="dark" data-density="compact"></html>
```

- **`data-theme`** — `light` | `dark` (resolved from `system` when chosen).
- **`data-density`** — `comfortable` | `compact` (scales rhythm + control heights, see
  [Typography & spacing](/design/typography-and-spacing/)).

## Surfaces

Chrome (sidebar/topbar) sits on `background`; content is `raised` above it — hierarchy
by **elevation**, consistent across light and dark
([Principles](/design/principles/)).

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--surface-background` | `#f6f6f4` | `#0b0b0d` | App canvas / chrome. |
| `--surface-raised` | `#ffffff` | `#18181b` | Content cards, inputs. |
| `--surface-sunken` | `#ececea` | `#1f1f23` | Inset panels. |
| `--surface-overlay` | `#ffffff` | `#1a1a1e` | Dialogs, popovers. |
| `--surface-hover` | `#ededeb` | `#1d1d21` | Hover state for rows/buttons. |

## Text

| Token | Light | Dark |
| --- | --- | --- |
| `--text-primary` | `#1c1c1a` | `#f4f4f5` |
| `--text-secondary` | `#5b5b57` | `#a7a7ad` |
| `--text-tertiary` | `#8c8c87` | `#6e6e77` |
| `--text-on-accent` | `#ffffff` | `#0b1020` |

## Borders

| Token | Light | Dark |
| --- | --- | --- |
| `--border-subtle` | `#efefec` | `#202024` |
| `--border-default` | `#e4e4e0` | `#2a2a30` |
| `--border-strong` | `#d2d2cd` | `#3a3a43` |

## Accent (indigo)

| Token | Light | Dark |
| --- | --- | --- |
| `--accent-default` | `#4f46e5` | `#6366f1` |
| `--accent-hover` | `#4338ca` | `#818cf8` |
| `--accent-active` | `#3730a3` | `#a5b4fc` |
| `--accent-subtle-bg` | `#eef2ff` | `#1e1b33` |
| `--accent-subtle-text` | `#4338ca` | `#c7d2fe` |

The accent doubles as the primary action color (`--action-primary-*` aliases it). A
secondary action uses `--action-secondary-default` / `-hover`.

## Feedback

| Token | Light | Dark |
| --- | --- | --- |
| `--feedback-success-text` | `#047857` | `#4ade80` |
| `--feedback-danger-text` | `#b91c1c` | `#f87171` |
| `--feedback-warning-text` | `#b45309` | `#fbbf24` |

Success/danger also have `-bg` tints for subtle backgrounds.

## Elevation

| Token | Role |
| --- | --- |
| `--shadow-sm` | Resting cards, buttons. |
| `--shadow-md` | Tooltips, raised popovers. |
| `--shadow-lg` | Dialogs, overlays. |

## Using tokens

UnoCSS utilities resolve to these variables, and a few **shortcuts** encode the
recurring surface recipes:

```ts title="uno.config.ts (shortcuts)"
'focus-ring':   'outline-none focus-visible:(ring-2 ring-accent/60 ring-offset-2 ring-offset-surface-background)',
'card':         'rounded-lg border border-border-default bg-surface-raised shadow-sm',
'panel-inset':  'rounded-lg border border-border-subtle bg-surface-sunken',
'row-interactive': 'focus-ring rounded-md transition-colors duration-150 hover:bg-surface-hover',
'icon-btn':     'focus-ring inline-flex items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:(bg-surface-hover text-text-primary)',
```

```html
<!-- compose from tokens, never raw hex -->
<div class="card p-5 text-text-primary">…</div>
<button class="icon-btn h-8 w-8">…</button>
```
