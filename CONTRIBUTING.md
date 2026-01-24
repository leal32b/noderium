# Contributing to Noderium

First off, thank you for considering contributing to Noderium! We are building the highest-performance local-first note-taking app in existence, and we can't do it without you.

Noderium is not just another Electron wrapper. We are building a **Tauri v2 + Rust + SolidJS** application that respects the user's RAM and treats Markdown files as the holy source of truth.

> 📚 **Full Documentation**: For comprehensive contribution guidelines, including issue templates, PR workflows, and labels, visit our [Contributing Guide](https://leal32b.github.io/noderium/docs/contributing/overview).

## ⚡ The Philosophy

Before writing code, please understand our core tenets:

1. **Performance Extreme:** If it drops frames, it's a bug. If it lags on a 10k-note vault, it's a bug.
2. **Markdown is King:** The filesystem is the source of truth. SQLite is _only_ a cached index. We never lock user data into the DB.
3. **Strict Types:** We use Rust and TypeScript. We do not allow any in JS or unwrap() in Rust production code.

## 🛠 Prerequisites

You will need the following tools installed:
- **Node.js (LTS)** & **pnpm** (We use pnpm workspaces).
- **Rust (Stable)** & **Cargo**.
- **System Dependencies:**
  - _Linux:_ `libwebkit2gtk-4.0-dev`, `build-essential`, `curl`, `wget`, `libssl-dev`, `libgtk-3-dev`,
`libayatana-appindicator3-dev`, `librsvg2-dev`.
  - _Windows/macOS:_ Standard build tools (VS C++ Build Tools / Xcode Command Line
Tools).
- **SQLx CLI:** Required for database migrations.

```bash
cargo install sqlx-cli
```

## 🏗 Monorepo Structure

We use **pnpm workspaces**. Familiarize yourself with the layout:
```bash
noderium/
├── apps/
│   ├── app/ # The Main Tauri App
│   │   ├── src/ # SolidJS Frontend (UI)
│   │   └── src-tauri/ # Rust Backend (Core Logic)
│   └── docs/ # Docusaurus Documentation
└── ...
```

## 🚀 Getting Started

1. **Clone the repository:**
    ```bash
    git clone https://github.com/noderium/noderium.git
    cd noderium
    ```
2. **Install dependencies:**
    ```bash
    pnpm install
    pnpm dev:app
    ````
3. **Setup the Database (Dev)**: This runs the migrations in crates/noderium_db to create your local dev.db.
    ```bash
    pnpm db:setup
    ```
4. **Run the App**: This command starts the Rust backend and the SolidJS frontend with Hot Module Replacement (HMR).
    ```bash
    pnpm tauri dev
    ```

## 💻 Development Workflow

### Working on the Frontend (SolidJS)
- Located in apps/desktop/src.
- We use Tailwind CSS for styling.
- State Management: We use Solid signals/stores. Avoid React-style patterns; embrace fine-grained reactivity.

### Working on the Core (Rust)
- Database: If you change the database schema, you must create a migration:
  ```bash
  cd crates/noderium_db
  sqlx migrate add <descriptive_name>
  ```
- Queries: We use sqlx. Queries are checked at compile-time. You must have a valid .env pointing to a DB to compile.

## 📝 Opening Issues

We use structured issue templates to ensure consistency. When [creating a new issue](https://github.com/leal32b/noderium/issues/new/choose), choose the appropriate template:

| Template | When to Use |
|----------|-------------|
| 🐛 **Bug Report** | Something isn't working as expected |
| ✨ **Feature Request** | Suggest new features or enhancements |
| ♻️ **Refactoring** | Propose code improvements |
| 🔬 **Spike / Research** | Request technical investigation |
| 📚 **Documentation** | Report or improve documentation |
| 🔧 **Chore** | Maintenance and housekeeping tasks |

For questions and discussions, use [GitHub Discussions](https://github.com/leal32b/noderium/discussions).

## 📮 Pull Request Process

1. **Fork & Branch:** Create a branch for your feature (`feat/graph-view`) or bugfix (`fix/parser-crash`).
2. **Conventional Commits:** We enforce Conventional Commits.
   - `feat:` add bi-directional linking
   - `fix(core):` resolve markdown parsing error
   - `perf:` optimize graph traversal query
3. **Check:** Run the full suite before pushing.
    ```bash
    pnpm turbo run test lint
    ```
4. **Open PR:** Use the PR template and link the issue you are solving.
5. **Review:** Address feedback and wait for approval.

## 🤝 Community

<!-- Join the discussion on [Discord](https://discord.gg/noderium) or open a (https://github.com/noderium/noderium/discussions). -->
Open a [Discussion](https://github.com/noderium/noderium/discussions).

**Happy Coding!**
