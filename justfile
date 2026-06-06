# Noderium task runner (ADR-013).
# Install just: `brew install just` or `cargo install just`.

# Default recipe: list available tasks.
default:
    @just --list

# Run the desktop frontend dev server (Vite).
dev:
    pnpm --filter @noderium/desktop-frontend dev

# Build everything (Rust workspace + desktop frontend).
build:
    cargo build --release
    pnpm --filter @noderium/desktop-frontend build

# Run all tests (Rust + frontend + editor).
test:
    cargo test
    pnpm --filter @noderium/desktop-frontend test
    just test-editor

# Editor latency spike (Spike #1, ADR-004). Fails the build if p95 > 16ms.
test-editor:
    pnpm --filter @noderium/editor test

# Lint: clippy for Rust (JS lint added in Phase 2).
lint:
    cargo clippy --all-targets -- -D warnings

# Format check.
fmt:
    cargo fmt --all -- --check

# Remove build artifacts.
clean:
    cargo clean
