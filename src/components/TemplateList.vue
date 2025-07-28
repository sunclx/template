<template>
  <div class="template-list-section">
    <!-- 列表头部 -->
    <div class="list-header">
      <div class="search-container">
        <i class="fas fa-search"></i>
        <input type="text" class="search-input" placeholder="搜索模板..." v-model="searchKeyword" @input="handleSearch" />
      </div>
      <div class="header-actions">
        <button class="add-template-btn" @click="handleAddTemplate">
          <i class="fas fa-plus"></i>
          <span>新增</span>
        </button>
        <button class="filter-btn" @click="toggleFilterPanel">
          <i class="fas fa-filter"></i>
          <span>筛选</span>
        </button>
      </div>

      <!-- 筛选面板 -->
      <div class="filter-panel" v-if="isFilterPanelOpen" @click.stop>
        <!-- 收藏状态筛选 -->
        <div class="filter-group">
          <div class="filter-title">收藏状态</div>
          <div class="filter-options">
            <div class="filter-option" :class="{ active: filterOptions.isFavorite === undefined }"
              @click="setFilter('isFavorite', undefined)">
              全部
            </div>
            <div class="filter-option" :class="{ active: filterOptions.isFavorite === true }"
              @click="setFilter('isFavorite', true)">
              已收藏
            </div>
            <div class="filter-option" :class="{ active: filterOptions.isFavorite === false }"
              @click="setFilter('isFavorite', false)">
              未收藏
            </div>
          </div>
        </div>

        <!-- 病种分类筛选 -->
        <div class="filter-group">
          <div class="filter-title">病种分类</div>
          <div class="filter-options">
            <div class="filter-option" :class="{ active: filterOptions.disease === undefined }"
              @click="setFilter('disease', undefined)">
              全部病种
            </div>
            <div v-for="disease in diseases" :key="disease.name" class="filter-option"
              :class="{ active: filterOptions.disease === disease.name }" @click="setFilter('disease', disease.name)">
              {{ disease.name }}
            </div>
          </div>
        </div>

        <!-- 模板类型筛选 -->
        <div class="filter-group">
          <div class="filter-title">模板类型</div>
          <div class="filter-options">
            <div class="filter-option" :class="{ active: filterOptions.templateType === undefined }"
              @click="setFilter('templateType', undefined)">
              全部类型
            </div>
            <div v-for="type in templateTypes" :key="type.name" class="filter-option"
              :class="{ active: filterOptions.templateType === type.name }"
              @click="setFilter('templateType', type.name)">
              {{ type.name }}
            </div>
          </div>
        </div>

        <!-- 标签筛选 -->
        <div class="filter-group">
          <div class="filter-title">标签筛选</div>
          <div class="filter-options">
            <div class="filter-option" :class="{ active: !filterOptions.tags || filterOptions.tags.length === 0 }"
              @click="setFilter('tags', [])">
              全部标签
            </div>
            <div v-for="tag in tags.filter(t => t.name !== 'all')" :key="tag.name" class="filter-option tag-option"
              :class="{ active: filterOptions.tags && filterOptions.tags.includes(tag.name) }"
              @click="toggleTagFilter(tag.name)">
              <i class="fas fa-tag" :style="{ color: tag.color }"></i>
              {{ tag.name }}
            </div>
          </div>
        </div>

        <!-- 时间范围筛选 -->
        <div class="filter-group">
          <div class="filter-title">更新时间</div>
          <div class="filter-options">
            <div class="filter-option" :class="{ active: filterOptions.timeRange === undefined }"
              @click="setFilter('timeRange', undefined)">
              全部时间
            </div>
            <div class="filter-option" :class="{ active: filterOptions.timeRange === 'today' }"
              @click="setFilter('timeRange', 'today')">
              今天
            </div>
            <div class="filter-option" :class="{ active: filterOptions.timeRange === 'week' }"
              @click="setFilter('timeRange', 'week')">
              本周
            </div>
            <div class="filter-option" :class="{ active: filterOptions.timeRange === 'month' }"
              @click="setFilter('timeRange', 'month')">
              本月
            </div>
          </div>
        </div>

        <!-- 筛选操作按钮 -->
        <div class="filter-actions">
          <button class="clear-btn" @click="clearFilters">清除筛选</button>
          <button class="apply-btn" @click="applyFilters">应用筛选</button>
        </div>
      </div>

    </div>

    <!-- 模板列表 -->
    <div class="template-list" @click="handleOutsideClick">
      <div v-for="template in filteredTemplates" :key="template.id" class="template-card"
        :class="{ active: selectedTemplate?.id === template.id }" @click="handleTemplateSelect(template.id)">
        <div class="card-header">
          <div class="template-title">{{ template.title }}</div>
          <button class="favorite-btn" :class="{ active: template.isFavorite }"
            @click.stop="handleToggleFavorite(template.id)">
            <i class="fas fa-star"></i>
          </button>
        </div>

        <div class="card-tags">
          <span class="tag type">{{ getTemplateTypeName(template.templateType) }}</span>
          <span class="tag category">{{ getDiseaseName(template.disease) }}</span>
          <span v-for="tagId in template.tags.slice(0, 2)" :key="tagId" class="tag">
            {{ getTagName(tagId) }}
          </span>
          <span v-if="template.tags.length > 2" class="tag more">+{{ template.tags.length - 2 }}</span>
        </div>

        <div class="card-footer">
          <span class="update-time">{{ formatTime(template.updatedAt) }}</span>
          <span class="section-count">{{ template.sections.length }} 个部分</span>
        </div>
      </div>

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
 * 处理点击外部区域关闭筛选面板
 */
const handleOutsideClick = () => {
  if (isFilterPanelOpen.value) {
    templateStore.closeFilterPanel()
  }
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
  templateStore.setFilterOptions({})
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
    // 使用store的createTemplate方法创建新模板
    const newTemplate = await templateStore.createTemplate({
      title: '新建模板'
    })

    console.log('新模板创建成功:', newTemplate)
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
 * 获取病种名称
 */
const getDiseaseName = (diseaseId: string) => {
  const disease = diseases.value.find(d => d.name === diseaseId)
  return disease?.name || '未知病种'
}

/**
 * 获取模板类型名称
 */
const getTemplateTypeName = (typeId: string) => {
  const type = templateTypes.value.find(t => t.name === typeId)
  return type?.name || '未知类型'
}

/**
 * 获取标签名称
 */
const getTagName = (tagName: string) => {
  const tag = tags.value.find(t => t.name === tagName)
  return tag?.name || '未知标签'
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
  padding: 10px 20px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  height: 40px;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: var(--section-bg);
  border-radius: 8px;
  padding: 6px 15px;
  flex: 1;
  max-width: 240px;
  height: 32px;
  box-sizing: border-box;
}

.search-container i {
  color: var(--text-secondary);
  margin-right: 10px;
  font-size: 14px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  color: var(--text-main);
  font-size: 14px;
  height: 32px;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.header-actions {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-template-btn {
  background-color: var(--doc-primary);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  height: 32px;
  box-sizing: border-box;
  font-weight: 500;
}

.add-template-btn:hover {
  background-color: var(--doc-secondary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(46, 74, 184, 0.3);
}

.add-template-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(46, 74, 184, 0.3);
}

.filter-btn {
  background-color: var(--section-bg);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  height: 32px;
  box-sizing: border-box;
}

.filter-btn:hover {
  background-color: var(--hover-bg);
  color: var(--doc-primary);
}

.filter-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 500px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1000;
  margin-top: 8px;
  animation: fadeInUp 0.2s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-of-type {
  margin-bottom: 16px;
}

.filter-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-secondary);
  font-size: 14px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-option {
  background-color: var(--section-bg);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filter-option:hover,
.filter-option.active {
  background-color: var(--doc-primary);
  color: white;
}

.filter-option.tag-option {
  margin-bottom: 8px;
}

.filter-option.tag-option i {
  font-size: 12px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
  margin-top: 16px;
}

.clear-btn,
.apply-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.clear-btn {
  background-color: var(--section-bg);
  color: var(--text-secondary);
}

.clear-btn:hover {
  background-color: var(--hover-bg);
}

.apply-btn {
  background-color: var(--doc-primary);
  color: white;
}

.apply-btn:hover {
  background-color: #1c3aa9;
}

.template-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px 20px;
}

.template-card {
  background-color: white;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: var(--border-emphasis);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.template-card.active {
  border-color: var(--doc-primary);
  background-color: var(--section-bg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.template-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--doc-primary);
  flex: 1;
  margin-right: 10px;
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

.card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.tag {
  background-color: var(--section-bg);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-secondary);
}

.tag.type {
  background-color: #e3f2fd;
  color: #1565c0;
}

.tag.category {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.tag.more {
  background-color: var(--border-light);
  color: var(--text-secondary);
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
.template-list::-webkit-scrollbar,
.filter-panel::-webkit-scrollbar {
  width: 6px;
}

.template-list::-webkit-scrollbar-track,
.filter-panel::-webkit-scrollbar-track {
  background: var(--section-bg);
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb,
.filter-panel::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb:hover,
.filter-panel::-webkit-scrollbar-thumb:hover {
  background: var(--border-emphasis);
}
</style>