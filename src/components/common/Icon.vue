<template>
  <component :is="iconComponent" :class="className" :style="style" v-bind="iconProps" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { getIconComponent, hasIcon } from './icons'

interface Props {
  /** 图标名称，支持两种格式：
   * 1. unplugin-icons格式: 'mdi:home', 'carbon:add', 'tabler:user'
   * 2. iconify格式: 'mdi-home', 'carbon-add' (兼容模式)
   */
  icon: string
  /** 图标大小 */
  size?: string | number
  /** 图标颜色 */
  color?: string
  /** 自定义类名 */
  className?: string
  /** 是否使用离线模式，默认true */
  offline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: '1em',
  offline: true
})

/**
 * 获取图标组件和属性
 */
const iconComponent = computed(() => {
  if (!props.offline) {
    // 在线模式，使用@iconify/vue
    return Icon
  }

  // 离线模式，从注册表获取图标
  const iconName = props.icon

  // 检查是否为unplugin-icons格式 (collection:name)
  if (iconName.includes(':')) {
    const offlineIcon = getIconComponent(iconName)
    if (offlineIcon) {
      return offlineIcon
    }
  } else {
    // 兼容旧格式，尝试转换为mdi格式
    const mdiIconName = `mdi:${iconName.replace(/^mdi-/, '')}`
    const offlineIcon = getIconComponent(mdiIconName)
    if (offlineIcon) {
      return offlineIcon
    }
  }

  // 如果离线图标不存在，fallback到在线模式
  console.warn(`离线图标 ${iconName} 未找到，使用在线模式`)
  return Icon
})

/**
 * 图标属性
 */
const iconProps = computed(() => {
  // 如果使用在线模式或者离线图标不存在，需要传递icon属性
  if (!props.offline || !hasIcon(props.icon)) {
    return { icon: props.icon }
  }
  // 离线图标不需要额外属性
  return {}
})

/**
 * 计算样式
 */
const style = computed(() => {
  const styles: Record<string, any> = {}

  if (props.size) {
    styles.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
    styles.width = typeof props.size === 'number' ? `${props.size}px` : props.size
    styles.height = typeof props.size === 'number' ? `${props.size}px` : props.size
  }

  if (props.color) {
    styles.color = props.color
  }

  return styles
})
</script>