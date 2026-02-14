<div align="center">
  <h1>N O D E R I U M</h1>
  <p>
    <strong>Local-first. AI-native. Zero maintenance.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/stack-Tauri_v2_%7C_Rust_%7C_SolidJS-888" alt="Tech Stack">
    <img src="https://img.shields.io/github/issues-search/leal32b/noderium?query=is%3Aissue%20is%3Aopen&label=issues" alt="issues">
    <img src="https://img.shields.io/badge/PRs-Welcome-blue.svg" alt="PRs Welcome">
    <img src="https://img.shields.io/github/actions/workflow/status/leal32b/noderium/ci-app.yml?label=app&link=https%3A%2F%2Fgithub.com%2Fleal32b%2Fnoderium%2Factions%2Fworkflows%2Fci-app.yml" alt="CI App">
    <img src="https://img.shields.io/github/actions/workflow/status/leal32b/noderium/ci-docs.yml?label=docs&link=https%3A%2F%2Fgithub.com%2Fleal32b%2Fnoderium%2Factions%2Fworkflows%2Fci-docs.yml" alt="CI Docs">
    <img src="https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/leal32b/18a36db0bca9c3f0458afa76d4bc2e34/raw/coverage.json" alt="Coverage">
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
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
| **Editor** | [CodeMirror 6](https://codemirror.net/) | Extensible text editor with Markdown support |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) | Utility-first CSS with a rich component library |
| **Testing** | [Vitest](https://vitest.dev/) | Fast unit testing powered by Vite |
| **Linting** | ESLint + TypeScript ESLint | Code quality and consistency |
| **Versioning** | [Changesets](https://github.com/changesets/changesets) | Automated versioning and changelogs |

### Current Editor Features

The Markdown editor is the foundation of the Noderium experience:

- **CodeMirror 6**: Modern, extensible text editor with markdown support
- **Hide Markers**: Markdown syntax markers are hidden when not editing that line (distraction-free)
- **Keyboard Shortcuts**: `Cmd/Ctrl+B` (bold), `Cmd/Ctrl+I` (italic), `Cmd/Ctrl+E` (code)

### The Truth Flow (Vision)

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
- [x] Markdown editor (CodeMirror 6) with syntax highlighting
- [x] Hide markers plugin (distraction-free editing)
- [x] Keyboard shortcuts (bold, italic, code)
- [x] Theme system (light/dark mode)
- [x] Theme system (light/dark mode with DaisyUI)
- [x] Layout system (Drawer with collapsible sidebars + Navbar)
- [x] Comprehensive test suite (100% coverage)
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
- **Node.js** (v20+ LTS) — [nodejs.org](https://nodejs.org/)
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
pnpm app:dev
```

### Development Commands

| Command | Description |
|---------|-------------|
| `pnpm app:dev` | Run the app in development mode |
| `pnpm app:test` | Run tests with coverage |
| `pnpm docs:dev` | Run documentation site locally |
| `pnpm build` | Build all packages |
| `pnpm --filter noderium-app lint` | Run ESLint on app source |
| `pnpm --filter noderium-app lint:fix` | Auto-fix linting issues |
| `pnpm --filter noderium-app test:watch` | Run tests in watch mode |

### Monorepo Structure

```
noderium/
├── apps/
│   ├── app/           # Main application (Tauri + SolidJS)
│   │   ├── src/       # SolidJS Frontend (UI)
│   │   ├── src-tauri/ # Rust Backend (Core Logic)
│   │   └── test/      # Unit tests (Vitest)
│   └── docs/          # Documentation (Docusaurus)
├── .changeset/        # Changesets configuration
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
