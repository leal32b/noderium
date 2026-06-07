---
title: 'ADR-003 — Versioning via the CRDT DAG (git is not first-class)'
description: CRDT history is the version control; git is an optional peripheral integration, outside the v1 core.
sidebar:
  label: 'ADR-003 — Versioning via CRDT DAG'
  order: 3
---

**Status:** Accepted

## Context

"Version with git" seemed a requirement, but decomposing the needs (time-travel,
backup, portability, diff) shows most are already covered by the CRDT or by export.

## Decision

**CRDT history is the version control** — superior to git in this domain
(per-block/operation, automatic merge). Exposed as a per-note history pane, **named
checkpoints**, and a "what changed" view. Git is an **optional peripheral
integration** (toggle "export to git repo", a possible free-tier sync), **outside
the v1 core**.

## Alternatives

- **Continuous deterministic git with round-trip** — rejected: reimplements a worse
  VCS alongside a better one, at high engineering cost (stable serialization,
  reimport, conflicts).

## Consequences

A smaller v1 scope and a single versioning system. Requires a **history compaction
strategy** (the DAG grows).
