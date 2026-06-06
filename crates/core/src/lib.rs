//! noderium-core — canonical block model, note types, markdown parser (comrak),
//! and deterministic `.md` export (ADR-001, ADR-015).

pub mod import;
pub mod markdown;
pub use import::{parse_markdown, ParsedBlock, ParsedNote, WikiLink};
pub use markdown::{note_to_markdown, ExportBlock, NoteFrontmatter};

// pub mod block;        // block model: id, type, properties, ordering
// pub mod note;         // note types (journal, atomic, ...)
// pub mod parser;       // comrak-based markdown import
