<template>
  <div class="template-detail-section">
    <!-- 空状态 -->
    <div v-if="!selectedTemplate" class="empty-state">
      <i class="fas fa-file-medical"></i>
      <div class="empty-title">请选择模板</div>
      <div class="empty-desc">从左侧列表中选择一个模板来查看详细内容</div>
    </div>

    <!-- 编辑模式 -->
    <TemplateEditMode v-else-if="isEditing" :template="editableTemplate" @save="handleSave" @cancel="handleCancel" />

    <!-- 查看模式 -->
    <TemplateViewMode v-else :template="selectedTemplate" @edit="startEdit" @copy="copyTemplate"
      @toggle-favorite="toggleFavorite" @copy-section-content="copySectionContent" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRaw, toRef } from 'vue'
import { useTemplateStore } from '../stores/template'
import type { Template } from '../types'
import TemplateEditMode from './TemplateEditMode.vue'
import TemplateViewMode from './TemplateViewMode.vue'

const templateStore = useTemplateStore()

// 响应式数据
const isEditing = ref(false)
// 计算属性
const selectedTemplate = toRef(templateStore, 'selectedTemplate')
const editableTemplate = ref<Template>(null as unknown as Template)

// 监听选中模板变化
watch(selectedTemplate, (newTemplate) => {
  if (newTemplate) {
    isEditing.value = false
  }
}, { immediate: true })

/**
 * 开始编辑
 */
const startEdit = async () => {
  if (selectedTemplate.value) {
    editableTemplate.value = structuredClone(toRaw(selectedTemplate.value));
    isEditing.value = true
  }
}

/**
 * 保存编辑
 */
const handleSave = () => {
  if (selectedTemplate.value && editableTemplate.value) {
    templateStore.updateTemplate({
      ...editableTemplate.value,
      sections: editableTemplate.value.sections
    })
    isEditing.value = false
  }
}

/**
 * 取消编辑
 */
const handleCancel = () => {
  if (selectedTemplate.value) {
    isEditing.value = false
  }
}

/**
 * 复制模板
 */
const copyTemplate = async () => {
  if (selectedTemplate.value) {
    try {
      const templateText = selectedTemplate.value.sections
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
</style>