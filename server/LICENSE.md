# License — sync server

The sync server (`server/`) is **not** covered by the repository's Apache-2.0
[`LICENSE`](../LICENSE). It is **source-available** under the Functional Source
License (`LicenseRef-FSL-1.1`, as declared in `sync-server/Cargo.toml`), per
[ADR-009](../docs/src/content/docs/architecture/adr/adr-009-open-core-licensing.md).

Only the client and the domain crates (`crates/`, `apps/`, `packages/`) are
Apache-2.0. The canonical FSL text applies once the server leaves stub status;
until then this note records the intended licensing boundary.
