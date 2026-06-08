//! Notes & the editor flow: create/open, the editor-snapshot persist + index
//! (the ADR-001 source-of-truth path), reads, lexical search, and the link graph.

use noderium_store::{Block, Note, StoreError};

use crate::{CoreError, Result, Workspace};

impl Workspace {
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
        self.seed_empty(id)?;
        Ok(())
    }

    /// Open today's (or any date's) journal note, creating it once on first use
    /// (FR-1). `date` is ISO `YYYY-MM-DD`. Returns the note id.
    pub fn open_journal(&self, date: &str, now: i64) -> Result<String> {
        if let Some(id) = self.store.note_id_by_journal_date(date)? {
            return Ok(id);
        }
        let id = format!("journal-{date}");
        self.store.upsert_note(&Note {
            id: id.clone(),
            note_type: "journal".to_string(),
            title: Some(date.to_string()),
            journal_date: Some(date.to_string()),
            created_at: now,
            updated_at: now,
        })?;
        // Only seed an empty CRDT doc on genuine first creation — never clobber
        // a note that already has persisted content.
        if self.store.load_snapshot(&id)?.is_none() {
            self.seed_empty(&id)?;
        }
        Ok(id)
    }

    /// Persist a snapshot produced by the JS editor (a `loro-prosemirror`-shaped
    /// Loro doc) as the note's source of truth, then derive its block index from
    /// it. This is the editor → core flush (ADR-005): the live doc lives in JS,
    /// its snapshot becomes truth here, and SQLite is rebuilt from it.
    pub fn import_editor_snapshot(&self, note_id: &str, snapshot: &[u8]) -> Result<()> {
        let tx = self.store.begin()?;
        self.store.save_snapshot(note_id, snapshot, &[])?;
        self.index_from_snapshot(note_id, snapshot)?;
        tx.commit().map_err(StoreError::from)?;
        Ok(())
    }

    /// All notes, most-recently-updated first.
    pub fn list_notes(&self) -> Result<Vec<Note>> {
        Ok(self.store.list_notes()?)
    }

    /// Blocks (with their note) that link to `note_id` via `[[wikilinks]]`.
    pub fn backlinks(&self, note_id: &str) -> Result<Vec<noderium_store::Backlink>> {
        Ok(self.store.backlinks(note_id)?)
    }

    /// The stored CRDT snapshot for a note (for re-hydrating the JS editor), if any.
    pub fn note_snapshot(&self, note_id: &str) -> Result<Option<Vec<u8>>> {
        Ok(self.store.load_snapshot(note_id)?)
    }

    /// Drop and re-derive a note's block index purely from its CRDT snapshot.
    /// (After this the SQLite rows are byte-for-byte reproducible from Loro.)
    pub fn rebuild_index_from_crdt(&self, note_id: &str) -> Result<()> {
        let snapshot = self
            .store
            .load_snapshot(note_id)?
            .ok_or_else(|| CoreError::NoteNotFound(note_id.to_string()))?;
        let tx = self.store.begin()?;
        self.index_from_snapshot(note_id, &snapshot)?;
        tx.commit().map_err(StoreError::from)?;
        Ok(())
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

    /// Lexical search over indexed block text (FTS5/BM25). Returns block ids.
    pub fn search(&self, query: &str) -> Result<Vec<String>> {
        Ok(self.store.search_blocks(query)?)
    }

    /// Lexical search returning full block rows (for readable result snippets).
    pub fn search_detailed(&self, query: &str) -> Result<Vec<Block>> {
        Ok(self.store.search_blocks_detailed(query)?)
    }

    /// Seed a note's source of truth with an empty editor-shaped snapshot. Using
    /// the same `loro-prosemirror` shape the live editor emits keeps every note
    /// on a single CRDT representation from creation onward.
    fn seed_empty(&self, note_id: &str) -> Result<()> {
        // Version vector blob is reserved for sync (ADR-008); empty for v1 local.
        let snapshot = noderium_crdt::blocks_to_prosemirror_snapshot(&[])?;
        self.store.save_snapshot(note_id, &snapshot, &[])?;
        Ok(())
    }

    /// Rebuild a note's derived index (blocks + title + links) purely from a
    /// stored `loro-prosemirror` snapshot — the one shape the live editor emits.
    /// This is what makes the golden rule (ADR-001) hold for *real* notes, not
    /// just synthetic ones.
    fn index_from_snapshot(&self, note_id: &str, snapshot: &[u8]) -> Result<()> {
        let blocks = noderium_crdt::blocks_from_prosemirror_snapshot(snapshot)?;
        self.store.delete_blocks_for_note(note_id)?;
        for (index, block) in blocks.iter().enumerate() {
            self.store.upsert_block(&Block {
                id: block.id.clone(),
                note_id: note_id.to_string(),
                parent_id: None,
                order_key: format!("{index:08}"),
                block_type: block.block_type.clone(),
                text: block.text.clone(),
            })?;
        }
        self.maybe_autotitle(note_id, &blocks)?;
        self.reindex_links(
            note_id,
            blocks.iter().map(|b| (b.id.as_str(), b.text.as_str())),
        )
    }

    /// Derive a note's title from its first non-empty block, unless the note
    /// already has a meaningful title (journal dates, frontmatter titles stay).
    fn maybe_autotitle(&self, note_id: &str, blocks: &[noderium_crdt::BlockData]) -> Result<()> {
        let Some(first) = blocks.iter().find(|b| !b.text.trim().is_empty()) else {
            return Ok(());
        };
        let Some(mut note) = self.store.get_note(note_id)? else {
            return Ok(());
        };
        let needs_title = note
            .title
            .as_deref()
            .map(|t| t.trim().is_empty() || t == "Untitled")
            .unwrap_or(true);
        if needs_title {
            note.title = Some(truncate(first.text.trim(), 80));
            self.store.upsert_note(&note)?;
        }
        Ok(())
    }

    /// Rebuild the link graph for a note: parse `[[wikilinks]]` from each block
    /// and store edges to notes that exist (resolved by title).
    fn reindex_links<'a>(
        &self,
        note_id: &str,
        blocks: impl Iterator<Item = (&'a str, &'a str)>,
    ) -> Result<()> {
        self.store.delete_links_from_note(note_id)?;
        for (block_id, text) in blocks {
            for target_title in noderium_core::extract_wikilinks(text) {
                if let Some(target_id) = self.store.note_id_by_title(&target_title)? {
                    self.store.insert_link(block_id, &target_id, "wikilink")?;
                }
            }
        }
        Ok(())
    }
}

fn truncate(text: &str, max_chars: usize) -> String {
    if text.chars().count() <= max_chars {
        text.to_string()
    } else {
        let mut s: String = text.chars().take(max_chars).collect();
        s.push('…');
        s
    }
}
