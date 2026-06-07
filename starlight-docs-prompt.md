# Claude Code Prompt — Noderium Documentation (Astro Starlight)

**Copy everything below into a new Claude Code session at the repo root.**

---

You are implementing the **Noderium documentation site** with **Astro Starlight**, inside the
existing monorepo (the `docs/` workspace package already exists as a stub). First read
`CLAUDE.md` (the working agreement — follow it exactly: simplicity, coherence, atomic
Conventional Commits, **no Claude co-author trailer**, verify before commit), then
`ARCHITECTURE.md`, `BLUEPRINT.md`, and `docs/implementation/status.md` — these are the
primary content sources you will migrate into the site.

## Goal

A single, well-organized **source of truth** that covers the whole project: planning →
architecture → UX/UI → how the system works → how to use it → roadmap/“what’s next”.
Docs-as-code: versioned in the repo, built in CI, deployable on push.

## Documentation model (use this)

Organize content with **Diátaxis** (Tutorials, How-to, Reference, Explanation) plus
project sections (Design system, Architecture/ADRs, Roadmap). Keep each page in exactly
one mode — never mix “teach” and “explain” and “look up” on one page.

## Tech & conventions

- **Astro + @astrojs/starlight** in `docs/` (keep the `@noderium/docs` package name; it is
  already in `pnpm-workspace.yaml`). Pin recent stable versions; use pnpm.
- **Search**: Pagefind (Starlight built-in — nothing to wire).
- **i18n**: default `en` (en-US), plus `pt-BR`. Scaffold structure; only the landing +
  “Start here” pages need full pt-BR initially (stub the rest, English fallback is fine).
- **Diagrams**: Mermaid. Use a build-time renderer (e.g. `rehype-mermaid`, or the
  `astro-mermaid` / `@beoe/rehype-mermaid` community integration). Pick the simplest that
  builds in CI without a headless browser if possible; document the choice.
- **Code samples**: Starlight Expressive Code (built-in) with titles + highlighting.
- **Edit links** to the GitHub repo; light/dark; logo = the accent “N” mark.
- Follow `CLAUDE.md`: small atomic commits (`docs: …`), verify the site builds before each.

---

## Information architecture (sidebar)

Create this structure (Starlight `sidebar` config + content collection folders). Items
marked *(migrate)* pull from existing files; *(new)* are written fresh but concise.

```
Start here
  ├─ What is Noderium        (new)  – the vision, the 3 pillars (journal→zettel→SRS)
  ├─ Install & run           (new)  – just dev-desktop, prerequisites, first launch
  └─ Quickstart (tutorial)   (new)  – capture → distill → search → review, end to end

Guides (how-to)
  ├─ Keep a daily journal
  ├─ Write & link atomic notes ([[wikilinks]] + backlinks)
  ├─ Search your notes (⌘K)
  ├─ Review with spaced repetition
  ├─ Import a Markdown / Obsidian vault
  └─ Export to Markdown

How it works (explanation)
  ├─ System overview         (migrate: ARCHITECTURE §overview) + C4-ish Mermaid diagram
  ├─ CRDT as source of truth (the golden rule; rebuildable indexes) + data-flow Mermaid
  ├─ The editor (ProseMirror + Loro, latency budget)
  ├─ Search (FTS5 + sqlite-vec + RRF)            (mark semantic as planned)
  ├─ Spaced repetition (FSRS)
  └─ Sync (E2E, zero-knowledge)                  (v2 / planned)

Design system (UX/UI)
  ├─ Principles              (migrate: CLAUDE.md principles, design lens)
  ├─ Design tokens & themes  (surfaces/elevation model, light+dark, density)
  ├─ Typography & spacing
  ├─ Components              (Button, Card, Input, Dialog, Command palette, Sidebar…)
  └─ Patterns               (page headers, empty states, autosave, tooltips, focus rings)

Architecture
  ├─ Overview & repo layout  (migrate: ARCHITECTURE §monorepo)
  ├─ Frontend (FSD)          (migrate: BLUEPRINT.md)
  ├─ Data model              (migrate: ARCHITECTURE §data model) + ER Mermaid
  ├─ Tauri command API       (reference of all commands + arg casing)
  └─ Decision records (ADRs) (migrate: the 15 ADRs, one file each + a decision log index)

Roadmap
  ├─ Status                  (migrate: docs/implementation/status.md, kept current)
  ├─ Phases & “what’s next”  (Now / Next / Later board)
  └─ Changelog               (Keep a Changelog format)

Contributing
  ├─ Working agreement       (mirror/link CLAUDE.md)
  ├─ Dev setup & commands    (just recipes, per-package checks)
  ├─ Testing strategy        (Rust tests, editor latency, vitest, CI gates)
  └─ Conventions             (Conventional Commits, FSD boundaries, i18n sync)
```

## Content migration map (do not duplicate — move + link, then update sources)

- `ARCHITECTURE.md` → split into **How it works** (explanations), **Architecture/Overview**,
  **Data model**, and **Architecture/Decision records** (one page per ADR, with
  status: accepted/superseded). Leave a short `ARCHITECTURE.md` at the root that points to
  the docs site (or remove if fully migrated — confirm with the user first).
- `BLUEPRINT.md` → **Architecture/Frontend (FSD)** + seed **Design system**.
- `docs/implementation/status.md` → **Roadmap/Status** (this becomes the living status page).
- `CLAUDE.md` → **Contributing/Working agreement** mirrors it (keep `CLAUDE.md` as the
  canonical file Claude reads; the docs page links to it, doesn’t fork it).
- Update root `README.md` and `CLAUDE.md` links to point at the docs site paths.

(There is a project memory that root architecture docs should move into Starlight — this
prompt fulfills it. Migrate; don’t leave two sources of truth.)

---

## Phases (one or more atomic commits each; verify the site builds; then summarize and await “ok”)

**Phase 1 — Scaffold & configure.** Initialize Starlight in `docs/`, wire the
`@noderium/docs` package scripts (`dev`/`build`/`preview`), Starlight config (title, logo,
social, edit links, i18n locales, sidebar skeleton from the IA above), Mermaid + Expressive
Code, and a root `just docs` recipe. **Verify:** `pnpm --filter @noderium/docs build` passes
and `dev` serves locally.

**Phase 2 — Information architecture & migration.** Create all sidebar pages (stubs where
needed), migrate ARCHITECTURE/BLUEPRINT/status per the map, split the 15 ADRs into files
with a decision-log index. **Verify:** no broken internal links (Starlight build fails on
them); sidebar matches the IA.

**Phase 3 — Explanation, design system & diagrams.** Flesh out “How it works” and “Design
system”, add Mermaid diagrams (system overview, editor→core data flow, FSD layers, data
model ER). Document tokens/surfaces/components with real usage snippets. **Verify:** diagrams
render in the build; design pages match the actual `theme.css` tokens.

**Phase 4 — Guides, reference, roadmap & CI/deploy.** Write the how-to guides and the
Quickstart tutorial, the Tauri command reference, the Roadmap (Now/Next/Later) + Changelog.
Add a CI job that builds the docs (and checks links) and a deploy workflow stub
(GitHub Pages or Cloudflare Pages). **Verify:** `just docs-build` is green; CI job added.

## Acceptance criteria

- `pnpm --filter @noderium/docs build` succeeds with **zero broken internal links**.
- The IA above is fully present; every existing root doc is migrated (no duplicated truth).
- All 15 ADRs are individual, linkable pages with status.
- Mermaid diagrams render; Pagefind search works; light/dark + en/pt-BR scaffolding present.
- Design-system pages reflect the real tokens (`src/app/styles/theme.css`) and components.
- A CI docs job builds the site; a deploy workflow stub exists.
- Root `README.md`/`CLAUDE.md` link into the site; the Roadmap page is the “what’s next” home.
- Conventional, atomic commits, **no Claude co-author trailer**.

## Style guide for the docs

- Voice: direct, second person, present tense. Short sentences. Lead with the task/answer.
- One Diátaxis mode per page. How-to = numbered steps to a goal; Explanation = why/trade-offs;
  Reference = exhaustive + skimmable tables; Tutorial = a guaranteed-success walkthrough.
- Every code block has a language + (where useful) a title. Prefer copy-pasteable commands.
- Add screenshots for UI flows (place under `docs/src/assets/`); keep them up to date.
- Cross-link generously; never paste the same content in two places — link to the canonical page.

Begin with **Phase 1**. After it builds, output a summary and await “ok”.
