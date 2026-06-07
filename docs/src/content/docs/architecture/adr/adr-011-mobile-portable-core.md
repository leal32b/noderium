---
title: 'ADR-011 — Mobile: core portable day 1, app post-v1'
description: All domain crates are portable for mobile from day 1; the mobile app (Tauri 2 iOS/Android) is deferred to post-v1.
sidebar:
  label: 'ADR-011 — Portable core, mobile later'
  order: 11
---

**Status:** Accepted

## Decision

All domain crates (`core`, `store`, `crdt`, `search`, `srs`, `sync-client`) are
**portable for mobile** from day 1 (the same Loro, with Swift/Kotlin bindings). The
**mobile app** (Tauri 2 iOS/Android) is **deferred to post-v1**.

## Consequences

Don't let mobile dictate the desktop architecture, but don't make choices that
preclude it. (Mobile is where paid sync sells most — a high priority on the future
roadmap.)
