---
title: CRDT as source of truth
description: The golden rule — the Loro CRDT is the only source of truth; every SQLite table except the CRDT store is a rebuildable derived index.
---

## The golden rule

The **Loro CRDT is the only source of truth**
([ADR-001](/architecture/adr/adr-001-block-model-crdt-source-of-truth/)). Every SQLite
table **except `crdt_docs` / `crdt_oplog` is a rebuildable derived index** — blocks,
notes, links, FTS, embeddings, and the SRS queue. Markdown is import/export, not the
live surface.

This is not just a principle on paper. It is enforced by a test:
`app-core::tests::derived_index_is_rebuildable_from_crdt` wipes the entire block index
and rebuilds it **byte-identical** from the Loro snapshot. Keep that test passing and
the rule holds.

## The data flow (editor → core)

When the editor flushes, the snapshot becomes the truth and everything else is derived
from it:

```
JS editor (live Loro doc, loro-prosemirror)
  └─ exportSnapshot() ─► Tauri invoke "save_editor_snapshot"
        └─ app-core::import_editor_snapshot
             ├─ store.save_snapshot   (crdt_docs = source of truth)
             ├─ crdt::blocks_from_prosemirror_snapshot   (cross-language read)
             ├─ store.upsert_block …  (blocks + FTS index)
             └─ reindex_links         (links/backlinks from [[wikilinks]])
```

:::note[Diagram]
A data-flow diagram is added in the design-and-diagrams phase.
:::

## Why a CRDT (not files, not git)

- **Files as truth** is a lossy round-trip trap for a block model — Logseq spent ~3
  years proving it and migrated to DB-first.
- **The CRDT DAG is the version control** — per-block, per-operation, with automatic
  merge ([ADR-003](/architecture/adr/adr-003-versioning-crdt-dag/)). Git is an
  optional peripheral integration, not the core.
- **Sync falls out for free (later)** — encrypted CRDT ops relayed through a
  zero-knowledge server ([Sync](/how-it-works/sync/)).

## Consequences

You get native versioning (history, named checkpoints), fast queries from the derived
indexes, and a portable single SQLite file. The cost — editing the underlying files
externally is no longer a first-class guarantee — is accepted by design. The
structures themselves are described in the [data model](/architecture/data-model/).
