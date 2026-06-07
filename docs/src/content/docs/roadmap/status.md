---
title: Status
description: A snapshot of what's built today — the living implementation status of Noderium.
---

A snapshot of what exists **in code**, not the plan. For the plan, see
[Phases & what's next](/roadmap/whats-next/); for the decisions behind it, the
[decision records](/architecture/decisions/).

- **Stage:** v0 walking skeleton complete + a working
  `capture → persist → search → link → retain` slice.
- **Tests:** 30 Rust unit/integration tests, 3 frontend tests, 1 editor latency test —
  all green.
- **De-risked:** Spike #1 (editor latency) **PASS**; CRDT↔SQLite round-trip;
  cross-language Loro; Tauri FFI.

## What works today

| Capability | FR / ADR | Where | Status |
| --- | --- | --- | --- |
| Monorepo (cargo + pnpm + just), CI, perf-budget | ADR-013 | repo root, `.github/` | ✅ |
| SolidJS FSD frontend shell (theming, i18n, ⌘K palette) | ADR-012 | `apps/desktop/frontend` | ✅ |
| Block editor: ProseMirror + loro-prosemirror | ADR-004 | `packages/editor` | ✅ (p95 ≈ 0.8 ms) |
| CRDT source of truth (Loro), block tree + text | ADR-002 | `crates/crdt` | ✅ |
| SQLite derived indexes (FTS5), rebuildable from CRDT | ADR-001/006 | `crates/store` | ✅ |
| Editor → core flush (snapshot → persist → index) | ADR-005 | `app-core`, desktop | ✅ |
| On-disk persistence (app-data SQLite) | — | `apps/desktop/src-tauri` | ✅ |
| Lexical search (FTS5/BM25) | FR-7 (lexical) | `store`, `app-core` | ✅ |
| Journal: date-keyed daily note | FR-1 | `app-core`, `/journal` | ✅ |
| Notes list + per-note pages + autosave | FR-2/FR-4 | `/notes`, `/note/:id` | ✅ |
| Atomic notes + `[[wikilinks]]` → backlinks | FR-4 | `core`, `store`, `app-core` | ✅ |
| Spaced repetition (FSRS) + review UI | FR-6 | `crates/srs`, `/review` | ✅ |
| Deterministic `.md` export | FR-9 | `crates/core`, `app-core` | ✅ |
| Markdown / Obsidian import | FR-10/ADR-015 | `crates/core`, `app-core` | ✅ |
| Command palette, themes, i18n (en-US/pt-BR) | FR-12 | frontend | ✅ |

### Not started

- **Hybrid semantic search** (`ai` crate: local embeddings + sqlite-vec + RRF) —
  FR-7 semantic. `crates/ai`, `crates/search` are stubs.
- **Typed properties** (FR-5), block move/indent ops, history/checkpoints UI (FR-8).
- **GUI vault import** (Tauri dialog + Obsidian walker), markdown source mode (FR-3).
- **E2E sync** (FR-11, v2): `crates/sync-client`, `server/sync-server` are stubs.

## Crates

```
crates/
  core/         ✅ markdown export + import (frontmatter, wikilinks)
  store/        ✅ SQLite: notes/blocks/links/srs_cards/FTS5/crdt_docs + migrations
  crdt/         ✅ Loro NoteDoc + loro-prosemirror snapshot parsing
  srs/          ✅ FSRS scheduler (wraps rs-fsrs)
  app-core/     ✅ Workspace facade orchestrating all of the above
  search/       ◻ stub (hybrid RRF)
  ai/           ◻ stub (embeddings; pluggable generation)
  sync-client/  ◻ stub (E2E crypto + sync engine)
server/sync-server/  ◻ stub (zero-knowledge relay)
packages/editor/     ✅ ProseMirror + loro-prosemirror, useLoroEditor hook
apps/desktop/
  src-tauri/    ✅ Tauri 2 app, 15 commands, on-disk Workspace
  frontend/     ✅ SolidJS FSD: home, journal, editor pages
```

## The golden rule, in code

[ADR-001](/architecture/adr/adr-001-block-model-crdt-source-of-truth/) says the CRDT
is the sole source of truth and every SQLite table (except the CRDT store) is a
rebuildable derived index. This is enforced by a test:
`app-core::tests::derived_index_is_rebuildable_from_crdt` wipes the entire block index
and rebuilds it **byte-identical** from the Loro snapshot. See
[CRDT as source of truth](/how-it-works/crdt-source-of-truth/).

## Known limitations

- The desktop app opens an **in-app-data SQLite** file; there is no migration UX yet.
- The journal/notes editors **autosave** (debounced) and re-hydrate from their stored
  snapshot on open; the `/editor` spike page still seeds 100 demo blocks (manual save).
- Frontmatter parsing is a minimal `key: value` reader, not full YAML.
- Note titles are auto-derived from the first block (the journal keeps its date title).
