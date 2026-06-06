//! Deterministic `.md` export (FR-9, ADR-001). Markdown is export, never the
//! source of truth — but it must always be available (anti-lock-in, §1.2).
//!
//! Output shape (one file per note):
//! ```text
//! ---
//! id: <stable note id>
//! type: atomic
//! title: Example
//! created: 2026-06-06T10:00:00Z
//! ---
//!
//! A paragraph. ^<block-id>
//! ```

use time::format_description::well_known::Rfc3339;
use time::OffsetDateTime;

/// Note-level metadata rendered as YAML frontmatter.
#[derive(Debug, Clone)]
pub struct NoteFrontmatter<'a> {
    pub id: &'a str,
    pub note_type: &'a str,
    pub title: Option<&'a str>,
    pub created_at_ms: i64,
}

/// A block to render. `block_type` matches the editor schema
/// (`paragraph`, `heading`, `blockquote`, `code_block`, `list_item`, …).
#[derive(Debug, Clone)]
pub struct ExportBlock<'a> {
    pub id: &'a str,
    pub block_type: &'a str,
    pub text: &'a str,
}

/// Serialize a note + its (already ordered) blocks to deterministic markdown.
pub fn note_to_markdown(frontmatter: &NoteFrontmatter, blocks: &[ExportBlock]) -> String {
    let mut out = String::new();
    out.push_str("---\n");
    out.push_str(&format!("id: {}\n", frontmatter.id));
    out.push_str(&format!("type: {}\n", frontmatter.note_type));
    if let Some(title) = frontmatter.title {
        out.push_str(&format!("title: {title}\n"));
    }
    out.push_str(&format!(
        "created: {}\n",
        format_timestamp(frontmatter.created_at_ms)
    ));
    out.push_str("---\n\n");

    for block in blocks {
        out.push_str(&render_block(block));
        out.push('\n');
    }

    out
}

fn render_block(block: &ExportBlock) -> String {
    match block.block_type {
        "heading" => format!("# {} ^{}", block.text, block.id),
        "blockquote" => format!("> {} ^{}", block.text, block.id),
        "list_item" | "bullet_list" => format!("- {} ^{}", block.text, block.id),
        // Code blocks are fenced; block-ref anchors would corrupt the content.
        "code_block" => format!("```\n{}\n```", block.text),
        // paragraph and anything else.
        _ => format!("{} ^{}", block.text, block.id),
    }
}

fn format_timestamp(ms: i64) -> String {
    OffsetDateTime::from_unix_timestamp_nanos((ms as i128) * 1_000_000)
        .ok()
        .and_then(|dt| dt.format(&Rfc3339).ok())
        .unwrap_or_else(|| ms.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn renders_frontmatter_and_blocks_deterministically() {
        let fm = NoteFrontmatter {
            id: "01J9X4",
            note_type: "atomic",
            title: Some("Example"),
            created_at_ms: 1_749_200_400_000, // 2025-06-06T09:00:00Z
        };
        let blocks = [
            ExportBlock {
                id: "b1",
                block_type: "heading",
                text: "Title",
            },
            ExportBlock {
                id: "b2",
                block_type: "paragraph",
                text: "Hello world",
            },
        ];

        let md = note_to_markdown(&fm, &blocks);
        let expected = "---\n\
id: 01J9X4\n\
type: atomic\n\
title: Example\n\
created: 2025-06-06T09:00:00Z\n\
---\n\n\
# Title ^b1\n\
Hello world ^b2\n";
        assert_eq!(md, expected);
    }

    #[test]
    fn omits_title_when_absent_and_fences_code() {
        let fm = NoteFrontmatter {
            id: "n1",
            note_type: "journal",
            title: None,
            created_at_ms: 0,
        };
        let blocks = [ExportBlock {
            id: "c1",
            block_type: "code_block",
            text: "let x = 1;",
        }];
        let md = note_to_markdown(&fm, &blocks);
        assert!(!md.contains("title:"));
        assert!(md.contains("created: 1970-01-01T00:00:00Z"));
        assert!(md.contains("```\nlet x = 1;\n```"));
    }
}
