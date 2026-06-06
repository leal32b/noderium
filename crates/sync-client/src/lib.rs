//! noderium-sync-client — client-side sync engine and E2E crypto (ADR-008).
//! Encrypts CRDT ops/snapshots before they leave the device (zero-knowledge server).

// pub mod engine;       // op/snapshot push/pull
// pub mod crypto;       // Argon2id master key, per-doc keys, envelopes
// pub mod transport;    // talks to sync-server
