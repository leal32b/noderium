---
title: The editor
description: A ProseMirror editor bound to a live Loro document via loro-prosemirror — the heart of the product, held to a <16ms typing budget.
---

The editor is the **#1 risk and the #1 feature**. It is a **ProseMirror** editor
bound to a **live Loro document** through the `loro-prosemirror` binding
([ADR-004](/architecture/adr/adr-004-desktop-tauri-solidjs-editor/)), shipped as the
`@noderium/editor` package.

## Why the live doc lives in the browser

Typing must never cross a process boundary. The live Loro document is attached to the
editor in JS/WASM; edits apply locally at memory speed, and **deltas flush to the Rust
core in batches** — never a round-trip per keystroke
([ADR-005](/architecture/adr/adr-005-rust-js-boundary/)).

## The latency budget

Typing latency is the **most sacred budget**: **p95 < 16 ms** (60 fps). This is a
contract enforced in CI — the editor latency test fails the build above it.

This was the project's blocking de-risking spike (**Spike #1**): prove
`loro-prosemirror` per-block editing under 16 ms before committing to the
architecture. It **passed**, with measured **p95 ≈ 0.8 ms** — far inside budget.

| Metric | Budget (p95) | Measured |
| --- | --- | --- |
| Typing latency | < 16 ms | ≈ 0.8 ms |

## Markdown mode (power users)

The WYSIWYG block editor is the native surface. A raw-markdown view (serializes ↔
reparses against the CRDT) is a secondary, power-user mode — CodeMirror 6 was demoted
from "main engine" to exactly this role, because novices won't tolerate raw syntax.

## Persistence

On flush, the editor calls `save_editor_snapshot`; the core stores the snapshot as the
[source of truth](/how-it-works/crdt-source-of-truth/) and rebuilds the derived
indexes. On open, `load_editor_snapshot` re-hydrates the editor.
