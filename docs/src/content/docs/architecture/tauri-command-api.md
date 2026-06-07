---
title: Tauri command API
description: Reference for every Tauri command the frontend uses to call the Rust core — names, arguments, return types, and argument casing.
---

The frontend calls the Rust core via **Tauri commands**, never HTTP
([ADR-005](/architecture/adr/adr-005-rust-js-boundary/)). Command arguments are
**camelCase** on the JS side; Tauri converts them to Rust `snake_case` (e.g.
`noteType` → `note_type`).

The typed client lives at
`apps/desktop/frontend/src/shared/api/core.ts`; the Rust handlers live at
`apps/desktop/src-tauri/src/commands.rs`.

## Notes & blocks

| Command | Arguments | Returns | Purpose |
| --- | --- | --- | --- |
| `create_note` | `id`, `noteType`, `title?` | `void` | Create a note with a stable id and type. |
| `add_block` | `noteId`, `blockType`, `text` | `string` (block id) | Append a block to a note. |
| `note_blocks` | `noteId` | `BlockDto[]` | List a note's blocks in order. |
| `list_notes` | — | `NoteDto[]` | List all notes. |
| `open_journal` | `date` (ISO) | `string` (note id) | Open (or create) the daily journal note. |

## Editor persistence

| Command | Arguments | Returns | Purpose |
| --- | --- | --- | --- |
| `save_editor_snapshot` | `noteId`, `snapshot` (bytes) | `void` | Persist the live Loro snapshot (source of truth). |
| `load_editor_snapshot` | `noteId` | `bytes \| null` | Re-hydrate the editor from its stored snapshot. |

## Links & search

| Command | Arguments | Returns | Purpose |
| --- | --- | --- | --- |
| `search` | `query` | `string[]` (note ids) | Lexical search (FTS5), id list. |
| `search_detailed` | `query` | `SearchHitDto[]` | Lexical search with block text + owning note. |
| `backlinks` | `noteId` | `BacklinkDto[]` | Notes/blocks that link to this note. |

## Import & export

| Command | Arguments | Returns | Purpose |
| --- | --- | --- | --- |
| `import_markdown` | `noteId`, `markdown` | `void` | Import markdown (frontmatter + `[[wikilinks]]`). |
| `export_note_markdown` | `noteId` | `string` | Deterministic `.md` export of a note. |

## Spaced repetition

| Command | Arguments | Returns | Purpose |
| --- | --- | --- | --- |
| `create_card` | `cardId`, `targetId`, `cardType` | `void` | Turn a note/block into an SRS card. |
| `due_cards` | — | `SrsCardDto[]` | The review queue (cards due now). |
| `review_card` | `cardId`, `rating` | `void` | Grade a card (`again` / `hard` / `good` / `easy`). |

## Data transfer types

```typescript
interface BlockDto { id: string; block_type: string; text: string }
interface NoteDto {
  id: string; type: string; title: string | null;
  journal_date: string | null; created_at: number; updated_at: number;
}
interface SearchHitDto { block_id: string; note_id: string; text: string }
interface BacklinkDto { source_note_id: string; source_block_id: string; text: string }
interface SrsCardDto {
  id: string; target_id: string; card_type: string;
  due: number; state: string; reps: number;
}
type Rating = 'again' | 'hard' | 'good' | 'easy';
```
