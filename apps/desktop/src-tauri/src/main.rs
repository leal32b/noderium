//! Noderium desktop shell (Tauri 2). Owns the app-core `Workspace` and exposes
//! it to the SolidJS frontend via commands (ADR-004/ADR-005).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use std::sync::Mutex;

use noderium_app_core::Workspace;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Persist to a SQLite file in the OS app-data dir (local-first,
            // durable across restarts). On macOS: ~/Library/Application Support/
            // app.noderium.desktop/noderium.db
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let db_path = data_dir.join("noderium.db");
            let workspace = Workspace::open(&db_path)?;
            app.manage(Mutex::new(workspace));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_note,
            commands::add_block,
            commands::note_blocks,
            commands::search,
            commands::save_editor_snapshot,
            commands::export_note_markdown,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Noderium");
}
