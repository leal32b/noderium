# Architecture & Specification — Noderium

> **Status:** Draft 1 (ready to scaffold the repository)  
> **Date:** 2026-06-06  
> **Language:** Document in English; code, identifiers, configs, and the bootstrap prompt use English throughout.

This document is the direct input for monorepo scaffolding. It records the vision, requirements, architecture decisions (ADRs with alternatives), data model, sync architecture, open-core strategy, monorepo structure, and roadmap in phases.

---

## 1. Vision and positioning

A **local-first, lightweight, and opinionated PKM tool** that unifies three methods into a single first-class workflow — rather than requiring users to assemble this manually with plugins:

1. **Journal** — low-friction daily capture.
2. **Zettelkasten** — distillation into densely interconnected atomic notes.
3. **Spaced Repetition (SRS)** — retention via spaced review.

The *capture → distill → retain* axis is the product. The data model is structured (block-based) with a CRDT engine as the source of truth, 100% local hybrid search (lexical + semantic), and E2E multi-device sync as a paid service.

**Market positioning.** The space converged on "structured store + CRDT + local search" (Logseq migrated from files to DB; Anytype, AFFiNE, SiYuan, CoCube follow this pattern). Obsidian (plain markdown as truth) became the *outlier*, at the cost of not being truly block-based. Our place: **Anytype/CoCube's curated experience + built-in methodology (journal/zettel/SRS) + Tauri/Rust performance**, with open-source client and open disk format for anti-lock-in.

### 1.1 Target audience

- **Advanced users** (frustrated escapees from Obsidian/Logseq: performance, closed core, fragile sync, degrading plugins).
- **Novices** who want a "second brain" without building rails themselves.

The **opinionated methodology is the bridge**: novices follow the rails; advanced users descend into the same primitives. The structured model exists precisely to codify the method in the data (note types, properties, relations), which plain files cannot do.

### 1.2 Inviolable principles

1. **Extreme performance** (see budget in §4).
2. **Local-first** — primary copy lives on the user's device.
3. **Privacy by default** — nothing leaves the device without explicit opt-in; sync is E2E zero-knowledge.
4. **Anti-lock-in** — open disk format (Loro) + on-demand markdown export, always.
5. **Curation** — closed in *how to operate* (opinionated experience), open in code.

---

## 2. Out of scope for v1 (what we're NOT doing)

Registering this is as important as positive scope.

- **Mobile app** (the *core* is portable from day 1; the app deferred).
- **Bundled text generation / RAG** (LLM in installer). Generation is pluggable opt-in backend.
- **Arbitrary-code plugin system** (Obsidian-style). Core APIs born "plugin-ready", but no marketplace.
- **Git versioning as first-class system** (CRDT IS versioning; see ADR-003). Git remains optional peripheral integration.
- **Real-time multi-user collaboration** (CRDT enables, but v1 focus is one user, multi-device).
- **Logseq import** (format in flux post-split; see ADR-015). Obsidian import, yes.
- **Whiteboard/canvas, kanban, Notion-style databases.**
- **Auth/login in app** — local-first doesn't require accounts; accounts exist only for paid sync service.

---

## 3. Functional requirements (v1)

- **FR-1 — Journal:** auto-created daily note, date-indexed, as capture surface.
- **FR-2 — Block-based WYSIWYG editor:** block-level editing with markdown markup (⌘/ for `#`, `**`, lists, `[[wikilinks]]`), live preview. Indent/move/reorder blocks.
- **FR-3 — Source markdown mode (power-user):** view/edit raw markdown of a note (serializes ↔ reparses against CRDT). Secondary, non-native.
- **FR-4 — Atomic notes + bidirectional links:** `[[links]]`, backlinks pane, block-level links via anchors.
- **FR-5 — Typed properties:** frontmatter/properties per note and per block (text, number, date, select, relation).
- **FR-6 — Spaced repetition:** transform note/block into card (whole note or cloze); review queue; **FSRS scheduler**.
- **FR-7 — Hybrid search:** lexical (FTS5/BM25) + semantic (local embeddings), fused by RRF.
- **FR-8 — History/versioning:** per-note history pane (time-travel via CRDT DAG) + named checkpoints.
- **FR-9 — On-demand markdown export:** deterministic tree of `.md` files (frontmatter + `^id` + `[[links]]`).
- **FR-10 — Obsidian vault import:** read `.md` + frontmatter + wikilinks.
- **FR-11 — E2E sync (paid product):** multi-device sync, conflict-free, encrypted.
- **FR-12 — Command palette (⌘K), themes (light/dark/system + density), i18n (en-US, pt-BR).**

---

## 4. Non-functional requirements — Performance budget

Targets as **contract**, validated in CI (see §13/Roadmap). Reference vault: **50k notes**.

| Metric | Target (p95) | Note |
|---|---|---|
| Cold start to interactive | **< 400 ms** | Indexing deferred to background |
| Typing latency | **< 16 ms** | Most sacred budget (60fps). Live Loro doc in WASM |
| Lexical search (FTS5) | **< 30 ms** | SQLite FTS5 over 50k docs is trivial |
| Hybrid search (lexical + semantic) | **< 120 ms** | Bottleneck = embedding the query (~10–50 ms on CPU) |
| Memory footprint (no AI) | **< 150 MB** | Base Tauri + mmap index |
| Memory footprint (with vector index) | **< 300 MB** | 50k × 384 × 4 B ≈ 77 MB of vectors |
| Reopen large note (10k blocks) | **< 100 ms** | |

Other NFRs: durability (no data loss even on crash — transactional writes), portability (export always available), accessibility (focus/keyboard via Kobalte), i18n-ready, telemetry opt-in and deferred.

---

## 5. Architecture decisions (ADRs)

Format: context → decision → alternatives → consequences. All ADRs below are **Accepted** unless noted.

### ADR-001 — Block-based model; source of truth = SQLite + Loro CRDT; `.md` is export

- **Context:** we wanted blocks (transclusion, refs, queries), editable `.md`, and CRDT sync — incompatible trio. Logseq spent ~3 years proving "blocks + `.md` as truth" is a lossy round-trip trap, and migrated to DB-first.
- **Decision:** **block-based structured model**. **Source of truth is the CRDT (Loro) persisted in SQLite**. Markdown is **import/export**, not the live editing surface or truth.
- **Alternatives:** (a) *file-first* à la Obsidian — rejected: prevents rich blocks/SRS/zettel and fine-grained sync; (b) *hybrid with `.md` as truth* — rejected: exactly Logseq OG's trap.
- **Consequences:** gain performance (query index, no lossy round-trip), high evolution ceiling, native versioning. Cost: editing files externally is no longer first-class guarantee (accepted by product owner).

### ADR-002 — CRDT = Loro

- **Context:** the sync engine is the business heart and must run in JS (editor) **and** Rust (persistence, server, mobile).
- **Decision:** **Loro** (`Tree` for block hierarchy, `Text` per block, `Map` for properties). Same engine native in Rust and WASM.
- **Alternatives:** *Automerge* (excellent history/branching model like Git, but larger/slower) — kept as backup if "note branching" becomes pillar; *Yjs* (JS-first, awkward for Rust core + server) — rejected.
- **Consequences:** better performance and smaller documents; stable encoding post-1.0 (critical for data living years); `Tree` movable directly maps an outliner. Risk: younger ecosystem (see Risks). Market validation: CoCube uses Loro as disk format.

### ADR-003 — Versioning via CRDT DAG (git is NOT first-class system)

- **Context:** "version with git" seemed a requirement, but decomposing needs (time-travel, backup, portability, diff) most are covered by CRDT or export.
- **Decision:** **CRDT history is the version control** — superior to git in this domain (per-block/operation, automatic merge). Exposed as: per-note history pane, **named checkpoints**, "what changed" view. Git is **optional peripheral integration** (toggle "export to git repo", possible free-tier sync), **outside v1 core**.
- **Alternatives:** continuous deterministic git with round-trip — rejected: reimplements a worse VCS alongside a better one, high engineering cost (stable serialization, reimport, conflicts).
- **Consequences:** smaller v1 scope; single versioning system. Requires: **history compaction strategy** (DAG grows).

### ADR-004 — Desktop = Tauri 2 + SolidJS (SPA); editor ProseMirror + `loro-prosemirror`

- **Decision:** **Tauri 2** (low footprint) + **SolidJS** (fine-grained reactivity, ideal for editor) as **pure SPA** (no meta-framework/SSR). Editor: **ProseMirror** family with `loro-prosemirror` binding, rendering WYSIWYG per-block editing.
- **Alternatives:** *Electron* (controls render engine, but heavy) — rejected for lightness principle; *meta-framework (SolidStart)* — rejected (local app, no SEO/server); *CodeMirror 6* as main engine — demoted to "markdown mode" for advanced users (novices won't tolerate raw syntax); *BlockSuite/Lexical* — rejected (Yjs-coupled, clash with Loro).
- **Consequences:** small, fast binary. **Accepted risk:** WebKitGTK on Linux (inconsistent webview engine) — see Risks. **Mandatory Spike #1:** prove `loro-prosemirror` with < 16 ms latency before committing repo.

### ADR-005 — Rust ↔ JS boundary

- **Decision:** **live Loro doc lives in JS/WASM**, attached to editor (no IPC per keystroke). Flushes deltas to **Rust** owner of: persistence (SQLite), indexing (FTS5 + sqlite-vec), embeddings, sync, crypto, markdown parser, canonical block model. **Same Loro native** runs on server and mobile.
- **Consequences:** single data model, no JS/Rust duplication; latency on right thread. Tauri communication via commands + events, batched (never round-trip per keystroke).

### ADR-006 — Search = FTS5 + sqlite-vec + local embeddings, hybrid via RRF

- **Decision:** **SQLite FTS5** (BM25) for lexical; **sqlite-vec** (same file) for vector; **local embeddings** via `candle`/`fastembed` (model ~384 dim, e.g., bge-small/MiniLM). Fusion by **Reciprocal Rank Fusion**.
- **Alternatives:** *Tantivy* — deferred (more powerful, separate index, more memory; only if we outgrow FTS5); *external vector DB* — rejected (breaks single-file portability).
- **Consequences:** everything in one SQLite file; portable; fast.

### ADR-007 — Local AI: embeddings in v1; generation pluggable and opt-in

- **Decision:** v1 delivers **100% local and private semantic/hybrid search**. **Generation/RAG is pluggable opt-in backend** (Ollama local / bring-your-own-API-key / paid service future). **No bundled LLM** in installer.
- **Alternatives:** bundle llama.cpp/mistral.rs/candle for generation in v1 — rejected (heavy, slow on average hardware, mediocre quality of small models).
- **Consequences:** strong privacy by default; high value at low cost; no binary bloat/inference runtime maintenance.

### ADR-008 — Sync = zero-knowledge E2E server (Loro + axum + Postgres + S3-compatible storage)

- **Decision:** **zero-knowledge server** storing/relaying **encrypted CRDT ops/snapshots** (never sees plaintext). Thin stack: **Rust + axum**, Postgres (metadata), S3-compatible storage (encrypted blobs). Key derived from user passphrase; multi-device key exchange.
- **Consequences:** this is the **paid product**. **Key recovery is first-order UX/business risk** (lost passphrase = lost data). *Semantic* conflicts (same property altered on two devices) fall to LWW — communicate that CRDT ≠ "always correct merge", just "no lost ops".

### ADR-009 — Open-core: client Apache-2.0; server source-available/proprietary

- **Decision:** **client Apache-2.0** (permissive + patent clause). **Sync server** **source-available** (FSL/BUSL — converts to OSS after N years) **or** proprietary. **CLA** on contributors (maintains dual-license option). Disk format (Loro) open.
- **Alternatives:** *MIT* (no patent), *AGPL* (barely bites on desktop app; scares companies/devs), *SSPL* (reputational poison in OSS audience) — rejected.
- **Consequences:** real moat = UX + reliable hosted service + methodology + brand (not protocol, which is replicable). Sync margins are thin — plan for it.

### ADR-010 — Curation: no arbitrary-code plugins in v1

- **Decision:** coherent with "closed in *how to operate*". **No** unrestricted JS plugin marketplace in v1. **But** core (commands, events, data access, themes) born designed for extension later. Themes via CSS vars from day one.
- **Alternatives:** unrestricted JS plugin API Obsidian-style — rejected (cause #1 of its performance/security problems and undermines lightness principle).
- **Consequences:** consistent, performant experience; ecosystem moat (takes years) deferred, no architectural debt.

### ADR-011 — Mobile: core portable day 1, app post-v1

- **Decision:** all domain crates (core, store, crdt, search, srs, sync-client) **portable for mobile** from day 1 (same Loro, Swift/Kotlin bindings). **Mobile app** (Tauri 2 iOS/Android) **deferred to post-v1**.
- **Consequences:** don't let mobile dictate desktop architecture, but don't make choices that preclude it. (Mobile is where paid sync sells most — high priority in future roadmap.)

### ADR-012 — Frontend: Feature-Sliced Design per `BLUEPRINT.md`

- **Decision:** fully adopt the **Tauri + SolidJS** template in `BLUEPRINT.md` (see §11). FSD `app → pages → widgets → features → entities → shared`, boundaries via ESLint, theming via CSS vars, lazy i18n, ⌘K command palette, UnoCSS + Kobalte, TanStack Query + signals + `makePersisted`.
- **Adaptations to our domain:** no auth/session layer in shell (local-first). Blueprint's `RealtimeProvider` becomes **`SyncProvider`** (CRDT/sync engine state). Domain entities (`note`, `block`, `editor`, `search`, `srs`) enter **after** shell.
- **Consequences:** professional, testable frontend base from commit zero; boundaries protect architecture as it grows.

### ADR-013 — Polyglot monorepo: cargo workspace + pnpm; runner `just`

- **Decision:** **cargo workspace** (Rust crates) + **pnpm workspace** (JS packages). Task runner: **`justfile`** (simple, sufficient to start). **moon** upgrade path if we want unified polyglot task graph.
- **Alternatives:** *Nx/Turborepo* — JS-first, treat Rust second-class; deferred/rejected as main runner.
- **Consequences:** lean tooling; no premature optimization.

### ADR-014 — Docs: Astro Starlight

- **Decision:** **Astro Starlight** for documentation (lightweight, content-first, great DX, aligned with performance obsession).
- **Alternatives:** *Docusaurus* — overkill (React, heavy) without day-1 need for versioning/blog/i18n; *VitePress* (OK), *mdBook* (minimal Rust).
- **Consequences:** docs as part of monorepo, fast build.

### ADR-015 — Import: Obsidian in v1, Logseq deferred

- **Decision:** **Obsidian vault import** (`.md` + frontmatter + `[[wikilinks]]`) in v1 — cheap, targets likely audience. **Logseq deferred** (format in flux post-split).
- **Consequences:** acquisition wedge of frustrated Obsidian power users.

---

## 6. Data model

### 6.1 Source-of-truth strategy

```
                 ┌────────────────────────────────┐
   editing  ───► │  Live Loro Doc (JS/WASM)       │  latency < 16ms, attached to editor
                 └──────────────┬─────────────────┘
                  batch delta flush
                                ▼
                 ┌────────────────────────────────┐
                 │  Rust core                     │
                 │  ┌──────────────────────────┐  │
                 │  │ CRDT store (Loro)        │  │  ◄── SOURCE OF TRUTH
                 │  │  - snapshots + oplog     │  │
                 │  └──────────────────────────┘  │
                 │  ┌──────────────────────────┐  │
                 │  │ Derived indexes (SQLite) │  │  ◄── rebuildable from CRDT
                 │  │  blocks, notes, links,   │  │
                 │  │  FTS5, sqlite-vec, srs   │  │
                 │  └──────────────────────────┘  │
                 └───────────────┬────────────────┘
               on-demand export  │            │ encrypted ops
                        ▼        │            ▼
               .md (portable)    │      Sync server (E2E)
```

**Golden rule:** **CRDT is the sole source of truth**. All SQLite tables except CRDT store are **derived indexes and rebuildable**. Includes FTS, embeddings, link graph, and SRS queue (SRS *state* lives in CRDT as properties; `srs_cards` table is just a query index).

### 6.2 Loro structures

- `Tree` — block hierarchy of a document (move/indent/reorder = clean ops).
- `Text` (per block) — block text.
- `Map` (per block/note) — typed properties, note type, SRS state.

### 6.3 SQLite schema (derived indexes) — sketch

```sql
CREATE TABLE notes (
  id            TEXT PRIMARY KEY,         -- stable (CRDT-generated)
  type          TEXT NOT NULL,            -- 'journal' | 'atomic' | ...
  title         TEXT,
  journal_date  TEXT,                     -- ISO date when type='journal'
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE blocks (
  id            TEXT PRIMARY KEY,
  note_id       TEXT NOT NULL REFERENCES notes(id),
  parent_id     TEXT,                     -- NULL = root block
  order_key     TEXT NOT NULL,            -- fractional index for ordering
  block_type    TEXT NOT NULL,            -- 'paragraph' | 'heading' | 'todo' | ...
  text          TEXT NOT NULL DEFAULT ''
);

CREATE TABLE properties (              -- typed properties (note/block)
  owner_id TEXT NOT NULL, key TEXT NOT NULL,
  value TEXT, value_type TEXT NOT NULL,
  PRIMARY KEY (owner_id, key)
);

CREATE TABLE links (                   -- graph for backlinks
  source_block_id TEXT NOT NULL,
  target_note_id  TEXT, target_block_id TEXT,
  link_type       TEXT NOT NULL        -- 'wikilink' | 'embed' | ...
);

CREATE VIRTUAL TABLE blocks_fts USING fts5(text, content='blocks', content_rowid='rowid');

CREATE VIRTUAL TABLE block_vec USING vec0(block_id TEXT, embedding FLOAT[384]);

CREATE TABLE srs_cards (
  id          TEXT PRIMARY KEY,
  target_id   TEXT NOT NULL,            -- note or block
  card_type   TEXT NOT NULL,            -- 'note' | 'cloze'
  due         INTEGER NOT NULL,
  stability   REAL, difficulty REAL,
  reps        INTEGER, lapses INTEGER,
  state       TEXT,                     -- new|learning|review|relearning
  last_review INTEGER
);

CREATE TABLE crdt_docs   (note_id TEXT PRIMARY KEY, snapshot BLOB NOT NULL, version BLOB NOT NULL);
CREATE TABLE crdt_oplog  (seq INTEGER PRIMARY KEY, note_id TEXT NOT NULL, update BLOB NOT NULL, ts INTEGER NOT NULL);
```

### 6.4 Export `.md` format (deterministic, round-trip-able)

One file per note (atomic = file; journal = one file per day). Structure + content are round-trip-able; fine history stays in CRDT (export is snapshot). SRS state optionally in frontmatter; never pollutes body.

```markdown
---
id: 01J9X4...                 # stable note ID
type: atomic
title: Example atomic note
created: 2026-06-06T10:00:00Z
props:
  status: seedling
srs:                          # optional; can be omitted
  due: 2026-06-10
  stability: 4.2
---

Content in **markdown**, with [[Links To Other Notes]]
and reference to a specific block. ^01J9X5
```

---

## 7. Sync architecture (paid product)

- **Model:** each note is a Loro doc. Client encrypts updates/snapshots **before** sending. Server is a **zero-knowledge relay/store** of opaque blobs.
- **Crypto:** master key derived from user passphrase (Argon2id); keys per document; multi-device key exchange via envelope. **Server never sees plaintext or keys.**
- **Server:** Rust + `axum`; Postgres (metadata: devices, versions, minimal ACL); S3-compatible storage (encrypted blobs). Stateless and thin.
- **Conflicts:** automatic resolution by CRDT at structure level; LWW for semantic property collisions.
- **First-order risks:** key recovery (loss = data loss), history bloat (compaction/shallow snapshots), storage cost (history axis of pricing: free local full history; paid sync retains N months encrypted).
- **Free tier (future):** option "sync via user's own git repo" (offload infra), inferior UX, no real-time.

---

## 8. Open-core strategy / licensing

| Component | License | Rationale |
|---|---|---|
| Client desktop + domain crates | **Apache-2.0** | Adoption, contribution, patent |
| `packages/editor`, SDK, theming | **Apache-2.0** | Build ecosystem base |
| Sync server | **FSL/BUSL** (source-available) or proprietary | Protect business; becomes OSS after N years |
| Disk format (Loro) | Open | Anti-lock-in, portability narrative |

- **CLA** required on contributors (maintains future dual-license option).
- **Real moat:** UX + reliable hosted service + methodology + brand. Protocol is replicable — don't count on it as moat.

---

## 9. Monorepo structure

```
noderium/
├── Cargo.toml                      # cargo workspace (members = crates/*, apps/desktop/src-tauri, server/*)
├── pnpm-workspace.yaml             # packages: apps/*, packages/*, docs
├── package.json                    # root scripts (delegate to just)
├── justfile                        # polyglot task runner
├── rust-toolchain.toml
├── .github/workflows/              # CI: lint, test, perf-budget (size-limit + bench)
│
├── crates/                         # === Rust (Apache-2.0) ===
│   ├── core/                       # block model, note types, markdown parser (comrak), .md export
│   ├── store/                      # SQLite (rusqlite/sqlx), FTS5, sqlite-vec, migrations; derived indexes
│   ├── crdt/                       # Loro integration, snapshots, history compaction, checkpoints
│   ├── search/                     # hybrid search (FTS + vector), RRF
│   ├── ai/                         # embeddings (candle/fastembed); trait for pluggable generation backend
│   ├── srs/                        # FSRS scheduler
│   ├── sync-client/                # client sync engine + E2E crypto (Argon2id, envelopes)
│   └── app-core/                   # facade: orchestrates core+store+crdt+search+srs; exposed via Tauri/FFI
│
├── apps/
│   ├── desktop/                    # === Tauri 2 app ===
│   │   ├── src-tauri/              # Rust shell: commands, events, app-core plugin
│   │   └── frontend/               # === SolidJS (FSD, BLUEPRINT.md) ===
│   │       └── src/
│   │           ├── app/            # providers, routes, styles/theme.css
│   │           ├── pages/          # home, settings, not-found
│   │           ├── widgets/        # app-shell, topbar, sidebar, command-palette
│   │           ├── features/       # editor, search, srs-review, journal, command-defaults
│   │           ├── entities/       # note, block, link, command
│   │           └── shared/         # ui (Kobalte), lib (theme, i18n, sync), config, api, types
│   │   (vite.config.ts, tsconfig.json, eslint.config.js, uno.config.ts, etc.)
│   └── mobile/                     # (post-v1) Tauri 2 iOS/Android — reuses crates + shared UI
│
├── packages/                       # === JS shared (Apache-2.0) ===
│   └── editor/                     # block editor: ProseMirror + loro-prosemirror (WASM)
│
├── server/
│   └── sync-server/                # === axum, zero-knowledge (FSL/BUSL or proprietary) ===
│
└── docs/                           # === Astro Starlight ===
    └── implementation/             # Implementation docs per step (see §13.2)
```

**Transversal tooling:** ESLint flat + `eslint-plugin-boundaries` (FSD), Prettier, Husky + lint-staged + commitlint, Vitest + `@solidjs/testing-library` + Playwright (e2e), `cargo clippy`/`cargo nextest`, `size-limit` + benches for performance budget.

---

## 10. Frontend layer (from `BLUEPRINT.md`)

Frontend follows the template **exactly**, with ADR-012 adaptations. Canonical points:

- **FSD with boundaries:** `app > pages > widgets > features > entities > shared`. Imports only via Public API (`index.ts`); deep imports blocked by ESLint.
- **Stack:** SolidJS, Vite, TS strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.), UnoCSS (semantic tokens as CSS vars), Kobalte (headless), `lucide-solid`, Valibot (validation/env).
- **Theming:** `data-theme` + `data-density` on `<html>`, instant swap, no rebuild; `ThemeProvider`/`useTheme`.
- **i18n:** lazy dicts (en-US bundled, pt-BR on-demand), `Intl` formatters, `<html lang>` synced.
- **Command palette (⌘K):** `command` entity + `useDefaultCommands()` + `useCommandPaletteShortcut()` (`@solid-primitives/keyboard`).
- **State:** TanStack Query (server/sync), signals (client), `makePersisted` (local preferences).
- **Providers (order matters):** `RootErrorBoundary > QueryProvider > SyncProvider > I18nProvider > ThemeProvider > ToastProvider > AppRoutes`.
- **Observability:** deferred to microtask after first paint.

Bootstrap prompt ready for Claude Code in **Appendix A**.

---

## 11. Roadmap in phases

### v0 — Walking skeleton & de-risking (prove the path doesn't die)
Goal: validate **technical risks before** building features.
- **Spike #1 (blocker):** ProseMirror + `loro-prosemirror`, per-block editing, < 16 ms latency. If it fails, reassess ADR-004.
- Loro `Tree`/`Text`/`Map` round-trip ↔ editor without snags.
- Loro persistence → SQLite + derived index rebuilds.
- Monorepo scaffold (cargo + pnpm + just) and frontend (BLUEPRINT).
- CI with performance budget measured (cold start, typing).

### v1 — Complete local-first product (single-device)
- FR-1 to FR-10 and FR-12 (journal, block editor, atomic notes + backlinks, properties, SRS/FSRS, hybrid search, history + checkpoints, `.md` export, Obsidian import, ⌘K/themes/i18n).
- AI generation: pluggable extension point (no bundled backend).
- Methodology baked into onboarding (**product decision pending — see §13**).

### v2 — E2E sync (monetization)
- FR-11: zero-knowledge server, E2E crypto, multi-device, key exchange, recovery.
- History compaction; pricing by retention.

### Future
- Mobile app (Tauri 2) — high priority (where sync sells).
- Local generation/RAG (Ollama/BYO-key) as first-class backends.
- Curated extensibility (core API already plugin-ready).
- Optional git integration; free tier sync via user's repo.
- Logseq import.

---

## 12. Main risks and mitigations

1. **The editor** (risk #1). Underestimating ProseMirror+Loro kills the project. → Spike #1 blocker in v0.
2. **`loro-prosemirror` maturity.** Bindings young. → Early prototype; documented fallback.
3. **WebKitGTK on Linux** (perf/consistency under Tauri). → Measure early on Linux audience; consider flags/optimizations; accept as known risk.
4. **CRDT history bloat.** → Compaction/shallow snapshots strategy in `crates/crdt` design.
5. **E2E key recovery UX.** → First-order product problem before v2.
6. **Scope** (three hard products: editor, sync, AI in one). → Rigid phases; v1 single-device, no sync; non-objectives respected.
7. **Weak open-core moat for sync.** → Build UX/reliability/methodology as real moat; thin margins planned.
8. **"Advanced + novices" become scope infinity.** → Methodology one-liner is the focus; without it, product has no center.

---

## 13. Open decisions (product, not architecture)

- **P-1 — Methodology one-liner.** Journal + Zettelkasten + SRS chosen, but missing the anchor sentence (e.g., "everything starts in the journal and distills into atomic notes entering spaced review"). **Required before v1 launch**, not before repo.
- **P-2 — Product name** (noderium is it; if changes, note it).
- **P-3 — Sync pricing model** (history retention as axis).
- **P-4 — Initial note types and properties** that materialize the methodology.

---

## Appendix A — Bootstrap prompt for Claude Code

Adapted from `BLUEPRINT_PROMPT.md` to the monorepo (`apps/desktop/frontend`) and our domain. Run **after** monorepo scaffolding.

```
Bootstrap the SolidJS frontend for a Tauri 2 desktop app inside this monorepo,
at apps/desktop/frontend. Follow BLUEPRINT.md exactly for structure and patterns.

SCOPE (shell only — no domain logic yet):
- Feature-Sliced Design: app → pages → widgets → features → entities → shared
- ESLint flat config with FSD boundary enforcement (eslint-plugin-boundaries)
- TypeScript strict + Vite (vite-plugin-solid) + Vitest + Prettier + Husky + commitlint
- Theme system: light/dark/system + density (CSS vars, data-theme on <html>, no flash)
- i18n: lazy dicts (en-US bundled, pt-BR lazy), Intl formatters, <html lang> sync
- Command palette (⌘K) via @solid-primitives/keyboard
- App shell: topbar + sidebar + main (NO auth/session gating — local-first)
- UnoCSS (semantic tokens as CSS vars) + Kobalte (headless) + lucide-solid
- TanStack Query + signals + makePersisted; Valibot for env validation
- Path aliases: @app @pages @widgets @features @entities @shared

ADAPTATIONS for Noderium:
- Replace blueprint's RealtimeProvider with a SyncProvider stub (CRDT/sync state).
- Providers order: RootErrorBoundary > QueryProvider > SyncProvider > I18nProvider
  > ThemeProvider > ToastProvider > AppRoutes
- NO auth/billing/workspace. AppShell renders children directly (no AuthSplash/gate).
- Tauri integration: adjust vite.config.ts for Tauri build; frontend talks to Rust
  core via Tauri commands/events (NOT HTTP; stub an invoke-based client in shared/api).

DELIVERABLES:
- Full FSD folder structure with index.ts public APIs per slice
- All configs (vite, tsconfig strict, eslint flat + boundaries, prettier, husky, commitlint, uno.config.ts, vitest.config.ts)
- App.tsx with provider stack above; blank Home page at /
- AppShell (Topbar + Sidebar) + CommandPalette + command entity + useDefaultCommands
- ThemeProvider + theme.css (semantic light/dark vars + density)
- I18nProvider + en-US/pt-BR sample dicts
- Base UI: Button, Card, Dialog, Input (Kobalte + UnoCSS + focus-ring)
- env.ts (Valibot), .env.example, sample Vitest test, Storybook (optional)

ARCHITECTURE CONSTRAINTS (enforced by ESLint boundaries):
- app→{pages,widgets,features,entities,shared}; pages→{widgets,features,entities,shared};
  widgets→{widgets,features,entities,shared}; features→{entities,shared};
  entities→{shared}; shared→{shared}. Cross-slice imports ONLY via index.ts public API.

Deliverable state: git-ready, fully typed, ESLint + Prettier clean, tests passing.
```

> Domain entities (`note`, `block`, `editor`, `search`, `srs`, `journal`) and the `editor` feature (ProseMirror + `packages/editor`) enter **after** the shell, contingent on **Spike #1** (ADR-004).