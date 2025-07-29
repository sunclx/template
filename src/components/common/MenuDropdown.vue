<template>
  <div class="menu-dropdown" @mouseenter="showDropdown" @mouseleave="hideDropdown">
    <div class="menu-item" :class="{ active: isActive }">
      {{ title }}
    </div>
    <div v-if="isActive" class="dropdown-menu">
      <template v-for="item in menuItems" :key="item.key">
        <div v-if="item.divider" class="dropdown-divider"></div>
        <div 
          v-else
          class="dropdown-item"
          @click="handleItemClick(item)"
        >
          <i v-if="item.icon" :class="item.icon" class="item-icon"></i>
          <span class="item-text">{{ item.label }}</span>
          <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MenuItem {
  key: string
  label: string
  icon?: string
  shortcut?: string
  divider?: boolean
  action?: () => void
}

interface Props {
  title: string
  menuItems: MenuItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  itemClick: [item: MenuItem]
}>()

const isActive = ref(false)
let hideTimer: NodeJS.Timeout | null = null

/**
 * 显示下拉菜单
 */
const showDropdown = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  isActive.value = true
}

/**
 * 隐藏下拉菜单
 */
const hideDropdown = () => {
  hideTimer = setTimeout(() => {
    isActive.value = false
  }, 150)
}

/**
 * 处理菜单项点击
 */
const handleItemClick = (item: MenuItem) => {
  if (item.action) {
    item.action()
  }
  emit('itemClick', item)
  isActive.value = false
}
</script>

<style scoped>
.menu-dropdown {
  position: relative;
  display: inline-block;
}

.menu-item {
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  border-radius: 4px;
}

.menu-item:hover,
.menu-item.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  padding: 2px 0;
  margin-top: 1px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #e0e0e0;
  font-size: 13px;
}

.dropdown-item:hover {
  background-color: #404040;
}

.item-icon {
  width: 14px;
  margin-right: 8px;
  color: #888;
  font-size: 12px;
}

.item-text {
  flex: 1;
}

.item-shortcut {
  color: #888;
  font-size: 11px;
  margin-left: 8px;
}

.dropdown-divider {
  height: 1px;
  background-color: #404040;
  margin: 2px 0;
}
</style>