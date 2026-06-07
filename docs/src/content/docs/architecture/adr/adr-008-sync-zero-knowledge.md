---
title: 'ADR-008 — Sync = zero-knowledge E2E server'
description: A zero-knowledge server (Rust + axum + Postgres + S3) relays encrypted CRDT ops; the server never sees plaintext.
sidebar:
  label: 'ADR-008 — Zero-knowledge sync'
  order: 8
---

**Status:** Accepted

## Decision

A **zero-knowledge server** that stores and relays **encrypted CRDT ops/snapshots**
(it never sees plaintext). A thin stack: **Rust + axum**, Postgres (metadata), and
S3-compatible storage (encrypted blobs). The key is derived from the user passphrase,
with multi-device key exchange.

## Consequences

This is the **paid product**. **Key recovery is a first-order UX/business risk** (a
lost passphrase = lost data). *Semantic* conflicts (the same property altered on two
devices) fall to last-writer-wins — we must communicate that CRDT ≠ "always correct
merge", only "no lost ops". See [Sync](/how-it-works/sync/) (v2 / planned).
