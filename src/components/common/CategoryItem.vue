<template>
  <div :class="[
    'category-item',
    {
      'category-item--active': active
    }
  ]" @click="handleClick">
    <span class="category-item__content">
      <i v-if="icon" :class="icon" :style="iconStyle" class="category-item__icon"></i>
      <span class="category-item__text">{{ label }}</span>
    </span>
    <span v-if="count !== undefined" class="category-item__badge">
      {{ count }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  count?: number
  icon?: string
  iconColor?: string
  active?: boolean
  value: string
}

interface Emits {
  click: [value: string]
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

const emit = defineEmits<Emits>()

/**
 * 图标样式
 */
const iconStyle = computed(() => {
  if (props.iconColor) {
    return { color: props.iconColor }
  }
  return {}
})

/**
 * 处理点击事件
 */
const handleClick = () => {
  emit('click', props.value)
}
</script>

<style scoped>
.category-item {
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  user-select: none;
}

.category-item:hover {
  background-color: var(--hover-bg);
}

.category-item--active {
  background-color: var(--doc-primary);
  color: white;
}

.category-item__content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.category-item__icon {
  font-size: 12px;
  flex-shrink: 0;
}

.category-item__text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-item__badge {
  background-color: var(--border-light);
  color: var(--text-secondary);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.category-item--active .category-item__badge {
  background-color: white;
  color: var(--doc-primary);
}
</style>