---
title: Search
description: Hybrid search — lexical (FTS5/BM25) shipped today, semantic (local embeddings + sqlite-vec) planned, fused by Reciprocal Rank Fusion.
---

Search is **100% local** and designed to be **hybrid**: lexical + semantic, fused into
one ranking ([ADR-006](/architecture/adr/adr-006-search-fts5-vec-rrf/)). Everything
lives in a single SQLite file — no external service, no index to ship around.

## Lexical search — shipped

SQLite **FTS5** (BM25) indexes block text. It is fast and trivial at the reference
scale (50k notes), with a budget of **< 30 ms**. This is what powers search today.

The FTS index is a [derived index](/how-it-works/crdt-source-of-truth/): it is rebuilt
from the CRDT, never the source of truth.

## Semantic search — planned

The semantic half adds **local embeddings** (a ~384-dim model such as bge-small /
MiniLM via `candle`/`fastembed`) stored in **sqlite-vec**, in the same file. No data
leaves the device ([ADR-007](/architecture/adr/adr-007-local-ai-embeddings/)).

:::caution[Planned]
Semantic search is not built yet — `crates/ai` and `crates/search` are stubs. The
lexical path is complete.
:::

## Fusion (RRF)

Lexical and semantic result lists are combined with **Reciprocal Rank Fusion** — a
simple, robust rank-merge that doesn't require calibrating scores across the two
engines. The hybrid budget is **< 120 ms**, dominated by embedding the query (~10–50 ms
on CPU).

## Budgets

| Path | Budget (p95) |
| --- | --- |
| Lexical (FTS5) | < 30 ms |
| Hybrid (lexical + semantic) | < 120 ms |
