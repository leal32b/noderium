# Noderium

A **local-first, lightweight, opinionated PKM tool** that unifies three methods into
a single first-class workflow: **Journal** (low-friction capture) → **Zettelkasten**
(atomic, densely linked notes) → **Spaced Repetition / SRS** (retention).

Source of truth is a **CRDT (Loro)** persisted in **SQLite**; markdown is import/export,
not the live surface. Search is 100% local and hybrid (FTS5 + sqlite-vec, fused by RRF).
Multi-device E2E sync is a future paid service. Built on **Tauri 2 + SolidJS + Rust**.

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — vision, 15 ADRs, data model, sync, roadmap.
- **[BLUEPRINT.md](BLUEPRINT.md)** — frontend (FSD) template reference (ADR-012).
- **[docs/implementation/](docs/implementation/)** — step-by-step implementation notes.

## Repository layout

```
crates/        Rust domain crates (core, store, crdt, search, ai, srs, sync-client, app-core)
apps/desktop/  Tauri 2 shell (src-tauri) + SolidJS frontend
apps/mobile/   (post-v1)
packages/      Shared JS packages (editor)
server/        Zero-knowledge sync server (axum)
docs/          Astro Starlight documentation
```

## Toolchain

Polyglot monorepo: **cargo workspace** + **pnpm workspace**, task runner **`just`** (ADR-013).

```sh
just            # list tasks
just build      # build the Rust workspace
just test       # run tests
just lint       # cargo clippy
```

> `just` not installed? `brew install just` or `cargo install just`.

## Status

v0 walking skeleton complete, plus a working capture → persist → search → link →
retain slice (journal, block editor, CRDT↔SQLite, FSRS, backlinks, FTS, `.md`
import/export) behind a Tauri desktop app. See
**[docs/implementation/status.md](docs/implementation/status.md)** for details and
ARCHITECTURE.md §11 for the roadmap.

## License

Client + domain crates: **Apache-2.0**. Sync server: source-available (FSL/BUSL). See ADR-009.
