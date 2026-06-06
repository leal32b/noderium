# Noderium task runner (ADR-013).
# Install just: `brew install just` or `cargo install just`.

# Default recipe: list available tasks.
default:
    @just --list

# Run the desktop app in dev mode (frontend scaffolded in Phase 2).
dev:
    @echo "dev: frontend not yet scaffolded (Phase 2). Building Rust workspace instead."
    cargo build

# Build everything (Rust workspace; JS packages added in later phases).
build:
    cargo build --release

# Run all tests.
test:
    cargo test

# Lint: clippy for Rust (JS lint added in Phase 2).
lint:
    cargo clippy --all-targets -- -D warnings

# Format check.
fmt:
    cargo fmt --all -- --check

# Remove build artifacts.
clean:
    cargo clean
