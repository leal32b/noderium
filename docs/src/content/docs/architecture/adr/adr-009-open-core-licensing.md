---
title: 'ADR-009 — Open-core: client Apache-2.0; server source-available/proprietary'
description: The client and domain crates are Apache-2.0; the sync server is source-available (FSL/BUSL) or proprietary. The disk format stays open.
sidebar:
  label: 'ADR-009 — Open-core licensing'
  order: 9
---

**Status:** Accepted

## Decision

The **client is Apache-2.0** (permissive + a patent clause). The **sync server** is
**source-available** (FSL/BUSL — converts to OSS after N years) **or** proprietary. A
**CLA** is required from contributors (to keep the dual-license option open). The disk
format (Loro) is open.

## Alternatives

- **MIT** (no patent), **AGPL** (barely bites on a desktop app; scares
  companies/devs), **SSPL** (reputational poison with an OSS audience) — rejected.

## Consequences

The real moat is UX + a reliable hosted service + methodology + brand — not the
protocol, which is replicable. Sync margins are thin — plan for it.
