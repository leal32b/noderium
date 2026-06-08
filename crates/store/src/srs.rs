//! SRS card rows (a query index over CRDT-held scheduling state).

use rusqlite::{params, OptionalExtension};

use crate::model::row_to_card;
use crate::{Result, SrsCard, Store, StoreError};

impl Store {
    pub fn upsert_card(&self, card: &SrsCard) -> Result<()> {
        self.conn.execute(
            "INSERT INTO srs_cards
               (id, target_id, card_type, due, stability, difficulty, reps, lapses, state, last_review)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
             ON CONFLICT(id) DO UPDATE SET
               target_id = excluded.target_id,
               card_type = excluded.card_type,
               due = excluded.due,
               stability = excluded.stability,
               difficulty = excluded.difficulty,
               reps = excluded.reps,
               lapses = excluded.lapses,
               state = excluded.state,
               last_review = excluded.last_review",
            params![
                card.id,
                card.target_id,
                card.card_type,
                card.due,
                card.stability,
                card.difficulty,
                card.reps,
                card.lapses,
                card.state,
                card.last_review
            ],
        )?;
        Ok(())
    }

    pub fn get_card(&self, id: &str) -> Result<Option<SrsCard>> {
        Ok(self
            .conn
            .query_row(
                "SELECT id, target_id, card_type, due, stability, difficulty, reps, lapses, state, last_review
                 FROM srs_cards WHERE id = ?1",
                params![id],
                row_to_card,
            )
            .optional()?)
    }

    /// Cards due at or before `now`, soonest first (the review queue).
    pub fn due_cards(&self, now: i64) -> Result<Vec<SrsCard>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, target_id, card_type, due, stability, difficulty, reps, lapses, state, last_review
             FROM srs_cards WHERE due <= ?1 ORDER BY due",
        )?;
        let rows = stmt.query_map(params![now], row_to_card)?;
        rows.collect::<rusqlite::Result<Vec<_>>>()
            .map_err(StoreError::from)
    }
}
