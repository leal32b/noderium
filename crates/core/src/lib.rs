//! noderium-core — canonical block model, note types, a line-based markdown
//! parser (frontmatter + `[[wikilinks]]`), and deterministic `.md` export
//! (ADR-001, ADR-015).

pub mod import;
pub mod markdown;
pub use import::{extract_wikilinks, parse_markdown, ParsedBlock, ParsedNote, WikiLink};
pub use markdown::{note_to_markdown, ExportBlock, NoteFrontmatter};

// pub mod block;        // block model: id, type, properties, ordering (FR-5)
// pub mod note;         // note types (journal, atomic, ...)
