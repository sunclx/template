mod commands;
mod database;

use commands::*;
use database::DatabaseManager;
use std::sync::Mutex;

/// 应用状态，包含数据库管理器
pub struct AppState {
    pub db: Mutex<Option<DatabaseManager>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            db: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            init_database,
            get_all_templates,
            get_template_by_id,
            save_template,
            delete_template,
            toggle_template_favorite,
            search_templates,
            get_all_diseases,
            get_all_template_types,
            get_all_tags,
            save_tag,
            import_templates,
            reset_tags
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
