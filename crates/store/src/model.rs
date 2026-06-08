//! Row types for the derived index, with their rusqlite row mappers.

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

/// An SRS card row (a query index over CRDT-held SRS state).
#[derive(Debug, Clone, PartialEq)]
pub struct SrsCard {
    pub id: String,
    pub target_id: String,
    pub card_type: String,
    pub due: i64,
    pub stability: f64,
    pub difficulty: f64,
    pub reps: i32,
    pub lapses: i32,
    pub state: String,
    pub last_review: i64,
}

/// A backlink: a block (and its note) that links to a target note.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Backlink {
    pub source_note_id: String,
    pub source_block_id: String,
    pub text: String,
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

pub(crate) fn row_to_note(row: &rusqlite::Row<'_>) -> rusqlite::Result<Note> {
    Ok(Note {
        id: row.get(0)?,
        note_type: row.get(1)?,
        title: row.get(2)?,
        journal_date: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
    })
}

pub(crate) fn row_to_block(row: &rusqlite::Row<'_>) -> rusqlite::Result<Block> {
    Ok(Block {
        id: row.get(0)?,
        note_id: row.get(1)?,
        parent_id: row.get(2)?,
        order_key: row.get(3)?,
        block_type: row.get(4)?,
        text: row.get(5)?,
    })
}

pub(crate) fn row_to_card(row: &rusqlite::Row<'_>) -> rusqlite::Result<SrsCard> {
    Ok(SrsCard {
        id: row.get(0)?,
        target_id: row.get(1)?,
        card_type: row.get(2)?,
        due: row.get(3)?,
        stability: row.get(4)?,
        difficulty: row.get(5)?,
        reps: row.get(6)?,
        lapses: row.get(7)?,
        state: row.get(8)?,
        last_review: row.get(9)?,
    })
}
