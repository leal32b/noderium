---
title: Typography & spacing
description: The Inter type stack, reading rhythm, density tokens, and the radius scale — the vertical grammar of Noderium's UI.
---

Typography and spacing follow the same rule as color: semantic tokens and a small,
consistent scale — no magic numbers ([Principles](/design/principles/)).

## Type

The base font is **Inter** (with a system fallback stack), tuned for a calm reading
surface. Defined in `apps/desktop/frontend/src/app/styles/global.css`:

| Property | Value |
| --- | --- |
| Font family | `Inter`, then `-apple-system` / `Segoe UI` / `Roboto` … |
| Base size | `15px` |
| Line height | `1.55` |
| Font features | `cv02`, `cv03`, `cv04`, `ss01` (Inter stylistic sets) |
| Smoothing | antialiased + `optimizeLegibility` |

Headings tighten tracking and balance their wrapping so titles read as one unit:

```css title="global.css"
h1, h2, h3 {
  letter-spacing: -0.014em;
  text-wrap: balance;
}
```

## Spacing & density

Spacing derives from a base rhythm that the **density** toggle scales — compose from
it instead of hardcoding pixels, so comfortable/compact stay coherent.

| Token | Comfortable | Compact |
| --- | --- | --- |
| `--density-space` | `1rem` | `0.625rem` |
| `--control-height` | `2.25rem` | `1.875rem` |

## Radius

A restrained three-step radius scale (from `uno.config.ts`):

| Token | Value | Use |
| --- | --- | --- |
| `rounded-md` | `0.5rem` | Buttons, inputs, rows. |
| `rounded-lg` | `0.625rem` | Cards, inset panels. |
| `rounded-xl` | `0.875rem` | Dialogs. |

## Control heights

Interactive controls share a small height scale so they align on a row:

| Size | Height |
| --- | --- |
| `sm` | `h-8` (2rem) |
| `md` | `h-9` (2.25rem) |
| `lg` | `h-11` (2.75rem) |

See [Components](/design/components/) for how these compose.
