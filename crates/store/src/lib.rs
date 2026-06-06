//! noderium-store — SQLite (rusqlite/sqlx), FTS5, sqlite-vec, migrations.
//! All tables except the CRDT store are derived indexes, rebuildable (ADR-001, ADR-006).

// pub mod schema;       // notes, blocks, properties, links, srs_cards
// pub mod migrations;   // versioned migrations
// pub mod fts;          // FTS5 (blocks_fts)
// pub mod vec;          // sqlite-vec (block_vec)
// pub mod crdt_store;   // crdt_docs + crdt_oplog (source of truth)
