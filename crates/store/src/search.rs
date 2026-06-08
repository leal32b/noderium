//! Lexical (FTS5/BM25) search over block text.

use rusqlite::params;

use crate::model::row_to_block;
use crate::{Block, Result, Store, StoreError};

impl Store {
    /// Lexical (FTS5/BM25) search over block text, returning block ids by rank.
    pub fn search_blocks(&self, query: &str) -> Result<Vec<String>> {
        let Some(match_query) = fts5_query(query) else {
            return Ok(Vec::new());
        };
        let mut stmt = self.conn.prepare(
            "SELECT b.id FROM blocks_fts f
             JOIN blocks b ON b.rowid = f.rowid
             WHERE blocks_fts MATCH ?1
             ORDER BY rank",
        )?;
        let rows = stmt.query_map(params![match_query], |row| row.get::<_, String>(0))?;
        rows.collect::<rusqlite::Result<Vec<_>>>()
            .map_err(StoreError::from)
    }

    /// Like [`Self::search_blocks`] but returns the full block rows (for snippets).
    pub fn search_blocks_detailed(&self, query: &str) -> Result<Vec<Block>> {
        let Some(match_query) = fts5_query(query) else {
            return Ok(Vec::new());
        };
        let mut stmt = self.conn.prepare(
            "SELECT b.id, b.note_id, b.parent_id, b.order_key, b.block_type, b.text
             FROM blocks_fts f JOIN blocks b ON b.rowid = f.rowid
             WHERE blocks_fts MATCH ?1
             ORDER BY rank",
        )?;
        let rows = stmt.query_map(params![match_query], row_to_block)?;
        rows.collect::<rusqlite::Result<Vec<_>>>()
            .map_err(StoreError::from)
    }
}

/// Turn arbitrary user input into a safe FTS5 `MATCH` query. Each whitespace
/// token is wrapped in double quotes (embedded quotes doubled) so FTS5 operators
/// in the raw text (`"`, `*`, `:`, `(`, `AND`, `NEAR`, …) are matched as literals
/// instead of raising a syntax error. Tokens with no alphanumeric content are
/// dropped; returns `None` when nothing is left to search for.
fn fts5_query(input: &str) -> Option<String> {
    let terms: Vec<String> = input
        .split_whitespace()
        .filter(|token| token.chars().any(char::is_alphanumeric))
        .map(|token| format!("\"{}\"", token.replace('"', "\"\"")))
        .collect();
    (!terms.is_empty()).then(|| terms.join(" "))
}
