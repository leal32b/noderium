---
title: Review with spaced repetition
description: Turn notes into cards and review a due queue scheduled by FSRS.
---

Spaced repetition is the **retain** end of the workflow: turn a note into a card, then
work the due queue. The scheduler is [FSRS](/how-it-works/spaced-repetition/).

## Turn a note into a card

1. Open the note you want to remember (from **Notes**).
2. Choose **Add to review** — this creates an SRS card targeting the note.

## Work the queue

1. Open **Review** (sidebar, or **⌘K** → *Go to Review*).
2. For each due card, recall the answer, then grade how it went:

| Rating | When to use |
| --- | --- |
| **Again** | You failed to recall it. |
| **Hard** | You recalled it, with difficulty. |
| **Good** | You recalled it correctly. |
| **Easy** | It was trivial. |

3. FSRS uses your grade to update the card's stability/difficulty and schedule the next
   review. Repeat until the queue is empty.

## Where the state lives

A card's SRS state is stored in the CRDT as properties — it's part of the
[source of truth](/how-it-works/crdt-source-of-truth/). The "what's due now" list is
just a [rebuildable index](/how-it-works/spaced-repetition/).
