# Implementation status

> Snapshot of what's built so far. Companion to [`ARCHITECTURE.md`](../../ARCHITECTURE.md)
> (vision, ADRs, data model). This tracks **what exists in code**, not the plan.

**Stage:** v0 walking skeleton complete + a working `capture → persist → search → link → retain` slice.
**Tests:** 30 Rust unit/integration tests, 3 frontend tests, 1 editor latency test — all green.
**De-risked:** Spike #1 (editor latency) **PASS**; CRDT↔SQLite round-trip; cross-language Loro; Tauri FFI.

---

## What works today

| Capability | FR / ADR | Where | Status |
|---|---|---|---|
| Monorepo (cargo + pnpm + just), CI, perf-budget | ADR-013 | repo root, `.github/` | ✅ |
| SolidJS FSD frontend shell (theming, i18n, ⌘K palette) | ADR-012 | `apps/desktop/frontend` | ✅ |
| Block editor: ProseMirror + loro-prosemirror | ADR-004 | `packages/editor` | ✅ (p95 ≈ 0.8 ms, < 16 ms budget) |
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

- **Hybrid semantic search** (`ai` crate: local embeddings + sqlite-vec + RRF) — FR-7 semantic. `crates/ai`, `crates/search` are stubs.
- **Typed properties** (FR-5), block move/indent ops, history/checkpoints UI (FR-8).
- **GUI vault import** (Tauri dialog + Obsidian walker), markdown source mode (FR-3).
- **E2E sync** (FR-11, v2): `crates/sync-client`, `server/sync-server` are stubs.

---

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
  src-tauri/    ✅ Tauri 2 app, 9 commands, on-disk Workspace
  frontend/     ✅ SolidJS FSD: home, journal, editor pages
```

## The golden rule, in code

ADR-001 says the CRDT is the sole source of truth and every SQLite table (except
the CRDT store) is a rebuildable derived index. This is enforced by a test:
`app-core::tests::derived_index_is_rebuildable_from_crdt` wipes the entire block
index and rebuilds it **byte-identical** from the Loro snapshot.

## Data flow (editor → core)

```
JS editor (live Loro doc, loro-prosemirror)
  └─ exportSnapshot() ─► Tauri invoke "save_editor_snapshot"
        └─ app-core::import_editor_snapshot
             ├─ store.save_snapshot   (crdt_docs = source of truth)
             ├─ crdt::blocks_from_prosemirror_snapshot   (cross-language read, ADR-002)
             ├─ store.upsert_block …  (blocks + FTS index)
             └─ reindex_links         (links/backlinks from [[wikilinks]])
```

## Tauri commands (Rust ↔ JS, ADR-005)

`create_note` · `add_block` · `note_blocks` · `search` · `search_detailed` ·
`save_editor_snapshot` · `load_editor_snapshot` · `export_note_markdown` ·
`open_journal` · `backlinks` · `import_markdown` · `list_notes` ·
`create_card` · `due_cards` · `review_card`

Frontend client: `apps/desktop/frontend/src/shared/api/core.ts` (camelCase arg keys —
Tauri converts to Rust snake_case).

---

## Running it

```sh
# Desktop app (Vite + Rust core + native window). Needs the Tauri CLI once:
#   cargo install tauri-cli --locked
just dev-desktop

# Frontend only, in the browser (no Rust core):
just dev

# Build the desktop app (frontend dist first, then Rust):
just build
```

### Tests & checks

```sh
cargo test --workspace --exclude noderium-desktop   # 30 Rust tests
just test-editor                                    # editor latency (fails if p95 > 16ms)
pnpm --filter @noderium/desktop-frontend test       # frontend (vitest)
cargo clippy --workspace --exclude noderium-desktop -- -D warnings
cargo fmt --all -- --check
```

> The `noderium-desktop` crate is excluded from the pure-Rust checks because
> `generate_context!` embeds the frontend `dist/`; it is built in CI's `desktop`
> job (and via `just build`) after the frontend is built.

## Try the loop (in `just dev-desktop`)

1. Open **Journal** → type → **Persist to core** (saves to today's daily note).
2. **Export .md** → see the deterministic markdown.
3. **Search** a word you typed → it appears (FTS5).
4. Backlinks populate once another note `[[links]]` to today's title.

---

## Known limitations

- The desktop app opens an **in-app-data SQLite** file; there is no migration UX yet.
- The journal/notes editors **autosave** (debounced) and re-hydrate from their stored
  snapshot on open; the `/editor` spike page still seeds 100 demo blocks (manual save).
- Frontmatter parsing is a minimal `key: value` reader, not full YAML.
- Note titles are auto-derived from the first block (journal keeps its date title).
