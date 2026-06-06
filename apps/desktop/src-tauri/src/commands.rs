//! Tauri commands exposing the app-core `Workspace` to the frontend (ADR-005).
//! The frontend calls these via `invoke(...)`; the live Loro doc and SQLite live
//! here in Rust. State is a `Mutex<Workspace>` because rusqlite's `Connection`
//! is `!Sync`.

use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

use noderium_app_core::Workspace;
use serde::Serialize;
use tauri::State;

pub type SharedWorkspace = Mutex<Workspace>;

#[derive(Serialize)]
pub struct BlockDto {
    pub id: String,
    pub block_type: String,
    pub text: String,
}

#[derive(Serialize)]
pub struct BacklinkDto {
    pub source_note_id: String,
    pub source_block_id: String,
    pub text: String,
}

fn to_message<E: std::fmt::Display>(error: E) -> String {
    error.to_string()
}

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn lock<'a>(
    ws: &'a State<'_, SharedWorkspace>,
) -> Result<std::sync::MutexGuard<'a, Workspace>, String> {
    ws.lock().map_err(|_| "workspace lock poisoned".to_string())
}

#[tauri::command]
pub fn create_note(
    ws: State<'_, SharedWorkspace>,
    id: String,
    note_type: String,
    title: Option<String>,
) -> Result<(), String> {
    lock(&ws)?
        .create_note(&id, &note_type, title.as_deref(), now_ms())
        .map_err(to_message)
}

#[tauri::command]
pub fn add_block(
    ws: State<'_, SharedWorkspace>,
    note_id: String,
    block_type: String,
    text: String,
) -> Result<String, String> {
    lock(&ws)?
        .add_block(&note_id, &block_type, &text)
        .map_err(to_message)
}

#[tauri::command]
pub fn note_blocks(
    ws: State<'_, SharedWorkspace>,
    note_id: String,
) -> Result<Vec<BlockDto>, String> {
    let blocks = lock(&ws)?.blocks(&note_id).map_err(to_message)?;
    Ok(blocks
        .into_iter()
        .map(|b| BlockDto {
            id: b.id,
            block_type: b.block_type,
            text: b.text,
        })
        .collect())
}

#[tauri::command]
pub fn search(ws: State<'_, SharedWorkspace>, query: String) -> Result<Vec<String>, String> {
    lock(&ws)?.search(&query).map_err(to_message)
}

/// Open (or create) the journal note for an ISO date (FR-1).
#[tauri::command]
pub fn open_journal(ws: State<'_, SharedWorkspace>, date: String) -> Result<String, String> {
    lock(&ws)?.open_journal(&date, now_ms()).map_err(to_message)
}

/// Blocks that link to a note via `[[wikilinks]]` (FR-4 backlinks pane).
#[tauri::command]
pub fn backlinks(
    ws: State<'_, SharedWorkspace>,
    note_id: String,
) -> Result<Vec<BacklinkDto>, String> {
    let links = lock(&ws)?.backlinks(&note_id).map_err(to_message)?;
    Ok(links
        .into_iter()
        .map(|b| BacklinkDto {
            source_note_id: b.source_note_id,
            source_block_id: b.source_block_id,
            text: b.text,
        })
        .collect())
}

/// Import a markdown note (Obsidian-style, FR-10).
#[tauri::command]
pub fn import_markdown(
    ws: State<'_, SharedWorkspace>,
    note_id: String,
    markdown: String,
) -> Result<(), String> {
    lock(&ws)?
        .import_markdown(&note_id, &markdown, now_ms())
        .map_err(to_message)
}

/// Export a note as deterministic markdown (FR-9).
#[tauri::command]
pub fn export_note_markdown(
    ws: State<'_, SharedWorkspace>,
    note_id: String,
) -> Result<String, String> {
    lock(&ws)?
        .export_note_markdown(&note_id)
        .map_err(to_message)
}

/// Persist a snapshot exported by the JS editor (loro-prosemirror) and reindex.
#[tauri::command]
pub fn save_editor_snapshot(
    ws: State<'_, SharedWorkspace>,
    note_id: String,
    snapshot: Vec<u8>,
) -> Result<(), String> {
    lock(&ws)?
        .import_editor_snapshot(&note_id, &snapshot)
        .map_err(to_message)
}
