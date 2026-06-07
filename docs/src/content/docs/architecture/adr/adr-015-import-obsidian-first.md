---
title: 'ADR-015 — Import: Obsidian in v1, Logseq deferred'
description: Obsidian vault import ships in v1; Logseq import is deferred while its format is in flux post-split.
sidebar:
  label: 'ADR-015 — Obsidian import first'
  order: 15
---

**Status:** Accepted

## Decision

**Obsidian vault import** (`.md` + frontmatter + `[[wikilinks]]`) ships in v1 — cheap,
and it targets the likely audience. **Logseq import is deferred** (its format is in
flux post-split).

## Consequences

An acquisition wedge of frustrated Obsidian power users. See
[Import a vault](/guides/import-a-vault/).
