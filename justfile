# Noderium task runner (ADR-013).
# Install just: `brew install just` or `cargo install just`.

# Default recipe: list available tasks.
default:
    @just --list

# Run the desktop frontend dev server (Vite).
dev:
    pnpm --filter @noderium/desktop-frontend dev

# Build the desktop app: frontend assets first (Tauri embeds them), then Rust.
build:
    pnpm --filter @noderium/desktop-frontend build
    cargo build --release -p noderium-desktop

# Run all tests (Rust + frontend + editor). The desktop crate is excluded — it
# needs the frontend dist embedded; build it via `just build`.
test:
    cargo test --workspace --exclude noderium-desktop
    pnpm --filter @noderium/desktop-frontend test
    just test-editor

# Editor latency spike (Spike #1, ADR-004). Fails the build if p95 > 16ms.
test-editor:
    pnpm --filter @noderium/editor test

# Lint: clippy for the Rust crates (desktop excluded — needs frontend dist).
lint:
    cargo clippy --workspace --exclude noderium-desktop --all-targets -- -D warnings

# Format check.
fmt:
    cargo fmt --all -- --check

# Remove build artifacts.
clean:
    cargo clean
