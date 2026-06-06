//! Noderium desktop shell (Tauri 2). Owns the app-core `Workspace` and exposes
//! it to the SolidJS frontend via commands (ADR-004/ADR-005).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use std::sync::Mutex;

use noderium_app_core::Workspace;

fn main() {
    // v1 local: an in-memory workspace. A persistent on-disk path (app data dir)
    // is wired when the persistence/migration UX lands.
    let workspace = Workspace::open_in_memory().expect("failed to initialize workspace");

    tauri::Builder::default()
        .manage(Mutex::new(workspace))
        .invoke_handler(tauri::generate_handler![
            commands::create_note,
            commands::add_block,
            commands::note_blocks,
            commands::search,
            commands::save_editor_snapshot,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Noderium");
}
