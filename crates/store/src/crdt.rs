//! The CRDT store — opaque snapshots that are the source of truth (ADR-001).

use rusqlite::{params, OptionalExtension};

use crate::{Result, Store};

impl Store {
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
