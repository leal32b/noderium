---
title: Frontend (FSD)
description: The SolidJS + Tauri 2 frontend — Feature-Sliced Design, enforced boundaries, theming, lazy i18n, and the ⌘K command palette.
---

The frontend follows **Feature-Sliced Design (FSD)** exactly, per
[ADR-012](/architecture/adr/adr-012-frontend-fsd/). This page is the canonical
reference for its structure and patterns; the [Design system](/design/principles/)
covers the visual layer.

## Layers & boundaries

Imports flow **down only**, and only through a slice's public API (`index.ts`):

```mermaid
flowchart TB
  app --> pages --> widgets --> features --> entities --> shared
  app -. "may import any layer below" .-> shared
```

- `app → {pages, widgets, features, entities, shared}`
- `pages → {widgets, features, entities, shared}`
- `widgets → {widgets, features, entities, shared}`
- `features → {entities, shared}`
- `entities → {shared}`
- `shared → {shared}`

Cross-slice imports go **only** through `index.ts`. Deep imports are blocked by
`eslint-plugin-boundaries`.

```typescript
// ❌ deep import into a slice's internals
import { something } from '@features/editor/model/store';
// ✅ import only from the public API
import { useEditor } from '@features/editor';
```

## Folder structure

```
src/
├── app/         # init, routes, providers, styles/theme.css
├── pages/       # full-screen routes (home, journal, note/:id, settings…)
├── widgets/     # composed UI (app-shell, topbar, sidebar, command-palette)
├── features/    # user-facing capabilities (editor, search, srs-review, journal)
├── entities/    # domain entities (note, block, link, command)
└── shared/      # ui (Kobalte), lib (theme, i18n, sync), config, api, types
```

Each slice has `ui/`, optional `model/` and `api/`, and a single `index.ts` public
API — the only external import point.

## Stack

- **SolidJS** + **Vite**, TypeScript strict (`noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, …).
- **UnoCSS** — semantic tokens as CSS variables (see
  [Design tokens & themes](/design/tokens-and-themes/)).
- **Kobalte** (headless components), `lucide-solid` (icons), **Valibot**
  (validation/env).

## Providers (order matters)

```
RootErrorBoundary
  └─ QueryProvider
       └─ SyncProvider        ← CRDT/sync engine state (was RealtimeProvider)
            └─ I18nProvider
                 └─ ThemeProvider
                      └─ ToastProvider
                           └─ AppRoutes
```

## Key systems

- **Theming** — `data-theme` + `data-density` on `<html>`; instant swap, no rebuild.
- **i18n** — lazy dictionaries (en-US bundled, pt-BR on demand), `Intl` formatters,
  `<html lang>` kept in sync.
- **Command palette (⌘K)** — a `command` entity + `useDefaultCommands()` +
  `useCommandPaletteShortcut()` (`@solid-primitives/keyboard`).
- **State** — TanStack Query (server/sync), signals (client UI), `makePersisted`
  (local preferences).
- **Local-first IPC** — the frontend talks to the Rust core via **Tauri commands**,
  never HTTP ([ADR-005](/architecture/adr/adr-005-rust-js-boundary/)). See the
  [Tauri command API](/architecture/tauri-command-api/).

## Adaptations for Noderium

No auth/session/billing layer (local-first): `AppShell` renders children directly. The
blueprint's `RealtimeProvider` becomes the **`SyncProvider`**. Domain entities and the
`editor` feature enter **after** the shell, gated on Spike #1.
