---
title: 'ADR-010 — Curation: no arbitrary-code plugins in v1'
description: No unrestricted JS plugin marketplace in v1, but the core is designed for extension later; themes via CSS vars from day one.
sidebar:
  label: 'ADR-010 — No arbitrary plugins'
  order: 10
---

**Status:** Accepted

## Decision

Coherent with "closed in *how to operate*". **No** unrestricted JS plugin marketplace
in v1. **But** the core (commands, events, data access, themes) is designed for
extension later. Themes use CSS variables from day one.

## Alternatives

- **An unrestricted JS plugin API (Obsidian-style)** — rejected: it is the #1 cause of
  Obsidian's performance/security problems and undermines the lightness principle.

## Consequences

A consistent, performant experience; the ecosystem moat (which takes years) is
deferred, with no architectural debt.
