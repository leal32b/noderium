---
title: Changelog
description: Notable changes to Noderium, newest first — following the Keep a Changelog format.
---

All notable changes to Noderium are documented here, newest first, following
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). For day-to-day work see the
git history; this page records milestones.

:::note[Stub]
The full changelog is compiled in a later phase. The entries below are a starting
point.
:::

## Unreleased

### Added

- Documentation site (Astro Starlight) — this site
  ([ADR-014](/architecture/adr/adr-014-docs-astro-starlight/)).

## v0 — Walking skeleton

### Added

- Polyglot monorepo (cargo + pnpm + just), CI, and the editor latency perf-budget.
- SolidJS FSD frontend shell (theming, i18n, ⌘K command palette).
- Block editor (ProseMirror + loro-prosemirror), p95 ≈ 0.8 ms.
- CRDT source of truth (Loro) with rebuildable SQLite derived indexes.
- A working `capture → persist → search → link → retain` slice: journal, atomic notes
  + backlinks, lexical search (FTS5), FSRS review, `.md` import/export.

See [Status](/roadmap/status/) for the detailed feature matrix.
