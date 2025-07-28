<template>
  <div class="template-query-example">
    <div class="header">
      <h2>TanStack Query 模板管理示例</h2>
      <div class="loading-indicator" v-if="isLoading">
        <span>加载中...</span>
      </div>
      <div class="error-message" v-if="error">
        <span>错误: {{ error.message }}</span>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <input v-model="searchKeyword" type="text" placeholder="搜索模板..." class="search-input" />
      <button @click="refreshData" class="refresh-btn">
        刷新数据
      </button>
    </div>

    <!-- 视图切换 -->
    <div class="view-switcher">
      <button v-for="view in views" :key="view.value" @click="switchView(view.value)"
        :class="{ active: currentView === view.value }" class="view-btn">
        {{ view.label }}
      </button>
    </div>

    <!-- 分类列表 -->
    <div class="categories-section">
      <h3>{{ currentViewLabel }}分类</h3>
      <div class="categories">
        <button @click="selectCategory('all')" :class="{ active: selectedCategory === 'all' }" class="category-btn">
          全部 ({{ filteredTemplates.length }})
        </button>
        <button v-for="category in currentCategories" :key="category" @click="selectCategory(category)"
          :class="{ active: selectedCategory === category }" class="category-btn">
          {{ category }}
          <span class="count">({{ category.template_count || 0 }})</span>
        </button>
      </div>
    </div>

    <!-- 筛选选项 -->
    <div class="filter-section">
      <button @click="toggleFilterPanel" class="filter-toggle">
        筛选选项 {{ isFilterPanelOpen ? '▼' : '▶' }}
      </button>
      <div v-if="isFilterPanelOpen" class="filter-panel">
        <label class="filter-option">
          <input type="checkbox" v-model="filterOptions.isFavorite" />
          只显示收藏的模板
        </label>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="templates-section">
      <h3>模板列表 ({{ filteredTemplates.length }})</h3>
      <div class="templates-grid">
        <div v-for="template in filteredTemplates" :key="template.id" @click="selectTemplate(template.id)" :class="{
          active: selectedTemplate?.id === template.id,
          favorite: template.isFavorite
        }" class="template-card">
          <div class="template-header">
            <h4>{{ template.title }}</h4>
            <button @click.stop="toggleFavorite(template.id)" :disabled="toggleFavoriteMutation.isPending"
              class="favorite-btn">
              {{ template.isFavorite ? '★' : '☆' }}
            </button>
          </div>
          <div class="template-meta">
            <span class="disease">{{ template.disease }}</span>
            <span class="type">{{ template.templateType }}</span>
          </div>
          <div class="template-tags">
            <span v-for="tag in template.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中模板详情 -->
    <div v-if="selectedTemplate" class="template-detail">
      <h3>模板详情</h3>
      <div class="detail-content">
        <h4>{{ selectedTemplate.title }}</h4>
        <div class="sections">
          <div v-for="section in selectedTemplate.sections" :key="section.id" class="section">
            <h5>{{ section.title }}</h5>
            <p>{{ section.content }}</p>
          </div>
        </div>
        <div class="actions">
          <button @click="deleteTemplate(selectedTemplate.id)" :disabled="deleteTemplateMutation.isPending"
            class="delete-btn">
            删除模板
          </button>
        </div>
      </div>
    </div>

    <!-- 查询状态信息 -->
    <div class="query-status">
      <h3>查询状态</h3>
      <div class="status-grid">
        <div class="status-item">
          <span>模板查询:</span>
          <span :class="getStatusClass(templatesQuery)">
            {{ getStatusText(templatesQuery) }}
          </span>
        </div>
        <div class="status-item">
          <span>疾病查询:</span>
          <span :class="getStatusClass(diseasesQuery)">
            {{ getStatusText(diseasesQuery) }}
          </span>
        </div>
        <div class="status-item">
          <span>类型查询:</span>
          <span :class="getStatusClass(templateTypesQuery)">
            {{ getStatusText(templateTypesQuery) }}
          </span>
        </div>
        <div class="status-item">
          <span>标签查询:</span>
          <span :class="getStatusClass(tagsQuery)">
            {{ getStatusText(tagsQuery) }}
          </span>
        </div>
        <div class="status-item" v-if="searchKeyword">
          <span>搜索查询:</span>
          <span :class="getStatusClass(searchQuery)">
            {{ getStatusText(searchQuery) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTemplateQueryStore } from '../stores/templateQuery'
import { useInitializeDatabaseMutation } from '../composables/useDatabase'
import type { CategoryView } from '../types'

const store = useTemplateQueryStore()

// 数据库初始化
const initDatabaseMutation = useInitializeDatabaseMutation()

// 组件挂载时初始化数据库
onMounted(async () => {
  try {
    console.log('初始化数据库...')
    await initDatabaseMutation.mutateAsync()
    console.log('数据库初始化完成')
  } catch (error) {
    console.error('数据库初始化失败:', error)
  }
})

// 解构store中的状态和方法
const {
  currentView,
  selectedTemplate,
  selectedCategory,
  filterOptions,
  isFilterPanelOpen,
  searchKeyword,
  isLoading,
  error,
  filteredTemplates,
  currentCategories,
  templatesQuery,
  diseasesQuery,
  templateTypesQuery,
  tagsQuery,
  searchQuery,
  toggleFavoriteMutation,
  deleteTemplateMutation,
  switchView,
  selectCategory,
  selectTemplate,
  toggleFavorite,
  deleteTemplate,
  toggleFilterPanel,
  refreshData
} = store

// 视图选项
const views = [
  { value: 'disease' as CategoryView, label: '疾病' },
  { value: 'type' as CategoryView, label: '类型' },
  { value: 'tag' as CategoryView, label: '标签' }
]

// 当前视图标签
const currentViewLabel = computed(() => {
  const view = views.find(v => v.value === currentView)
  return view?.label || ''
})

// 获取查询状态类名
const getStatusClass = (query: any) => {
  if (query.isLoading?.value) return 'status-loading'
  if (query.isError?.value) return 'status-error'
  if (query.isSuccess?.value) return 'status-success'
  return 'status-idle'
}

// 获取查询状态文本
const getStatusText = (query: any) => {
  if (query.isLoading?.value) return '加载中'
  if (query.isError?.value) return '错误'
  if (query.isSuccess?.value) return '成功'
  return '空闲'
}
</script>

<style scoped>
.template-query-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.loading-indicator {
  color: #007bff;
  font-weight: bold;
}

.error-message {
  color: #dc3545;
  font-weight: bold;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.refresh-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #0056b3;
}

.view-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.view-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.categories-section {
  margin-bottom: 20px;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.category-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.category-btn.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.count {
  font-size: 0.8em;
  opacity: 0.8;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-toggle {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.filter-panel {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.templates-section {
  margin-bottom: 30px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.template-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.template-card.active {
  border-color: #007bff;
  background: #f0f8ff;
}

.template-card.favorite {
  border-left: 4px solid #ffc107;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.template-header h4 {
  margin: 0;
  font-size: 1.1em;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  color: #ffc107;
}

.favorite-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.template-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #666;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8em;
  color: #495057;
}

.template-detail {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  background: #f8f9fa;
}

.detail-content h4 {
  margin-top: 0;
  color: #007bff;
}

.sections {
  margin: 15px 0;
}

.section {
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.section h5 {
  margin: 0 0 8px 0;
  color: #495057;
}

.section p {
  margin: 0;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 10px;
}

.delete-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c82333;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.query-status {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.status-loading {
  color: #007bff;
  font-weight: bold;
}

.status-error {
  color: #dc3545;
  font-weight: bold;
}

.status-success {
  color: #28a745;
  font-weight: bold;
}

.status-idle {
  color: #6c757d;
}
</style>