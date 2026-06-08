---
title: Search your notes
description: Find anything fast with local search and the ⌘K command palette.
---

Search is **100% local** and instant. There are two ways in: the command palette and
the search surface.

## Search from the command palette

1. Press **⌘K** (Ctrl+K) anywhere.
2. Type your query — the palette searches your notes *and* lists commands (placeholder:
   *Search notes or run a command…*).
3. Press **Enter** on a result to jump to it.

The palette is also how you navigate (*Go to Journal/Notes/Review*) and run actions
(*Toggle theme*) without the mouse.

## Search the full collection

1. Open the search surface and type into **Search your notes…**.
2. Run the search — matching blocks appear with their owning note.

## What's matched

Today's search is **lexical** (SQLite FTS5/BM25) over your block text, with a budget of
< 30 ms. Semantic search (local embeddings, fused via RRF) is planned — see
[How search works](/how-it-works/search/).

:::note
The search index is a rebuildable
[derived index](/how-it-works/crdt-source-of-truth/); new text is searchable as soon as
the editor flushes.
:::
