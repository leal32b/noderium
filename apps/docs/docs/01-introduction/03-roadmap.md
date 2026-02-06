# Product Roadmap

> From abandonment (80%) to retention (65%+) through systematic tension resolution.

---

## Current Status

**We are on Day 1.** Focus is currently on foundation and architecture.

---

## Development Phases

### Phase 1: The Editor (Current)

The foundation of everything.

- [x] Monorepo setup with pnpm workspaces
- [x] Tauri v2 application scaffold
- [x] **Markdown editor** (CodeMirror 6) with syntax highlighting
- [x] **Hide markers plugin** — distraction-free editing (markers hidden when cursor is not on line)
- [x] **Keyboard shortcuts** — `Cmd/Ctrl+B` (bold), `Cmd/Ctrl+I` (italic), `Cmd/Ctrl+E` (inline code)
- [x] **Comprehensive test suite** — 100% coverage enforced
- [ ] Rust-based Markdown File I/O
- [ ] Basic SQLite indexing
- [ ] File system watcher (Rust)
- [ ] Markdown parser with wiki-links and tags

### Phase 2: The Graph

Visual knowledge connections.

- [ ] High-performance graph visualization (Canvas/WebGL)
- [ ] Backlinks sidebar
- [ ] Note relationships panel
- [ ] Graph filtering and search

### Phase 3: The Experience

Polish and essential features.

- [ ] Full-text Search (FTS5 via SQLite)
- [ ] Mobile support (Android/iOS via Tauri)
- [ ] Conversational retrieval (local AI)
- [ ] Guided onboarding flow

---

## Vision Phases

| Phase | Milestone | Key Features |
|-------|-----------|--------------|
| **Phase 1** | Foundation | Core capture & organization, local conversational retrieval, basic collaboration, mobile MVP |
| **Phase 2** | Integration | Multi-modal content (articles, videos, audio), native integrations (Slack, Email, etc.), team applications |
| **Phase 3** | Intelligence | Advanced reasoning, AI proactivity (suggestions before you ask), team knowledge graphs |
| **Phase 4** | Ubiquity | Workflow integration, semi-autonomous agency, emergent thinking patterns discovery |

---

## Success Metrics

We measure success not by features shipped, but by tensions resolved.

| Metric | Target | Why |
|--------|--------|-----|
| **Retention** | 35%+ at 8 weeks | 80% of retention LTV happens here |
| **DAU/MAU** | 25%+ | "Stickiness" metric; users return daily |
| **Aha Moment** | &lt;10 min | Critical; 80% of churn happens days 1-3 |
| **Feature Adoption** | 3+ features week 1 | Users with 3+ features = 4x better retention |
| **NPS** | 50+ | User satisfaction; word-of-mouth driver |
| **Security/Privacy** | 100% compliance | Trust is foundational |

---

## Retention Journey: Our Target

### The Current Reality (Existing Tools)

```
Day 1:   "I don't know where to start"
         └─→ 20% ABANDON HERE

Week 1:  "How should I organize?"
         └─→ 15% ABANDON HERE (35% total)

Month 1: "I can't find what I saved"
         └─→ 15% ABANDON HERE (50% total)

Month 2: "This is now a job"
         └─→ 15% ABANDON HERE (65% total)

Month 3: "Maybe a different tool?"
         └─→ 15% ABANDON HERE (80% FINAL)
```

### The Noderium Target

| Checkpoint | Existing Tools | Noderium | Improvement |
|------------|----------------|----------|-------------|
| **Day 1 Completion** | 80% | 95%+ | +15 pts |
| **Week 1 Aha Moment** | 50% | 95%+ | +45 pts |
| **Week 1 Abandonment** | 35% | &lt;5% | -30 pts |
| **Month 1 Active Users** | 50% | 90%+ | +40 pts |
| **Month 2 Maintenance Burden** | 3-5 h/week | &lt;15 min/week | -94% effort |
| **Month 3 Retention** | 20% | 65%+ | +45 pts |
| **3-Month Stickiness** | ~13% DAU/MAU | 25%+ DAU/MAU | +92% |

---

## Technical Architecture

### Stack Overview

| Layer | Technology | Why |
|-------|------------|-----|
| **Runtime** | [Tauri v2](https://v2.tauri.app/) | Tiny binaries (~10MB), native security, mobile & desktop ready |
| **Core/Backend** | **Rust** | Zero-copy Markdown parser, async file I/O, memory safety |
| **Database** | **SQLite** | Relational indexing of knowledge graph. Rebuilds itself if deleted |
| **Frontend** | [SolidJS](https://www.solidjs.com/) | Superior performance vs React. Fine-grained reactivity without VDOM |
| **Styling** | [UnoCSS](https://unocss.dev/) | Atomic CSS with instant performance |

### The Data Flow (Truth Flow)

1. User edits `note.md`
2. **Rust (Watcher)** detects the file change
3. **Rust (Parser)** extracts metadata, `[[wiki-links]]`, and #tags
4. **SQLite** is updated instantly
5. **SolidJS** receives an event and updates the UI (Graph/Backlinks)

**Key Principle**: The Markdown on your disk is the *Source of Truth*. The database is just a disposable index.

---

## Contributing to the Roadmap

We're building in the open. Here's how to contribute:

1. **Discussions**: Share ideas and feedback in [GitHub Discussions](https://github.com/leal32b/noderium/discussions)
2. **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/leal32b/noderium/issues)
3. **Pull Requests**: Read our [CONTRIBUTING.md](https://github.com/leal32b/noderium/blob/main/CONTRIBUTING.md) before submitting

---

## The Fundamental Bet

Our roadmap is based on one core bet:

> **The biggest market isn't in more features, but in resolving the fundamental tension.**

If we can eliminate the 3 tensions (capture, maintenance, retrieval) simultaneously while maintaining trust (local-first), the rest follows.

Users don't abandon because they lack features. They abandon because the system costs more than it's worth.

Noderium solves this through architecture, not features.
