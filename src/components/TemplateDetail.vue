<template>
  <div class="template-detail-section">
    <!-- 编辑模式 -->
    <TemplateEditMode v-if="isEditing" />
    <!-- 空状态 -->
    <div v-else-if="!selectedTemplate" class="empty-state">
      <Icon icon="mdi:file-document-plus" />
      <div class="empty-title">请选择模板</div>
      <div class="empty-desc">从左侧列表中选择一个模板来查看详细内容</div>
    </div>
    <!-- 查看模式 -->
    <TemplateViewMode v-else />
  </div>
</template>

<script setup lang="ts">
import { watch, toRef } from 'vue'
import { useTemplateStore } from '../stores/template'
import TemplateEditMode from './TemplateEditMode.vue'
import TemplateViewMode from './TemplateViewMode.vue'
import Icon from './common/Icon.vue'

const templateStore = useTemplateStore()

// 响应式数据
const isEditing = toRef(templateStore, 'isEditMode')
// 计算属性
const selectedTemplate = toRef(templateStore, 'selectedTemplate')

// 监听选中模板变化
watch(selectedTemplate, (newTemplate) => {
  if (newTemplate) {
    templateStore.setEditMode(false)
  }
}, { immediate: true })


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