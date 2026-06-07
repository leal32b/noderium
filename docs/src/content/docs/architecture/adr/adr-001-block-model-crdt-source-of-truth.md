---
title: 'ADR-001 — Block model; source of truth = SQLite + Loro CRDT'
description: Block-based structured model with the Loro CRDT (in SQLite) as the source of truth; markdown is import/export.
sidebar:
  label: 'ADR-001 — Block model + CRDT truth'
  order: 1
---

**Status:** Accepted

## Context

We wanted blocks (transclusion, refs, queries), editable `.md`, and CRDT sync —
an incompatible trio. Logseq spent ~3 years proving "blocks + `.md` as truth" is a
lossy round-trip trap, and migrated to DB-first.

## Decision

A **block-based structured model**. The **source of truth is the CRDT (Loro)
persisted in SQLite**. Markdown is **import/export**, not the live editing surface
or the truth.

## Alternatives

- **File-first à la Obsidian** — rejected: prevents rich blocks/SRS/zettel and
  fine-grained sync.
- **Hybrid with `.md` as truth** — rejected: exactly Logseq's original trap.

## Consequences

Gain performance (query index, no lossy round-trip), a high evolution ceiling, and
native versioning. Cost: editing files externally is no longer a first-class
guarantee (accepted by the product owner).

See [CRDT as source of truth](/how-it-works/crdt-source-of-truth/) for how this rule
plays out in the running system.
