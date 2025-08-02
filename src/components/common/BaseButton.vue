<template>
  <button :class="[
    'base-button',
    `base-button--${variant}`,
    `base-button--${size}`,
    {
      'base-button--disabled': disabled,
      'base-button--loading': loading
    }
  ]" :disabled="disabled || loading" @click="handleClick">
    <Icon v-if="icon && !loading" :icon="icon" class="base-button__icon" />
    <Icon v-if="loading" icon="mdi:loading" class="base-button__icon base-button__icon--spin" />
    <span v-if="$slots.default" class="base-button__text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import Icon from '@/components/common/Icon.vue';
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  disabled?: boolean
  loading?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})

const emit = defineEmits<Emits>()

/**
 * 处理按钮点击事件
 */
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  outline: none;
  user-select: none;
}

.base-button:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* 尺寸变体 */
.base-button--small {
  padding: 4px 8px;
  font-size: 12px;
  height: 24px;
}

.base-button--medium {
  padding: 6px 12px;
  font-size: 13px;
  height: 28px;
}

.base-button--large {
  padding: 8px 16px;
  font-size: 14px;
  height: 32px;
}

/* 颜色变体 */
.base-button--primary {
  background-color: var(--doc-primary);
  color: white;
}

.base-button--primary:hover:not(.base-button--disabled) {
  background-color: var(--doc-secondary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(46, 74, 184, 0.3);
}

.base-button--secondary {
  background-color: var(--section-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background-color: var(--hover-bg);
  color: var(--doc-primary);
  border-color: var(--border-emphasis);
}

.base-button--danger {
  background-color: var(--danger);
  color: white;
}

.base-button--danger:hover:not(.base-button--disabled) {
  background-color: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.base-button--success {
  background-color: var(--success);
  color: white;
}

.base-button--success:hover:not(.base-button--disabled) {
  background-color: #1e7e34;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.base-button--warning {
  background-color: var(--warning);
  color: white;
}

.base-button--warning:hover:not(.base-button--disabled) {
  background-color: #e0a800;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

/* 禁用状态 */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 加载状态 */
.base-button--loading {
  cursor: wait;
}

.base-button__icon {
  font-size: 0.9em;
}

.base-button__icon--spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.base-button__text {
  line-height: 1;
}
</style>