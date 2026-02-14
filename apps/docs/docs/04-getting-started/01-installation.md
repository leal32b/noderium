# Installation

> Get Noderium running on your machine in under 10 minutes.

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Rust** | Stable | [Install via rustup](https://rustup.rs/) |
| **Node.js** | v20+ LTS | [Download here](https://nodejs.org/) |
| **pnpm** | Latest | Required for monorepo management |
| **Build Dependencies** | - | See [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS |

### Quick Check

```bash
# Verify installations
rustc --version
node --version
pnpm --version
```

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/leal32b/noderium.git
cd noderium
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo, including:
- Frontend dependencies (SolidJS, Tailwind CSS, DaisyUI, CodeMirror)
- Documentation site dependencies (Docusaurus)
- Shared package dependencies

### 3. Run the Application

```bash
pnpm app:dev
```

This starts both:
- **Vite** development server for the frontend
- **Rust** compiler in watch mode for the Tauri backend

The application will open automatically once compiled.

---

## Monorepo Structure

```
noderium/
├── apps/
│   ├── app/           # Main application (Tauri + SolidJS)
│   │   ├── src/       # SolidJS Frontend (UI)
│   │   ├── src-tauri/ # Rust Backend (Core Logic)
│   │   └── test/      # Unit tests (Vitest)
│   └── docs/          # Documentation (Docusaurus)
├── .changeset/        # Changesets configuration
├── pnpm-workspace.yaml
└── package.json
```

---

## Platform-Specific Notes

### macOS

Install Xcode Command Line Tools:

```bash
xcode-select --install
```

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### Windows

1. Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

---

## Troubleshooting

### Rust compilation errors

Make sure you have the latest stable Rust:

```bash
rustup update stable
```

### Node.js version mismatch

We recommend using a Node.js version manager like [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm):

```bash
# Using fnm
fnm use 20

# Using nvm
nvm use 20
```

### pnpm not found

Install pnpm globally:

```bash
npm install -g pnpm
```

Or use corepack (recommended for Node.js 16.10+):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

## Next Steps

Once installed, you're ready to:

1. **Explore the editor**: The Markdown editor supports syntax highlighting, keyboard shortcuts (Cmd/Ctrl+B for bold, Cmd/Ctrl+I for italic), and a distraction-free "hide markers" mode
2. **Toggle themes**: Use the theme toggle in the navbar to switch between light and dark modes
3. **Read the architecture**: Understand [The Five Pillars](/docs/introduction/pillars) that guide Noderium
4. **Contribute**: Check out our [Contributing Guide](/docs/contributing/overview)

---

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm app:dev` | Start the desktop app in development mode |
| `pnpm app:test` | Run tests with coverage |
| `pnpm docs:dev` | Start the documentation site locally |
| `pnpm build` | Build all packages for production |
| `pnpm --filter noderium-app test:watch` | Run tests in watch mode |
