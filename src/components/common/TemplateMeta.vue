<template>
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
</template>

<script setup lang="ts">
import type { Template } from '@/types'
import { formatDateTime } from '@/utils/date'

interface Props {
  template: Template
}

defineProps<Props>()

</script>

<style scoped>
.template-meta {
  background-color: rgba(248, 249, 250, 0.6);
  border-radius: 6px;
  padding: 4px 6px;
  margin-top: 5px;
  font-size: 10px;
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
}
</style>