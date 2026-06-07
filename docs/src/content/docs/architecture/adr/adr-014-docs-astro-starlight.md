---
title: 'ADR-014 — Docs: Astro Starlight'
description: Astro Starlight for documentation — lightweight, content-first, great DX, aligned with the performance obsession.
sidebar:
  label: 'ADR-014 — Docs: Astro Starlight'
  order: 14
---

**Status:** Accepted

## Decision

**Astro Starlight** for documentation — lightweight, content-first, great DX, and
aligned with the project's performance obsession. (This very site.)

## Alternatives

- **Docusaurus** — overkill (React, heavy) without a day-1 need for versioning/blog/
  i18n.
- **VitePress** (OK), **mdBook** (minimal Rust) — viable but less suited.

## Consequences

Docs live as part of the monorepo, with a fast build. See
[Contributing](/contributing/dev-setup/) for the `just docs` recipes.
