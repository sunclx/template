<template>
  <div class="tag-list">
    <span v-for="(tag, index) in displayTags" :key="tag.name" :class="[
      'tag',
      `tag--${getTagType(tag.name, index)}`
    ]" :style="getTagStyle(tag.name)">
      <i v-if="showIcon" :class="getTagIcon(tag.name)" class="tag__icon"></i>
      {{ tag.name }}
    </span>
    <span v-if="hasMoreTags" class="tag tag--more" :title="moreTagsTooltip">
      +{{ remainingCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Tag {
  name: string
  type: 'default' | 'type' | 'category'
  icon?: string
  color?: string
}

interface Props {
  tags: Tag[]
  maxDisplay?: number
  showIcon?: boolean
  colorMap?: Record<string, string>
  variant?: 'default' | 'type' | 'category'
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 6,
  showIcon: false,
  variant: 'default'
})

/**
 * 显示的标签列表
 */
const displayTags = computed(() => {
  return props.tags.slice(0, props.maxDisplay)
})

/**
 * 是否有更多标签
 */
const hasMoreTags = computed(() => {
  return props.tags.length > props.maxDisplay
})

/**
 * 剩余标签数量
 */
const remainingCount = computed(() => {
  return props.tags.length - props.maxDisplay
})

/**
 * 更多标签的提示文本
 */
const moreTagsTooltip = computed(() => {
  const remainingTags = props.tags.slice(props.maxDisplay)
  return remainingTags.join(', ')
})

/**
 * 获取标签类型
 * @param tagName - 标签名称
 * @param index - 标签索引
 * @returns 标签类型字符串
 */
const getTagType = (tagName: string, index: number): string => {
  // 首先查找对应的标签对象
  const tagObj = props.tags.find(tag => tag.name === tagName)

  // 如果找到标签对象且有明确的type属性，使用该type
  if (tagObj && tagObj.type && tagObj.type !== 'default') {
    return tagObj.type
  }

  // 如果没有明确的type，根据variant和索引位置判断
  if (props.variant === 'type' && index === 0) {
    return 'type'
  }

  if (props.variant === 'category' && index === 0) {
    return 'category'
  }

  // 默认返回default类型
  return 'default'
}

/**
 * 获取标签图标类名
 * @param tagName - 标签名称
 * @returns 图标类名字符串
 */
const getTagIcon = (tagName: string): string => {
  // 首先查找对应的标签对象
  const tagObj = props.tags.find(tag => tag.name === tagName)
  
  // 如果标签对象有自定义图标，使用自定义图标
  if (tagObj && tagObj.icon) {
    return tagObj.icon
  }
  
  // 默认使用fa-tag图标
  return 'fas fa-tag'
}

/**
 * 获取标签样式
 * @param tagName - 标签名称
 * @returns 样式对象
 */
const getTagStyle = (tagName: string) => {
  const tagObj = props.tags.find(tag => tag.name === tagName)
  const style: Record<string, string> = {}
  
  // 优先使用标签对象的color属性
  if (tagObj && tagObj.color) {
    style.color = tagObj.color
  }
  // 其次使用colorMap中的颜色
  else if (props.colorMap && props.colorMap[tagName]) {
    style.color = props.colorMap[tagName]
  }
  
  return style
}
</script>

<style scoped>
.tag-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.tag {
  background-color: var(--section-bg);
  padding: 3px 8px;
  border-radius: 16px;
  font-size: 11px;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: var(--hover-bg);
}

.tag__icon {
  font-size: 10px;
}

/* 标签变体 */
.tag--type {
  background-color: #e3f2fd;
  color: #1565c0;
}

.tag--category {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.tag--more {
  background-color: var(--border-light);
  color: var(--text-secondary);
  cursor: help;
}

.tag--more:hover {
  background-color: var(--border-emphasis);
}
</style>