---
title: Testing strategy
description: How Noderium is tested — Rust unit/integration tests, the editor latency perf-budget, frontend vitest, and the CI gates.
---

Every behavior change ships with a test. Pure logic lives in pure functions; side
effects sit at the edges. If something is hard to test, the design is wrong — fix the
design.

## Layers

| Layer | Tooling | What it covers |
| --- | --- | --- |
| Rust unit/integration | `cargo test` | Domain crates: core, store, crdt, srs, app-core. |
| Editor latency | perf spike (`just test-editor`) | The < 16 ms typing budget. |
| Frontend unit/component | Vitest + `@solidjs/testing-library` | UI logic, stores, components. |
| E2E (planned) | Playwright | Critical flows. |

## The performance budget is a test

Performance is a contract, not a hope
([ADR-004](/architecture/adr/adr-004-desktop-tauri-solidjs-editor/)). The editor
latency test **fails CI above p95 16 ms**. Other budgets (search < 120 ms, cold start
< 400 ms) are tracked the same way as they land.

## The golden-rule test

`app-core::tests::derived_index_is_rebuildable_from_crdt` wipes the entire derived
SQLite index and rebuilds it **byte-identical** from the Loro snapshot — the
executable form of [the golden rule](/how-it-works/crdt-source-of-truth/). Keep it
passing.

## CI gates

CI runs four jobs (`.github/workflows/ci.yml`):

- **Rust** — `cargo fmt --check`, `clippy -D warnings`, and tests (desktop excluded).
- **Frontend** — typecheck, lint, format check, test, build.
- **Perf budget** — the editor latency test.
- **Desktop** — the full Tauri build (frontend dist embedded).

Run the whole suite locally with `just test`. See
[Dev setup & commands](/contributing/dev-setup/).
