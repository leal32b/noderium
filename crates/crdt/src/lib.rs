//! noderium-crdt — Loro integration (ADR-002, ADR-003).
//!
//! A note is a Loro document: a `Tree` of blocks ("blocks"), each tree node
//! carrying a `Map` of metadata with a `Text` container for its content. The
//! Loro doc is the source of truth; SQLite indexes are derived from snapshots.

use loro::{ExportMode, LoroDoc, LoroError, LoroMap, LoroText, LoroValue, TreeParentId};
use thiserror::Error;

pub mod prosemirror;
pub use prosemirror::{blocks_from_prosemirror_snapshot, blocks_to_prosemirror_snapshot};

#[derive(Debug, Error)]
pub enum CrdtError {
    #[error(transparent)]
    Loro(#[from] LoroError),
    #[error("encode error: {0}")]
    Encode(String),
}

pub type Result<T> = std::result::Result<T, CrdtError>;

const BLOCKS_TREE: &str = "blocks";
const TEXT_KEY: &str = "text";
const TYPE_KEY: &str = "blockType";

/// A block read out of the Loro tree.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BlockData {
    pub id: String,
    pub block_type: String,
    pub text: String,
}

/// A single note's CRDT document.
pub struct NoteDoc {
    doc: LoroDoc,
}

impl Default for NoteDoc {
    fn default() -> Self {
        Self::new()
    }
}

impl NoteDoc {
    pub fn new() -> Self {
        Self {
            doc: LoroDoc::new(),
        }
    }

    /// Rebuild a document from a previously exported snapshot.
    pub fn from_snapshot(bytes: &[u8]) -> Result<Self> {
        let doc = LoroDoc::new();
        doc.import(bytes)?;
        Ok(Self { doc })
    }

    /// Append a block (a new tree node with `blockType` + `text`); returns its id.
    pub fn add_block(&self, block_type: &str, text: &str) -> Result<String> {
        let tree = self.doc.get_tree(BLOCKS_TREE);
        let id = tree.create(TreeParentId::Root)?;
        let meta = tree.get_meta(id)?;
        meta.insert(TYPE_KEY, block_type)?;
        let content = meta.insert_container(TEXT_KEY, LoroText::new())?;
        content.insert(0, text)?;
        self.doc.commit();
        Ok(id.to_string())
    }

    /// All blocks currently in the tree.
    pub fn blocks(&self) -> Result<Vec<BlockData>> {
        let tree = self.doc.get_tree(BLOCKS_TREE);
        let mut out = Vec::new();
        for node in tree.nodes() {
            let meta = tree.get_meta(node)?;
            out.push(BlockData {
                id: node.to_string(),
                block_type: map_string(&meta, TYPE_KEY).unwrap_or_default(),
                text: map_string(&meta, TEXT_KEY).unwrap_or_default(),
            });
        }
        Ok(out)
    }

    pub fn block_count(&self) -> usize {
        self.doc.get_tree(BLOCKS_TREE).nodes().len()
    }

    /// Export a full snapshot (state + history) — the bytes persisted as the
    /// source of truth (ADR-001). Encrypted before sync (ADR-008).
    pub fn snapshot(&self) -> Result<Vec<u8>> {
        self.doc.commit();
        self.doc
            .export(ExportMode::Snapshot)
            .map_err(|e| CrdtError::Encode(e.to_string()))
    }
}

fn map_string(meta: &LoroMap, key: &str) -> Option<String> {
    match meta.get(key)?.get_deep_value() {
        LoroValue::String(s) => Some(s.to_string()),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_doc_has_no_blocks() {
        let doc = NoteDoc::new();
        assert_eq!(doc.block_count(), 0);
        assert!(doc.blocks().unwrap().is_empty());
    }

    #[test]
    fn blocks_round_trip_through_a_snapshot() {
        let doc = NoteDoc::new();
        doc.add_block("heading", "Title").unwrap();
        doc.add_block("paragraph", "Hello world").unwrap();
        assert_eq!(doc.block_count(), 2);

        let snapshot = doc.snapshot().unwrap();
        let restored = NoteDoc::from_snapshot(&snapshot).unwrap();

        assert_eq!(restored.block_count(), 2);
        let mut blocks = restored.blocks().unwrap();
        blocks.sort_by(|a, b| a.text.cmp(&b.text));
        assert_eq!(blocks[0].text, "Hello world");
        assert_eq!(blocks[0].block_type, "paragraph");
        assert_eq!(blocks[1].text, "Title");
        assert_eq!(blocks[1].block_type, "heading");
    }

    #[test]
    fn snapshots_are_deterministic_for_same_ops() {
        let a = NoteDoc::new();
        a.add_block("paragraph", "same").unwrap();
        let restored = NoteDoc::from_snapshot(&a.snapshot().unwrap()).unwrap();
        // Re-exporting a restored doc yields a usable snapshot with the same state.
        let again = NoteDoc::from_snapshot(&restored.snapshot().unwrap()).unwrap();
        assert_eq!(again.blocks().unwrap(), restored.blocks().unwrap());
    }
}
