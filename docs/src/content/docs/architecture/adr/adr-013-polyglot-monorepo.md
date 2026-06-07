---
title: 'ADR-013 — Polyglot monorepo: cargo + pnpm; runner just'
description: A cargo workspace + pnpm workspace, with just as the task runner; moon is the upgrade path.
sidebar:
  label: 'ADR-013 — Polyglot monorepo'
  order: 13
---

**Status:** Accepted

## Decision

A **cargo workspace** (Rust crates) + a **pnpm workspace** (JS packages). The task
runner is a **`justfile`** (simple and sufficient to start). **moon** is the upgrade
path if we want a unified polyglot task graph.

## Alternatives

- **Nx / Turborepo** — JS-first, treating Rust as second-class. Deferred/rejected as
  the main runner.

## Consequences

Lean tooling; no premature optimization. See
[Overview & repo layout](/architecture/overview/) and
[Dev setup & commands](/contributing/dev-setup/).
