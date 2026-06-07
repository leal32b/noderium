---
title: What is Noderium
description: A local-first PKM that unifies journal, Zettelkasten, and spaced repetition into one capture → distill → retain workflow.
sidebar:
  order: 1
---

Noderium is a **local-first, lightweight, opinionated personal knowledge management
(PKM) tool**. It unifies three methods into a single first-class workflow — instead of
making you assemble them from plugins:

1. **Journal** — low-friction daily capture.
2. **Zettelkasten** — distillation into densely interconnected atomic notes.
3. **Spaced repetition (SRS)** — retention through spaced review.

The **capture → distill → retain** axis *is* the product.

## The three pillars

- **Capture** in the [journal](/guides/keep-a-daily-journal/): a date-keyed daily note,
  always one keystroke away.
- **Distill** into [atomic notes](/guides/write-and-link-atomic-notes/) connected with
  `[[wikilinks]]` and backlinks.
- **Retain** by turning notes into
  [spaced-repetition cards](/guides/review-with-spaced-repetition/) scheduled with
  FSRS.

## What makes it different

- **Local-first** — the primary copy lives on your device; nothing leaves it without
  explicit opt-in.
- **Fast** — a Tauri 2 + Rust core with a hard [typing budget](/how-it-works/the-editor/)
  of < 16 ms.
- **A CRDT is the source of truth** — structured, block-based, with native versioning
  ([how it works](/how-it-works/crdt-source-of-truth/)). Markdown is import/export, not
  the live surface.
- **Private semantic search** — hybrid lexical + (planned) local semantic search, 100%
  on-device ([how it works](/how-it-works/search/)).
- **Anti-lock-in** — an open disk format (Loro) and on-demand markdown export, always.

## Who it's for

- **Advanced users** escaping Obsidian/Logseq (performance, closed core, fragile sync).
- **Newcomers** who want a "second brain" without building the rails themselves.

The opinionated methodology is the bridge: newcomers follow the rails; advanced users
descend into the same primitives.

## Next

- [Install & run](/start/install-and-run/) — get it running.
- [Quickstart](/start/quickstart/) — the loop, end to end.
- [How it works](/how-it-works/system-overview/) — the system, explained.
