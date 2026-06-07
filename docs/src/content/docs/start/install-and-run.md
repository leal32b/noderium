---
title: Install & run
description: Prerequisites and the commands to build and launch Noderium from source for the first time.
sidebar:
  order: 2
---

Noderium builds from source today (no prebuilt installers yet). It's a polyglot
monorepo — a Rust core plus a SolidJS + Tauri 2 frontend.

## Prerequisites

- **Rust** (stable; see `rust-toolchain.toml`).
- **Node 22** + **pnpm** (the version is pinned in `package.json`).
- **`just`** — `brew install just` or `cargo install just`.
- **Tauri CLI** (once) — `cargo install tauri-cli --locked`.

## Get the code

```sh
git clone https://github.com/leal32b/noderium.git
cd noderium
pnpm install
```

## Run the desktop app

The full app boots Vite + the Rust core in a native window:

```sh
just dev-desktop
```

Prefer the browser-only frontend (no Rust core)?

```sh
just dev
```

## First launch

On first run the app opens an **in-app-data SQLite** file as your workspace (there's no
migration UX yet). Head to the **Journal** and start typing — then follow the
[Quickstart](/start/quickstart/) to walk the full capture → distill → search → review
loop.

## Build & test

```sh
just build   # frontend dist + cargo build --release
just test    # cargo test + frontend test + editor latency
```

For the full set of recipes and per-package commands, see
[Dev setup & commands](/contributing/dev-setup/).
