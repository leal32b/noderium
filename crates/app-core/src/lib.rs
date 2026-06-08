//! noderium-app-core — facade orchestrating the CRDT (source of truth) and the
//! SQLite derived indexes (ADR-005, ADR-011). This is the surface the desktop
//! shell exposes via Tauri commands/events and mobile reaches via FFI.
//!
//! Golden rule (ADR-001): the Loro doc is the source of truth; every SQLite row
//! except the CRDT store is a rebuildable derived index — proven by the tests.
//!
//! The [`Workspace`] surface is split by domain: notes + the editor flow in
//! [`notes`], markdown import/export in [`markdown`], spaced repetition in [`srs`].

use noderium_crdt::CrdtError;
use noderium_srs::Scheduler;
use noderium_store::{Store, StoreError};
use thiserror::Error;

mod markdown;
mod notes;
mod srs;

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
