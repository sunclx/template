<template>
  <div class="float-window">
    <!-- 搜索框 -->
    <div class="search-container">
      <input v-model="searchKeyword" type="text" placeholder="搜索模板..." class="search-input" @input="handleSearch" />
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div v-for="template in searchResults" :key="template.id" class="result-item"
        @click="selectTemplate(template.id)">
        <div class="result-title">{{ template.title }}</div>
        <div class="result-meta">
          <span class="result-disease">{{ template.disease }}</span>
          <span class="result-type">{{ template.templateType }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="searchKeyword && searchResults.length === 0" class="empty-state">
      <div class="empty-text">未找到匹配的模板</div>
    </div>

    <!-- 默认状态 -->
    <div v-else class="default-state">
      <div class="default-text">输入关键词搜索模板</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplateStore } from '../stores/template'
import { matchText } from '../utils/pinyin'
import type { Template } from '../types'

/**
 * 悬浮窗口搜索组件
 */
const templateStore = useTemplateStore()
const searchKeyword = ref('')

/**
 * 搜索结果计算属性
 */
const searchResults = computed(() => {
  if (!searchKeyword.value.trim()) {
    return []
  }

  const keyword = searchKeyword.value.trim().toLowerCase()
  const allTemplates = templateStore.templates || []

  return allTemplates
    .filter((template: Template) => {
      return matchText(template.title, keyword) ||
        //  matchText(template.content, keyword) ||
        matchText(template.disease, keyword) ||
        matchText(template.templateType, keyword)
    })
    .slice(0, 10) // 限制显示前10个结果
})

/**
 * 处理搜索输入
 */
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

/**
 * 选择模板
 */
const selectTemplate = (templateId: string) => {
  templateStore.selectTemplate(templateId)
  // 可以在这里添加关闭窗口或其他逻辑
  console.log('Selected template:', templateId)
}
</script>

<style scoped>
.float-window {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.result-item {
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.result-item:hover {
  background: rgba(25, 118, 210, 0.05);
  border-color: rgba(25, 118, 210, 0.2);
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.4;
}

.result-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.result-disease,
.result-type {
  padding: 2px 6px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 4px;
  font-size: 11px;
}

.empty-state,
.default-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.empty-text,
.default-text {
  color: #999;
  font-size: 14px;
  text-align: center;
}

/* 滚动条样式 */
.search-results::-webkit-scrollbar {
  width: 4px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>