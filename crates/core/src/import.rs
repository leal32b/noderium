//! Markdown import (ADR-015): parse `.md` + frontmatter + `[[wikilinks]]` into
//! blocks. Targets Obsidian vaults and round-trips with [`crate::note_to_markdown`].
//! This is import, not the source of truth — parsed blocks are fed into the CRDT.

use std::collections::BTreeMap;

/// A block parsed from markdown. `id` is `Some` when a `^anchor` was present.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedBlock {
    pub id: Option<String>,
    pub block_type: String,
    pub text: String,
}

/// A `[[wikilink]]` discovered in a block, with the index of its source block.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WikiLink {
    pub target: String,
    pub source_block_index: usize,
}

/// The result of parsing one markdown note.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedNote {
    pub frontmatter: BTreeMap<String, String>,
    pub blocks: Vec<ParsedBlock>,
    pub links: Vec<WikiLink>,
}

/// Parse a markdown document into frontmatter + blocks + wikilinks.
pub fn parse_markdown(input: &str) -> ParsedNote {
    let (frontmatter, body) = parse_frontmatter(input);
    let mut blocks = Vec::new();
    let mut links = Vec::new();

    let mut lines = body.lines();
    while let Some(line) = lines.next() {
        if line.trim().is_empty() {
            continue;
        }

        // Fenced code block: accumulate until the closing fence.
        if line.trim_start().starts_with("```") {
            let mut code = String::new();
            for inner in lines.by_ref() {
                if inner.trim_start().starts_with("```") {
                    break;
                }
                if !code.is_empty() {
                    code.push('\n');
                }
                code.push_str(inner);
            }
            blocks.push(ParsedBlock {
                id: None,
                block_type: "code_block".to_string(),
                text: code,
            });
            continue;
        }

        let (content, id) = split_anchor(line);
        let (block_type, text) = classify(content);
        let index = blocks.len();
        for target in extract_wikilinks(&text) {
            links.push(WikiLink {
                target,
                source_block_index: index,
            });
        }
        blocks.push(ParsedBlock {
            id,
            block_type,
            text,
        });
    }

    ParsedNote {
        frontmatter,
        blocks,
        links,
    }
}

fn parse_frontmatter(input: &str) -> (BTreeMap<String, String>, &str) {
    let mut map = BTreeMap::new();
    if let Some(rest) = input.strip_prefix("---\n") {
        if let Some(end) = rest.find("\n---\n") {
            for line in rest[..end].lines() {
                if let Some((key, value)) = line.split_once(':') {
                    map.insert(key.trim().to_string(), value.trim().to_string());
                }
            }
            return (map, &rest[end + 5..]);
        }
    }
    (map, input)
}

/// Split a trailing ` ^anchor` block id off a line, if present.
fn split_anchor(line: &str) -> (&str, Option<String>) {
    let trimmed = line.trim_end();
    if let Some(pos) = trimmed.rfind(" ^") {
        let token = &trimmed[pos + 2..];
        if !token.is_empty() && !token.contains(char::is_whitespace) {
            return (&trimmed[..pos], Some(token.to_string()));
        }
    }
    (trimmed, None)
}

fn classify(line: &str) -> (String, String) {
    let l = line.trim_start();
    if l.starts_with('#') {
        let hashes = l.chars().take_while(|&c| c == '#').count();
        if hashes <= 6 {
            let rest = l[hashes..].trim_start();
            if !rest.is_empty() || hashes > 0 {
                return ("heading".to_string(), rest.to_string());
            }
        }
    }
    if let Some(rest) = l.strip_prefix("> ") {
        return ("blockquote".to_string(), rest.to_string());
    }
    if let Some(rest) = l.strip_prefix("- ").or_else(|| l.strip_prefix("* ")) {
        return ("list_item".to_string(), rest.to_string());
    }
    ("paragraph".to_string(), line.trim_end().to_string())
}

/// Extract `[[wikilink]]` targets from a string (alias form `[[Target|alias]]`
/// yields `Target`). Used to build the backlink graph.
pub fn extract_wikilinks(text: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut rest = text;
    while let Some(start) = rest.find("[[") {
        let after = &rest[start + 2..];
        if let Some(end) = after.find("]]") {
            let inner = &after[..end];
            let target = inner.split('|').next().unwrap_or(inner).trim();
            if !target.is_empty() {
                out.push(target.to_string());
            }
            rest = &after[end + 2..];
        } else {
            break;
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_obsidian_style_markdown() {
        let md = "---\n\
title: My Note\n\
type: atomic\n\
---\n\n\
# Heading\n\n\
Some text with [[Other Note|alias]] and [[Second]].\n\n\
- item one\n\
- item two\n";
        let note = parse_markdown(md);

        assert_eq!(
            note.frontmatter.get("title").map(String::as_str),
            Some("My Note")
        );
        assert_eq!(
            note.frontmatter.get("type").map(String::as_str),
            Some("atomic")
        );

        let kinds: Vec<_> = note.blocks.iter().map(|b| b.block_type.as_str()).collect();
        assert_eq!(
            kinds,
            vec!["heading", "paragraph", "list_item", "list_item"]
        );
        assert_eq!(note.blocks[0].text, "Heading");
        assert_eq!(note.blocks[3].text, "item two");

        assert_eq!(
            note.links,
            vec![
                WikiLink {
                    target: "Other Note".to_string(),
                    source_block_index: 1,
                },
                WikiLink {
                    target: "Second".to_string(),
                    source_block_index: 1,
                },
            ]
        );
    }

    #[test]
    fn recovers_block_ids_from_anchors_and_fences_code() {
        let md = "# Title ^b1\nbody ^b2\n```\nlet x = 1;\n```\n";
        let note = parse_markdown(md);
        assert_eq!(note.blocks[0].id.as_deref(), Some("b1"));
        assert_eq!(note.blocks[0].text, "Title");
        assert_eq!(note.blocks[1].id.as_deref(), Some("b2"));
        assert_eq!(note.blocks[2].block_type, "code_block");
        assert_eq!(note.blocks[2].text, "let x = 1;");
        assert_eq!(note.blocks[2].id, None);
    }

    #[test]
    fn round_trips_with_export() {
        let fm = crate::NoteFrontmatter {
            id: "n1",
            note_type: "atomic",
            title: Some("Example"),
            created_at_ms: 0,
        };
        let blocks = [
            crate::ExportBlock {
                id: "b1",
                block_type: "heading",
                text: "Title",
            },
            crate::ExportBlock {
                id: "b2",
                block_type: "paragraph",
                text: "Hello [[Other Note]] world",
            },
        ];
        let md = crate::note_to_markdown(&fm, &blocks);
        let note = parse_markdown(&md);

        assert_eq!(note.frontmatter.get("id").map(String::as_str), Some("n1"));
        assert_eq!(note.blocks.len(), 2);
        assert_eq!(note.blocks[0].block_type, "heading");
        assert_eq!(note.blocks[0].text, "Title");
        assert_eq!(note.blocks[0].id.as_deref(), Some("b1"));
        assert_eq!(note.blocks[1].text, "Hello [[Other Note]] world");
        assert_eq!(note.links[0].target, "Other Note");
    }
}
