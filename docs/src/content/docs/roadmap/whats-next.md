---
title: Phases & what's next
description: The Now / Next / Later board — what's shipping, what's coming, and what's deferred, mapped to the phased roadmap.
---

Noderium ships in rigid phases to keep three hard products (editor, sync, AI) from
becoming scope infinity. For what already exists, see [Status](/roadmap/status/).

## Now — finish the local-first product (v1)

Single-device, fully local. Building out the remaining v1 functional requirements on
top of the working skeleton:

- **Hybrid semantic search** — local embeddings + sqlite-vec + RRF (the lexical half
  ships today). [How search works →](/how-it-works/search/)
- **Typed properties** (FR-5), block move/indent ops, and history/checkpoints UI
  (FR-8).
- **GUI vault import** (Tauri dialog + Obsidian walker) and markdown source mode
  (FR-3).
- AI generation as a **pluggable extension point** — no bundled backend
  ([ADR-007](/architecture/adr/adr-007-local-ai-embeddings/)).

## Next — E2E sync (v2, monetization)

The paid product: a zero-knowledge, end-to-end-encrypted sync service
([ADR-008](/architecture/adr/adr-008-sync-zero-knowledge/)).

- Multi-device sync, key exchange, and **key recovery** (the first-order risk).
- History compaction; pricing by retention.
- [How sync will work →](/how-it-works/sync/)

## Later — beyond v1/v2

- **Mobile app** (Tauri 2) — high priority; the core is portable from day 1
  ([ADR-011](/architecture/adr/adr-011-mobile-portable-core/)).
- **Local generation / RAG** (Ollama / bring-your-own-key) as first-class backends.
- **Curated extensibility** — the core API is already plugin-ready
  ([ADR-010](/architecture/adr/adr-010-curation-no-plugins/)).
- **Optional git integration**; a free sync tier via the user's own repo.
- **Logseq import** ([ADR-015](/architecture/adr/adr-015-import-obsidian-first/)).

## Out of scope (for now)

Deliberately *not* doing, to protect focus: a plugin marketplace, a bundled LLM,
real-time multi-user collaboration, whiteboard/canvas/kanban/Notion-style databases,
and in-app accounts (beyond paid sync).
