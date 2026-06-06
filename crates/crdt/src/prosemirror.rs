//! Read blocks out of a `loro-prosemirror`-shaped document.
//!
//! The JS editor (packages/editor) syncs ProseMirror into Loro via
//! `loro-prosemirror`, which stores the doc as a root `LoroMap` ("doc") whose
//! nodes each have `nodeName`, an `attributes` map, and a `children` list of
//! child node maps / `LoroText`. Because Loro's binary format is cross-language
//! (ADR-002), a snapshot exported in JS imports into Rust and is read here — no
//! re-serialization, no schema duplication.

use loro::{
    Container, ExportMode, LoroDoc, LoroList, LoroMap, LoroText, LoroValue, ValueOrContainer,
};

use crate::{BlockData, CrdtError, Result};

// Keys mirror loro-prosemirror's exported constants.
const ROOT_DOC_KEY: &str = "doc";
const CHILDREN_KEY: &str = "children";
const ATTRIBUTES_KEY: &str = "attributes";
const NODE_NAME_KEY: &str = "nodeName";

/// Extract top-level blocks from a `loro-prosemirror` snapshot (e.g. one exported
/// by the JS editor). Each top-level child of the doc node becomes a block; its
/// text is the concatenation of all descendant `LoroText`.
pub fn blocks_from_prosemirror_snapshot(snapshot: &[u8]) -> Result<Vec<BlockData>> {
    let doc = LoroDoc::new();
    doc.import(snapshot)?;
    Ok(blocks_from_prosemirror_doc(&doc))
}

/// Extract blocks from an already-loaded `loro-prosemirror` document.
pub fn blocks_from_prosemirror_doc(doc: &LoroDoc) -> Vec<BlockData> {
    let root = doc.get_map(ROOT_DOC_KEY);
    let mut blocks = Vec::new();
    let Some(children) = get_list(&root, CHILDREN_KEY) else {
        return blocks;
    };
    for index in 0..children.len() {
        if let Some(ValueOrContainer::Container(Container::Map(node))) = children.get(index) {
            blocks.push(block_from_node(&node, index));
        }
    }
    blocks
}

/// Build a `loro-prosemirror`-shaped snapshot from flat blocks (each a node with
/// a single text child). Used to synthesize editor-like documents in tests and
/// to round-trip against [`blocks_from_prosemirror_snapshot`].
pub fn blocks_to_prosemirror_snapshot(blocks: &[BlockData]) -> Result<Vec<u8>> {
    let doc = LoroDoc::new();
    let root = doc.get_map(ROOT_DOC_KEY);
    root.insert(NODE_NAME_KEY, "doc")?;
    let children = root.insert_container(CHILDREN_KEY, LoroList::new())?;
    for (index, block) in blocks.iter().enumerate() {
        let node = children.insert_container(index, LoroMap::new())?;
        node.insert(NODE_NAME_KEY, block.block_type.as_str())?;
        let attrs = node.insert_container(ATTRIBUTES_KEY, LoroMap::new())?;
        attrs.insert("id", block.id.as_str())?;
        let node_children = node.insert_container(CHILDREN_KEY, LoroList::new())?;
        let text = node_children.insert_container(0, LoroText::new())?;
        text.insert(0, &block.text)?;
    }
    doc.commit();
    doc.export(ExportMode::Snapshot)
        .map_err(|e| CrdtError::Encode(e.to_string()))
}

fn block_from_node(node: &LoroMap, index: usize) -> BlockData {
    let block_type = get_string(node, NODE_NAME_KEY).unwrap_or_else(|| "paragraph".to_string());
    let id = get_map(node, ATTRIBUTES_KEY)
        .and_then(|attrs| get_string(&attrs, "id"))
        .unwrap_or_else(|| format!("block-{index}"));
    let mut text = String::new();
    collect_text(node, &mut text);
    BlockData {
        id,
        block_type,
        text,
    }
}

fn collect_text(node: &LoroMap, out: &mut String) {
    let Some(children) = get_list(node, CHILDREN_KEY) else {
        return;
    };
    for index in 0..children.len() {
        match children.get(index) {
            Some(ValueOrContainer::Container(Container::Text(text))) => {
                out.push_str(&text.to_string())
            }
            Some(ValueOrContainer::Container(Container::Map(child))) => collect_text(&child, out),
            _ => {}
        }
    }
}

fn get_list(map: &LoroMap, key: &str) -> Option<LoroList> {
    match map.get(key)? {
        ValueOrContainer::Container(Container::List(list)) => Some(list),
        _ => None,
    }
}

fn get_map(map: &LoroMap, key: &str) -> Option<LoroMap> {
    match map.get(key)? {
        ValueOrContainer::Container(Container::Map(inner)) => Some(inner),
        _ => None,
    }
}

fn get_string(map: &LoroMap, key: &str) -> Option<String> {
    match map.get(key)?.get_deep_value() {
        LoroValue::String(s) => Some(s.to_string()),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn block(id: &str, block_type: &str, text: &str) -> BlockData {
        BlockData {
            id: id.to_string(),
            block_type: block_type.to_string(),
            text: text.to_string(),
        }
    }

    #[test]
    fn parses_blocks_from_a_built_doc() {
        let input = vec![
            block("b1", "heading", "Title"),
            block("b2", "paragraph", "Hello world"),
        ];
        let snapshot = blocks_to_prosemirror_snapshot(&input).unwrap();
        let parsed = blocks_from_prosemirror_snapshot(&snapshot).unwrap();
        assert_eq!(parsed, input);
    }

    #[test]
    fn empty_doc_yields_no_blocks() {
        let snapshot = blocks_to_prosemirror_snapshot(&[]).unwrap();
        assert!(blocks_from_prosemirror_snapshot(&snapshot)
            .unwrap()
            .is_empty());
    }

    #[test]
    fn falls_back_to_block_index_when_id_attr_missing() {
        // A doc node without an `attributes.id` should still parse with a
        // synthetic id rather than being dropped.
        let doc = LoroDoc::new();
        let root = doc.get_map(ROOT_DOC_KEY);
        let children = root
            .insert_container(CHILDREN_KEY, LoroList::new())
            .unwrap();
        let node = children.insert_container(0, LoroMap::new()).unwrap();
        node.insert(NODE_NAME_KEY, "paragraph").unwrap();
        let node_children = node
            .insert_container(CHILDREN_KEY, LoroList::new())
            .unwrap();
        let text = node_children.insert_container(0, LoroText::new()).unwrap();
        text.insert(0, "no id here").unwrap();
        doc.commit();

        let blocks = blocks_from_prosemirror_doc(&doc);
        assert_eq!(blocks.len(), 1);
        assert_eq!(blocks[0].id, "block-0");
        assert_eq!(blocks[0].text, "no id here");
    }
}
