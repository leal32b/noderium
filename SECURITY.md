# Security Policy

## Supported versions

Noderium is pre-1.0 (`0.0.x`). Security fixes land on the latest `main`; there are
no backported release branches yet.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub's **["Report a vulnerability"](https://github.com/leal32b/noderium/security/advisories/new)**
(Security → Advisories) so we can triage and fix before disclosure.

Include, where possible:

- affected component (a `crates/*` crate, the desktop shell, the frontend, or the
  sync server) and version/commit,
- a reproduction or proof of concept,
- the impact you observed.

We aim to acknowledge within a few days and to coordinate a fix and disclosure
timeline with you.

## Scope notes

- Noderium is **local-first**: notes live on-device in SQLite (the Loro CRDT is the
  source of truth). The desktop app talks to the Rust core via Tauri commands, not
  HTTP (ADR-005).
- End-to-end-encrypted multi-device sync is a **future** capability (ADR-008); the
  `sync-client`/`sync-server` crates are stubs today.
