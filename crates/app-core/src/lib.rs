//! noderium-app-core — facade orchestrating the CRDT (source of truth) and the
//! SQLite derived indexes (ADR-005, ADR-011). This is the surface the desktop
//! shell exposes via Tauri commands/events and mobile reaches via FFI.
//!
//! Golden rule (ADR-001): the Loro doc is the source of truth; every SQLite row
//! except the CRDT store is a rebuildable derived index — proven by the tests.

use noderium_crdt::{CrdtError, NoteDoc};
use noderium_store::{Block, Note, Store, StoreError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error(transparent)]
    Store(#[from] StoreError),
    #[error(transparent)]
    Crdt(#[from] CrdtError),
    #[error("note not found: {0}")]
    NoteNotFound(String),
}

pub type Result<T> = std::result::Result<T, CoreError>;

/// Orchestrates persistence + CRDT for a single local workspace.
pub struct Workspace {
    store: Store,
}

impl Workspace {
    pub fn open_in_memory() -> Result<Self> {
        Ok(Self {
            store: Store::open_in_memory()?,
        })
    }

    pub fn open(path: impl AsRef<std::path::Path>) -> Result<Self> {
        Ok(Self {
            store: Store::open(path)?,
        })
    }

    /// Create an empty note: write its index row and persist an empty CRDT doc.
    pub fn create_note(
        &self,
        id: &str,
        note_type: &str,
        title: Option<&str>,
        now: i64,
    ) -> Result<()> {
        self.store.upsert_note(&Note {
            id: id.to_string(),
            note_type: note_type.to_string(),
            title: title.map(str::to_string),
            journal_date: None,
            created_at: now,
            updated_at: now,
        })?;
        self.persist(id, &NoteDoc::new())?;
        Ok(())
    }

    /// Append a block to a note (CRDT op), then refresh its derived index.
    pub fn add_block(&self, note_id: &str, block_type: &str, text: &str) -> Result<String> {
        let doc = self.load_doc(note_id)?;
        let block_id = doc.add_block(block_type, text)?;
        self.persist(note_id, &doc)?;
        Ok(block_id)
    }

    /// Drop and re-derive a note's block index purely from its CRDT snapshot.
    /// (After this the SQLite rows are byte-for-byte reproducible from Loro.)
    pub fn rebuild_index_from_crdt(&self, note_id: &str) -> Result<()> {
        let doc = self.load_doc(note_id)?;
        self.reindex(note_id, &doc)
    }

    /// Wipe a note's derived block index (e.g. before a rebuild). Does not touch
    /// the CRDT source of truth.
    pub fn clear_block_index(&self, note_id: &str) -> Result<usize> {
        Ok(self.store.delete_blocks_for_note(note_id)?)
    }

    pub fn note(&self, id: &str) -> Result<Option<Note>> {
        Ok(self.store.get_note(id)?)
    }

    pub fn blocks(&self, note_id: &str) -> Result<Vec<Block>> {
        Ok(self.store.blocks_for_note(note_id)?)
    }

    /// Lexical search over indexed block text (FTS5/BM25).
    pub fn search(&self, query: &str) -> Result<Vec<String>> {
        Ok(self.store.search_blocks(query)?)
    }

    // --- internals ---

    fn load_doc(&self, note_id: &str) -> Result<NoteDoc> {
        let snapshot = self
            .store
            .load_snapshot(note_id)?
            .ok_or_else(|| CoreError::NoteNotFound(note_id.to_string()))?;
        Ok(NoteDoc::from_snapshot(&snapshot)?)
    }

    fn persist(&self, note_id: &str, doc: &NoteDoc) -> Result<()> {
        let snapshot = doc.snapshot()?;
        // Version vector blob is reserved for sync (ADR-008); empty for v1 local.
        self.store.save_snapshot(note_id, &snapshot, &[])?;
        self.reindex(note_id, doc)
    }

    fn reindex(&self, note_id: &str, doc: &NoteDoc) -> Result<()> {
        self.store.delete_blocks_for_note(note_id)?;
        for (index, block) in doc.blocks()?.into_iter().enumerate() {
            self.store.upsert_block(&Block {
                id: block.id,
                note_id: note_id.to_string(),
                parent_id: None,
                order_key: format!("{index:08}"),
                block_type: block.block_type,
                text: block.text,
            })?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_a_note_and_indexes_blocks() {
        let ws = Workspace::open_in_memory().unwrap();
        ws.create_note("n1", "atomic", Some("Fruit"), 1).unwrap();
        ws.add_block("n1", "heading", "Apples and oranges").unwrap();
        ws.add_block("n1", "paragraph", "bananas are great")
            .unwrap();

        assert_eq!(
            ws.note("n1").unwrap().unwrap().title.as_deref(),
            Some("Fruit")
        );
        assert_eq!(ws.blocks("n1").unwrap().len(), 2);
        assert_eq!(ws.search("apples").unwrap().len(), 1);
        assert_eq!(ws.search("bananas").unwrap().len(), 1);
    }

    #[test]
    fn derived_index_is_rebuildable_from_crdt() {
        let ws = Workspace::open_in_memory().unwrap();
        ws.create_note("n1", "atomic", None, 1).unwrap();
        ws.add_block("n1", "paragraph", "the quick brown fox")
            .unwrap();
        ws.add_block("n1", "paragraph", "jumps over lazy dog")
            .unwrap();

        // Snapshot the indexed state (block ids derive from stable Loro TreeIDs).
        let before: Vec<(String, String)> = ws
            .blocks("n1")
            .unwrap()
            .into_iter()
            .map(|b| (b.id, b.text))
            .collect();
        assert_eq!(before.len(), 2);

        // Nuke the derived index entirely (simulate a fresh device / corruption).
        assert_eq!(ws.clear_block_index("n1").unwrap(), 2);
        assert!(ws.blocks("n1").unwrap().is_empty());
        assert!(ws.search("quick").unwrap().is_empty());

        // Rebuild purely from the CRDT snapshot — same rows, search works again.
        ws.rebuild_index_from_crdt("n1").unwrap();
        let after: Vec<(String, String)> = ws
            .blocks("n1")
            .unwrap()
            .into_iter()
            .map(|b| (b.id, b.text))
            .collect();
        assert_eq!(before, after);
        assert_eq!(ws.search("quick").unwrap().len(), 1);
    }
}
