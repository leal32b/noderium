//! Note rows (and title lookup, used to resolve `[[wikilinks]]`).

use rusqlite::{params, OptionalExtension};

use crate::model::row_to_note;
use crate::{Note, Result, Store, StoreError};

impl Store {
    pub fn upsert_note(&self, note: &Note) -> Result<()> {
        self.conn.execute(
            // COALESCE keeps an existing title/journal_date when the incoming
            // value is NULL, so a generic note upsert can't wipe journal metadata.
            "INSERT INTO notes (id, type, title, journal_date, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(id) DO UPDATE SET
               type = excluded.type,
               title = COALESCE(excluded.title, title),
               journal_date = COALESCE(excluded.journal_date, journal_date),
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

    /// Resolve the note id for a given journal date (ISO `YYYY-MM-DD`).
    pub fn note_id_by_journal_date(&self, date: &str) -> Result<Option<String>> {
        Ok(self
            .conn
            .query_row(
                "SELECT id FROM notes WHERE journal_date = ?1 LIMIT 1",
                params![date],
                |row| row.get::<_, String>(0),
            )
            .optional()?)
    }

    pub fn get_note(&self, id: &str) -> Result<Option<Note>> {
        Ok(self
            .conn
            .query_row(
                "SELECT id, type, title, journal_date, created_at, updated_at
                 FROM notes WHERE id = ?1",
                params![id],
                row_to_note,
            )
            .optional()?)
    }

    /// All notes, most-recently-updated first.
    pub fn list_notes(&self) -> Result<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, type, title, journal_date, created_at, updated_at
             FROM notes ORDER BY updated_at DESC, id",
        )?;
        let rows = stmt.query_map([], row_to_note)?;
        rows.collect::<rusqlite::Result<Vec<_>>>()
            .map_err(StoreError::from)
    }

    /// Resolve a note id by exact title (first match).
    pub fn note_id_by_title(&self, title: &str) -> Result<Option<String>> {
        Ok(self
            .conn
            .query_row(
                "SELECT id FROM notes WHERE title = ?1 LIMIT 1",
                params![title],
                |row| row.get::<_, String>(0),
            )
            .optional()?)
    }
}
