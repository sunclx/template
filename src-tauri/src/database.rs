use duckdb::{Connection, Result as DuckResult, ToSql};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

/// 模板数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Template {
    pub id: String,
    pub title: String,
    pub sections: Vec<TemplateSection>,
    pub disease: String,
    pub template_type: String,
    pub tags: Vec<String>,
    pub created_at: i64,
    pub updated_at: i64,
    pub is_favorite: bool,
}

/// 模板章节数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TemplateSection {
    pub title: String,
    pub content: String,
}



/// 标签数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
}

/// 数据库管理器
pub struct DatabaseManager {
    conn: Connection,
}

impl DatabaseManager {
    /// 创建新的数据库管理器实例
    pub fn new(app_handle: &AppHandle) -> DuckResult<Self> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .expect("Failed to get app data directory");
        
        // 确保应用数据目录存在
        std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
        
        let db_path = app_dir.join("template.db");
        let conn = Connection::open(db_path)?;
        
        let mut manager = DatabaseManager { conn };
        manager.init_tables()?;
        
        Ok(manager)
    }
    
    /// 初始化数据库表
    fn init_tables(&mut self) -> DuckResult<()> {
        // 创建模板表
        self.conn.execute(
            r#"
            CREATE TABLE IF NOT EXISTS templates (
                id VARCHAR PRIMARY KEY,
                title VARCHAR NOT NULL,
                sections JSON NOT NULL,
                disease VARCHAR NOT NULL,
                template_type VARCHAR NOT NULL,
                tags JSON NOT NULL,
                created_at BIGINT NOT NULL,
                updated_at BIGINT NOT NULL,
                is_favorite BOOLEAN NOT NULL DEFAULT FALSE
            )
            "#,
            [],
        )?;
        

        
        // 创建标签表
        self.conn.execute(
            r#"
            CREATE TABLE IF NOT EXISTS tags (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                color VARCHAR NOT NULL
            )
            "#,
            [],
        )?;
        
        Ok(())
    }
    
    /// 插入或更新模板
    pub fn upsert_template(&mut self, template: &Template) -> DuckResult<()> {
        let sections_json = serde_json::to_string(&template.sections)
            .map_err(|e| duckdb::Error::ToSqlConversionFailure(Box::new(e)))?;
        let tags_json = serde_json::to_string(&template.tags)
            .map_err(|e| duckdb::Error::ToSqlConversionFailure(Box::new(e)))?;
        println!("upsert_template:{:?}", template);
        
        self.conn.execute(
            r#"
            INSERT OR REPLACE INTO templates 
            (id, title, sections, disease, template_type, tags, created_at, updated_at, is_favorite)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            [
                &template.id as &dyn ToSql,
                &template.title as &dyn ToSql,
                &sections_json as &dyn ToSql,
                &template.disease as &dyn ToSql,
                &template.template_type as &dyn ToSql,
                &tags_json as &dyn ToSql,
                &template.created_at as &dyn ToSql,
                &template.updated_at as &dyn ToSql,
                &template.is_favorite as &dyn ToSql,
            ],
        )?;
        
        Ok(())
    }
    
    /// 获取所有模板
    pub fn get_all_templates(&self) -> DuckResult<Vec<Template>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, sections, disease, template_type, tags, created_at, updated_at, is_favorite FROM templates ORDER BY updated_at DESC"
        )?;
        
        let template_iter = stmt.query_map([], |row| {
            let sections_json: String = row.get(2)?;
            let tags_json: String = row.get(5)?;
            
            let sections: Vec<TemplateSection> = serde_json::from_str(&sections_json)
                .map_err(|_| duckdb::Error::InvalidColumnIndex(2))?;
            let tags: Vec<String> = serde_json::from_str(&tags_json)
                .map_err(|_| duckdb::Error::InvalidColumnIndex(5))?;
            
            Ok(Template {
                id: row.get(0)?,
                title: row.get(1)?,
                sections,
                disease: row.get(3)?,
                template_type: row.get(4)?,
                tags,
                created_at: row.get::<_, i64>(6)?,
                updated_at: row.get::<_, i64>(7)?,
                is_favorite: row.get::<_, bool>(8)?,
            })
        })?;
        
        let mut templates = Vec::new();
        for template in template_iter {
            templates.push(template?);
        }
        
        Ok(templates)
    }
    
    /// 根据ID获取模板
    pub fn get_template_by_id(&self, id: &str) -> DuckResult<Option<Template>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, title, sections, disease, template_type, tags, created_at, updated_at, is_favorite FROM templates WHERE id = ?"
        )?;
        
        let mut rows = stmt.query_map([id], |row| {
            let sections_json: String = row.get(2)?;
            let tags_json: String = row.get(5)?;
            
            let sections: Vec<TemplateSection> = serde_json::from_str(&sections_json)
                .map_err(|_| duckdb::Error::InvalidColumnIndex(2))?;
            let tags: Vec<String> = serde_json::from_str(&tags_json)
                .map_err(|_| duckdb::Error::InvalidColumnIndex(5))?;
            
            Ok(Template {
                id: row.get(0)?,
                title: row.get(1)?,
                sections,
                disease: row.get(3)?,
                template_type: row.get(4)?,
                tags,
                created_at: row.get::<_, i64>(6)?,
                updated_at: row.get::<_, i64>(7)?,
                is_favorite: row.get::<_, bool>(8)?,
            })
        })?;
        
        match rows.next() {
            Some(template) => Ok(Some(template?)),
            None => Ok(None),
        }
    }
    
    /// 删除模板
    pub fn delete_template(&mut self, id: &str) -> DuckResult<()> {
        self.conn.execute("DELETE FROM templates WHERE id = ?", [id])?;
        Ok(())
    }
    
    /// 切换模板收藏状态
    pub fn toggle_template_favorite(&mut self, id: &str) -> DuckResult<()> {
        self.conn.execute(
            "UPDATE templates SET is_favorite = NOT is_favorite, updated_at = ? WHERE id = ?",
            [&chrono::Utc::now().timestamp_millis() as &dyn ToSql, &id as &dyn ToSql],
        )?;
        Ok(())
    }
    
    /// 获取所有疾病分类及其模板数量
    pub fn get_all_diseases(&self) -> DuckResult<Vec<(String, i32)>> {
        let mut stmt = self.conn.prepare(
            "SELECT disease, COUNT(*) as template_count FROM templates GROUP BY disease ORDER BY disease"
        )?;
        
        let disease_iter = stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, i32>(1)?))
        })?;
        
        let mut diseases = Vec::new();
        for disease in disease_iter {
            diseases.push(disease?);
        }
        
        Ok(diseases)
    }
    
    /// 获取所有模板类型及其模板数量
    pub fn get_all_template_types(&self) -> DuckResult<Vec<(String, i32)>> {
        let mut stmt = self.conn.prepare(
            "SELECT template_type, COUNT(*) as template_count FROM templates GROUP BY template_type ORDER BY template_type"
        )?;
        
        let type_iter = stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, i32>(1)?))
        })?;
        
        let mut types = Vec::new();
        for template_type in type_iter {
            types.push(template_type?);
        }
        
        Ok(types)
    }
    
    /// 插入或更新标签
    pub fn upsert_tag(&mut self, tag: &Tag) -> DuckResult<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO tags (id, name, color) VALUES (?, ?, ?)",
            [&tag.id, &tag.name, &tag.color],
        )?;
        Ok(())
    }
    
    /// 获取所有标签
    pub fn get_all_tags(&self) -> DuckResult<Vec<Tag>> {
        let mut stmt = self.conn.prepare("SELECT id, name, color FROM tags ORDER BY name")?;
        
        let tag_iter = stmt.query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })?;
        
        let mut tags = Vec::new();
        for tag in tag_iter {
            tags.push(tag?);
        }
        
        Ok(tags)
    }
    
    /// 搜索模板
    pub fn search_templates(&self, keyword: &str) -> DuckResult<Vec<Template>> {
        let search_pattern = format!("%{}%", keyword);
        let mut stmt = self.conn.prepare(
            r#"
            SELECT id, title, sections, disease, template_type, tags, created_at, updated_at, is_favorite 
            FROM templates 
            WHERE title LIKE ? OR sections LIKE ?
            ORDER BY updated_at DESC
            "#
        )?;
        
        let template_iter = stmt.query_map([&search_pattern, &search_pattern], |row| {
            let sections_json: String = row.get(2)?;
            let tags_json: String = row.get(5)?;
            
            let sections: Vec<TemplateSection> = serde_json::from_str(&sections_json)
                .map_err(|_| duckdb::Error::InvalidColumnIndex(2))?;
            let tags: Vec<String> = serde_json::from_str(&tags_json)
                .map_err(|_| duckdb::Error::InvalidColumnIndex(5))?;
            
            Ok(Template {
                id: row.get(0)?,
                title: row.get(1)?,
                sections,
                disease: row.get(3)?,
                template_type: row.get(4)?,
                tags,
                created_at: row.get::<_, i64>(6)?,
                updated_at: row.get::<_, i64>(7)?,
                is_favorite: row.get::<_, bool>(8)?,
            })
        })?;
        
        let mut templates = Vec::new();
        for template in template_iter {
            templates.push(template?);
        }
        
        Ok(templates)
    }
}