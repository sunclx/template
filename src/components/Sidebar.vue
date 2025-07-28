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
          <div class="category-item" :class="{ active: selectedCategory === 'all' }"
            @click="handleCategorySelect('all')">
            <span>全部</span>
            <span class="badge">{{ templates.length }}</span>
          </div>
          <div v-for="disease in diseases" :key="disease.name" class="category-item"
            :class="{ active: selectedCategory === disease.name }" @click="handleCategorySelect(disease.name)">
            <span>{{ disease.name }}</span>
            <span class="badge">{{ disease.templateCount }}</span>
          </div>
        </div>
      </div>

      <!-- 按模板种类 -->
      <div class="category-view" :class="{ active: currentView === 'type' }" v-if="currentView === 'type'">
        <div class="category-items">
          <div class="category-item" :class="{ active: selectedCategory === 'all' }"
            @click="handleCategorySelect('all')">
            <span>全部</span>
            <span class="badge">{{ templates.length }}</span>
          </div>
          <div v-for="type in templateTypes" :key="type.name" class="category-item"
            :class="{ active: selectedCategory === type.name }" @click="handleCategorySelect(type.name)">
            <span>{{ type.name }}</span>
            <span class="badge">{{ type.templateCount }}</span>
          </div>
        </div>
      </div>

      <!-- 按标签分类 -->
      <div class="category-view" :class="{ active: currentView === 'tag' }" v-if="currentView === 'tag'">

        <div class="category-items">
          <div class="category-item" :class="{ active: selectedCategory === 'all' }"
            @click="handleCategorySelect('all')">
            <span>全部</span>
            <span class="badge">{{ templates.length }}</span>
          </div>
          <div v-for="tag in tags" :key="tag.name" class="category-item"
            :class="{ active: selectedCategory === tag.name }" @click="handleCategorySelect(tag.name)">
            <span>
              <i class="fas fa-tag" :style="{ color: tag.color }"></i>
              {{ tag.name }}
            </span>
            <span class="badge" v-if="tag.name !== 'all'">{{ getTagTemplateCount(tag.name) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTemplateStore } from '../stores/template'
import type { CategoryView } from '../types'

const templateStore = useTemplateStore()

// 模板引用
const categoryContentRef = ref<HTMLElement>()
let scrollTimer: number | null = null

// 计算属性
const currentView = computed(() => templateStore.currentView)
const selectedCategory = computed(() => templateStore.selectedCategory)
const diseases = computed(() => templateStore.diseases)
const templateTypes = computed(() => templateStore.templateTypes)
const tags = computed(() => templateStore.tags)
const templates = computed(() => templateStore.templates)

/**
 * 处理滚动事件
 */
const handleScroll = () => {
  const element = categoryContentRef.value
  if (!element) return

  // 添加滚动中的类
  element.classList.add('scrolling')

  // 清除之前的定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }

  // 设置新的定时器，在停止滚动后移除类
  scrollTimer = window.setTimeout(() => {
    element.classList.remove('scrolling')
  }, 1000) // 1秒后隐藏滚动条
}

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

/**
 * 获取标签对应的模板数量
 */
const getTagTemplateCount = (tagId: string) => {
  return templates.value.filter(template => template.tags.includes(tagId)).length
}

// 生命周期钩子
onMounted(() => {
  const element = categoryContentRef.value
  if (element) {
    element.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  const element = categoryContentRef.value
  if (element) {
    element.removeEventListener('scroll', handleScroll)
  }
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
})
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
  padding: 20px;
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
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background-color: white;
  color: var(--text-primary);
  font-size: 14px;
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
  padding: 20px;
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
  margin-bottom: 15px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  padding: 10px 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.category-item:hover {
  background-color: var(--hover-bg);
}

.category-item.active {
  background-color: var(--doc-primary);
  color: white;
}

.category-item span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background-color: var(--border-light);
  color: var(--text-secondary);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
}

.category-item.active .badge {
  background-color: white;
  color: var(--doc-primary);
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