<template>
  <div class="template-view-mode">
    <!-- 查看模式头部 -->
    <div class="template-detail-header">
      <div class="title-row">
        <div class="detail-title">{{ template.title }}</div>
        <div class="title-actions">
          <BaseButton variant="secondary" size="small" icon="fas fa-edit" @click="handleEdit" title="编辑模板" />
          <BaseButton variant="secondary" size="small" icon="fas fa-copy" @click="handleCopy" title="复制" />
          <BaseButton variant="secondary" size="small" icon="fas fa-star"
            :class="{ 'favorite-active': template.isFavorite }" @click="handleToggleFavorite"
            :title="template.isFavorite ? '取消收藏' : '收藏'" />
        </div>
      </div>
      <div class="detail-tags">
        <TagList :tags="getDetailTemplateTags(template)" :show-icon="true" variant="detail" />
      </div>
    </div>

    <!-- 查看模式内容 -->
    <div class="template-detail-content">
      <div class="detail-content">
        <div class="template-sections">
          <div v-for="(section, index) in template.sections" :key="index" class="template-section">
            <div class="section-title">
              <div class="section-title-left">
                <i class="fas fa-file-alt"></i>
                <span>{{ section.title }}</span>
              </div>
              <BaseButton variant="secondary" size="small" icon="fas fa-copy"
                @click="copySectionContent(section.content)" title="复制此部分内容" />
            </div>
            <div class="section-content">
              <div class="section-content-text">{{ section.content }}</div>
            </div>
          </div>
        </div>

        <!-- 元数据信息 -->
        <div class="template-meta">
          <div class="meta-row">
            <div class="meta-item">
              <span class="meta-label">创建：</span>
              <span class="meta-value">{{ formatDateTime(template.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新：</span>
              <span class="meta-value">{{ formatDateTime(template.updatedAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">ID：</span>
              <span class="meta-value">{{ template.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTemplateStore } from '../stores/template'
import BaseButton from './common/BaseButton.vue'
import TagList from './common/TagList.vue'

// Props
interface Props {
  template: any
}

const props = defineProps<Props>()

// Emits
interface Emits {
  edit: []
  copy: []
  toggleFavorite: []
  copySectionContent: [content: string]
}

const emit = defineEmits<Emits>()

const templateStore = useTemplateStore()

// 计算属性
const diseases = computed(() => templateStore.diseases)
const templateTypes = computed(() => templateStore.templateTypes)
const tags = computed(() => templateStore.tags)

/**
 * 开始编辑
 */
const handleEdit = () => {
  emit('edit')
}

/**
 * 复制模板
 */
const handleCopy = () => {
  emit('copy')
}

/**
 * 切换收藏状态
 */
const handleToggleFavorite = () => {
  emit('toggleFavorite')
}

/**
 * 复制区块内容
 */
const copySectionContent = (content: string) => {
  emit('copySectionContent', content)
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
 * 获取标签颜色
 */
const getTagColor = (tagName: string) => {
  const tag = tags.value.find(t => t.name === tagName)
  return tag?.color || '#2e4ab8'
}

/**
 * 获取详情页模板标签列表（用于TagList组件）
 */
const getDetailTemplateTags = (template: any) => {
  const result = []

  // 添加病种标签
  result.push({
    name: getDiseaseName(template.disease),
    variant: 'category',
    icon: 'fas fa-stethoscope'
  })

  // 添加模板类型标签
  result.push({
    name: getTemplateTypeName(template.templateType),
    variant: 'type',
    icon: 'fas fa-file-medical'
  })

  // 添加其他标签
  template.tags.forEach((tagId: string) => {
    result.push({
      name: getTagName(tagId),
      variant: 'default',
      icon: 'fas fa-tag',
      color: getTagColor(tagId)
    })
  })

  return result
}

/**
 * 格式化日期时间
 */
const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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
  padding: 12px 16px;
}

.detail-content {
  max-width: 800px;
}

.template-meta {
  background-color: rgba(248, 249, 250, 0.6);
  border-radius: 6px;
  padding: 6px 10px;
  margin-top: 20px;
  font-size: 11px;
  opacity: 0.8;
  border: 1px solid rgba(233, 236, 239, 0.5);
}

.meta-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  min-width: 100px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2px 6px;
  border-radius: 3px;
}

.meta-label {
  font-weight: 500;
  color: rgba(108, 117, 125, 0.8);
  margin-right: 4px;
  flex-shrink: 0;
}

.meta-value {
  color: rgba(73, 80, 87, 0.8);
  font-size: 11px;
  font-weight: normal;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.template-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
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
  padding: 0 10px;
}

.section-content-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #edf2ff;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 8px 0;
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