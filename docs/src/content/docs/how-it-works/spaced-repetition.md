---
title: Spaced repetition
description: Retention via the FSRS scheduler — turn a note or block into a card, review a due queue, and let stability/difficulty drive the next interval.
---

Spaced repetition is the **retain** end of the *capture → distill → retain* axis. Any
note or block can become a **card** (a whole note or a cloze), and a review queue
surfaces what's due ([FR-6](/roadmap/status/)).

## The scheduler — FSRS

Noderium uses **FSRS** (Free Spaced Repetition Scheduler), implemented in `crates/srs`
(wrapping `rs-fsrs`). FSRS models each card with **stability** and **difficulty** and
predicts the optimal next interval from your grade — fewer reviews for the same
retention than fixed-interval schemes.

You grade a card with one of four ratings:

| Rating | Meaning |
| --- | --- |
| `again` | Failed — reschedule soon. |
| `hard` | Recalled with difficulty. |
| `good` | Recalled correctly. |
| `easy` | Trivially recalled — longer interval. |

## State lives in the CRDT

A card's SRS state (stability, difficulty, due date, reps, lapses) is stored in the
CRDT as properties — it is part of the
[source of truth](/how-it-works/crdt-source-of-truth/). The `srs_cards` SQLite table is
just a **rebuildable query index** for "what's due now".

## In the app

The review flow is wired through three [Tauri commands](/architecture/tauri-command-api/):
`create_card` (turn a target into a card), `due_cards` (the queue), and `review_card`
(grade it). The `/review` page drives the loop.
