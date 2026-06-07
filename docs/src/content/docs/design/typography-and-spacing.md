---
title: Typography & spacing
description: The type scale, reading measure, and the spacing rhythm that density scales — the vertical grammar of Noderium's UI.
---

:::note[Expanded soon]
This page is seeded in the migration phase and completed in the design-and-diagrams
phase, with the real scale values pulled from the frontend.
:::

Typography and spacing follow the same rule as everything else in the
[design system](/design/principles/): semantic tokens, no magic numbers, consistent
across themes.

## Spacing rhythm

Spacing derives from a base rhythm that **density** scales:

- `--density-space` — the base unit (comfortable vs compact).
- `--control-height` — control height, scaled with density.

Compose spacing from the rhythm rather than hardcoding pixels, so comfortable/compact
stays coherent.

## Typography

- Body text targets a comfortable reading **measure** and line height.
- Headings step down a restrained scale — hierarchy comes from weight and space, not
  loud size jumps.
- The editor's type matches the reading surface so distilled notes read like the
  journal they came from.
