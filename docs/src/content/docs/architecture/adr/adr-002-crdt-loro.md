---
title: 'ADR-002 — CRDT = Loro'
description: Loro is the CRDT engine — Tree for block hierarchy, Text per block, Map for properties — native in Rust and WASM.
sidebar:
  label: 'ADR-002 — CRDT = Loro'
  order: 2
---

**Status:** Accepted

## Context

The sync engine is the business heart and must run in JS (editor) **and** Rust
(persistence, server, mobile).

## Decision

**Loro** — `Tree` for the block hierarchy, `Text` per block, `Map` for properties.
The same engine runs natively in Rust and in WASM.

## Alternatives

- **Automerge** — excellent history/branching model (Git-like), but larger and
  slower. Kept as a backup if "note branching" becomes a pillar.
- **Yjs** — JS-first, awkward for a Rust core + server. Rejected.

## Consequences

Better performance and smaller documents; stable encoding post-1.0 (critical for
data that lives for years); a movable `Tree` directly maps an outliner. Risk: a
younger ecosystem. Market validation: CoCube uses Loro as its disk format.
