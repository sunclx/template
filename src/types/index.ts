// 基础类型
export type Timestamp = number; // 时间戳
export type TemplateID = string; // 模板ID
export type TemplateType = string; // 模板类型
export type TagID = string; // 标签ID
export type Disease = string; // 病种ID

// 标签类型
export interface Tag {
  id: TagID;
  name: string;
  color?: string; // 可选的颜色标识
  template_count?: number; // 模板数量
}

// 模板内容部分
export interface TemplateSection {
  id?: string; // 可选的ID字段
  title: string;
  content: string;
}

// 病历模板
export interface Template {
  id: TemplateID;
  title: string;
  sections: TemplateSection[];
  disease: Disease; // 关联的病种ID
  templateType: TemplateType; // 模板类型
  tags: TagID[]; // 关联的标签ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isFavorite: boolean;
}

// 病种类型
export interface DiseaseInfo {
  name: Disease;
  templateCount: number;
}

// 模板类型定义
export interface TemplateTypeInfo {
  name: string;
  templateCount: number;
}

// 筛选条件
export interface FilterOptions {
  disease?: Disease;
  templateType?: TemplateType;
  tags?: TagID[];
  isFavorite?: boolean;
  searchKeyword?: string;
}

// 分类视图类型
export type CategoryView = 'disease' | 'type' | 'tag';

// 应用状态
export interface AppState {
  currentView: CategoryView;
  selectedTemplate: Template | null;
  filterOptions: FilterOptions;
  isFilterPanelOpen: boolean;
}