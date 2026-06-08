---
title: Keep a daily journal
description: Capture thoughts with zero friction in the date-keyed daily journal note.
---

The journal is the **capture** end of the workflow: one date-keyed note per day,
created automatically. Get the thought down first;
[distill it into atomic notes](/guides/write-and-link-atomic-notes/) later.

## Open today's journal

1. Launch the app with `just dev-desktop` (see [Install & run](/start/install-and-run/)).
2. Click **Journal** in the sidebar — or press **⌘K** (Ctrl+K) and choose
   **Go to Journal**.
3. Noderium opens (or creates) the note for today's date.

## Capture

1. Start typing in the editor. Each line is a block; press **Enter** for a new block.
2. There's no save button — the journal **autosaves** as you type. A **Saved**
   indicator confirms the flush to the core.

That's the whole loop. Everything you type is persisted to today's note and indexed for
[search](/guides/search-your-notes/) immediately.

## What's happening underneath

Your keystrokes go to a live Loro document in the editor; on a debounce, a snapshot
flushes to the Rust core, which persists it as the
[source of truth](/how-it-works/crdt-source-of-truth/) and rebuilds the search index.

## Next

- [Write & link atomic notes](/guides/write-and-link-atomic-notes/) — distill the day's
  capture.
- [Review with spaced repetition](/guides/review-with-spaced-repetition/) — retain what
  matters.
