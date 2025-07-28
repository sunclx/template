<template>
  <div class="template-detail-section">
    <!-- 详情头部 -->
    <div class="template-detail-header" v-if="selectedTemplate">
      <div class="title-row">
        <div v-if="!isEditing" class="detail-title">{{ selectedTemplate.title }}</div>
        <input v-else v-model="editableTemplate.title" class="detail-title-input" placeholder="请输入模板标题" />
        <div class="title-actions">
          <button class="title-action-btn" v-if="!isEditing" @click="startEdit" title="编辑模板">
            <i class="fas fa-edit"></i>
          </button>
          <button class="title-action-btn save-btn" v-if="isEditing" @click="saveEdit" title="保存">
            <i class="fas fa-save"></i>
          </button>
          <button class="title-action-btn cancel-btn" v-if="isEditing" @click="cancelEdit" title="取消">
            <i class="fas fa-times"></i>
          </button>
          <button class="title-action-btn" @click="copyTemplate" title="复制">
            <i class="fas fa-copy"></i>
          </button>
          <button class="title-action-btn favorite-btn" :class="{ active: selectedTemplate.isFavorite }"
            @click="toggleFavorite" :title="selectedTemplate.isFavorite ? '取消收藏' : '收藏'">
            <i class="fas fa-star"></i>
          </button>
        </div>
      </div>
      <div class="detail-tags" v-if="!isEditing">
        <span class="tag disease-tag">
          <i class="fas fa-stethoscope"></i>
          {{ getDiseaseName(selectedTemplate.disease) }}
        </span>
        <span class="tag type-tag">
          <i class="fas fa-file-medical"></i>
          {{ getTemplateTypeName(selectedTemplate.templateType) }}
        </span>
        <span v-for="tagId in selectedTemplate.tags" :key="tagId" class="tag custom-tag"
          :style="{ backgroundColor: getTagColor(tagId) + '20', color: getTagColor(tagId) }">
          <i class="fas fa-tag"></i>
          {{ getTagName(tagId) }}
        </span>
      </div>

      <!-- 编辑模式下的标签编辑 -->
      <div class="edit-tags" v-if="isEditing">
        <div class="edit-row">
          <label>病种：</label>
          <input v-model="editableTemplate.disease" class="edit-select" list="diseases-list" placeholder="选择或输入病种" />
          <datalist id="diseases-list">
            <option v-for="disease in diseases" :key="disease.name" :value="disease.name">
              {{ disease.name }}
            </option>
          </datalist>
        </div>
        <div class="edit-row">
          <label>类型：</label>
          <input v-model="editableTemplate.templateType" class="edit-select" list="types-list" placeholder="选择或输入类型" />
          <datalist id="types-list">
            <option v-for="type in templateTypes" :key="type.name" :value="type.name">
              {{ type.name }}
            </option>
          </datalist>
        </div>
        <div class="edit-row">
          <label>标签：</label>
          <div class="tag-checkboxes">
            <label v-for="tag in availableTags" :key="tag.name" class="tag-checkbox">
              <input type="checkbox" :value="tag.name" v-model="editableTemplate.tags" />
              <span class="tag-label" :style="{ color: tag.color }">
                <i class="fas fa-tag"></i> {{ tag.name }}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情内容 -->
    <div class="template-detail-content">
      <!-- 空状态 -->
      <div v-if="!selectedTemplate" class="empty-state">
        <i class="fas fa-file-medical"></i>
        <div class="empty-title">请选择模板</div>
        <div class="empty-desc">从左侧列表中选择一个模板来查看详细内容</div>
      </div>

      <!-- 模板内容 -->
      <div v-else class="detail-content">

        <div class="template-sections">
          <!-- 非编辑模式 -->
          <div v-if="!isEditing">
            <div v-for="(section, index) in editableSections" :key="index" class="template-section">
              <div class="section-title">
                <div class="section-title-left">
                  <i class="fas fa-file-alt"></i>
                  <span>{{ section.title }}</span>
                </div>
                <button class="section-copy-btn" @click="copySectionContent(section.content)" title="复制此部分内容">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <div class="section-content">
                <div class="section-content-text">{{ section.content }}</div>
              </div>
            </div>
          </div>

          <!-- 编辑模式 - 可拖拽 -->
          <VueDraggableNext v-else v-model="editableSections" class="draggable-sections" :animation="200"
            ghost-class="ghost-section" chosen-class="chosen-section" drag-class="drag-section">
            <div v-for="(section, index) in editableSections" :key="index" class="template-section draggable-section">
              <div class="section-title">
                <i class="fas fa-grip-vertical drag-handle"></i>
                <i class="fas fa-file-alt"></i>
                <input v-model="section.title" class="section-title-input" placeholder="输入部分标题" />
                <button class="remove-section-btn" @click="removeSection(index)" title="删除此部分">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div class="section-content">
                <textarea v-model="section.content" class="section-content-textarea" placeholder="输入部分内容"
                  rows="6" @input="autoResizeTextarea" ref="textareaRefs"></textarea>
              </div>
            </div>
          </VueDraggableNext>

          <!-- 添加新部分按钮 -->
          <button v-if="isEditing" class="add-section-btn" @click="addSection">
            <i class="fas fa-plus"></i>
            添加新部分
          </button>
        </div>

        <!-- 元数据信息 -->
        <div class="template-meta">
          <div class="meta-row">
            <div class="meta-item">
              <span class="meta-label">创建：</span>
              <span class="meta-value">{{ formatDateTime(selectedTemplate.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新：</span>
              <span class="meta-value">{{ formatDateTime(selectedTemplate.updatedAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">ID：</span>
              <span class="meta-value">{{ selectedTemplate.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import { useTemplateStore } from '../stores/template'
import type { TemplateSection } from '../types'

const templateStore = useTemplateStore()

// 响应式数据
const isEditing = ref(false)
const editableTemplate = ref<any>(null)
const editableSections = ref<TemplateSection[]>([])

// 计算属性
const selectedTemplate = computed(() => templateStore.selectedTemplate)
const diseases = computed(() => templateStore.diseases)
const templateTypes = computed(() => templateStore.templateTypes)
const tags = computed(() => templateStore.tags)
const availableTags = computed(() => templateStore.tags)

// 监听选中模板变化
watch(selectedTemplate, (newTemplate) => {
  if (newTemplate) {
    editableSections.value = JSON.parse(JSON.stringify(newTemplate.sections))
    isEditing.value = false
  }
}, { immediate: true })

/**
 * 开始编辑
 */
const startEdit = async () => {
  if (selectedTemplate.value) {
    isEditing.value = true
    editableTemplate.value = JSON.parse(JSON.stringify(selectedTemplate.value))
    editableSections.value = JSON.parse(JSON.stringify(selectedTemplate.value.sections))
    
    // 等待DOM更新后调整所有textarea的高度
    await nextTick()
    const textareas = document.querySelectorAll('.section-content-textarea')
    textareas.forEach((textarea: HTMLTextAreaElement) => {
      textarea.style.height = 'auto'
      const newHeight = Math.max(textarea.scrollHeight, 120)
      textarea.style.height = newHeight + 'px'
    })
  }
}

/**
 * 保存编辑
 */
const saveEdit = () => {
  if (selectedTemplate.value && editableSections.value && editableTemplate.value) {
    templateStore.updateTemplate({
      ...editableTemplate.value,
      sections: editableSections.value
    })
    isEditing.value = false
  }
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
  if (selectedTemplate.value) {
    editableSections.value = JSON.parse(JSON.stringify(selectedTemplate.value.sections))
    isEditing.value = false
  }
}

/**
 * 复制模板
 */
const copyTemplate = async () => {
  if (selectedTemplate.value) {
    try {
      const templateText = editableSections.value
        .map(section => `${section.title}\n${section.content}`)
        .join('\n\n')

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
 * 切换收藏状态
 */
const toggleFavorite = () => {
  if (selectedTemplate.value) {
    templateStore.toggleFavorite(selectedTemplate.value.id)
  }
}

/**
 * 添加新部分
 */
const addSection = () => {
  editableSections.value.push({
    title: '新部分',
    content: ''
  })
}

/**
 * 删除部分
 */
const removeSection = (index: number) => {
  editableSections.value.splice(index, 1)
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
 * 自动调整textarea高度
 */
const autoResizeTextarea = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  if (textarea) {
    // 重置高度以获取正确的scrollHeight
    textarea.style.height = 'auto'
    // 设置最小高度
    const minHeight = 120
    // 计算新高度，至少为最小高度
    const newHeight = Math.max(textarea.scrollHeight, minHeight)
    textarea.style.height = newHeight + 'px'
  }
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
.template-detail-section {
  flex: 1;
  height: 100%;
  background-color: white;
  border-left: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.template-detail-header {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-light);
  background-color: white;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.detail-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--doc-primary);
}

.detail-title-input {
  font-size: 24px;
  font-weight: 700;
  color: var(--doc-primary);
  background: transparent;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 4px 8px;
  outline: none;
  transition: all 0.2s;
  width: 100%;
  max-width: 400px;
}

.detail-title-input:focus {
  border-color: var(--primary-color);
  background: var(--section-bg);
}

.favorite-btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: var(--section-bg);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}

.favorite-btn-icon:hover {
  background-color: var(--hover-bg);
  color: #ffc107;
}

.favorite-btn-icon.active {
  background-color: #ffc107;
  color: white;
}

/* 标题操作按钮样式 */
.title-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.title-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background-color: var(--section-bg);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}

.title-action-btn:hover {
  background-color: var(--hover-bg);
  color: var(--doc-primary);
}

.title-action-btn.save-btn {
  color: var(--success);
}

.title-action-btn.save-btn:hover {
  background-color: var(--success);
  color: white;
}

.title-action-btn.cancel-btn {
  color: var(--text-secondary);
}

.title-action-btn.cancel-btn:hover {
  background-color: var(--text-secondary);
  color: white;
}

.title-action-btn.favorite-btn:hover {
  color: #ffc107;
}

.title-action-btn.favorite-btn.active {
  background-color: #ffc107;
  color: white;
}

.detail-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* 病种标签样式 */
.tag.disease-tag {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.tag.disease-tag i {
  margin-right: 4px;
}

/* 类型标签样式 */
.tag.type-tag {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #2196f3;
}

.tag.type-tag i {
  margin-right: 4px;
}

/* 自定义标签样式 */
.tag.custom-tag {
  border: 1px solid currentColor;
}

.tag.custom-tag i {
  margin-right: 4px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  font-size: 13px;
  height: 32px;
}

.edit-btn {
  background-color: var(--doc-primary);
  color: white;
}

.edit-btn:hover {
  background-color: #1c3aa9;
}

.save-btn {
  background-color: var(--success);
  color: white;
}

.save-btn:hover {
  background-color: #388e3c;
}

.cancel-btn {
  background-color: var(--text-secondary);
  color: white;
}

.cancel-btn:hover {
  background-color: #263238;
}

.copy-btn {
  background-color: var(--section-bg);
  color: var(--text-secondary);
}

.copy-btn:hover {
  background-color: var(--hover-bg);
  color: var(--doc-primary);
}

.favorite-btn {
  background-color: var(--section-bg);
  color: var(--text-secondary);
}

.favorite-btn:hover {
  background-color: var(--hover-bg);
  color: #ffc107;
}

.favorite-btn.active {
  background-color: #ffc107;
  color: white;
}

.template-detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  text-align: center;
  padding: 20px;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  color: var(--border-light);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.detail-content {
  max-width: 800px;
}

.template-meta {
  background-color: rgba(248, 249, 250, 0.6);
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 30px;
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

/* 编辑模式样式 */
.edit-tags {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.edit-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.edit-row:last-child {
  margin-bottom: 0;
}

.edit-row label {
  min-width: 60px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.edit-select {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  min-width: 150px;
}

.edit-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.tag-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tag-checkbox:hover {
  background-color: #edf2ff;
}

.tag-checkbox input[type="checkbox"] {
  margin: 0;
}

.tag-label {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 拖拽样式 */
.draggable-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
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
  padding-bottom: 20px;
}

.template-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
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

.section-copy-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background-color: var(--section-bg);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 12px;
  opacity: 0.7;
}

.section-copy-btn:hover {
  background-color: var(--hover-bg);
  color: var(--doc-primary);
  opacity: 1;
}

.section-title-input {
  flex: 1;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--doc-primary);
  background-color: white;
}

.section-title-input:focus {
  outline: none;
  border-color: var(--doc-primary);
}

.remove-section-btn {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-section-btn:hover {
  background-color: var(--danger);
  color: white;
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
  border-left: 4px solid var(--doc-primary);
  margin: 8px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.section-content-text:hover {
  background-color: #d6e4ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.section-content-textarea {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-main);
  background-color: white;
  resize: none;
  min-height: 120px;
  overflow-y: hidden;
  transition: height 0.2s ease;
}

.section-content-textarea:focus {
  outline: none;
  border-color: var(--doc-primary);
}

.add-section-btn {
  background-color: var(--section-bg);
  border: 2px dashed var(--border-light);
  border-radius: 8px;
  padding: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-size: 14px;
}

.add-section-btn:hover {
  background-color: var(--hover-bg);
  border-color: var(--doc-primary);
  color: var(--doc-primary);
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