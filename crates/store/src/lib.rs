//! noderium-store — SQLite (rusqlite), FTS5, migrations.
//! All tables except crdt_docs/crdt_oplog are derived indexes, rebuildable from
//! the CRDT source of truth (ADR-001, ADR-006).

use rusqlite::{params, Connection, OptionalExtension};
use std::path::Path;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StoreError {
    #[error(transparent)]
    Sqlite(#[from] rusqlite::Error),
}

pub type Result<T> = std::result::Result<T, StoreError>;

const MIGRATION_0001: &str = include_str!("../migrations/0001_init.sql");
const SCHEMA_VERSION: i64 = 1;

/// A note row in the derived index.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Note {
    pub id: String,
    pub note_type: String,
    pub title: Option<String>,
    pub journal_date: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

/// A block row in the derived index.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Block {
    pub id: String,
    pub note_id: String,
    pub parent_id: Option<String>,
    pub order_key: String,
    pub block_type: String,
    pub text: String,
}

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
        let mut store = Self { conn };
        store.migrate()?;
        Ok(store)
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

    // --- notes ---

    pub fn upsert_note(&self, note: &Note) -> Result<()> {
        self.conn.execute(
            "INSERT INTO notes (id, type, title, journal_date, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(id) DO UPDATE SET
               type = excluded.type,
               title = excluded.title,
               journal_date = excluded.journal_date,
               updated_at = excluded.updated_at",
            params![
                note.id,
                note.note_type,
                note.title,
                note.journal_date,
                note.created_at,
                note.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn get_note(&self, id: &str) -> Result<Option<Note>> {
        Ok(self
            .conn
            .query_row(
                "SELECT id, type, title, journal_date, created_at, updated_at
                 FROM notes WHERE id = ?1",
                params![id],
                |row| {
                    Ok(Note {
                        id: row.get(0)?,
                        note_type: row.get(1)?,
                        title: row.get(2)?,
                        journal_date: row.get(3)?,
                        created_at: row.get(4)?,
                        updated_at: row.get(5)?,
                    })
                },
            )
            .optional()?)
    }

    // --- blocks ---

    pub fn upsert_block(&self, block: &Block) -> Result<()> {
        self.conn.execute(
            "INSERT INTO blocks (id, note_id, parent_id, order_key, block_type, text)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(id) DO UPDATE SET
               note_id = excluded.note_id,
               parent_id = excluded.parent_id,
               order_key = excluded.order_key,
               block_type = excluded.block_type,
               text = excluded.text",
            params![
                block.id,
                block.note_id,
                block.parent_id,
                block.order_key,
                block.block_type,
                block.text
            ],
        )?;
        Ok(())
    }

    /// Blocks of a note, ordered by their fractional `order_key`.
    pub fn blocks_for_note(&self, note_id: &str) -> Result<Vec<Block>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, note_id, parent_id, order_key, block_type, text
             FROM blocks WHERE note_id = ?1 ORDER BY order_key",
        )?;
        let rows = stmt.query_map(params![note_id], |row| {
            Ok(Block {
                id: row.get(0)?,
                note_id: row.get(1)?,
                parent_id: row.get(2)?,
                order_key: row.get(3)?,
                block_type: row.get(4)?,
                text: row.get(5)?,
            })
        })?;
        rows.collect::<rusqlite::Result<Vec<_>>>()
            .map_err(StoreError::from)
    }

    /// Delete all blocks of a note (used when rebuilding the index from CRDT).
    pub fn delete_blocks_for_note(&self, note_id: &str) -> Result<usize> {
        Ok(self
            .conn
            .execute("DELETE FROM blocks WHERE note_id = ?1", params![note_id])?)
    }

    /// Lexical (FTS5/BM25) search over block text, returning block ids by rank.
    pub fn search_blocks(&self, query: &str) -> Result<Vec<String>> {
        let mut stmt = self.conn.prepare(
            "SELECT b.id FROM blocks_fts f
             JOIN blocks b ON b.rowid = f.rowid
             WHERE blocks_fts MATCH ?1
             ORDER BY rank",
        )?;
        let rows = stmt.query_map(params![query], |row| row.get::<_, String>(0))?;
        rows.collect::<rusqlite::Result<Vec<_>>>()
            .map_err(StoreError::from)
    }

    // --- CRDT store (source of truth) ---

    pub fn save_snapshot(&self, note_id: &str, snapshot: &[u8], version: &[u8]) -> Result<()> {
        self.conn.execute(
            "INSERT INTO crdt_docs (note_id, snapshot, version)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(note_id) DO UPDATE SET
               snapshot = excluded.snapshot,
               version = excluded.version",
            params![note_id, snapshot, version],
        )?;
        Ok(())
    }

    pub fn load_snapshot(&self, note_id: &str) -> Result<Option<Vec<u8>>> {
        Ok(self
            .conn
            .query_row(
                "SELECT snapshot FROM crdt_docs WHERE note_id = ?1",
                params![note_id],
                |row| row.get::<_, Vec<u8>>(0),
            )
            .optional()?)
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
