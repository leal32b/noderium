---
title: Import a Markdown / Obsidian vault
description: Bring existing Markdown or Obsidian notes into Noderium — frontmatter and [[wikilinks]] included.
---

Noderium imports Markdown with frontmatter and `[[wikilinks]]`, targeting **Obsidian**
vaults ([ADR-015](/architecture/adr/adr-015-import-obsidian-first/)). Logseq import is
deferred.

## What import does

For a Markdown note, import:

- parses the YAML-ish **frontmatter** (`id`, `type`, `title`, `props`, …),
- preserves `[[wikilinks]]`, which become real links + backlinks, and
- writes the content into the CRDT (the [source of truth](/how-it-works/crdt-source-of-truth/)),
  rebuilding the search and link indexes.

## Importing today

The import path exists in the core and is exposed as the `import_markdown`
[Tauri command](/architecture/tauri-command-api/) (`noteId`, `markdown`). It takes the
Markdown body of a note and imports it into that note.

:::caution[Planned]
A **GUI vault picker** (a Tauri file dialog plus an Obsidian-vault walker that imports a
whole folder at once) is on the [roadmap](/roadmap/whats-next/) but not built yet. For
now, import is per-note via the command above.
:::

## Round trip

Import is the inverse of [export](/guides/export-to-markdown/): the same frontmatter +
`[[wikilinks]]` + block-id conventions are read on the way in and written on the way
out, so a vault can move through Noderium and back out as Markdown.
