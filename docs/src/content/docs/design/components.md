---
title: Components
description: The base UI kit — Button, Card, Input, Dialog, the command palette, and the sidebar — built on Kobalte headless primitives + UnoCSS tokens.
---

Components live in `apps/desktop/frontend/src/shared/ui` and are built on **Kobalte**
(headless, accessible) styled with **UnoCSS** utilities bound to
[design tokens](/design/tokens-and-themes/). Every interactive element gets a
`focus-ring`.

## Button

Four variants × three sizes. Wraps Kobalte's `Button`; presses scale subtly
(`active:scale-[0.98]`) and disabled buttons drop to 50% opacity.

```tsx title="Button.tsx (variants)"
const VARIANTS = {
  primary:   'bg-accent text-accent-text shadow-sm hover:bg-accent-hover active:bg-accent-active',
  secondary: 'border border-border-default bg-surface-raised text-text-primary shadow-sm hover:(bg-surface-hover border-border-strong)',
  ghost:     'text-text-secondary hover:(bg-surface-hover text-text-primary)',
  danger:    'text-feedback-danger-text hover:bg-feedback-danger-bg',
};
```

```tsx
<Button>Save</Button>                      {/* primary, md */}
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">More</Button>
<Button variant="danger">Delete</Button>
```

| Prop | Values | Default |
| --- | --- | --- |
| `variant` | `primary` · `secondary` · `ghost` · `danger` | `primary` |
| `size` | `sm` · `md` · `lg` | `md` |

## Card

A raised content container — the surface model in practice (`card` shortcut +
padding).

```tsx title="Card.tsx"
<div class="card p-5 text-text-primary">{children}</div>
```

```tsx
<Card>Anything that should float above the chrome.</Card>
```

## Input

A token-driven text field. Native chrome is reset in `global.css`; `autocomplete` and
spellcheck are off by default (a notes app, not a form).

```tsx title="Input.tsx (key classes)"
'h-9 w-full rounded-md border border-border-default bg-surface-raised px-3 text-sm',
'placeholder:text-text-tertiary',
'hover:border-border-strong',
'focus:(border-accent ring-2 ring-accent/25)',
```

```tsx
<Input placeholder="Search…" />
```

## Dialog

A modal surface on the `overlay` tone, focus-trapped by Kobalte, portaled, with a
blurred scrim and entrance animations (`overlay-in` / `content-in`, both respecting
`prefers-reduced-motion`).

```tsx
<Dialog open={open()} onOpenChange={setOpen} title="Rename note">
  <div class="p-4">…</div>
</Dialog>
```

| Prop | Type |
| --- | --- |
| `open` | `boolean` |
| `onOpenChange` | `(open: boolean) => void` |
| `title?` | `string` |

## Composed widgets

| Component | Where | Role |
| --- | --- | --- |
| Command palette | `widgets/command-palette` | The ⌘K motor for navigation + actions. |
| Sidebar | `widgets/sidebar` | Collapsible nav chrome; tooltips when collapsed. |
| Topbar | `widgets/topbar` | App chrome on the base tone. |

See [Patterns](/design/patterns/) for how these compose into screens.
