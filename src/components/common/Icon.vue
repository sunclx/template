<template>
  <Icon :icon="icon" :class="className" :style="style" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'

interface Props {
  icon: string
  size?: string | number
  color?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '1em'
})

/**
 * 计算样式
 */
const style = computed(() => {
  const styles: Record<string, any> = {}
  
  if (props.size) {
    styles.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
  }
  
  if (props.color) {
    styles.color = props.color
  }
  
  return styles
})
</script>