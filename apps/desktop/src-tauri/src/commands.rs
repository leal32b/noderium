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
pub struct BacklinkDto {
    pub source_note_id: String,
    pub source_block_id: String,
    pub text: String,
}

#[derive(Serialize)]
pub struct NoteDto {
    pub id: String,
    #[serde(rename = "type")]
    pub note_type: String,
    pub title: Option<String>,
    pub journal_date: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
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

#[derive(Serialize)]
pub struct SearchHitDto {
    pub block_id: String,
    pub note_id: String,
    pub text: String,
}

/// Search returning readable hits (block text + owning note).
#[tauri::command]
pub fn search_detailed(
    ws: State<'_, SharedWorkspace>,
    query: String,
) -> Result<Vec<SearchHitDto>, String> {
    let hits = lock(&ws)?.search_detailed(&query).map_err(to_message)?;
    Ok(hits
        .into_iter()
        .map(|b| SearchHitDto {
            block_id: b.id,
            note_id: b.note_id,
            text: b.text,
        })
        .collect())
}

#[derive(Serialize)]
pub struct SrsCardDto {
    pub id: String,
    pub target_id: String,
    pub card_type: String,
    pub due: i64,
    pub state: String,
    pub reps: i32,
}

/// Turn a note/block into a review card (FR-6).
#[tauri::command]
pub fn create_card(
    ws: State<'_, SharedWorkspace>,
    card_id: String,
    target_id: String,
    card_type: String,
) -> Result<(), String> {
    lock(&ws)?
        .create_card(&card_id, &target_id, &card_type, now_ms())
        .map_err(to_message)
}

/// The review queue: cards due now.
#[tauri::command]
pub fn due_cards(ws: State<'_, SharedWorkspace>) -> Result<Vec<SrsCardDto>, String> {
    let cards = lock(&ws)?.due_cards(now_ms()).map_err(to_message)?;
    Ok(cards
        .into_iter()
        .map(|c| SrsCardDto {
            id: c.id,
            target_id: c.target_id,
            card_type: c.card_type,
            due: c.due,
            state: c.state,
            reps: c.reps,
        })
        .collect())
}

/// Grade a card review (`again` | `hard` | `good` | `easy`), rescheduling it.
#[tauri::command]
pub fn review_card(
    ws: State<'_, SharedWorkspace>,
    card_id: String,
    rating: String,
) -> Result<(), String> {
    let rating = noderium_app_core::rating_from_str(&rating)
        .ok_or_else(|| format!("invalid rating: {rating}"))?;
    lock(&ws)?
        .review_card(&card_id, rating, now_ms())
        .map_err(to_message)
}

/// List all notes, most-recently-updated first.
#[tauri::command]
pub fn list_notes(ws: State<'_, SharedWorkspace>) -> Result<Vec<NoteDto>, String> {
    let notes = lock(&ws)?.list_notes().map_err(to_message)?;
    Ok(notes
        .into_iter()
        .map(|n| NoteDto {
            id: n.id,
            note_type: n.note_type,
            title: n.title,
            journal_date: n.journal_date,
            created_at: n.created_at,
            updated_at: n.updated_at,
        })
        .collect())
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

/// Load a note's stored snapshot so the editor can re-hydrate on open.
#[tauri::command]
pub fn load_editor_snapshot(
    ws: State<'_, SharedWorkspace>,
    note_id: String,
) -> Result<Option<Vec<u8>>, String> {
    lock(&ws)?.note_snapshot(&note_id).map_err(to_message)
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
