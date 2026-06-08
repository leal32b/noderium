//! Block rows in the derived index.

use rusqlite::params;

use crate::model::row_to_block;
use crate::{Block, Result, Store, StoreError};

impl Store {
    pub fn upsert_block(&self, block: &Block) -> Result<()> {
        // Cached statement: this runs in a tight loop over every block of a note
        // on each save, so prepare once and reuse.
        self.conn
            .prepare_cached(
                "INSERT INTO blocks (id, note_id, parent_id, order_key, block_type, text)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(id) DO UPDATE SET
               note_id = excluded.note_id,
               parent_id = excluded.parent_id,
               order_key = excluded.order_key,
               block_type = excluded.block_type,
               text = excluded.text",
            )?
            .execute(params![
                block.id,
                block.note_id,
                block.parent_id,
                block.order_key,
                block.block_type,
                block.text
            ])?;
        Ok(())
    }

    /// Blocks of a note, ordered by their fractional `order_key`.
    pub fn blocks_for_note(&self, note_id: &str) -> Result<Vec<Block>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, note_id, parent_id, order_key, block_type, text
             FROM blocks WHERE note_id = ?1 ORDER BY order_key",
        )?;
        let rows = stmt.query_map(params![note_id], row_to_block)?;
        rows.collect::<rusqlite::Result<Vec<_>>>()
            .map_err(StoreError::from)
    }

    /// Delete all blocks of a note (used when rebuilding the index from CRDT).
    pub fn delete_blocks_for_note(&self, note_id: &str) -> Result<usize> {
        Ok(self
            .conn
            .execute("DELETE FROM blocks WHERE note_id = ?1", params![note_id])?)
    }
}
