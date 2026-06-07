---
title: Principles
description: The design lens for Noderium's UI — coherence, simplicity, and performance, applied to surfaces, theming, and interaction.
---

The product sells on **speed and focus**. The UI exists to get out of the way of
*capture → distill → retain*. These principles shape every screen.

## The lens

1. **Coherence** — one way to do a thing, used everywhere. A new component should look
   like it was always here. Reuse a pattern before inventing one.
2. **Simplicity** — the simplest UI that meets the need wins. No options nobody asked
   for; remove before adding.
3. **Performance is a feeling** — instant theme swaps (no rebuild), no layout jank,
   60 fps typing. The [editor budget](/how-it-works/the-editor/) is the bar.
4. **Keyboard-first** — the ⌘K command palette is the central motor of navigation and
   actions; every action should be reachable without the mouse.
5. **Accessible by default** — focus rings, keyboard operability, and semantic markup
   via Kobalte headless components.

## The surface model

Elevation, not absolute lightness, carries hierarchy — and it stays consistent across
light and dark:

- **Chrome** (sidebar, topbar) sits on the **base** tone.
- **Content** is **raised** above the chrome.

This is an architecture invariant, not a preference. See
[Design tokens & themes](/design/tokens-and-themes/) for the variables that encode it.

## Theming & density

Themes are **light / dark / system**, plus a **density** toggle (comfortable /
compact). Both are attributes on `<html>` (`data-theme`, `data-density`) and swap
instantly with no rebuild.
