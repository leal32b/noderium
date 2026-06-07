# Noderium

A **local-first, lightweight, opinionated PKM tool** that unifies three methods into
a single first-class workflow: **Journal** (low-friction capture) → **Zettelkasten**
(atomic, densely linked notes) → **Spaced Repetition / SRS** (retention).

Source of truth is a **CRDT (Loro)** persisted in **SQLite**; markdown is import/export,
not the live surface. Search is 100% local and hybrid (FTS5 + sqlite-vec, fused by RRF).
Multi-device E2E sync is a future paid service. Built on **Tauri 2 + SolidJS + Rust**.

## Documentation

Full documentation lives in the [`docs/`](docs/) Astro Starlight site — run
`just docs` to browse it locally. Highlights:

- **[Architecture overview](docs/src/content/docs/architecture/overview.md)** — repo layout, crates, data model.
- **[Decision records](docs/src/content/docs/architecture/decisions.md)** — the 15 ADRs, one page each.
- **[How it works](docs/src/content/docs/how-it-works/system-overview.md)** — the system, explained.
- **[Frontend (FSD)](docs/src/content/docs/architecture/frontend-fsd.md)** — the SolidJS template reference.
- **[Roadmap / Status](docs/src/content/docs/roadmap/status.md)** — what's built and what's next.

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
**[Status](docs/src/content/docs/roadmap/status.md)** for details and
**[Roadmap](docs/src/content/docs/roadmap/whats-next.md)** for what's next.

## License

Client + domain crates: **Apache-2.0**. Sync server: source-available (FSL/BUSL). See ADR-009.
