# Working agreement for Noderium

Read this first, every session. It is the contract for how we build here.
For *what* the system is, see [ARCHITECTURE.md](ARCHITECTURE.md) (vision + 15 ADRs),
[docs/implementation/status.md](docs/implementation/status.md) (what exists today),
and [BLUEPRINT.md](BLUEPRINT.md) (frontend template).

Noderium is a local-first PKM: **Rust** core (cargo workspace) + **SolidJS + Tauri 2**
frontend (Feature-Sliced Design). Source of truth is a **Loro CRDT** in **SQLite**.

---

## Principles (in priority order)

1. **Coherence.** Match the patterns already in the codebase before inventing new ones.
   One way to do a thing, used everywhere. New code should look like it was always here.
2. **Simplicity.** The simplest design that meets the requirement wins. No speculative
   abstraction, no dead code, no options nobody asked for. Delete before you add.
3. **Clean code.** Small, single-purpose units. Clear names. Errors handled explicitly
   (`Result`/typed errors in Rust; no swallowed promises in TS). Comments explain *why*,
   not *what*. Keep public APIs minimal.
4. **Testability.** Every behavior change ships with a test. Pure logic in pure functions;
   side effects at the edges. If it's hard to test, the design is wrong — fix the design.
5. **Maximum performance.** This product sells on speed (ADR-004/§1.2). Respect the budgets:
   **typing < 16ms** (the editor latency test fails CI above p95 16ms), **search < 120ms**,
   **cold start < 400ms**. Avoid per-keystroke IPC, needless allocations, and N+1 queries.
   Measure, don't guess.
6. **Scalability.** Solutions must hold at 50k+ blocks and multi-device sync (v2). Derive,
   don't duplicate state. Keep the domain crates portable (no UI/Tauri leakage into core).

When principles conflict, prefer the earlier one — but call out the trade-off, don't decide silently.

---

## Architecture invariants (do not break)

- **Golden rule (ADR-001):** the Loro CRDT is the *only* source of truth. Every SQLite table
  except `crdt_docs` / `crdt_oplog` is a **rebuildable derived index**. There is a test that
  wipes the index and rebuilds it byte-identical — keep it passing.
- **Local-first (ADR-005):** the frontend calls the Rust core via **Tauri commands**, never HTTP.
  Command args are camelCase on the JS side (Tauri converts to Rust snake_case).
- **Domain crates stay pure:** `core`/`store`/`crdt`/`srs` must not depend on Tauri or the UI.
  Orchestration lives in `app-core`; the shell (`apps/desktop/src-tauri`) is a thin adapter.
- **FSD boundaries (ADR-012):** layers `app > pages > widgets > features > entities > shared`.
  Import only *down*, and only through a slice's public API (`index.ts`). Enforced by ESLint.
- **Design tokens:** colors/spacing come from CSS vars in `src/app/styles/theme.css`. Never
  hardcode hex. Surface model: **chrome (sidebar/topbar) = base tone, content = raised** — keep
  light and dark consistent in elevation, not absolute lightness.

---

## Workflow

- **Verify before you commit.** Logic → run the relevant tests. UI → run the app and look
  (`just dev` / `just dev-desktop`) or screenshot; don't assume rendering.
- **Commit small and atomic** — one logical change per commit. Every commit must build and pass.
- **Conventional Commits**, lowercase subject (commitlint enforces this), e.g.
  `feat(store): add list_notes query`, `fix(frontend): …`, `style(frontend): …`.
- **Never** add a `Co-Authored-By: Claude` trailer (or any Claude attribution) to commits.
- Keep **en-US and pt-BR** dictionaries in sync; `en-US` is the source of truth for translation types.
- Prefer editing existing files over adding new ones; remove anything you obsolete.

## Commands

```sh
just dev           # frontend in the browser (no Rust core)
just dev-desktop   # full app: Vite + Rust core + native window
just build         # frontend dist + cargo build --release
just test          # cargo test + frontend test + editor latency
just test-editor   # editor latency spike (fails if p95 > 16ms)
just lint          # cargo clippy -D warnings
just fmt           # cargo fmt --check
```

Per-package, prefer the filtered forms:

```sh
cargo test --workspace --exclude noderium-desktop      # desktop needs the frontend dist
cargo clippy --workspace --exclude noderium-desktop -- -D warnings
cargo fmt --all -- --check
pnpm --filter @noderium/desktop-frontend run typecheck   # tsc -b, strict
pnpm --filter @noderium/desktop-frontend run lint        # eslint (FSD boundaries)
pnpm --filter @noderium/desktop-frontend run test        # vitest
```

> The `noderium-desktop` crate embeds the frontend `dist/` via `generate_context!`, so it is
> excluded from the pure-Rust checks and built separately (CI `desktop` job / `just build`).

## Definition of done

A change is done when:

- It does exactly what was asked — no more, no less.
- Tests cover the new behavior and the whole suite is green.
- `typecheck`, `clippy -D warnings`, `fmt --check`, `lint`, and `format:check` all pass.
- UI changes were visually verified in light **and** dark.
- It's committed atomically with a clean conventional message (no Claude co-author).
