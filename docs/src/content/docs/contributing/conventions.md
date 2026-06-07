---
title: Conventions
description: Commit conventions, FSD import boundaries, and i18n dictionary sync — the rules that keep the codebase coherent.
---

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), with a **lowercase
subject** (commitlint enforces this). One logical change per commit; every commit must
build and pass.

```text
feat(store): add list_notes query
fix(frontend): disable autocomplete on search inputs
style(frontend): consistent surface hierarchy
docs: add the architecture decision log
```

:::caution
**Never** add a `Co-Authored-By: Claude` trailer (or any Claude attribution) to
commits.
:::

## FSD import boundaries

Imports flow **down only**, and only through a slice's public API (`index.ts`),
enforced by `eslint-plugin-boundaries`:

```text
app → pages → widgets → features → entities → shared
```

No deep imports into a slice's internals. See [Frontend (FSD)](/architecture/frontend-fsd/).

## i18n sync

Keep the **en-US** and **pt-BR** dictionaries in sync. **`en-US` is the source of
truth** for the translation types — add a key there first, then translate it.

## Design tokens

Colors and spacing come from CSS variables in `theme.css`. **Never hardcode hex.** The
surface model is: chrome (sidebar/topbar) = base tone, content = raised — consistent in
elevation across light and dark. See [Design tokens & themes](/design/tokens-and-themes/).

## Files

Prefer editing existing files over adding new ones; remove anything you obsolete.
