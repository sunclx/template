use crate::database::{DatabaseManager, Disease, Tag, Template, TemplateType};
use crate::AppState;
use tauri::webview::WebviewWindowBuilder;
use tauri::{AppHandle, State, WebviewUrl};

/// 初始化数据库
#[tauri::command]
pub async fn init_database(
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // 检查数据库是否已初始化
    if state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?
        .is_some()
    {
        return Ok(());
    }

    match DatabaseManager::new(&app_handle) {
        Ok(db_manager) => {
            // 将数据库管理器存储到应用状态中
            let mut db = state
                .db
                .lock()
                .map_err(|e| format!("Failed to lock database: {}", e))?;
            *db = Some(db_manager);
            Ok(())
        }
        Err(e) => Err(format!("Failed to initialize database: {}", e)),
    }
}

/// 获取所有模板
#[tauri::command]
pub async fn get_all_templates(state: State<'_, AppState>) -> Result<Vec<Template>, String> {
    let db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_ref().ok_or("Database not initialized")?;
    db_manager
        .get_all_templates()
        .map_err(|e| format!("Database error: {}", e))
}

/// 根据ID获取模板
#[tauri::command]
pub async fn get_template_by_id(
    id: String,
    state: State<'_, AppState>,
) -> Result<Option<Template>, String> {
    let db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_ref().ok_or("Database not initialized")?;
    db_manager
        .get_template_by_id(&id)
        .map_err(|e| format!("Database error: {}", e))
}

/// 保存模板
#[tauri::command]
pub async fn save_template(
    template: Template,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let mut db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_mut().ok_or("Database not initialized")?;
    db_manager
        .upsert_template(&template)
        .map_err(|e| format!("Database error: {}", e))?;
    Ok("Template saved successfully".to_string())
}

/// 导入模板
#[tauri::command]
pub async fn import_templates(
    templates: Vec<Template>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let mut db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_mut().ok_or("Database not initialized")?;
    db_manager
        .batch_upsert_templates(&templates)
        .map_err(|e| format!("Database error: {}", e))?;
    Ok("Templates saved successfully".to_string())
}

/// 删除模板
#[tauri::command]
pub async fn delete_template(id: String, state: State<'_, AppState>) -> Result<String, String> {
    let mut db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_mut().ok_or("Database not initialized")?;
    db_manager
        .delete_template(&id)
        .map_err(|e| format!("Database error: {}", e))?;
    Ok("Template deleted successfully".to_string())
}

/// 切换模板收藏状态
#[tauri::command]
pub async fn toggle_template_favorite(
    id: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let mut db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_mut().ok_or("Database not initialized")?;
    db_manager
        .toggle_template_favorite(&id)
        .map_err(|e| format!("Database error: {}", e))?;
    Ok("Template favorite status toggled successfully".to_string())
}

/// 搜索模板
#[tauri::command]
pub async fn search_templates(
    keyword: String,
    state: State<'_, AppState>,
) -> Result<Vec<Template>, String> {
    let db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_ref().ok_or("Database not initialized")?;
    db_manager
        .search_templates(&keyword)
        .map_err(|e| format!("Database error: {}", e))
}

/// 获取所有疾病分类及其模板数量
#[tauri::command]
pub async fn get_all_diseases(state: State<'_, AppState>) -> Result<Vec<Disease>, String> {
    let db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_ref().ok_or("Database not initialized")?;
    db_manager
        .get_all_diseases()
        .map_err(|e| format!("Database error: {}", e))
}

/// 获取所有模板类型及其模板数量
#[tauri::command]
pub async fn get_all_template_types(
    state: State<'_, AppState>,
) -> Result<Vec<TemplateType>, String> {
    let db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_ref().ok_or("Database not initialized")?;
    db_manager
        .get_all_template_types()
        .map_err(|e| format!("Database error: {}", e))
}

/// 获取所有标签
#[tauri::command]
pub async fn get_all_tags(state: State<'_, AppState>) -> Result<Vec<Tag>, String> {
    let db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_ref().ok_or("Database not initialized")?;
    db_manager
        .get_all_tags()
        .map_err(|e| format!("Database error: {}", e))
}

/// 保存标签
#[tauri::command]
pub async fn save_tag(tag: Tag, state: State<'_, AppState>) -> Result<String, String> {
    let mut db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_mut().ok_or("Database not initialized")?;
    db_manager
        .upsert_tag(&tag)
        .map_err(|e| format!("Database error: {}", e))?;
    Ok("Tag saved successfully".to_string())
}

/// 重置标签
#[tauri::command]
pub async fn reset_tags(state: State<'_, AppState>) -> Result<String, String> {
    let mut db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_mut().ok_or("Database not initialized")?;
    db_manager
        .reset_tags()
        .map_err(|e| format!("Database error: {}", e))?;
    Ok("Tags reset successfully".to_string())
}

/// 清空模板
#[tauri::command]
pub async fn clear_templates(state: State<'_, AppState>) -> Result<String, String> {
    let mut db = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;
    let db_manager = db.as_mut().ok_or("Database not initialized")?;
    db_manager
        .clear_all_templates()
        .map_err(|e| format!("Database error: {}", e))?;
    Ok("Templates cleared successfully".to_string())
}

// 初始化示例数据
// #[tauri::command]
// pub async fn init_sample_data(state: State<'_, AppState>) -> Result<String, String> {
//     let mut db = state.db.lock().map_err(|e| format!("Failed to lock database: {}", e))?;
//     let db_manager = db.as_mut().ok_or("Database not initialized")?;

//     // 初始化标签
//     let tags = vec![
//         Tag {
//             id: "common".to_string(),
//             name: "常用".to_string(),
//             color: "#4caf50".to_string(),
//         },
//         Tag {
//             id: "emergency".to_string(),
//             name: "急诊".to_string(),
//             color: "#e53935".to_string(),
//         },
//         Tag {
//             id: "surgery".to_string(),
//             name: "手术".to_string(),
//             color: "#ff9800".to_string(),
//         },
//         Tag {
//             id: "pediatric".to_string(),
//             name: "儿科".to_string(),
//             color: "#9c27b0".to_string(),
//         },
//     ];

//     for tag in tags {
//         db_manager.upsert_tag(&tag).map_err(|e| format!("Failed to insert tag: {}", e))?;
//     }

//     Ok("Sample data initialized successfully".to_string())
// }

/// 创建悬浮搜索窗口
#[tauri::command]
pub async fn create_float_window(app_handle: AppHandle) -> Result<(), String> {
    WebviewWindowBuilder::new(
        &app_handle,
        "floating",
        WebviewUrl::App("float.html".into()),
    )
    .title("悬浮搜索")
    .inner_size(300.0, 400.0)
    .min_inner_size(250.0, 300.0)
    .resizable(true)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .transparent(true)
    .build()
    .map_err(|e| format!("Failed to create float window: {}", e))?;

    Ok(())
}

use mouse_position::mouse_position::Mouse;
use serde_json::json;

#[tauri::command]
pub fn get_mouse_position() -> serde_json::Value {
    /*
     * because we set the window to ignore cursor events, we cannot use
     * javascript to get the mouse position, so we use get mouse position manually
     */
    let position = Mouse::get_mouse_position();
    match position {
        Mouse::Position { x, y } => {
            json!({
                "clientX": x,
                "clientY": y
            })
        }
        Mouse::Error => {
            println!("Error getting mouse position");
            json!(null)
        }
    }
}
