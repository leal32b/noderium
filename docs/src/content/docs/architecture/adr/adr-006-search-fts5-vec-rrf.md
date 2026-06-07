---
title: 'ADR-006 — Search = FTS5 + sqlite-vec + local embeddings, fused via RRF'
description: Lexical search with SQLite FTS5, vector search with sqlite-vec, local embeddings, fused by Reciprocal Rank Fusion — all in one file.
sidebar:
  label: 'ADR-006 — Hybrid search'
  order: 6
---

**Status:** Accepted

## Decision

**SQLite FTS5** (BM25) for lexical search; **sqlite-vec** (in the same file) for
vector search; **local embeddings** via `candle`/`fastembed` (a ~384-dim model, e.g.
bge-small/MiniLM). Results are fused by **Reciprocal Rank Fusion (RRF)**.

## Alternatives

- **Tantivy** — deferred (more powerful, but a separate index and more memory; only
  if we outgrow FTS5).
- **An external vector DB** — rejected (breaks single-file portability).

## Consequences

Everything lives in one SQLite file; portable and fast. See
[Search](/how-it-works/search/) for the current state — lexical is shipped, semantic
is planned.
