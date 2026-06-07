---
title: 'ADR-007 — Local AI: embeddings in v1; generation pluggable and opt-in'
description: v1 ships 100% local semantic search; text generation/RAG is a pluggable opt-in backend — no bundled LLM.
sidebar:
  label: 'ADR-007 — Local AI'
  order: 7
---

**Status:** Accepted

## Decision

v1 delivers **100% local and private semantic/hybrid search**.
**Generation/RAG is a pluggable opt-in backend** (local Ollama / bring-your-own
API key / a future paid service). **No bundled LLM** in the installer.

## Alternatives

- **Bundle llama.cpp/mistral.rs/candle for generation in v1** — rejected (heavy, slow
  on average hardware, and mediocre quality from small models).

## Consequences

Strong privacy by default; high value at low cost; no binary bloat or inference
runtime to maintain.
