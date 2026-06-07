---
title: Patterns
description: Recurring UI patterns — focus rings, surface recipes, the active-nav pill, collapsed-sidebar tooltips, autosave, and motion — that keep screens consistent.
---

Patterns are how the [components](/design/components/) and
[tokens](/design/tokens-and-themes/) compose into coherent screens. Reuse a pattern
before inventing a layout.

## Focus rings

Every interactive element uses the `focus-ring` shortcut — a token-driven,
keyboard-only ring (`focus-visible`), offset against the canvas:

```ts
'focus-ring': 'outline-none focus-visible:(ring-2 ring-accent/60 ring-offset-2 ring-offset-surface-background)'
```

## Surface recipes

Two shortcuts encode the [surface model](/design/principles/) so elevation stays
consistent:

- `card` — raised content: `border-border-default` + `bg-surface-raised` + `shadow-sm`.
- `panel-inset` — sunken regions: `border-border-subtle` + `bg-surface-sunken`.

## Interactive rows & icon buttons

- `row-interactive` — list rows that highlight on hover (`hover:bg-surface-hover`) and
  carry the focus ring.
- `icon-btn` — square, quiet icon buttons that gain a surface + stronger text on hover.

## The active-nav pill

The selected sidebar item uses an accent-subtle pill, defined in `global.css` so it
wins over UnoCSS utilities:

```css title="global.css"
.nav-active, .nav-active:hover {
  background-color: var(--accent-subtle-bg);
  color: var(--accent-subtle-text);
}
```

## Collapsed-sidebar tooltips

When the sidebar collapses, labels become **CSS-only tooltips** — no JS, and they show
on hover **and** keyboard focus:

```css title="global.css"
.sidebar-tip::after { content: attr(data-tip); /* … */ }
.sidebar-tip:hover::after,
.sidebar-tip:focus-visible::after { opacity: 1; }
```

## Autosave

Editors **autosave** on a debounce and re-hydrate from their stored
[snapshot](/how-it-works/crdt-source-of-truth/) on open — no explicit "save" button in
the primary flow. Feedback is quiet and non-blocking.

## Motion

Dialogs animate in (`overlay-in` / `content-in`); selection and scrollbars are
theme-aware. All of it collapses under `prefers-reduced-motion`:

```css title="global.css"
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

The throughline is the [principles](/design/principles/): coherent, simple, and
keyboard-first by default.
