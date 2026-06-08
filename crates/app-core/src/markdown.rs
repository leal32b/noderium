//! Markdown import (Obsidian-style, ADR-015) and deterministic `.md` export
//! (FR-9, anti-lock-in). Import feeds the CRDT; export reads the derived index.

use crate::{CoreError, Result, Workspace};

impl Workspace {
    /// Import a markdown note (Obsidian-style: frontmatter + `[[wikilinks]]`,
    /// ADR-015). Parses to blocks, builds a CRDT snapshot as the source of truth,
    /// then derives the index. Round-trips with [`Self::export_note_markdown`].
    pub fn import_markdown(&self, note_id: &str, markdown: &str, now: i64) -> Result<()> {
        let parsed = noderium_core::parse_markdown(markdown);
        let note_type = parsed
            .frontmatter
            .get("type")
            .map(String::as_str)
            .unwrap_or("atomic");
        let title = parsed.frontmatter.get("title").map(String::as_str);
        self.create_note(note_id, note_type, title, now)?;

        let blocks: Vec<noderium_crdt::BlockData> = parsed
            .blocks
            .iter()
            .enumerate()
            .map(|(index, block)| noderium_crdt::BlockData {
                id: block
                    .id
                    .clone()
                    .unwrap_or_else(|| format!("{note_id}-b{index}")),
                block_type: block.block_type.clone(),
                text: block.text.clone(),
            })
            .collect();
        let snapshot = noderium_crdt::blocks_to_prosemirror_snapshot(&blocks)?;
        self.import_editor_snapshot(note_id, &snapshot)
    }

    /// Export a note as deterministic markdown (FR-9, anti-lock-in). Always
    /// available regardless of sync/CRDT state.
    pub fn export_note_markdown(&self, note_id: &str) -> Result<String> {
        let note = self
            .store
            .get_note(note_id)?
            .ok_or_else(|| CoreError::NoteNotFound(note_id.to_string()))?;
        let blocks = self.store.blocks_for_note(note_id)?;
        let frontmatter = noderium_core::NoteFrontmatter {
            id: &note.id,
            note_type: &note.note_type,
            title: note.title.as_deref(),
            created_at_ms: note.created_at,
        };
        let export_blocks: Vec<noderium_core::ExportBlock> = blocks
            .iter()
            .map(|b| noderium_core::ExportBlock {
                id: &b.id,
                block_type: &b.block_type,
                text: &b.text,
            })
            .collect();
        Ok(noderium_core::note_to_markdown(
            &frontmatter,
            &export_blocks,
        ))
    }
}
