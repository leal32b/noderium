//! Link / backlink graph index.

use rusqlite::params;

use crate::{Backlink, Result, Store, StoreError};

impl Store {
    pub fn insert_link(
        &self,
        source_block_id: &str,
        target_note_id: &str,
        link_type: &str,
    ) -> Result<()> {
        self.conn
            .prepare_cached(
                "INSERT INTO links (source_block_id, target_note_id, target_block_id, link_type)
                 VALUES (?1, ?2, NULL, ?3)",
            )?
            .execute(params![source_block_id, target_note_id, link_type])?;
        Ok(())
    }

    /// Remove all links originating from a note's blocks (before a rebuild).
    pub fn delete_links_from_note(&self, note_id: &str) -> Result<usize> {
        Ok(self.conn.execute(
            "DELETE FROM links WHERE source_block_id IN
               (SELECT id FROM blocks WHERE note_id = ?1)",
            params![note_id],
        )?)
    }

    /// Blocks (with their note) that link to `target_note_id`.
    pub fn backlinks(&self, target_note_id: &str) -> Result<Vec<Backlink>> {
        let mut stmt = self.conn.prepare(
            "SELECT b.note_id, l.source_block_id, b.text
             FROM links l JOIN blocks b ON b.id = l.source_block_id
             WHERE l.target_note_id = ?1 AND l.link_type = 'wikilink'
             ORDER BY b.note_id, b.order_key",
        )?;
        let rows = stmt.query_map(params![target_note_id], |row| {
            Ok(Backlink {
                source_note_id: row.get(0)?,
                source_block_id: row.get(1)?,
                text: row.get(2)?,
            })
        })?;
        rows.collect::<rusqlite::Result<Vec<_>>>()
            .map_err(StoreError::from)
    }
}
