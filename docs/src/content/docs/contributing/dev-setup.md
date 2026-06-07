---
title: Dev setup & commands
description: Prerequisites and the just recipes (plus per-package commands) for building, testing, and running Noderium.
---

Noderium is a polyglot monorepo driven by
[`just`](https://github.com/casey/just) ([ADR-013](/architecture/adr/adr-013-polyglot-monorepo/)).

## Prerequisites

- **Rust** (stable; see `rust-toolchain.toml`).
- **Node 22** + **pnpm** (`packageManager` is pinned in `package.json`).
- **`just`** — `brew install just` or `cargo install just`.
- **Tauri CLI** (once, for the desktop app) — `cargo install tauri-cli --locked`.

## just recipes

```sh
just            # list available tasks
just dev        # frontend in the browser (Vite only, no Rust core)
just dev-desktop# full app: Vite + Rust core + native window
just build      # frontend dist + cargo build --release
just test       # cargo test + frontend test + editor latency
just test-editor# editor latency spike (fails if p95 > 16ms)
just lint       # cargo clippy -D warnings
just fmt        # cargo fmt --check
just docs       # this documentation site (dev server)
just docs-build # build the docs (fails on broken internal links)
```

## Per-package commands

The `noderium-desktop` crate embeds the frontend `dist/` via `generate_context!`, so
it is **excluded** from the pure-Rust checks and built separately.

```sh
# Rust (desktop excluded — needs the frontend dist)
cargo test --workspace --exclude noderium-desktop
cargo clippy --workspace --exclude noderium-desktop -- -D warnings
cargo fmt --all -- --check

# Frontend
pnpm --filter @noderium/desktop-frontend run typecheck   # tsc -b, strict
pnpm --filter @noderium/desktop-frontend run lint        # eslint (FSD boundaries)
pnpm --filter @noderium/desktop-frontend run test        # vitest

# Docs
pnpm --filter @noderium/docs build
```

## Try the loop (in `just dev-desktop`)

1. Open **Journal** → type → **Persist to core** (saves to today's daily note).
2. **Export .md** → see the deterministic markdown.
3. **Search** a word you typed → it appears (FTS5).
4. Backlinks populate once another note `[[links]]` to today's title.
