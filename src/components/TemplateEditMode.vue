<template>
  <div class="template-edit-mode">
    <!-- 编辑模式头部 -->
    <div class="template-detail-header">
      <div class="title-row">
        <input v-model="template.title" class="detail-title-input" placeholder="请输入模板标题" />
        <div class="title-actions">
          <BaseButton size="small" icon="mdi:content-save" @click="handleSave" title="保存" />
          <BaseButton variant="secondary" size="small" icon="mdi:close" @click="handleCancel" title="取消" />
          <BaseButton variant="secondary" size="small" icon="mdi:content-copy" @click="handleCopy" title="复制" />
          <BaseButton variant="secondary" size="small" icon="mdi:star"
            :class="{ 'favorite-active': template.isFavorite }" @click="handleToggleFavorite"
            :title="template.isFavorite ? '取消收藏' : '收藏'" />
        </div>
      </div>

      <!-- 编辑模式下的标签编辑 -->
      <div class="edit-tags">
        <div class="edit-row">
          <label>病种：</label>
          <SelectDropdown v-model="template.disease" :options="diseaseOptions" placeholder="选择或输入病种"
            class="edit-select-dropdown" />
        </div>
        <div class="edit-row">
          <label>类型：</label>
          <SelectDropdown v-model="template.templateType" :options="typeOptions" placeholder="选择或输入类型"
            class="edit-select-dropdown" />
        </div>
        <div class="edit-row">
          <label>标签：</label>
          <div class="tag-management">
            <!-- 已选择的标签 -->
            <div v-for="tagName in template.tags" :key="tagName" class="tag-item">
              <span>{{ tagName }}</span>
              <Icon icon="mdi:close" @click="removeTag(tagName)" />
            </div>
            <!-- 添加标签输入框 -->
            <input type="text" class="add-tag-input" placeholder="添加标签..." v-model="newTagInput"
              @focus="handleAddTagFocus" @keypress="handleAddTag" @blur="handleAddTagBlur" />
          </div>
        </div>
        <!-- 可选标签列表 -->
        <div class="edit-row" v-if="showAvailableTags">
          <label></label>
          <div class="available-tags">
            <span v-for="tag in filteredAvailableTags" :key="tag.name" class="available-tag"
              :style="{ color: tag.color }" @click="addTag(tag.name)">
              <Icon icon="mdi:tag" /> {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模式内容 -->
    <div class="template-detail-content">
      <div class="detail-content">
        <div class="template-sections">
          <!-- 编辑模式 - 可拖拽 -->
          <VueDraggableNext v-model="template.sections" class="draggable-sections" :animation="200"
            ghost-class="ghost-section" chosen-class="chosen-section" drag-class="drag-section">
            <div v-for="(section, index) in template.sections" :key="index" class="template-section draggable-section">
              <div class="section-title">
                <Icon icon="mdi:drag-vertical" class="drag-handle" />
                <Icon icon="mdi:file-document-outline" />
                <input v-model="section.title" class="section-title-input" placeholder="输入部分标题" />
                <BaseButton variant="danger" size="small" icon="mdi:delete" @click="removeSection(index)"
                  title="删除此部分" />
              </div>
              <div class="section-content">
                <textarea v-model="section.content" class="section-content-textarea" placeholder="输入部分内容" rows="6"
                  @input="autoResizeTextarea" ref="textareaRefs"></textarea>
              </div>
            </div>
          </VueDraggableNext>

          <!-- 添加新部分按钮 -->
          <div class="add-section-container">
            <BaseButton icon="mdi:plus" @click="addSection">
              添加新部分
            </BaseButton>
          </div>
        </div>

        <!-- 元数据信息 -->
        <TemplateMeta :template="template" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from './common/BaseButton.vue'
import SelectDropdown from './common/SelectDropdown.vue'
import TemplateMeta from './common/TemplateMeta.vue'
import Icon from './common/Icon.vue'

import { computed, ref, watch, toRaw } from 'vue'
import { storeToRefs } from 'pinia'
import { VueDraggableNext } from 'vue-draggable-next'

import { useTemplateStore } from '@/stores/template'
import { copyToClipboard, defaultTemplateValue } from '@/utils/template'


const templateStore = useTemplateStore()
const { selectedTemplate, tags: availableTags, diseases, templateTypes } = storeToRefs(templateStore)

// 响应式数据
const template = ref(selectedTemplate.value ? structuredClone(toRaw(selectedTemplate.value)) : defaultTemplateValue())


// 标签管理相关
const newTagInput = ref('')
const showAvailableTags = ref(false)

// 过滤可用标签（排除已选择的）
const filteredAvailableTags = computed(() => {
  return availableTags.value.filter(tag => tag.name.includes(newTagInput.value) && !template.value.tags.includes(tag.name)) || []
})

/**
 * 添加标签
 */
const addTag = (tagName: string) => {
  if (!template.value.tags.includes(tagName)) {
    template.value.tags.push(tagName)
  }
  newTagInput.value = ''
  showAvailableTags.value = false
}

/**
 * 移除标签
 */
const removeTag = (tagName: string) => {
  const index = template.value.tags.indexOf(tagName)
  if (index > -1) {
    template.value.tags.splice(index, 1)
  }
}


/**
 * 处理添加标签按键事件
 */
const handleAddTag = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && newTagInput.value.trim() !== '') {
    const tagText = newTagInput.value.trim()
    addTag(tagText)
  }
}
const handleAddTagFocus = () => {
  showAvailableTags.value = filteredAvailableTags.value.length > 0
}
/**
 * 处理输入框失去焦点
 */
const handleAddTagBlur = () => {
  setTimeout(() => {
    showAvailableTags.value = false
  }, 200) // 延迟隐藏，允许点击可选标签
}

// 监听输入框焦点，显示可选标签
watch(newTagInput, () => {
  showAvailableTags.value = filteredAvailableTags.value.length > 0
})

/**
 * 病种选项列表（转换为下拉组件格式）
 */
const diseaseOptions = computed(() =>
  diseases.value.map(disease => ({
    label: disease.name,
    value: disease.name
  }))
)

/**
 * 类型选项列表（转换为下拉组件格式）
 */
const typeOptions = computed(() =>
  templateTypes.value.map(type => ({
    label: type.name,
    value: type.name
  }))
)
/**
 * 保存编辑
 */
const handleSave = () => {
  if (template.value) {
    templateStore.updateTemplate({
      ...template.value,
      updatedAt: Date.now()
    })
  }
  templateStore.setEditMode(false)
}

/**
 * 取消编辑
 */
const handleCancel = () => {
  if (template.value) {
    templateStore.setEditMode(false)
  }
}

/**
 * 复制模板
 */
const handleCopy = () => {
  copyToClipboard(template.value)
}

/**
 * 切换收藏状态
 */
const handleToggleFavorite = () => {
  template.value.isFavorite = !template.value.isFavorite
}

/**
 * 添加新部分
 */
const addSection = () => {
  template.value.sections.push({
    title: '新部分',
    content: ''
  })
}

/**
 * 删除部分
 */
const removeSection = (index: number) => {
  template.value.sections.splice(index, 1)
}

/**
 * 自动调整textarea高度
 */
const autoResizeTextarea = async (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  if (textarea) {
    // 重置高度以获取正确的scrollHeight
    textarea.style.height = 'auto'
    // 设置最小高度
    const minHeight = 10
    // 计算新高度，至少为最小高度
    const newHeight = Math.max(textarea.scrollHeight, minHeight)
    textarea.style.height = newHeight + 'px'
  }
}

</script>

<style scoped>
.template-edit-mode {
  flex: 1;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.template-detail-header {
  padding: 4px 6px;
  border-bottom: 1px solid var(--border-light);
  background-color: white;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.detail-title-input {
  font-size: 20px;
  font-weight: 700;
  color: var(--doc-primary);
  background: transparent;
  border: 1px solid;
  border-radius: 6px;
  padding: 4px 8px;
  outline: none;
  transition: all 0.2s;
  width: 100%;
  max-width: 400px;
  margin-right: 8px;
}

.detail-title-input:focus {
  border-color: var(--primary-color);
  background: var(--section-bg);
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
  padding: 6px 8px;
}

.detail-content {
  max-width: 1200px;
}


/* 编辑模式样式 */
.edit-tags {
  padding: 4px 6px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.edit-row {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 12px;
}

.edit-row:nth-child(1),
.edit-row:nth-child(2) {
  display: inline-flex;
  flex: 1;
  min-width: 100px;
  max-width: 200px;
  margin-bottom: 0;
  margin-right: 12px;
}

.edit-row:nth-child(3) {
  width: 100%;
  margin-top: 2px;
  margin-bottom: 0;
}

.edit-row:last-child {
  margin-bottom: 0;
}

.edit-row label {
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.edit-select-dropdown {
  min-width: 100px;
  max-width: 200px;
  flex: 1;
}

/* 标签管理区域样式 */
.tag-management {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  align-items: center;
  background: #f8f9fa;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 15px;
  background: #e8f0fe;
  color: var(--doc-primary);
  font-size: 12px;
  transition: all 0.2s;
}

.tag-item:hover {
  background: rgba(26, 115, 232, 0.15);
}

.tag-item i {
  cursor: pointer;
  font-size: 10px;
  opacity: 0.7;
  transition: all 0.2s;
}

.tag-item i:hover {
  opacity: 1;
  color: var(--danger, #ea4335);
}

.add-tag-input {
  padding: 4px 8px;
  border-radius: 15px;
  border: 1px dashed var(--doc-primary);
  background: white;
  color: var(--text-main);
  font-size: 12px;
  width: 100px;
  outline: none;
  transition: all 0.2s;
}

.add-tag-input:focus {
  border-color: var(--doc-primary);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
  width: 120px;
}

/* 可选标签列表 */
.available-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background: #f8f9fa;
  border: 1px solid var(--border-light);
  border-radius: 6px;
}

.available-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.available-tag:hover {
  background: rgba(26, 115, 232, 0.1);
  border-color: var(--doc-primary);
  transform: translateY(-1px);
}

/* 拖拽样式 */
.draggable-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.draggable-section {
  cursor: move;
  transition: all 0.2s;
}

.drag-handle {
  cursor: grab;
  color: var(--text-secondary);
  margin-right: 4px;
}

.drag-handle:active {
  cursor: grabbing;
}

.ghost-section {
  opacity: 0.5;
  background-color: var(--section-bg);
}

.chosen-section {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.drag-section {
  transform: rotate(2deg);
  opacity: 0.8;
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
  margin-bottom: 4px;
}

.section-title-input {
  flex: 1;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--doc-primary);
  background-color: white;
  margin-left: 8px;
}

.section-title-input:focus {
  outline: none;
  border-color: var(--doc-primary);
}

.section-content {
  color: var(--text-main);
  line-height: 1.6;
}

.section-content-textarea {
  height: 60px;
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-main);
  background-color: white;
  resize: none;
  overflow-y: hidden;
  transition: height 0.2s ease;
}

.section-content-textarea:focus {
  outline: none;
  border-color: var(--doc-primary);
}

.add-section-container {
  display: flex;
  justify-content: center;
  padding: 20px;
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