<div align="center">
  <h1>N O D E R I U M</h1>
  <p>
    <strong>Local-first. AI-native. Zero maintenance.</strong>
  </p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status">
    <img src="https://img.shields.io/badge/PRs-welcome-orange.svg" alt="PRs Welcome">
    <img src="https://img.shields.io/badge/stack-Tauri_v2_%7C_Rust_%7C_SolidJS-red" alt="Tech Stack">
  </p>
</div>

---

## Why Noderium?

**80% of PKM users abandon their tools within 6 months.** Not because of missing features—because the cognitive cost exceeds the benefit.

Noderium resolves the three fundamental tensions that cause this abandonment:

| Tension | Problem | Noderium Solution |
|---------|---------|-------------------|
| **Capture Paradox** | Manual capture is friction, ideas get lost | Capture in <5 seconds with ubiquitous entry |
| **Maintenance Tax** | 3-5 hours/week organizing, not thinking | Zero maintenance with AI-driven organization |
| **Retrieval Failure** | Search has 10% accuracy, trust erodes | 95%+ success with conversational retrieval |

### The Five Design Pillars

1. **Minimum-Effort Capture** — From thought to saved in <5 seconds
2. **Invisible Organization** — AI organizes; you just think
3. **Conversational Retrieval** — Talk to your knowledge like a colleague
4. **Ownership & Privacy** — Local-first, open formats, your control
5. **Intentional Onboarding** — Productive in <10 minutes

> 📖 [**Read the full Vision & Mission →**](https://leal32b.github.io/noderium/docs/introduction/vision)

---

## Architecture & Stack

Designed for extreme performance and developer experience.

| Layer | Technology | Why |
|-------|------------|-----|
| **Runtime** | [Tauri v2](https://v2.tauri.app/) | Tiny binaries (~10MB), native security, mobile & desktop ready |
| **Core** | **Rust** | Zero-copy Markdown parser, async file I/O, memory safety |
| **Database** | **SQLite** | Relational indexing of knowledge graph. Rebuilds if deleted |
| **Frontend** | [SolidJS](https://www.solidjs.com/) | Fine-grained reactivity without Virtual DOM |
| **Styling** | TailwindCSS | Rapid UI iteration |

### The Truth Flow

```
User edits note.md
       ↓
Rust (Watcher) detects change
       ↓
Rust (Parser) extracts [[wiki-links]], #tags, metadata
       ↓
SQLite updated instantly
       ↓
SolidJS receives event, updates UI
```

**Key Principle**: The Markdown on your disk is the *Source of Truth*. The database is just a disposable index.

---

## Roadmap

We are on **Day 1**. Current focus: foundation and architecture.

### Phase 1: The Editor (Current)
- [x] Monorepo & Tauri v2 setup
- [ ] Rust-based Markdown File I/O
- [ ] Basic SQLite indexing
- [ ] File system watcher

### Phase 2: The Graph
- [ ] High-performance graph visualization (Canvas/WebGL)
- [ ] Backlinks sidebar

### Phase 3: The Experience
- [ ] Full-text Search (FTS5 via SQLite)
- [ ] Mobile support (Android/iOS)
- [ ] Conversational retrieval

> 📖 [**See full Roadmap →**](https://leal32b.github.io/noderium/docs/introduction/roadmap)

---

## Getting Started

### Prerequisites

- **Rust** (Stable) — [rustup.rs](https://rustup.rs/)
- **Node.js** (v20+) — [nodejs.org](https://nodejs.org/)
- **pnpm** — Required for monorepo management
- Build dependencies for your OS — [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/leal32b/noderium.git
cd noderium

# Install dependencies
pnpm install

# Run the app (starts Vite + Rust compiler)
pnpm dev:app
```

### Monorepo Structure

```
noderium/
├── apps/
│   ├── app/          # Main application (Tauri + SolidJS)
│   └── docs/         # Documentation (Docusaurus)
├── packages/         # Shared libraries (future)
└── pnpm-workspace.yaml
```

> 📖 [**Full installation guide →**](https://leal32b.github.io/noderium/docs/getting-started/installation)

---

## Documentation

| Document | Description |
|----------|-------------|
| [Vision & Mission](https://leal32b.github.io/noderium/docs/introduction/vision) | Why Noderium exists, core beliefs, product vision |
| [The Five Pillars](https://leal32b.github.io/noderium/docs/introduction/pillars) | Architecture principles that resolve the tensions |
| [Roadmap](https://leal32b.github.io/noderium/docs/introduction/roadmap) | Development phases and success metrics |
| [Getting Started](https://leal32b.github.io/noderium/docs/getting-started/installation) | Installation and quick start guide |

---

## Community

- **Questions?** Open a [Discussion](https://github.com/leal32b/noderium/discussions)
- **Bugs?** Open an [Issue](https://github.com/leal32b/noderium/issues)
- **Contributing?** Read [CONTRIBUTING.md](./CONTRIBUTING.md) first

---

## Core Beliefs

1. **Your knowledge is an extension of your identity** — It deserves respect, privacy, and control
2. **Cognitive load is real and finite** — Every organization decision steals from thinking
3. **Trust is the foundation** — Transparency, local control, and results build trust
4. **AI changes the game** — But only if it's local-first, yours, and transparent
5. **Simplicity in complexity is luxury** — Focused constraints liberate more than infinite options

---

<p align="center">
  Made with 🦀 and ❤️ by the Noderium community.
</p>
<p align="center">
  <a href="https://leal32b.github.io/noderium/">Documentation</a> •
  <a href="https://github.com/leal32b/noderium/discussions">Discussions</a> •
  <a href="https://github.com/leal32b/noderium/issues">Issues</a>
</p>
