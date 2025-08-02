<template>
  <div class="template-list-section">
    <!-- 列表头部 -->
    <div class="list-header">
      <div class="search-container">
        <Icon icon="mdi:magnify" />
        <input type="text" class="search-input" placeholder="搜索模板..." v-model="searchKeyword" @input="handleSearch" />
      </div>
      <div class="header-actions">
        <BaseButton icon="mdi:plus" @click="handleAddTemplate">
        </BaseButton>
        <BaseButton variant="secondary" icon="mdi:filter" @click="toggleFilterPanel">
        </BaseButton>
      </div>

      <!-- 筛选面板 -->
      <FilterPanel :is-open="isFilterPanelOpen" />

    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <TemplateCard v-for="template in filteredTemplates" :key="template.id" :template="template"
        :is-active="selectedTemplate?.id === template.id" />

      <!-- 空状态 -->
      <div v-if="filteredTemplates.length === 0" class="empty-state">
        <Icon icon="mdi:file-document-plus" />
        <div class="empty-title">暂无模板</div>
        <div class="empty-desc">当前分类下没有找到匹配的模板</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useTemplateStore } from '../stores/template'

import BaseButton from './common/BaseButton.vue'
import FilterPanel from './FilterPanel.vue'
import TemplateCard from './TemplateCard.vue'
import Icon from './common/Icon.vue'


const templateStore = useTemplateStore()
const { filteredTemplates, selectedTemplate, isFilterPanelOpen } = storeToRefs(templateStore)

// 响应式数据
const searchKeyword = ref('')

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
 * 处理新增模板
 */
const handleAddTemplate = async () => {
  try {
    templateStore.setEditMode(true)
    templateStore.selectedTemplate = null
    // console.log('新模板创建成功:', newTemplate)
  } catch (error) {
    console.error('创建模板失败:', error)
    // 这里可以显示错误提示
  }
}


</script>

<style scoped>
.template-list-section {
  width: fit-content;
  max-width: var(--middle-list-width);
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


.template-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0px 4px 4px;
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


/* 模板卡片样式已迁移到TemplateCard组件 */

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