# Contributing to Noderium

Thanks for your interest! The full guides live in the `docs/` Starlight site
(run `just docs`). This page is the quick map.

## Prerequisites

- **Rust** (pinned by `rust-toolchain.toml`) + `cargo`
- **Node 22** + **pnpm** (`corepack enable`)
- **just** (`brew install just` or `cargo install just`)
- For the desktop app: the Tauri CLI (`cargo install tauri-cli --locked`)

See [Dev setup & commands](docs/src/content/docs/contributing/dev-setup.md).

## Workflow

```sh
just dev           # frontend in the browser (no Rust core)
just dev-desktop   # full app: Vite + Rust core + native window
just test          # cargo test + frontend test + editor latency
just lint          # cargo clippy -D warnings
just fmt           # cargo fmt --check
```

- **Conventional Commits**, lowercase subject (commitlint enforces this), e.g.
  `feat(store): add list_notes query`.
- **Commit small and atomic** — one logical change per commit; every commit must
  build and pass.
- **Tests ship with behavior changes.** UI changes are verified in light **and** dark.
- **FSD boundaries** (frontend) and **pure domain crates** (Rust) are enforced —
  see the [conventions](docs/src/content/docs/contributing/conventions.md) and the
  [architecture overview](docs/src/content/docs/architecture/overview.md).
- Keep **en-US** and **pt-BR** dictionaries in sync (`en-US` is the source of truth).

## Definition of done

A change is done when it does exactly what was asked, is covered by tests, the whole
suite is green (`typecheck`, `clippy -D warnings`, `fmt --check`, `lint`,
`format:check`), and it is committed atomically with a clean message. See the
[working agreement](docs/src/content/docs/contributing/working-agreement.md).

## License

By contributing, you agree your contributions are licensed under
[Apache-2.0](LICENSE) (the client and domain crates). The sync server is
source-available under a separate license — see [`server/LICENSE.md`](server/LICENSE.md).
