---
title: Working agreement
description: How we build Noderium — the principles and invariants that every change follows. Mirrors the canonical CLAUDE.md.
---

The canonical working agreement is
[`CLAUDE.md`](https://github.com/leal32b/noderium/blob/main/CLAUDE.md) at the repo root
— the file the AI assistant and contributors read first. This page mirrors it; when
they disagree, **`CLAUDE.md` wins**.

## Principles (in priority order)

1. **Coherence** — match the patterns already in the codebase. One way to do a thing,
   used everywhere. New code should look like it was always here.
2. **Simplicity** — the simplest design that meets the requirement wins. No
   speculative abstraction, no dead code. Delete before you add.
3. **Clean code** — small, single-purpose units; clear names; errors handled
   explicitly (`Result`/typed errors in Rust; no swallowed promises in TS). Comments
   explain *why*, not *what*.
4. **Testability** — every behavior change ships with a test. Pure logic in pure
   functions; side effects at the edges.
5. **Maximum performance** — respect the budgets: typing < 16 ms, search < 120 ms,
   cold start < 400 ms. Measure, don't guess.
6. **Scalability** — solutions must hold at 50k+ blocks and multi-device sync (v2).
   Derive, don't duplicate state.

When principles conflict, prefer the earlier one — but call out the trade-off, don't
decide silently.

## Architecture invariants (do not break)

- **Golden rule** — the Loro CRDT is the *only* source of truth; every other SQLite
  table is a rebuildable derived index
  ([ADR-001](/architecture/adr/adr-001-block-model-crdt-source-of-truth/)).
- **Local-first** — the frontend calls the Rust core via **Tauri commands**, never
  HTTP; args are camelCase on the JS side
  ([ADR-005](/architecture/adr/adr-005-rust-js-boundary/)).
- **Domain crates stay pure** — `core`/`store`/`crdt`/`srs` must not depend on Tauri or
  the UI. Orchestration lives in `app-core`.
- **FSD boundaries** — import only *down*, only through a slice's public API
  ([Frontend (FSD)](/architecture/frontend-fsd/)).
- **Design tokens** — colors/spacing come from CSS vars in `theme.css`; never hardcode
  hex ([Design tokens & themes](/design/tokens-and-themes/)).

## Definition of done

- It does exactly what was asked — no more, no less.
- Tests cover the new behavior and the whole suite is green.
- `typecheck`, `clippy -D warnings`, `fmt --check`, `lint`, and `format:check` pass.
- UI changes were visually verified in light **and** dark.
- It's committed atomically with a clean
  [Conventional Commit](/contributing/conventions/) message.
