---
title: Sync
description: Multi-device sync as a zero-knowledge, end-to-end-encrypted service — the planned v2 paid product. The server never sees plaintext.
---

:::caution[Planned — v2]
Sync is the **v2 paid product**, not in v1. `crates/sync-client` and
`server/sync-server` are stubs today. This page explains the intended design
([ADR-008](/architecture/adr/adr-008-sync-zero-knowledge/)).
:::

## The model

Each note is a Loro document. The client **encrypts** updates and snapshots **before**
sending them. The server is a **zero-knowledge relay/store** of opaque blobs — it
**never sees plaintext or keys**.

## Crypto

- A master key is derived from the user's passphrase (**Argon2id**).
- Per-document keys; multi-device key exchange via an envelope scheme.
- The server stores only ciphertext and minimal metadata.

## The stack

A thin, stateless service: **Rust + axum**, **Postgres** (metadata: devices,
versions, minimal ACL), and **S3-compatible storage** (encrypted blobs).

## Conflicts

The CRDT resolves **structural** conflicts automatically — no lost operations. But a
CRDT is not "always the correct merge": **semantic** collisions (the same property
changed on two devices) fall to **last-writer-wins**. That distinction has to be
communicated clearly in the UX.

## First-order risks

- **Key recovery** — a lost passphrase means lost data. This is the first product
  problem to solve before v2.
- **History bloat** — the DAG grows; compaction and shallow snapshots are required.
- **Storage cost** — history is the pricing axis: full history is free locally; the
  paid service retains N months of encrypted history.

A possible **free tier** later: "sync via your own git repo" — offloads infra, with an
inferior UX and no real-time.
