---
title: Decision records (ADRs)
description: The decision log — an index of all 15 architecture decision records, each with its status.
---

Every significant architectural choice in Noderium is recorded as an **Architecture
Decision Record (ADR)**: context → decision → alternatives → consequences. Each ADR
is a standalone, linkable page. All are **Accepted** unless noted otherwise.

| ADR | Decision | Status |
| --- | --- | --- |
| [ADR-001](/architecture/adr/adr-001-block-model-crdt-source-of-truth/) | Block model; source of truth = SQLite + Loro CRDT; `.md` is export | Accepted |
| [ADR-002](/architecture/adr/adr-002-crdt-loro/) | CRDT = Loro | Accepted |
| [ADR-003](/architecture/adr/adr-003-versioning-crdt-dag/) | Versioning via the CRDT DAG (git is not first-class) | Accepted |
| [ADR-004](/architecture/adr/adr-004-desktop-tauri-solidjs-editor/) | Desktop = Tauri 2 + SolidJS; editor = ProseMirror + loro-prosemirror | Accepted |
| [ADR-005](/architecture/adr/adr-005-rust-js-boundary/) | The Rust ↔ JS boundary | Accepted |
| [ADR-006](/architecture/adr/adr-006-search-fts5-vec-rrf/) | Search = FTS5 + sqlite-vec + local embeddings, fused via RRF | Accepted |
| [ADR-007](/architecture/adr/adr-007-local-ai-embeddings/) | Local AI: embeddings in v1; generation pluggable and opt-in | Accepted |
| [ADR-008](/architecture/adr/adr-008-sync-zero-knowledge/) | Sync = zero-knowledge E2E server | Accepted |
| [ADR-009](/architecture/adr/adr-009-open-core-licensing/) | Open-core: client Apache-2.0; server source-available/proprietary | Accepted |
| [ADR-010](/architecture/adr/adr-010-curation-no-plugins/) | Curation: no arbitrary-code plugins in v1 | Accepted |
| [ADR-011](/architecture/adr/adr-011-mobile-portable-core/) | Mobile: core portable day 1, app post-v1 | Accepted |
| [ADR-012](/architecture/adr/adr-012-frontend-fsd/) | Frontend: Feature-Sliced Design | Accepted |
| [ADR-013](/architecture/adr/adr-013-polyglot-monorepo/) | Polyglot monorepo: cargo + pnpm; runner `just` | Accepted |
| [ADR-014](/architecture/adr/adr-014-docs-astro-starlight/) | Docs: Astro Starlight | Accepted |
| [ADR-015](/architecture/adr/adr-015-import-obsidian-first/) | Import: Obsidian in v1, Logseq deferred | Accepted |
