---
title: 'ADR-004 — Desktop = Tauri 2 + SolidJS; editor = ProseMirror + loro-prosemirror'
description: A Tauri 2 + SolidJS SPA with a ProseMirror editor bound to Loro; the <16ms typing budget is proven by Spike #1.
sidebar:
  label: 'ADR-004 — Tauri 2 + SolidJS + editor'
  order: 4
---

**Status:** Accepted

## Decision

**Tauri 2** (low footprint) + **SolidJS** (fine-grained reactivity, ideal for an
editor) as a **pure SPA** (no meta-framework/SSR). The editor is the **ProseMirror**
family with the `loro-prosemirror` binding, rendering WYSIWYG per-block editing.

## Alternatives

- **Electron** — controls the render engine, but heavy. Rejected for the lightness
  principle.
- **A meta-framework (SolidStart)** — rejected (local app, no SEO/server).
- **CodeMirror 6 as the main engine** — demoted to a "markdown mode" for advanced
  users (novices won't tolerate raw syntax).
- **BlockSuite / Lexical** — rejected (Yjs-coupled, clashes with Loro).

## Consequences

A small, fast binary. **Accepted risk:** WebKitGTK on Linux (an inconsistent webview
engine). **Mandatory Spike #1:** prove `loro-prosemirror` with < 16 ms latency before
committing the repo — this is now [verified in code](/how-it-works/the-editor/)
(p95 ≈ 0.8 ms).
