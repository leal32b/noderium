<div align="center">
  <h1>N O D E R I U M</h1>
  <p>
    <strong>Local-first. Graph-powered. Blazing Fast.</strong>
  </p>

  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status">
    <img src="https://img.shields.io/badge/PRs-welcome-orange.svg" alt="PRs Welcome">
    <img src="https://img.shields.io/badge/stack-Tauri_v2_%7C_Rust_%7C_SolidJS-red" alt="Tech Stack">
  </p>
</div>

---

## 🛑 Why another note-taking app?

We believe personal knowledge management shouldn't require choosing between **performance** and **freedom**.

Currently, the market forces a compromise:
1.  **Obsidian:** Great ecosystem, but the core is proprietary, and it relies on Electron (heavy resource usage).
2.  **Logseq:** Open source and great block structure, but suffers from performance issues on large graphs and stability quirks.

### The Noderium Mission
Noderium is the answer for 2026. We are building a "second brain" that:
* 🚀 **Is Blazing Fast:** Built with **Rust** and **SolidJS**. No Virtual DOM, no bloatware.
* 📂 **Respects your Files:** The Markdown on your disk is the *Source of Truth*. The database is just a disposable index.
* 📱 **Is Ubiquitous:** Native Desktop and Mobile with a single codebase (Tauri v2).
* 🔓 **Is 100% Open Source:** No "Pro" features hidden behind a proprietary core.

---

## ⚡ Architecture & Stack

Designed for extreme performance and Developer Experience (DX).

| Layer | Technology | Why? |
| :--- | :--- | :--- |
| **Runtime** | [Tauri v2](https://v2.tauri.app/) | Tiny binaries (~10MB), native security, Mobile & Desktop ready. |
| **Core / Backend** | **Rust** | Zero-copy Markdown parser, async File I/O, and memory safety. |
| **Database** | **SQLite** | Relational indexing of the knowledge graph. The DB rebuilds itself if deleted. |
| **Frontend** | [SolidJS](https://www.solidjs.com/) | Superior performance over React. Fine-grained reactivity without VDOM overhead. |
| **Styling** | TailwindCSS | Rapid UI iteration. |

### The Data Flow (The Truth Flow)
1.  User edits `note.md`.
2.  **Rust (Watcher)** detects the file change.
3.  **Rust (Parser)** extracts metadata, `[[wiki-links]]`, and #tags.
4.  **SQLite** is updated instantly.
5.  **SolidJS** receives an event and updates the UI (Graph/Backlinks).

---

## 🗺️ Roadmap: Where are we?

We are on **Day 1**. Focus is currently on foundation and architecture.

- [ ] **Phase 1: The Editor (Current)**
    - Monorepo & Tauri v2 setup.
    - Rust-based Markdown File I/O.
    - Basic SQLite indexing.
- [ ] **Phase 2: The Graph**
    - High-performance Graph visualization (Canvas/WebGL).
    - Backlinks sidebar.
- [ ] **Phase 3: The Experience**
    - Full-text Search (FTS5 via SQLite).
    - Mobile Support (Android/iOS).

> See [ROADMAP.md](./ROADMAP.md) for technical details and milestones.

---

## 🛠️ Contributing (Developer Setup)

We want you up and running in under 10 minutes.

### Prerequisites
* **Rust** (Stable)
* **Node.js** (v20+)
* **pnpm** (Required for monorepo management)
* Build dependencies for your OS (see Tauri guides).

### Running the Project

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/leal32b/noderium.git](https://github.com/leal32b/noderium.git)
    cd noderium
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run the App (Desktop):**
    ```bash
    pnpm dev:app
    ```
    *This starts Vite and the Rust compiler simultaneously.*

### Monorepo Structure
* `apps/app`: The main application (Tauri + SolidJS).
* `apps/docs`: Documentation (Docusaurus).
* `packages/`: Shared libraries (Future expansion).

---

## 🤝 Community

* **Questions?** Open a [Discussion](https://github.com/your-username/noderium/discussions).
* **Bugs?** Open an [Issue](https://github.com/your-username/noderium/issues).
* Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting your first PR!

---

<p align="center">
  Made with ❤️ and 🦀 (Rust) by the Noderium community.
</p>