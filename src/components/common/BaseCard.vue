<template>
  <div :class="[
    'base-card',
    {
      'base-card--hoverable': hoverable,
      'base-card--active': active,
      'base-card--clickable': clickable
    }
  ]" @click="handleClick">
    <!-- 卡片头部 -->
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header"></slot>
    </div>

    <!-- 卡片内容 -->
    <div class="base-card__content">
      <slot></slot>
    </div>

    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean
  active?: boolean
  clickable?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

withDefaults(defineProps<Props>(), {
  hoverable: true,
  active: false,
  clickable: false
})

const emit = defineEmits<Emits>()

/**
 * 处理卡片点击事件
 */
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style scoped>
.base-card {
  background-color: white;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.base-card--hoverable:hover {
  border-color: var(--border-emphasis);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.base-card--active {
  border-color: var(--doc-primary);
  background-color: var(--section-bg);
}

.base-card--clickable {
  cursor: pointer;
}

.base-card__header {
  padding: 8px 10px 0 10px;
}

.base-card__content {
  padding: 6px 8px;
}

.base-card__footer {
  padding: 0 12px 12px 12px;
}

/* 当同时有header和content时，调整content的padding */
.base-card__header+.base-card__content {
  padding-top: 8px;
}

/* 当同时有content和footer时，调整footer的padding */
.base-card__content+.base-card__footer {
  padding-top: 0;
}
</style>