---
title: Write & link atomic notes
description: Distill ideas into atomic notes and connect them with [[wikilinks]] and backlinks.
---

Atomic notes are the **distill** end of the workflow: small, single-idea notes
connected with `[[wikilinks]]`. Every link is bidirectional — the target shows who
points to it.

## Create a note

1. Open **Notes** (sidebar, or **⌘K** → *Go to Notes*).
2. Click **New note**.
3. Type the idea. Like the journal, the note **autosaves** as you write; the title is
   derived from the first block.

## Link to another note

1. In any block, type `[[` and the start of a note's title, e.g. `[[Spaced repetition]]`.
2. Close it with `]]`. That creates a **wikilink** to the target note.
3. Open the target note — its **Backlinks** pane now lists the note you just linked
   from.

:::tip
Links are the point of a Zettelkasten. Prefer many small notes with dense links over a
few large ones — backlinks turn the collection into a graph you can explore.
:::

## How links are indexed

When the editor flushes, the core re-derives the link graph from your `[[wikilinks]]`
into the `links` index, which powers the backlinks pane — a rebuildable
[derived index](/how-it-works/crdt-source-of-truth/), not the source of truth.

## Next

- [Search your notes](/guides/search-your-notes/) — find anything fast.
- [Export to Markdown](/guides/export-to-markdown/) — take your notes with you.
