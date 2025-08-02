<template>
  <div v-if="template" class="template-view-mode">

    <!-- 查看模式头部 -->
    <div class="template-detail-header">
      <div class="title-row">
        <div class="detail-title">{{ template.title }}</div>
        <div class="title-actions">
          <BaseButton variant="secondary" size="small" icon="mdi:pencil" @click="handleEdit" title="编辑模板" />
          <BaseButton variant="secondary" size="small" icon="mdi:content-copy" @click="handleCopy" title="复制" />
          <BaseButton variant="secondary" size="small" icon="mdi:star"
            :class="{ 'favorite-active': template.isFavorite }" @click="handleToggleFavorite"
            :title="template.isFavorite ? '取消收藏' : '收藏'" />
        </div>
      </div>
      <div class="detail-tags">
        <TagList :tags="getDetailTemplateTags(template)" :show-icon="true" />
      </div>
    </div>

    <!-- 查看模式内容 -->
    <div class="template-detail-content">
      <div class="detail-content">
        <div class="template-sections">
          <div v-for="(section, index) in template.sections" :key="index" class="template-section">
            <div class="section-title">
              <div class="section-title-left">
                <Icon icon="mdi:file-document-outline" />
                <span>{{ section.title }}</span>
              </div>
              <BaseButton variant="secondary" size="small" icon="mdi:content-copy"
                @click="copySectionContent(section.content)" title="复制此部分内容" />
            </div>
            <div class="section-content">
              <div class="section-content-text">{{ section.content }}</div>
            </div>
          </div>
        </div>

        <!-- 元数据信息 -->
        <TemplateMeta :template="template" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateStore } from '../stores/template'
import BaseButton from './common/BaseButton.vue'
import TagList from './common/TagList.vue'
import TemplateMeta from './common/TemplateMeta.vue'
import Icon from './common/Icon.vue'
import type { Template } from '../types'
import { storeToRefs } from 'pinia'

const templateStore = useTemplateStore()
const { selectedTemplate: template } = storeToRefs(templateStore)

/**
 * 开始编辑
 */
const handleEdit = () => {
  templateStore.setEditMode(true)
}

/**
 * 复制模板
 */
const handleCopy = async () => {
  if (template.value) {
    try {
      const templateText = template.value.sections
        .map(section => `${section.title}：${section.content}`)
        .join('\n')

      await navigator.clipboard.writeText(templateText)
      console.log('模板已复制到剪贴板')
      // TODO: 显示成功提示
    } catch (error) {
      console.error('复制失败:', error)
      // TODO: 显示错误提示
    }
  }
}

/**
 * 切换收藏状态
 */
const handleToggleFavorite = () => {
  if (template.value) {
    template.value.isFavorite = !template.value.isFavorite
    templateStore.toggleFavorite(template.value.id)
  }
}

/**
 * 复制区块内容
 */
const copySectionContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    console.log('区块内容已复制到剪贴板')
    // TODO: 显示成功提示
  } catch (error) {
    console.error('复制失败:', error)
    // TODO: 显示错误提示
  }
}

/**
 * 获取详情页模板标签列表（用于TagList组件）
 */
const getDetailTemplateTags = (template: Template) => {
  interface Tag {
    name: string
    type: 'default' | 'type' | 'category'
    icon?: string,
    color?: string
  }
  const result: Tag[] = []

  // 添加病种标签
  result.push({
    name: template.disease,
    type: 'category',
    icon: 'mdi:stethoscope'
  })

  // 添加模板类型标签
  result.push({
    name: template.templateType,
    type: 'type',
    icon: 'mdi:file-document-plus'
  })

  // 添加其他标签
  template.tags.forEach((tagId: string) => {
    result.push({
      name: tagId,
      type: 'default',
      icon: 'mdi:tag',
      color: templateStore.getTagColor(tagId)
    })
  })

  return result
}


</script>

<style scoped>
.template-view-mode {
  flex: 1;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.template-detail-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  background-color: white;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--doc-primary);
}

.title-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.favorite-active {
  background-color: #ffc107 !important;
  color: white !important;
}

.template-detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px;
}

/* .detail-content {
  max-width: 800px;
} */



.template-sections {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.template-section {
  border-bottom: 1px dashed var(--border-light);
}

.template-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--doc-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-content {
  color: var(--text-main);
  line-height: 1.6;
  /* padding: 0 10px; */
}

.section-content-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #edf2ff;
  padding: 6px 10px;
  border-radius: 6px;
  margin: 6px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.section-content-text:hover {
  background-color: #d6e4ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 滚动条样式 */
.template-detail-content::-webkit-scrollbar {
  width: 6px;
}

.template-detail-content::-webkit-scrollbar-track {
  background: var(--section-bg);
  border-radius: 3px;
}

.template-detail-content::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

.template-detail-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-emphasis);
}
</style>