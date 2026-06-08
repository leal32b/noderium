---
title: Export to Markdown
description: Export your notes to deterministic .md — frontmatter, block ids, and [[wikilinks]] preserved.
---

Anti-lock-in is a core principle: **export is always available**. A note exports to a
**deterministic** Markdown file.

## Export a note

1. Open the note you want to export.
2. Choose **Export**.
3. You get the note's Markdown — frontmatter on top, content below.

## What you get

One file per note (an atomic note = a file; a journal = one file per day), with:

- **frontmatter** — `id`, `type`, `title`, `created`, optional `props` and `srs`,
- the content in **Markdown**, with `[[Links To Other Notes]]` preserved, and
- stable **block anchors** (`^id`) so block-level links survive.

```markdown
---
id: 01J9X4...
type: atomic
title: Example atomic note
created: 2026-06-06T10:00:00Z
props:
  status: seedling
---

Content in **markdown**, with [[Links To Other Notes]]
and a reference to a specific block. ^01J9X5
```

The export is a **snapshot** — fine-grained history stays in the CRDT. See the
[export format](/architecture/data-model/) for the full specification, and
[Import a vault](/guides/import-a-vault/) for the round trip back in.
