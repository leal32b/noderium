---
title: Overview & repo layout
description: The Noderium monorepo — Rust domain crates, the Tauri shell, the SolidJS frontend, shared packages, and the sync server.
---

Noderium is a **polyglot monorepo** ([ADR-013](/architecture/adr/adr-013-polyglot-monorepo/)):
a **cargo workspace** for the Rust crates and a **pnpm workspace** for the JS
packages, driven by a single `just` task runner.

The shape follows the architecture invariants: the **domain crates stay pure**
(no Tauri or UI leakage), orchestration lives in `app-core`, and the desktop shell is
a thin adapter.

## Repository layout

```
noderium/
├── Cargo.toml            # cargo workspace (crates/*, apps/desktop/src-tauri, server/*)
├── pnpm-workspace.yaml   # packages: apps/*/frontend, packages/*, docs
├── justfile              # polyglot task runner (ADR-013)
│
├── crates/               # === Rust domain (Apache-2.0) ===
│   ├── core/             # block model, note types, markdown parser, .md export
│   ├── store/            # SQLite (FTS5, sqlite-vec), migrations; derived indexes
│   ├── crdt/             # Loro integration, snapshots, compaction, checkpoints
│   ├── search/           # hybrid search (FTS + vector), RRF
│   ├── ai/               # embeddings; trait for pluggable generation backend
│   ├── srs/              # FSRS scheduler
│   ├── sync-client/      # client sync engine + E2E crypto
│   └── app-core/         # facade: orchestrates core+store+crdt+search+srs
│
├── apps/
│   ├── desktop/
│   │   ├── src-tauri/    # Rust shell: commands, events, app-core plugin
│   │   └── frontend/     # SolidJS (FSD, see BLUEPRINT) — embedded into the app
│   └── mobile/           # (post-v1) Tauri 2 iOS/Android
│
├── packages/
│   └── editor/           # block editor: ProseMirror + loro-prosemirror (WASM)
│
├── server/
│   └── sync-server/      # axum, zero-knowledge (FSL/BUSL or proprietary)
│
└── docs/                 # === Astro Starlight (this site) ===
```

## Layering rules

- **Domain crates are portable** — `core`/`store`/`crdt`/`srs` must not depend on
  Tauri or the UI ([ADR-005](/architecture/adr/adr-005-rust-js-boundary/),
  [ADR-011](/architecture/adr/adr-011-mobile-portable-core/)).
- **`app-core` is the facade** — it orchestrates the domain crates and is exposed via
  Tauri commands and FFI.
- **The shell is thin** — `apps/desktop/src-tauri` only adapts `app-core` to Tauri.
  The `noderium-desktop` crate embeds the frontend `dist/` via `generate_context!`,
  so it is built separately from the pure-Rust checks.
- **The frontend follows FSD** — see [Frontend (FSD)](/architecture/frontend-fsd/).

## Tooling

ESLint flat + `eslint-plugin-boundaries` (FSD), Prettier, Husky + lint-staged +
commitlint, Vitest + `@solidjs/testing-library`, `cargo clippy`, and `size-limit` +
benches for the performance budget. See
[Dev setup & commands](/contributing/dev-setup/).

## Licensing

The client and domain crates are **Apache-2.0**; the sync server is source-available
(FSL/BUSL) or proprietary; the disk format is open
([ADR-009](/architecture/adr/adr-009-open-core-licensing/)).
