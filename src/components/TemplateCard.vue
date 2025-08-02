<template>
  <BaseCard class="template-card" :active="isActive" hoverable clickable @click="handleTemplateSelect">
    <template #header>
      <div class="card-header">
        <div class="template-title">{{ template.title }}</div>
        <button class="favorite-btn" :class="{ active: template.isFavorite }" @click.stop="handleToggleFavorite">
          <Icon icon="mdi:star" />
        </button>
      </div>
    </template>

    <div class="card-content">
      <span v-html="highlightedPreview"></span>
    </div>

    <template #footer>
      <div class="card-footer">
        <span class="update-time">{{ formatTime(template.updatedAt) }}</span>
        <span class="section-count">{{ template.sections.length }} 个部分</span>
      </div>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { match } from 'pinyin-pro'
import type { Template } from '../types'
import { formatTime } from '../utils/date'
import BaseCard from './common/BaseCard.vue'
import Icon from './common/Icon.vue'
import { useTemplateStore } from '../stores/template'

const templateStore = useTemplateStore()

interface Props {
  template: Template
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  searchKeyword: ''
})


/**
 * 查找匹配位置（支持中文、拼音首字母、完整拼音匹配）
 */
const findMatchIndex = (text: string, keyword: string): number => {
  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()

  // 1. 直接匹配中文或英文
  const directMatch = lowerText.indexOf(lowerKeyword)
  if (directMatch !== -1) {
    return directMatch
  }

  // 2. 拼音首字母匹配
  const matchResult = match(lowerText, lowerKeyword, { continuous: true });
  if (matchResult) {
    return matchResult[0]
  }
  return -1
}

/**
 * 获取模板内容预览（搜索时显示匹配字符周围的十个字，否则显示前十个字）
 */
const getTemplatePreview = (template: Template, searchKeyword: string) => {
  // 合并所有章节内容
  const allContent = template.title + template.sections.map(section => section.title + section.content).join('')
  // 移除HTML标签和多余空白字符
  const cleanContent = allContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

  const keyword = searchKeyword.trim()

  // 如果没有搜索关键词，返回前十个字
  if (!keyword) {
    return cleanContent.length > 10 ? cleanContent.substring(0, 10) + '...' : cleanContent
  }

  // 查找匹配位置
  const matchIndex = findMatchIndex(cleanContent, keyword)


  if (matchIndex === -1) {
    // 如果没有找到匹配，返回前十个字
    return cleanContent.length > 10 ? cleanContent.substring(0, 10) + '...' : cleanContent
  }

  // 计算显示范围（匹配字符周围的十个字）
  const start = Math.max(0, matchIndex - 5)
  const end = Math.min(cleanContent.length, matchIndex + keyword.length + 5)

  let preview = cleanContent.substring(start, end)

  // 添加省略号
  if (start > 0) preview = '...' + preview
  if (end < cleanContent.length) preview = preview + '...'

  return preview
}

/**
 * 高亮显示搜索关键词（支持拼音匹配）
 */
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword || !text) return text

  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()

  // 1. 直接匹配中文或英文
  const directMatch = lowerText.indexOf(lowerKeyword)
  if (directMatch !== -1) {
    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, '<mark class="highlight">$1</mark>')
  }

  const matchResult = match(lowerText, lowerKeyword, { continuous: true });
  if (matchResult) {
    const beforeMatch = text.substring(0, matchResult[0])
    const matchText = text.substring(matchResult[0], matchResult[matchResult.length - 1] + 1)
    const afterMatch = text.substring(matchResult[matchResult.length - 1] + 1)
    return beforeMatch + '<mark class="highlight">' + matchText + '</mark>' + afterMatch
  }

  return text
}

// 计算属性
const highlightedPreview = computed(() => {
  const preview = getTemplatePreview(props.template, templateStore.searchKeyword)
  return highlightKeyword(preview, templateStore.searchKeyword)
})

/**
 * 处理模板选择
 */
const handleTemplateSelect = () => {
  templateStore.selectTemplate(props.template.id)
}

/**
 * 切换收藏状态
 */
const handleToggleFavorite = () => {
  templateStore.toggleFavorite(props.template.id)
}

</script>

<style scoped>
.template-card {
  flex-shrink: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.card-content {
  margin-bottom: 1px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.card-content .highlight {
  background-color: #fff3cd;
  color: #856404;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>