//! noderium-app-core — facade orchestrating the CRDT (source of truth) and the
//! SQLite derived indexes (ADR-005, ADR-011). This is the surface the desktop
//! shell exposes via Tauri commands/events and mobile reaches via FFI.
//!
//! Golden rule (ADR-001): the Loro doc is the source of truth; every SQLite row
//! except the CRDT store is a rebuildable derived index — proven by the tests.

use noderium_crdt::CrdtError;
use noderium_srs::{CardState, Phase, Scheduler};
use noderium_store::{Block, Note, SrsCard, Store, StoreError};
use thiserror::Error;

pub use noderium_srs::{rating_from_str, Rating};

#[derive(Debug, Error)]
pub enum CoreError {
    #[error(transparent)]
    Store(#[from] StoreError),
    #[error(transparent)]
    Crdt(#[from] CrdtError),
    #[error("note not found: {0}")]
    NoteNotFound(String),
    #[error("card not found: {0}")]
    CardNotFound(String),
}

fn to_row(id: &str, target_id: &str, card_type: &str, state: &CardState) -> SrsCard {
    SrsCard {
        id: id.to_string(),
        target_id: target_id.to_string(),
        card_type: card_type.to_string(),
        due: state.due_ms,
        stability: state.stability,
        difficulty: state.difficulty,
        reps: state.reps,
        lapses: state.lapses,
        state: state.phase.as_str().to_string(),
        last_review: state.last_review_ms,
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

fn from_row(card: &SrsCard) -> CardState {
    CardState {
        due_ms: card.due,
        stability: card.stability,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        phase: Phase::parse(&card.state),
        last_review_ms: card.last_review,
    }
}

pub type Result<T> = std::result::Result<T, CoreError>;

/// Orchestrates persistence + CRDT for a single local workspace.
pub struct Workspace {
    store: Store,
    scheduler: Scheduler,
}

impl Workspace {
    pub fn open_in_memory() -> Result<Self> {
        Ok(Self {
            store: Store::open_in_memory()?,
            scheduler: Scheduler::new(),
        })
    }

    pub fn open(path: impl AsRef<std::path::Path>) -> Result<Self> {
        Ok(Self {
            store: Store::open(path)?,
            scheduler: Scheduler::new(),
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
        self.store.save_snapshot(note_id, snapshot, &[])?;
        self.index_from_snapshot(note_id, snapshot)
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
        self.index_from_snapshot(note_id, &snapshot)
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

    // --- spaced repetition (FSRS, FR-6) ---

    /// Turn a note or block into a review card, due immediately.
    pub fn create_card(
        &self,
        card_id: &str,
        target_id: &str,
        card_type: &str,
        now: i64,
    ) -> Result<()> {
        let state = Scheduler::new_card(now);
        self.store
            .upsert_card(&to_row(card_id, target_id, card_type, &state))?;
        Ok(())
    }

    /// Grade a card review; reschedules via FSRS and updates the queue index.
    pub fn review_card(&self, card_id: &str, rating: Rating, now: i64) -> Result<()> {
        let card = self
            .store
            .get_card(card_id)?
            .ok_or_else(|| CoreError::CardNotFound(card_id.to_string()))?;
        let next = self.scheduler.review(&from_row(&card), rating, now);
        self.store
            .upsert_card(&to_row(&card.id, &card.target_id, &card.card_type, &next))?;
        Ok(())
    }

    /// The review queue: cards due at or before `now` (target ids).
    pub fn due_cards(&self, now: i64) -> Result<Vec<SrsCard>> {
        Ok(self.store.due_cards(now)?)
    }

    // --- internals ---

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

#[cfg(test)]
mod tests {
    use super::*;
    use noderium_crdt::BlockData;

    #[test]
    fn imports_an_editor_snapshot_and_indexes_it() {
        let ws = Workspace::open_in_memory().unwrap();
        ws.create_note("n1", "journal", None, 1).unwrap();

        // Synthesize a loro-prosemirror-shaped snapshot as the JS editor would emit.
        let snapshot = noderium_crdt::blocks_to_prosemirror_snapshot(&[
            BlockData {
                id: "b1".into(),
                block_type: "heading".into(),
                text: "Meeting notes".into(),
            },
            BlockData {
                id: "b2".into(),
                block_type: "paragraph".into(),
                text: "discuss the roadmap".into(),
            },
        ])
        .unwrap();

        ws.import_editor_snapshot("n1", &snapshot).unwrap();

        let blocks = ws.blocks("n1").unwrap();
        assert_eq!(blocks.len(), 2);
        assert_eq!(blocks[0].id, "b1");
        assert_eq!(blocks[0].text, "Meeting notes");
        assert_eq!(ws.search("roadmap").unwrap(), vec!["b2"]);

        // The snapshot itself is persisted as the source of truth.
        assert!(!ws.blocks("n1").unwrap().is_empty());
    }

    #[test]
    fn imports_markdown_then_indexes_and_round_trips() {
        let ws = Workspace::open_in_memory().unwrap();
        let md = "---\n\
title: Imported\n\
type: atomic\n\
---\n\n\
# Heading\n\n\
body with [[Link]]\n";
        ws.import_markdown("n1", md, 0).unwrap();

        let note = ws.note("n1").unwrap().unwrap();
        assert_eq!(note.title.as_deref(), Some("Imported"));
        assert_eq!(note.note_type, "atomic");

        let blocks = ws.blocks("n1").unwrap();
        assert_eq!(blocks.len(), 2);
        assert_eq!(blocks[0].block_type, "heading");
        assert_eq!(blocks[0].text, "Heading");
        assert_eq!(ws.search("body").unwrap().len(), 1);

        // Exporting it back recovers the markdown content.
        let out = ws.export_note_markdown("n1").unwrap();
        assert!(out.contains("# Heading"));
        assert!(out.contains("body with [[Link]]"));
    }

    #[test]
    fn lists_notes_and_autotitles_from_first_block() {
        let ws = Workspace::open_in_memory().unwrap();
        ws.create_note("n1", "atomic", None, 1).unwrap();
        let snapshot = noderium_crdt::blocks_to_prosemirror_snapshot(&[BlockData {
            id: "b1".into(),
            block_type: "heading".into(),
            text: "My First Note".into(),
        }])
        .unwrap();
        ws.import_editor_snapshot("n1", &snapshot).unwrap();

        // Untitled atomic note gets a title from its first block.
        assert_eq!(
            ws.note("n1").unwrap().unwrap().title.as_deref(),
            Some("My First Note")
        );

        // Journal keeps its date title even after content is saved.
        let jid = ws.open_journal("2026-06-06", 2).unwrap();
        let jsnap = noderium_crdt::blocks_to_prosemirror_snapshot(&[BlockData {
            id: "jb".into(),
            block_type: "paragraph".into(),
            text: "dear diary".into(),
        }])
        .unwrap();
        ws.import_editor_snapshot(&jid, &jsnap).unwrap();
        assert_eq!(
            ws.note(&jid).unwrap().unwrap().title.as_deref(),
            Some("2026-06-06")
        );

        let notes = ws.list_notes().unwrap();
        assert!(notes.iter().any(|n| n.id == "n1"));
        assert!(notes.iter().any(|n| n.id == jid));
    }

    #[test]
    fn journal_is_created_once_per_date() {
        let ws = Workspace::open_in_memory().unwrap();
        let first = ws.open_journal("2026-06-06", 1).unwrap();
        let again = ws.open_journal("2026-06-06", 2).unwrap();
        assert_eq!(first, again, "same date returns the same journal note");

        let note = ws.note(&first).unwrap().unwrap();
        assert_eq!(note.note_type, "journal");
        assert_eq!(note.journal_date.as_deref(), Some("2026-06-06"));

        let other_day = ws.open_journal("2026-06-07", 3).unwrap();
        assert_ne!(first, other_day);
    }

    #[test]
    fn journal_content_survives_reopen() {
        let ws = Workspace::open_in_memory().unwrap();
        let id = ws.open_journal("2026-06-06", 1).unwrap();

        // Simulate the editor's Persist flow: a generic create_note (no title /
        // journal_date) followed by saving the editor snapshot.
        ws.create_note(&id, "journal", None, 2).unwrap();
        let snapshot = noderium_crdt::blocks_to_prosemirror_snapshot(&[BlockData {
            id: "b1".into(),
            block_type: "paragraph".into(),
            text: "hello journal".into(),
        }])
        .unwrap();
        ws.import_editor_snapshot(&id, &snapshot).unwrap();

        // Reopening the same day must return the same note without wiping content.
        let reopened = ws.open_journal("2026-06-06", 3).unwrap();
        assert_eq!(reopened, id);

        let blocks = ws.blocks(&reopened).unwrap();
        assert_eq!(blocks.len(), 1);
        assert_eq!(blocks[0].text, "hello journal");

        // The stored snapshot is still the editor's (re-hydration would work).
        let stored = ws.note_snapshot(&reopened).unwrap().unwrap();
        let parsed = noderium_crdt::blocks_from_prosemirror_snapshot(&stored).unwrap();
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].text, "hello journal");
    }

    #[test]
    fn wikilinks_become_backlinks() {
        let ws = Workspace::open_in_memory().unwrap();
        // Target note exists with a title that a wikilink can resolve to.
        ws.create_note("target", "atomic", Some("Target Note"), 0)
            .unwrap();
        // Source note references it.
        ws.import_markdown(
            "source",
            "---\ntitle: Source\n---\n\nsee [[Target Note]] for more\n",
            0,
        )
        .unwrap();

        let back = ws.backlinks("target").unwrap();
        assert_eq!(back.len(), 1);
        assert_eq!(back[0].source_note_id, "source");
        assert!(back[0].text.contains("Target Note"));

        // A note with no inbound links has no backlinks.
        assert!(ws.backlinks("source").unwrap().is_empty());
    }

    #[test]
    fn srs_card_review_flow() {
        let ws = Workspace::open_in_memory().unwrap();
        let now = 1_700_000_000_000;
        ws.create_card("c1", "b1", "note", now).unwrap();

        // Freshly created -> due now -> in the queue.
        let due = ws.due_cards(now).unwrap();
        assert_eq!(due.len(), 1);
        assert_eq!(due[0].id, "c1");
        assert_eq!(due[0].state, "new");

        // Grade it "Good" -> rescheduled into the future -> leaves the queue.
        ws.review_card("c1", Rating::Good, now).unwrap();
        assert!(ws.due_cards(now).unwrap().is_empty());

        // But it reappears once its due date arrives.
        let rescheduled = ws.due_cards(now + 30 * 86_400_000).unwrap();
        assert_eq!(rescheduled.len(), 1);
        assert_eq!(rescheduled[0].reps, 1);
        assert_ne!(rescheduled[0].state, "new");
    }

    #[test]
    fn exports_a_note_to_markdown() {
        let ws = Workspace::open_in_memory().unwrap();
        ws.create_note("n1", "atomic", Some("Fruit"), 0).unwrap();
        let snapshot = noderium_crdt::blocks_to_prosemirror_snapshot(&[
            BlockData {
                id: "b1".into(),
                block_type: "heading".into(),
                text: "Title".into(),
            },
            BlockData {
                id: "b2".into(),
                block_type: "paragraph".into(),
                text: "the body".into(),
            },
        ])
        .unwrap();
        ws.import_editor_snapshot("n1", &snapshot).unwrap();

        let md = ws.export_note_markdown("n1").unwrap();
        assert!(md.contains("id: n1"));
        assert!(md.contains("type: atomic"));
        assert!(md.contains("title: Fruit"));
        assert!(md.contains("# Title ^b1"));
        assert!(md.contains("the body ^b2"));
    }

    #[test]
    fn creates_a_note_and_indexes_blocks() {
        let ws = Workspace::open_in_memory().unwrap();
        ws.create_note("n1", "atomic", Some("Fruit"), 1).unwrap();
        let snapshot = noderium_crdt::blocks_to_prosemirror_snapshot(&[
            BlockData {
                id: "b1".into(),
                block_type: "heading".into(),
                text: "Apples and oranges".into(),
            },
            BlockData {
                id: "b2".into(),
                block_type: "paragraph".into(),
                text: "bananas are great".into(),
            },
        ])
        .unwrap();
        ws.import_editor_snapshot("n1", &snapshot).unwrap();

        // An explicit title is kept (autotitle only fills in untitled notes).
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
        // Persist content exactly as the live editor does: a loro-prosemirror
        // snapshot. The rebuild path must hold for *this* shape, not just the
        // synthetic Tree model.
        let snapshot = noderium_crdt::blocks_to_prosemirror_snapshot(&[
            BlockData {
                id: "b1".into(),
                block_type: "paragraph".into(),
                text: "the quick brown fox".into(),
            },
            BlockData {
                id: "b2".into(),
                block_type: "paragraph".into(),
                text: "jumps over lazy dog".into(),
            },
        ])
        .unwrap();
        ws.import_editor_snapshot("n1", &snapshot).unwrap();

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

        // Rebuild purely from the stored CRDT snapshot — same rows, search works.
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
