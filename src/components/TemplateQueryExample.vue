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

    <!-- 搜索框和操作按钮 -->
    <div class="search-section">
      <div class="search-and-actions">
        <div class="search-box">
          <input type="text" v-model="searchInput" placeholder="搜索模板... (支持拼音搜索)" class="search-input">
          <Icon icon="mdi:magnify" class="search-icon" :size="16" />
          <Icon v-if="store.searchQuery.isFetching" icon="mdi:loading" class="search-loading" :size="16" />
        </div>

        <!-- 导入导出按钮 -->
        <div class="import-export-actions">
          <button @click="importTemplates" :disabled="isImporting" class="action-btn import-btn" title="导入模板">
            <Icon :icon="isImporting ? 'mdi:loading' : 'mdi:file-import'" :size="16" /> 导入
          </button>

          <div class="export-dropdown">
            <button class="action-btn export-btn" :disabled="isExporting" title="导出模板">
              <Icon :icon="isExporting ? 'mdi:loading' : 'mdi:file-export'" :size="16" /> 导出
            </button>
            <div class="export-menu">
              <button @click="exportTemplates('all')" :disabled="isExporting">
                导出全部 ({{ store.currentTemplates.length }})
              </button>
              <button @click="exportTemplates('filtered')" :disabled="isExporting">
                导出筛选结果 ({{ store.filteredTemplates.length }})
              </button>
              <button @click="exportTemplates('selected')" :disabled="isExporting || !store.selectedTemplate">
                导出选中模板
              </button>
            </div>
          </div>
        </div>

        <!-- 隐藏的文件输入 -->
        <input ref="fileInputRef" type="file" accept=".json" @change="handleFileSelect" style="display: none;" />
      </div>

      <button @click="refreshData" class="refresh-btn">
        刷新数据
      </button>
      <button v-if="error && retryCount < maxRetries" @click="retry" class="retry-btn">
        重试 ({{ retryCount }}/{{ maxRetries }})
      </button>
    </div>

    <!-- 视图切换 -->
    <div class="view-switcher-section">
      <button @click="toggleViewSwitcher" class="section-toggle">
        视图切换 <Icon :icon="isViewSwitcherOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'" :size="16" />
      </button>
      <div v-if="isViewSwitcherOpen" class="view-switcher-panel">
        <div class="view-switcher">
          <button v-for="view in views" :key="view.value" @click="switchView(view.value)"
            :class="{ active: currentView === view.value }" class="view-btn">
            {{ view.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="categories-section">
      <button @click="toggleCategories" class="section-toggle">
        {{ currentViewLabel }}分类 <Icon :icon="isCategoriesOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'" :size="16" />
      </button>
      <div v-if="isCategoriesOpen" class="categories-panel">
        <div class="categories">
          <button @click="selectCategory('all')" :class="{ active: selectedCategory === 'all' }" class="category-btn">
            全部 ({{ filteredTemplates.length }})
          </button>
          <button v-for="category in currentCategories" :key="category.name" @click="selectCategory(category.name)"
            :class="{ active: selectedCategory === category.name }" class="category-btn">
            {{ category.name }}
            <span class="count">({{ category.templateCount || 0 }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选选项 -->
    <div class="filter-section">
      <button @click="toggleFilterPanel" class="section-toggle">
        筛选选项 <Icon :icon="isFilterPanelOpen ? 'mdi:chevron-down' : 'mdi:chevron-right'" :size="16" />
      </button>
      <div v-if="isFilterPanelOpen" class="filter-panel">
        <label class="filter-option">
          <input type="checkbox" v-model="filterOptions.isFavorite" />
          只显示收藏的模板
        </label>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="store.error" class="error-state">
      <div class="error-message">
        <Icon icon="mdi:alert" class="error-icon" :size="20" />
        <p>数据加载失败: {{ store.error.message }}</p>
        <button v-if="retryCount < maxRetries" @click="retry" class="retry-btn">
          重试 ({{ retryCount }}/{{ maxRetries }})
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="store.filteredTemplates.length === 0 && !store.isLoading" class="empty-state">
      <div class="empty-message">
        <Icon icon="mdi:file-document" class="empty-icon" :size="24" />
        <p v-if="store.searchKeyword">未找到匹配的模板</p>
        <p v-else>暂无模板数据</p>
        <button @click="store.setSearchKeyword('')" v-if="store.searchKeyword" class="clear-search-btn">
          清除搜索
        </button>
      </div>
    </div>

    <!-- 模板列表 -->
    <div v-else class="templates-section">
      <h3>模板列表 ({{ store.filteredTemplates.length }})</h3>
      <div class="templates-grid">
        <div v-for="template in store.filteredTemplates" :key="template.id" @click="store.selectTemplate(template.id)"
          :class="{
            active: store.selectedTemplate?.id === template.id,
            favorite: template.isFavorite
          }" class="template-card">
          <div class="template-header">
            <h4>{{ template.title }}</h4>
            <div class="template-actions">
              <button @click.stop="handleToggleFavorite(template.id)"
                :class="['favorite-btn', { active: template.isFavorite }]"
                :disabled="store.toggleFavoriteMutation.isPending" :title="template.isFavorite ? '取消收藏' : '添加收藏'">
                <Icon
                  v-if="store.toggleFavoriteMutation.isPending && store.toggleFavoriteMutation.variables === template.id"
                  icon="mdi:loading" :size="16" />
                <Icon v-else :icon="template.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" :size="16" />
              </button>
              <button @click.stop="handleDeleteTemplate(template.id)" class="delete-btn"
                :disabled="store.deleteTemplateMutation.isPending" title="删除模板">
                <Icon
                  v-if="store.deleteTemplateMutation.isPending && store.deleteTemplateMutation.variables === template.id"
                  icon="mdi:loading" :size="16" />
                <Icon v-else icon="mdi:delete" :size="16" />
              </button>
            </div>
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
    <div v-if="store.selectedTemplate" class="template-detail">
      <h3>模板详情</h3>
      <div class="detail-content">
        <h4>{{ store.selectedTemplate.title }}</h4>
        <div class="sections">
          <div v-for="section in store.selectedTemplate.sections" :key="section.id" class="section">
            <h5>{{ section.title }}</h5>
            <p>{{ section.content }}</p>
          </div>
        </div>
        <div class="actions">
          <button @click="store.deleteTemplate(store.selectedTemplate.id)" :disabled="deleteTemplateMutation.isPending"
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
import { computed, onMounted, watch, ref } from 'vue'
import { useTemplateStore } from '../stores/template'
import { useInitializeDatabaseMutation, useImportTemplatesMutation } from '../composables/useDatabase'
// import { DatabaseService } from '../services/database'
import type { CategoryView, Template } from '../types'
import Icon from './common/Icon.vue'

// 防抖搜索
const searchInput = ref('')
let searchTimeout: NodeJS.Timeout | null = null

const store = useTemplateStore()

// 数据库初始化
const initDatabaseMutation = useInitializeDatabaseMutation()

// 导入模板
const importTemplatesMutation = useImportTemplatesMutation()

// 错误重试状态
const retryCount = ref(0)
const maxRetries = 3

// 导入导出状态
const fileInputRef = ref<HTMLInputElement | null>(null)
const isExporting = ref(false)
const isImporting = ref(false)

// 面板折叠状态
const isViewSwitcherOpen = ref(true)
const isCategoriesOpen = ref(true)

// 防抖搜索逻辑
watch(searchInput, (newValue) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    store.setSearchKeyword(newValue)
  }, 300) // 300ms 防抖
})

// 错误处理
const handleError = async (error: any) => {
  console.error('操作失败:', error)
  if (retryCount.value < maxRetries) {
    retryCount.value++
    console.log(`正在重试... (${retryCount.value}/${maxRetries})`)
    await store.refreshData()
  }
}

// 重试操作
const retry = async () => {
  retryCount.value = 0
  await store.refreshData()
}

// 组件挂载时初始化数据库
onMounted(async () => {
  try {
    // 初始化搜索输入框
    searchInput.value = store.searchKeyword

    console.log('初始化数据库...')
    await initDatabaseMutation.mutateAsync()
    console.log('数据库初始化完成')
    retryCount.value = 0 // 重置重试计数
  } catch (error) {
    console.error('数据库初始化失败:', error)
    await handleError(error)
  }
})

// 解构store中的状态和方法
const {
  currentView,
  // selectedTemplate,
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
  // toggleFavoriteMutation,
  deleteTemplateMutation,
  switchView,
  selectCategory,
  // selectTemplate,
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

/**
 * 切换视图切换面板的显示状态
 */
const toggleViewSwitcher = () => {
  isViewSwitcherOpen.value = !isViewSwitcherOpen.value
}

/**
 * 切换分类面板的显示状态
 */
const toggleCategories = () => {
  isCategoriesOpen.value = !isCategoriesOpen.value
}

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

// 处理收藏切换
const handleToggleFavorite = async (templateId: string) => {
  try {
    await store.toggleFavorite(templateId)
  } catch (error) {
    console.error('切换收藏状态失败:', error)
    await handleError(error)
  }
}

// 处理删除模板
const handleDeleteTemplate = async (templateId: string) => {
  if (confirm('确定要删除这个模板吗？')) {
    try {
      await store.deleteTemplate(templateId)
    } catch (error) {
      console.error('删除模板失败:', error)
      await handleError(error)
    }
  }
}

/**
 * 导出模板功能
 */
const exportTemplates = async (exportType: 'all' | 'selected' | 'filtered') => {
  try {
    isExporting.value = true
    let templatesToExport: Template[] = []

    switch (exportType) {
      case 'all':
        templatesToExport = store.currentTemplates
        break
      case 'selected':
        if (store.selectedTemplate) {
          templatesToExport = [store.selectedTemplate]
        } else {
          alert('请先选择一个模板')
          return
        }
        break
      case 'filtered':
        templatesToExport = store.filteredTemplates
        break
    }

    if (templatesToExport.length === 0) {
      alert('没有可导出的模板')
      return
    }

    // 创建导出数据
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      exportType,
      templates: templatesToExport
    }

    // 创建下载链接
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `templates_${exportType}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`成功导出 ${templatesToExport.length} 个模板`)
  } catch (error) {
    console.error('导出模板失败:', error)
    alert('导出失败: ' + (error as Error).message)
  } finally {
    isExporting.value = false
  }
}

/**
 * 导入模板功能
 */
const importTemplates = () => {
  fileInputRef.value?.click()
}

/**
 * 处理文件选择
 */
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    isImporting.value = true

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      alert('请选择JSON格式的文件')
      return
    }

    // 读取文件内容
    const text = await file.text()
    const importData = JSON.parse(text)
    let templates: Template[] = []

    if (importData?.templates) {
      // 验证数据格式
      if (!Array.isArray(importData.templates)) {
        alert('文件格式不正确，缺少templates数组')
        return
      }
      templates = importData.templates as Template[]
    } else {
      // 验证数据格式
      if (!Array.isArray(importData)) {
        alert('文件格式不正确，缺少templates数组')
        return
      }
      templates = importData as Template[]
    }

    // 基本验证模板数据
    for (const template of templates) {
      if (!template.id || !template.title || !template.sections) {
        alert('模板数据格式不正确，缺少必要字段')
        return
      }
    }

    // 确认导入
    const confirmMessage = `确定要导入 ${templates.length} 个模板吗？\n导入类型: ${importData.exportType || '未知'}\n导出时间: ${importData.exportTime || '未知'}`
    if (!confirm(confirmMessage)) {
      return
    }

    // 执行导入
    await importTemplatesMutation.mutateAsync(templates)
    alert(`成功导入 ${templates.length} 个模板`)

  } catch (error) {
    console.error('导入模板失败:', error)
    if (error instanceof SyntaxError) {
      alert('文件格式错误，请确保是有效的JSON文件')
    } else {
      alert('导入失败: ' + (error as Error).message)
    }
  } finally {
    isImporting.value = false
    // 清空文件输入
    if (target) {
      target.value = ''
    }
  }
}
</script>

<style scoped>
.template-query-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--doc-bg);
  color: var(--text-main);
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.loading-indicator {
  color: var(--doc-primary);
  font-weight: 500;
}

.error-message {
  color: var(--danger);
  font-weight: 500;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

/* 搜索和操作区域样式 */
.search-and-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 8px 45px 8px 40px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 14px;
  background: var(--card-bg);
  color: var(--text-main);
  transition: all 0.2s ease;
  height: 32px;
}

.search-input:focus {
  outline: none;
  border-color: var(--border-emphasis);
  box-shadow: 0 0 0 2px rgba(46, 74, 184, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #6c757d;
  pointer-events: none;
}

.search-loading {
  position: absolute;
  right: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* 导入导出操作样式 */
.import-export-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover:not(:disabled) {
  background: var(--hover-bg);
  color: var(--doc-primary);
  border-color: var(--border-emphasis);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.import-btn:hover:not(:disabled) {
  color: var(--success);
  border-color: var(--success);
}

.export-btn:hover:not(:disabled) {
  color: var(--doc-secondary);
  border-color: var(--doc-secondary);
}

/* 导出下拉菜单样式 */
.export-dropdown {
  position: relative;
  display: inline-block;
}

.export-dropdown:hover .export-menu {
  display: block;
}

.export-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  margin-top: 2px;
}

.export-menu button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-menu button:hover:not(:disabled) {
  background-color: var(--hover-bg);
  color: var(--doc-primary);
}

.export-menu button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-menu button:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.export-menu button:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.refresh-btn {
  padding: 6px 12px;
  background: var(--doc-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  height: 32px;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: var(--doc-secondary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(46, 74, 184, 0.3);
}

/* 视图切换面板样式 */
.view-switcher-section {
  margin-bottom: 20px;
}

.section-toggle {
  padding: 6px 12px;
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  justify-content: space-between;
}

.section-toggle:hover {
  background: var(--hover-bg);
  border-color: var(--border-emphasis);
}

.view-switcher-panel {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--section-bg);
}

.view-switcher {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  height: 32px;
}

.view-btn:hover:not(.active) {
  background: var(--hover-bg);
  border-color: var(--border-emphasis);
}

.view-btn.active {
  background: var(--doc-primary);
  color: white;
  border-color: var(--doc-primary);
}

/* 分类面板样式 */
.categories-section {
  margin-bottom: 20px;
}

.categories-panel {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--section-bg);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-light);
  background: var(--card-bg);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  height: 32px;
}

.category-btn:hover:not(.active) {
  background: var(--hover-bg);
  border-color: var(--border-emphasis);
}

.category-btn.active {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.count {
  font-size: 0.8em;
  opacity: 0.8;
}

.filter-section {
  margin-bottom: 20px;
}

/* 筛选面板样式 */
.filter-section {
  margin-bottom: 20px;
}

.filter-panel {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: var(--section-bg);
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
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--card-bg);
}

.template-card:hover {
  border-color: var(--border-emphasis);
  box-shadow: 0 2px 8px rgba(46, 74, 184, 0.1);
  transform: translateY(-1px);
}

.template-card.active {
  border-color: var(--doc-primary);
  background: var(--active-bg);
}

.template-card.favorite {
  border-left: 4px solid var(--warning);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.template-header h4 {
  margin: 0;
  color: var(--doc-primary);
  font-size: 16px;
  font-weight: 600;
}

.template-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: var(--section-bg);
  color: var(--warning);
}

.favorite-btn.active {
  color: var(--warning);
}

.favorite-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.template-actions .delete-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.template-actions .delete-btn:hover {
  background: var(--hover-bg);
  color: var(--danger);
  transform: scale(1.05);
}

.template-actions .delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.template-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--text-secondary);
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: var(--section-bg);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.tag:hover {
  background: var(--hover-bg);
  color: var(--doc-primary);
  border-color: var(--border-emphasis);
}

.disease,
.type {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.disease {
  background: var(--section-bg);
  color: var(--doc-primary);
  border: 1px solid var(--border-light);
}

.type {
  background: var(--hover-bg);
  color: var(--doc-secondary);
  border: 1px solid var(--border-light);
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

.actions .delete-btn {
  padding: 8px 16px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.actions .delete-btn:hover {
  background: var(--danger);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  filter: brightness(0.9);
}

.actions .delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.query-status {
  margin-top: 30px;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--section-bg);
  border-radius: 6px;
  border: 1px solid var(--border-light);
  font-size: 13px;
}

.status-item span:first-child {
  color: var(--text-secondary);
  font-weight: 500;
}

.status-loading {
  color: var(--doc-primary);
  font-weight: 500;
}

.status-error {
  color: var(--danger);
  font-weight: 500;
}

.status-success {
  color: var(--success);
  font-weight: 500;
}

.status-idle {
  color: var(--text-secondary);
  font-weight: 500;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  margin: 1rem 0;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--danger);
}

.error-icon {
  font-size: 2rem;
  color: var(--danger);
}

.error-message p {
  color: var(--danger);
  margin: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 8px;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
  color: var(--text-secondary);
}

.empty-message p {
  margin: 0;
  font-size: 1.1rem;
}

.clear-search-btn {
  background: var(--doc-primary);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: var(--doc-secondary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(46, 74, 184, 0.3);
}

.retry-btn {
  background: var(--danger);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}
</style>