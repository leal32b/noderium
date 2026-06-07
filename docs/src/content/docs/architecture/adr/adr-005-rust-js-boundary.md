---
title: 'ADR-005 — The Rust ↔ JS boundary'
description: The live Loro doc lives in JS/WASM; deltas flush to a Rust core that owns persistence, indexing, embeddings, sync, and crypto.
sidebar:
  label: 'ADR-005 — Rust ↔ JS boundary'
  order: 5
---

**Status:** Accepted

## Decision

The **live Loro doc lives in JS/WASM**, attached to the editor (no IPC per
keystroke). It flushes deltas to **Rust**, which owns persistence (SQLite), indexing
(FTS5 + sqlite-vec), embeddings, sync, crypto, the markdown parser, and the canonical
block model. The **same native Loro** runs on the server and on mobile.

## Consequences

A single data model, with no JS/Rust duplication, and latency on the right thread.
Tauri communication uses **commands + events**, batched (never a round-trip per
keystroke). Command arguments are camelCase on the JS side; Tauri converts them to
Rust snake_case — see the [Tauri command API](/architecture/tauri-command-api/).
