<template>
  <div class="sidebar">
    <!-- 固定在顶部的选择器 -->
    <div class="sidebar-header">
      <div class="select-group">
        <select class="category-select" :value="currentView"
          @change="handleViewChange(($event.target as HTMLSelectElement)?.value || 'disease')">
          <option value="disease">病种分类</option>
          <option value="type">模板种类</option>
          <option value="tag">标签分类</option>
        </select>
      </div>
    </div>

    <!-- 可滚动的内容区域 -->
    <div class="category-content" ref="categoryContentRef">
      <!-- 按病种分类 -->
      <div class="category-view" :class="{ active: currentView === 'disease' }" v-if="currentView === 'disease'">
        <div class="category-items">
          <CategoryItem label="全部" :count="templates.length" :active="selectedCategory === 'all'" value="all"
            @click="handleCategorySelect" />
          <CategoryItem v-for="disease in diseases" :key="disease.name" :label="disease.name"
            :count="disease.templateCount" :active="selectedCategory === disease.name" :value="disease.name"
            @click="handleCategorySelect" />
        </div>
      </div>

      <!-- 按模板种类 -->
      <div class="category-view" :class="{ active: currentView === 'type' }" v-if="currentView === 'type'">
        <div class="category-items">
          <CategoryItem label="全部" :count="templates.length" :active="selectedCategory === 'all'" value="all"
            @click="handleCategorySelect" />
          <CategoryItem v-for="type in templateTypes" :key="type.name" :label="type.name" :count="type.templateCount"
            :active="selectedCategory === type.name" :value="type.name" @click="handleCategorySelect" />
        </div>
      </div>

      <!-- 按标签分类 -->
      <div class="category-view" :class="{ active: currentView === 'tag' }" v-if="currentView === 'tag'">
        <div class="category-items">
          <CategoryItem label="全部" :count="templates.length" :active="selectedCategory === 'all'" value="all"
            @click="handleCategorySelect" />
          <CategoryItem v-for="tag in tags" :key="tag.name" :label="tag.name" :count="tag.template_count"
            :active="selectedCategory === tag.name" :value="tag.name" icon="mdi:tag"
            :icon-color="tag.color || randomColor()" @click="handleCategorySelect" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTemplateStore } from '../stores/template'
import type { CategoryView } from '../types'
import CategoryItem from './common/CategoryItem.vue'
import { storeToRefs } from 'pinia'
import { randomColor } from '@/utils/color'

const templateStore = useTemplateStore()
const { currentView, selectedCategory,
  templates,
  diseases,
  tags,
  templateTypes } = storeToRefs(templateStore)

// 模板引用
const categoryContentRef = ref<HTMLElement>()

/**
 * 处理视图切换
 */
const handleViewChange = (view: string | CategoryView) => {
  templateStore.switchView(view as CategoryView)
}

/**
 * 处理分类选择
 */
const handleCategorySelect = (categoryId: string) => {
  templateStore.selectCategory(categoryId)
}

</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background-color: white;
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 固定在顶部的选择器区域 */
.sidebar-header {
  padding: 2px;
  border-bottom: 1px solid var(--border-light);
  background-color: white;
  z-index: 10;
}

.select-group {
  display: flex;
  flex-direction: column;
}

.category-select {
  width: 100%;
  padding: 2px 4px;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background-color: white;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.category-select:hover {
  border-color: var(--doc-primary);
}

.category-select:focus {
  border-color: var(--doc-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* 可滚动的内容区域 */
.category-content {
  flex: 1;
  overflow-y: auto;
  padding: 2px;
  /* 滚动条默认隐藏，滚动时显示 */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s ease;
}

/* 鼠标悬停或滚动时显示滚动条 */
.category-content:hover,
.category-content:active {
  scrollbar-color: var(--border-light) var(--section-bg);
}

.category-view {
  display: none;
}

.category-view.active {
  display: block;
}

.category-header {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Webkit滚动条样式 - 默认隐藏 */
.category-content::-webkit-scrollbar {
  width: 6px;
}

.category-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.category-content::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
  transition: background 0.3s ease;
}

/* 鼠标悬停时显示滚动条 */
.category-content:hover::-webkit-scrollbar-track {
  background: var(--section-bg);
}

.category-content:hover::-webkit-scrollbar-thumb {
  background: var(--border-light);
}

.category-content:hover::-webkit-scrollbar-thumb:hover {
  background: var(--border-emphasis);
}

/* 滚动时显示滚动条 */
.category-content.scrolling::-webkit-scrollbar-track {
  background: var(--section-bg);
}

.category-content.scrolling::-webkit-scrollbar-thumb {
  background: var(--border-light);
}
</style>