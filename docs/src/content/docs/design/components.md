---
title: Components
description: The base UI kit — Button, Card, Input, Dialog, the command palette, and the sidebar — built on Kobalte headless primitives + UnoCSS tokens.
---

:::note[Expanded soon]
Real usage snippets and prop tables for each component are added in the
design-and-diagrams phase. This page lists the kit.
:::

Components live in `shared/ui` and are built on **Kobalte** (headless, accessible)
styled with **UnoCSS** utilities bound to [design tokens](/design/tokens-and-themes/).
Every interactive element gets a focus ring.

## The kit

| Component | Role |
| --- | --- |
| `Button` | Primary / secondary / destructive actions, with sizes. |
| `Card` | A raised content container (the surface model in practice). |
| `Input` | Text fields with token-driven borders + focus states. |
| `Dialog` | Modal surfaces on the overlay tone, focus-trapped. |
| Command palette | The ⌘K motor for navigation and actions. |
| Sidebar | Collapsible navigation chrome on the base tone. |

## Pattern

Each component reads from tokens and exposes a small, semantic prop surface — for
example, a `Button`'s `variant` selects an action token set rather than raw colors. See
[Patterns](/design/patterns/) for how these compose into screens.
