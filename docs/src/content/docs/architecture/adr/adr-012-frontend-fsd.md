---
title: 'ADR-012 — Frontend: Feature-Sliced Design'
description: Fully adopt the Tauri + SolidJS FSD template — layered boundaries, CSS-var theming, lazy i18n, ⌘K palette, UnoCSS + Kobalte.
sidebar:
  label: 'ADR-012 — Feature-Sliced Design'
  order: 12
---

**Status:** Accepted

## Decision

Fully adopt the **Tauri + SolidJS** template in `BLUEPRINT.md`. FSD layers
`app → pages → widgets → features → entities → shared`, with boundaries enforced by
ESLint, theming via CSS variables, lazy i18n, a ⌘K command palette, UnoCSS + Kobalte,
and TanStack Query + signals + `makePersisted`.

## Adaptations to our domain

- No auth/session layer in the shell (local-first).
- The blueprint's `RealtimeProvider` becomes a **`SyncProvider`** (CRDT/sync engine
  state).
- Domain entities (`note`, `block`, `editor`, `search`, `srs`) enter **after** the
  shell.

## Consequences

A professional, testable frontend base from commit zero; boundaries protect the
architecture as it grows. See [Frontend (FSD)](/architecture/frontend-fsd/).
