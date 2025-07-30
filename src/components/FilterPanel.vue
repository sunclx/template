<template>
  <div class="filter-panel" v-if="isOpen" @click.stop>
    <!-- 筛选操作按钮 -->
    <div class="filter-actions">
      <BaseButton variant="secondary" size="small" @click="clearFilters">
        清除筛选
      </BaseButton>
      <BaseButton size="small" @click="applyFilters">
        应用筛选
      </BaseButton>
    </div>

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
        <div class="filter-option" :class="{ active: !filterOptions.disease || filterOptions.disease.length === 0 }"
          @click="setFilter('disease', [])">
          全部病种
        </div>
        <div v-for="disease in diseases" :key="disease.name" class="filter-option"
          :class="{ active: filterOptions.disease && filterOptions.disease.includes(disease.name) }" 
          @click="toggleDiseaseFilter(disease.name)">
          {{ disease.name }}
        </div>
      </div>
    </div>

    <!-- 模板类型筛选 -->
    <div class="filter-group">
      <div class="filter-title">模板类型</div>
      <div class="filter-options">
        <div class="filter-option" :class="{ active: !filterOptions.templateType || filterOptions.templateType.length === 0 }"
          @click="setFilter('templateType', [])">
          全部类型
        </div>
        <div v-for="type in templateTypes" :key="type.name" class="filter-option"
          :class="{ active: filterOptions.templateType && filterOptions.templateType.includes(type.name) }"
          @click="toggleTemplateTypeFilter(type.name)">
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

  </div>
</template>

<script setup lang="ts">
import BaseButton from './common/BaseButton.vue'

// 定义props
interface Props {
  isOpen: boolean
  filterOptions: any
  diseases: any[]
  templateTypes: any[]
  tags: any[]
}

const props = defineProps<Props>()

// 定义emits
interface Emits {
  setFilter: [key: string, value: any]
  toggleTagFilter: [tagId: string]
  toggleDiseaseFilter: [diseaseId: string]
  toggleTemplateTypeFilter: [typeId: string]
  clearFilters: []
  applyFilters: []
}

const emit = defineEmits<Emits>()

/**
 * 设置筛选条件
 */
const setFilter = (key: string, value: any) => {
  emit('setFilter', key, value)
}

/**
 * 切换标签筛选
 */
const toggleTagFilter = (tagId: string) => {
  emit('toggleTagFilter', tagId)
}

/**
 * 切换病种筛选
 */
const toggleDiseaseFilter = (diseaseId: string) => {
  emit('toggleDiseaseFilter', diseaseId)
}

/**
 * 切换模板类型筛选
 */
const toggleTemplateTypeFilter = (typeId: string) => {
  emit('toggleTemplateTypeFilter', typeId)
}

/**
 * 清除筛选条件
 */
const clearFilters = () => {
  emit('clearFilters')
}

/**
 * 应用筛选
 */
const applyFilters = () => {
  emit('applyFilters')
}
</script>

<style scoped>
.filter-panel {
  position: absolute;
  top: 0;
  right: -280px;
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 12px;
  z-index: 1000;
  margin-top: 4px;
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
  margin-bottom: 12px;
}

.filter-group:last-of-type {
  margin-bottom: 8px;
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
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 16px;
}

/* 滚动条样式 */
.filter-panel::-webkit-scrollbar {
  width: 6px;
}

.filter-panel::-webkit-scrollbar-track {
  background: var(--section-bg);
  border-radius: 3px;
}

.filter-panel::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

.filter-panel::-webkit-scrollbar-thumb:hover {
  background: var(--border-emphasis);
}
</style>