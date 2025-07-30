<template>
  <div class="template-list-section">
    <!-- 列表头部 -->
    <div class="list-header">
      <div class="search-container">
        <i class="fas fa-search"></i>
        <input type="text" class="search-input" placeholder="搜索模板..." v-model="searchKeyword" @input="handleSearch" />
      </div>
      <div class="header-actions">
        <BaseButton icon="fas fa-plus" @click="handleAddTemplate">
        </BaseButton>
        <BaseButton variant="secondary" icon="fas fa-filter" @click="toggleFilterPanel">
          筛选
        </BaseButton>
      </div>

      <!-- 筛选面板 -->
      <FilterPanel :is-open="isFilterPanelOpen" :filter-options="filterOptions" :diseases="diseases"
        :template-types="templateTypes" :tags="tags" @set-filter="setFilter" @toggle-tag-filter="toggleTagFilter"
        @toggle-disease-filter="toggleDiseaseFilter" @toggle-template-type-filter="toggleTemplateTypeFilter"
        @clear-filters="clearFilters" @apply-filters="applyFilters" />

    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <BaseCard v-for="template in filteredTemplates" :key="template.id" :active="selectedTemplate?.id === template.id"
        hoverable clickable @click="handleTemplateSelect(template.id)">
        <template #header>
          <div class="card-header">
            <div class="template-title">{{ template.title }}</div>
            <button class="favorite-btn" :class="{ active: template.isFavorite }"
              @click.stop="handleToggleFavorite(template.id)">
              <i class="fas fa-star"></i>
            </button>
          </div>
        </template>
        <div class="card-content">
          描述：默认模版前十个字
        </div>

        <!-- <div class="card-content">
          <TagList :tags="getTemplateTags(template)" :max-display="4" variant="type" />
        </div> -->

        <template #footer>
          <div class="card-footer">
            <span class="update-time">{{ formatTime(template.updatedAt) }}</span>
            <span class="section-count">{{ template.sections.length }} 个部分</span>
          </div>
        </template>
      </BaseCard>

      <!-- 空状态 -->
      <div v-if="filteredTemplates.length === 0" class="empty-state">
        <i class="fas fa-file-medical"></i>
        <div class="empty-title">暂无模板</div>
        <div class="empty-desc">当前分类下没有找到匹配的模板</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTemplateStore } from '../stores/template'
import type { TemplateID } from '../types'
import BaseButton from './common/BaseButton.vue'
import BaseCard from './common/BaseCard.vue'
import FilterPanel from './FilterPanel.vue'

const templateStore = useTemplateStore()

// 响应式数据
const searchKeyword = ref('')

// 计算属性
const filteredTemplates = computed(() => templateStore.filteredTemplates)
const selectedTemplate = computed(() => templateStore.selectedTemplate)
const isFilterPanelOpen = computed(() => templateStore.isFilterPanelOpen)
const filterOptions = computed(() => templateStore.filterOptions)
const diseases = computed(() => templateStore.diseases)
const templateTypes = computed(() => templateStore.templateTypes)
const tags = computed(() => templateStore.tags)

/**
 * 处理搜索
 */
const handleSearch = () => {
  templateStore.setSearchKeyword(searchKeyword.value)
}

/**
 * 切换筛选面板
 */
const toggleFilterPanel = () => {
  templateStore.toggleFilterPanel()
}


/**
 * 设置筛选条件
 */
const setFilter = (key: string, value: any) => {
  templateStore.setFilterOptions({ [key]: value })
}

/**
 * 清除筛选条件
 */
const clearFilters = () => {
  templateStore.setFilterOptions({
    isFavorite: undefined,
    disease: [],
    templateType: [],
    tags: [],
    searchKeyword: ''
  })
}

/**
 * 切换标签筛选
 */
const toggleTagFilter = (tagId: string) => {
  const currentTags = filterOptions.value.tags || []
  const newTags = currentTags.includes(tagId)
    ? currentTags.filter(id => id !== tagId)
    : [...currentTags, tagId]
  templateStore.setFilterOptions({ tags: newTags })
}

/**
 * 切换病种筛选
 */
const toggleDiseaseFilter = (diseaseId: string) => {
  const currentDiseases = filterOptions.value.disease || []
  const newDiseases = currentDiseases.includes(diseaseId)
    ? currentDiseases.filter(id => id !== diseaseId)
    : [...currentDiseases, diseaseId]
  templateStore.setFilterOptions({ disease: newDiseases })
}

/**
 * 切换模板类型筛选
 */
const toggleTemplateTypeFilter = (typeId: string) => {
  const currentTypes = filterOptions.value.templateType || []
  const newTypes = currentTypes.includes(typeId)
    ? currentTypes.filter(id => id !== typeId)
    : [...currentTypes, typeId]
  templateStore.setFilterOptions({ templateType: newTypes })
}

/**
 * 应用筛选
 */
const applyFilters = () => {
  templateStore.closeFilterPanel()
}

/**
 * 处理新增模板
 */
const handleAddTemplate = async () => {
  try {
    templateStore.isEditMode = true
    templateStore.selectedTemplate = null
    // console.log('新模板创建成功:', newTemplate)
  } catch (error) {
    console.error('创建模板失败:', error)
    // 这里可以显示错误提示
  }
}



/**
 * 处理模板选择
 */
const handleTemplateSelect = (templateId: TemplateID) => {
  templateStore.selectTemplate(templateId)
}

/**
 * 切换收藏状态
 */
const handleToggleFavorite = (templateId: TemplateID) => {
  templateStore.toggleFavorite(templateId)
}


/**
 * 格式化时间
 */
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.template-list-section {
  width: var(--middle-list-width);
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  position: relative;
}

.list-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 36px;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: var(--section-bg);
  border-radius: 6px;
  padding: 4px 10px;
  flex: 1;
  max-width: 200px;
  height: 28px;
  box-sizing: border-box;
}

.search-container i {
  color: var(--text-secondary);
  margin-right: 6px;
  font-size: 12px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  color: var(--text-main);
  font-size: 13px;
  height: 28px;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.header-actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 按钮样式已迁移到BaseButton组件 */

/* 筛选面板样式已迁移到FilterPanel组件 */

.template-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* 滚动条默认隐藏，滚动时显示 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s ease;
}

/* 鼠标悬停或滚动时显示滚动条 */
.template-list:hover,
.template-list:active {
  scrollbar-color: var(--border-light) var(--section-bg);
}


.template-list>.base-card {
  flex-shrink: 0;
}

/* 模板卡片样式已迁移到BaseCard组件 */

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* margin-bottom: 12px; */
}

.template-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--doc-primary);
  flex: 1;
  margin-right: 8px;
}

.favorite-btn {
  background: none;
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  padding: 4px;
}

.favorite-btn:hover {
  color: #ffc107;
}

.favorite-btn.active {
  color: #ffc107;
}

/* 标签样式已迁移到TagList组件 */

.card-content {
  margin-bottom: 1px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 13px;
}

.empty-state {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: var(--border-light);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 滚动条样式 */
.template-list::-webkit-scrollbar {
  width: 6px;
}

.template-list::-webkit-scrollbar-track {
  background: var(--section-bg);
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-emphasis);
}
</style>