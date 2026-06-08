//! noderium-store — SQLite (rusqlite), FTS5, migrations.
//! All tables except crdt_docs/crdt_oplog are derived indexes, rebuildable from
//! the CRDT source of truth (ADR-001, ADR-006).
//!
//! [`Store`] is one connection; its query surface is split by domain into
//! sibling modules ([`notes`], [`blocks`], [`search`], [`links`], [`srs`],
//! [`crdt`]), each an `impl Store` block. Row types live in [`model`].

use rusqlite::Connection;
use std::path::Path;
use thiserror::Error;

mod blocks;
mod crdt;
mod links;
mod model;
mod notes;
mod search;
mod srs;

pub use model::{Backlink, Block, Note, SrsCard};

#[derive(Debug, Error)]
pub enum StoreError {
    #[error(transparent)]
    Sqlite(#[from] rusqlite::Error),
}

pub type Result<T> = std::result::Result<T, StoreError>;

const MIGRATION_0001: &str = include_str!("../migrations/0001_init.sql");
const SCHEMA_VERSION: i64 = 1;

/// Handle over a SQLite database holding the derived indexes + CRDT store.
pub struct Store {
    conn: Connection,
}

impl Store {
    /// Open an on-disk database, applying migrations.
    pub fn open(path: impl AsRef<Path>) -> Result<Self> {
        Self::from_connection(Connection::open(path)?)
    }

    /// Open an ephemeral in-memory database (tests, scratch).
    pub fn open_in_memory() -> Result<Self> {
        Self::from_connection(Connection::open_in_memory()?)
    }

    fn from_connection(conn: Connection) -> Result<Self> {
        conn.pragma_update(None, "foreign_keys", true)?;
        // WAL + NORMAL: durable enough for a local-first store, with far fewer
        // fsyncs on the write-heavy reindex path. (No-op for in-memory databases.)
        conn.execute_batch("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;")?;
        let mut store = Self { conn };
        store.migrate()?;
        Ok(store)
    }

    /// Begin a transaction over the underlying connection. A note reindex wraps
    /// all its writes in one so the whole operation is a single atomic, durable
    /// unit (one fsync) instead of dozens of auto-committed statements.
    pub fn begin(&self) -> Result<rusqlite::Transaction<'_>> {
        Ok(self.conn.unchecked_transaction()?)
    }

    fn migrate(&mut self) -> Result<()> {
        let version: i64 = self
            .conn
            .pragma_query_value(None, "user_version", |row| row.get(0))?;
        if version < 1 {
            self.conn.execute_batch(MIGRATION_0001)?;
        }
        self.conn
            .pragma_update(None, "user_version", SCHEMA_VERSION)?;
        Ok(())
    }

    /// Current schema version (PRAGMA user_version).
    pub fn schema_version(&self) -> Result<i64> {
        Ok(self
            .conn
            .pragma_query_value(None, "user_version", |row| row.get(0))?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_note(id: &str) -> Note {
        Note {
            id: id.to_string(),
            note_type: "atomic".to_string(),
            title: Some("Example".to_string()),
            journal_date: None,
            created_at: 1,
            updated_at: 1,
        }
    }

    fn sample_block(id: &str, note_id: &str, order_key: &str, text: &str) -> Block {
        Block {
            id: id.to_string(),
            note_id: note_id.to_string(),
            parent_id: None,
            order_key: order_key.to_string(),
            block_type: "paragraph".to_string(),
            text: text.to_string(),
        }
    }

    #[test]
    fn migrates_to_current_version() {
        let store = Store::open_in_memory().unwrap();
        assert_eq!(store.schema_version().unwrap(), SCHEMA_VERSION);
    }

    #[test]
    fn upserts_and_reads_a_note() {
        let store = Store::open_in_memory().unwrap();
        let mut note = sample_note("n1");
        store.upsert_note(&note).unwrap();
        assert_eq!(store.get_note("n1").unwrap().as_ref(), Some(&note));

        note.title = Some("Renamed".to_string());
        note.updated_at = 2;
        store.upsert_note(&note).unwrap();
        assert_eq!(store.get_note("n1").unwrap(), Some(note));
    }

    #[test]
    fn blocks_are_returned_in_order() {
        let store = Store::open_in_memory().unwrap();
        store.upsert_note(&sample_note("n1")).unwrap();
        store
            .upsert_block(&sample_block("b2", "n1", "a1", "second"))
            .unwrap();
        store
            .upsert_block(&sample_block("b1", "n1", "a0", "first"))
            .unwrap();

        let ids: Vec<_> = store
            .blocks_for_note("n1")
            .unwrap()
            .into_iter()
            .map(|b| b.id)
            .collect();
        assert_eq!(ids, vec!["b1", "b2"]);
    }

    #[test]
    fn fts_search_finds_block_and_reflects_updates() {
        let store = Store::open_in_memory().unwrap();
        store.upsert_note(&sample_note("n1")).unwrap();
        store
            .upsert_block(&sample_block("b1", "n1", "a0", "the quick brown fox"))
            .unwrap();
        store
            .upsert_block(&sample_block("b2", "n1", "a1", "lazy dog sleeps"))
            .unwrap();

        assert_eq!(store.search_blocks("brown").unwrap(), vec!["b1"]);
        assert_eq!(store.search_blocks("dog").unwrap(), vec!["b2"]);

        // Update b1's text; FTS must follow via triggers.
        store
            .upsert_block(&sample_block("b1", "n1", "a0", "now about cats"))
            .unwrap();
        assert!(store.search_blocks("brown").unwrap().is_empty());
        assert_eq!(store.search_blocks("cats").unwrap(), vec!["b1"]);
    }

    #[test]
    fn search_tolerates_fts5_special_characters() {
        let store = Store::open_in_memory().unwrap();
        store.upsert_note(&sample_note("n1")).unwrap();
        store
            .upsert_block(&sample_block("b1", "n1", "a0", "the quick brown fox"))
            .unwrap();

        // Operators/punctuation in the raw query must never raise a syntax error.
        for q in [
            "fox\"", "fox*", "fox:bar", "(fox", "NEAR fox", "fox AND", "  ",
        ] {
            assert!(store.search_blocks(q).is_ok(), "query {q:?} must not error");
            assert!(store.search_blocks_detailed(q).is_ok());
        }

        // A normal query still ranks the block; quoting keeps `fox"` finding `fox`.
        assert_eq!(store.search_blocks("brown").unwrap(), vec!["b1"]);
        assert_eq!(store.search_blocks("fox\"").unwrap(), vec!["b1"]);
        // Punctuation-only / empty queries resolve to "nothing to search".
        assert!(store.search_blocks(":::").unwrap().is_empty());
        assert!(store.search_blocks("").unwrap().is_empty());
    }

    #[test]
    fn rebuilding_blocks_index_is_idempotent() {
        let store = Store::open_in_memory().unwrap();
        store.upsert_note(&sample_note("n1")).unwrap();
        store
            .upsert_block(&sample_block("b1", "n1", "a0", "alpha"))
            .unwrap();
        store
            .upsert_block(&sample_block("b2", "n1", "a1", "beta"))
            .unwrap();

        // Simulate "rebuild derived index from CRDT": wipe + repopulate.
        let removed = store.delete_blocks_for_note("n1").unwrap();
        assert_eq!(removed, 2);
        assert!(store.blocks_for_note("n1").unwrap().is_empty());
        assert!(store.search_blocks("alpha").unwrap().is_empty());

        store
            .upsert_block(&sample_block("b1", "n1", "a0", "alpha"))
            .unwrap();
        assert_eq!(store.blocks_for_note("n1").unwrap().len(), 1);
        assert_eq!(store.search_blocks("alpha").unwrap(), vec!["b1"]);
    }

    #[test]
    fn srs_cards_upsert_and_due_queue() {
        let store = Store::open_in_memory().unwrap();
        let mut card = SrsCard {
            id: "c1".into(),
            target_id: "b1".into(),
            card_type: "note".into(),
            due: 100,
            stability: 1.0,
            difficulty: 5.0,
            reps: 0,
            lapses: 0,
            state: "new".into(),
            last_review: 100,
        };
        store.upsert_card(&card).unwrap();
        assert_eq!(store.get_card("c1").unwrap().as_ref(), Some(&card));

        // Due at 100, so it appears in the queue at now=150 but not at now=50.
        assert_eq!(store.due_cards(150).unwrap().len(), 1);
        assert!(store.due_cards(50).unwrap().is_empty());

        // Reschedule into the future; queue at now=150 is now empty.
        card.due = 1_000;
        card.reps = 1;
        store.upsert_card(&card).unwrap();
        assert!(store.due_cards(150).unwrap().is_empty());
        assert_eq!(store.get_card("c1").unwrap().unwrap().reps, 1);
    }

    #[test]
    fn snapshot_round_trips() {
        let store = Store::open_in_memory().unwrap();
        store.upsert_note(&sample_note("n1")).unwrap();
        store.save_snapshot("n1", &[1, 2, 3], &[9, 9]).unwrap();
        assert_eq!(store.load_snapshot("n1").unwrap(), Some(vec![1, 2, 3]));

        store.save_snapshot("n1", &[4, 5], &[10]).unwrap();
        assert_eq!(store.load_snapshot("n1").unwrap(), Some(vec![4, 5]));
        assert_eq!(store.load_snapshot("missing").unwrap(), None);
    }
}
