<template>
  <div class="title-bar" data-tauri-drag-region>
    <div class="logo-section">
      <div class="app-logo">医</div>
      <div class="app-title">住院病历模板</div>
      <div class="menu-items">
        <MenuDropdown title="文件" :menu-items="fileMenuItems" @item-click="handleMenuItemClick" />
        <MenuDropdown title="编辑" :menu-items="editMenuItems" @item-click="handleMenuItemClick" />
        <MenuDropdown title="视图" :menu-items="viewMenuItems" @item-click="handleMenuItemClick" />
        <MenuDropdown title="帮助" :menu-items="helpMenuItems" @item-click="handleMenuItemClick" />
      </div>
    </div>
    <div class="window-controls">
      <BaseButton variant="secondary" size="small" icon="mdi:pin" class="pin-btn" @click="handleWindowAction('pin')" />
      <BaseButton variant="secondary" size="small" icon="mdi:minus" class="minimize-btn"
        @click="handleWindowAction('minimize')" />
      <BaseButton variant="secondary" size="small" icon="mdi:fullscreen" class="maximize-btn"
        @click="handleWindowAction('maximize')" />
      <BaseButton variant="danger" size="small" icon="mdi:close" class="close-btn"
        @click="handleWindowAction('close')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'
import BaseButton from './common/BaseButton.vue'
import MenuDropdown from './common/MenuDropdown.vue'
import { useTemplateStore } from '@/stores/template'
import { useResetTagsMutation } from '@/composables/useDatabase'

const templateStore = useTemplateStore();
const resetTagsMutation = useResetTagsMutation();

// 菜单数据定义
const fileMenuItems = [
  { key: 'new', label: '新建模板', icon: 'mdi:file-plus', shortcut: 'Ctrl+N' },
  { key: 'open', label: '打开模板', icon: 'mdi:folder-open', shortcut: 'Ctrl+O' },
  { key: 'reset-tags', label: '重置标签', icon: 'mdi:undo' },
  // 清空模板
  { key: 'clear-templates', label: '清空模板', icon: 'mdi:delete-empty' },
  { key: 'save', label: '保存', icon: 'mdi:content-save', shortcut: 'Ctrl+S' },
  { key: 'save-as', label: '另存为', icon: 'mdi:content-save-outline', shortcut: 'Ctrl+Shift+S' },
  { key: 'divider1', label: '', divider: true },
  { key: 'import', label: '导入模板', icon: 'mdi:file-import', shortcut: 'Ctrl+O' },
  { key: 'export', label: '导出模板', icon: 'mdi:file-export', shortcut: 'Ctrl+E' },
  { key: 'divider2', label: '', divider: true },
  { key: 'exit', label: '退出', icon: 'mdi:exit-to-app', shortcut: 'Alt+F4' }
]

const editMenuItems = [
  { key: 'undo', label: '撤销', icon: 'mdi:undo', shortcut: 'Ctrl+Z' },
  { key: 'redo', label: '重做', icon: 'mdi:redo', shortcut: 'Ctrl+Y' },
  { key: 'divider1', label: '', divider: true },
  { key: 'cut', label: '剪切', icon: 'mdi:content-cut', shortcut: 'Ctrl+X' },
  { key: 'copy', label: '复制', icon: 'mdi:content-copy', shortcut: 'Ctrl+C' },
  { key: 'paste', label: '粘贴', icon: 'mdi:content-paste', shortcut: 'Ctrl+V' },
  { key: 'divider2', label: '', divider: true },
  { key: 'select-all', label: '全选', icon: 'mdi:select-all', shortcut: 'Ctrl+A' },
  { key: 'find', label: '查找', icon: 'mdi:magnify', shortcut: 'Ctrl+F' }
]

const viewMenuItems = [
  { key: 'queryExample', label: 'TanStack Query 示例', icon: 'mdi:refresh' },
  { key: 'refresh', label: '刷新', icon: 'mdi:refresh', shortcut: 'F5' },
  { key: 'divider1', label: '', divider: true },
  { key: 'sidebar', label: '侧边栏', icon: 'mdi:menu' },
  { key: 'status-bar', label: '状态栏', icon: 'mdi:information' },
  { key: 'divider2', label: '', divider: true },
  { key: 'zoom-in', label: '放大', icon: 'mdi:magnify-plus', shortcut: 'Ctrl++' },
  { key: 'zoom-out', label: '缩小', icon: 'mdi:magnify-minus', shortcut: 'Ctrl+-' },
  { key: 'zoom-reset', label: '重置缩放', icon: 'mdi:magnify', shortcut: 'Ctrl+0' }
]

const helpMenuItems = [
  { key: 'help', label: '帮助文档', icon: 'mdi:help-circle', shortcut: 'F1' },
  { key: 'shortcuts', label: '快捷键', icon: 'mdi:keyboard' },
  { key: 'divider1', label: '', divider: true },
  { key: 'feedback', label: '反馈建议', icon: 'mdi:comment' },
  { key: 'about', label: '关于', icon: 'mdi:information' }
]

/**
 * 处理菜单项点击事件
 */
const handleMenuItemClick = (item: any) => {
  console.log(`点击菜单项: ${item.key} - ${item.label}`)
  // TODO: 实现具体菜单功能
  if (item.key === 'queryExample') {
    templateStore.toggleQueryExample()
  } else if (item.key === 'reset-tags') {
    resetTagsMutation.mutateAsync()
  } else if (item.key === 'clear-templates') {
    templateStore.clearTemplates()
  }
}

/**
 * 处理窗口操作
 */
const handleWindowAction = async (action: string) => {
  const appWindow = getCurrentWindow()

  try {
    switch (action) {
      case 'minimize':
        await appWindow.minimize()
        break
      case 'maximize':
        await appWindow.toggleMaximize()
        break
      case 'close':
        await appWindow.close()
        break
      case 'pin':
        const isAlwaysOnTop = await appWindow.isAlwaysOnTop()
        await appWindow.setAlwaysOnTop(!isAlwaysOnTop)
        break
    }
  } catch (error) {
    console.error('窗口操作失败:', error)
  }
}
</script>

<style scoped>
.title-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--title-bar-height);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  border-bottom: 1px solid var(--border-light);
  user-select: none;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-logo {
  width: 24px;
  height: 24px;
  background-color: var(--doc-primary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--doc-primary);
}

.menu-items {
  display: flex;
  gap: 8px;
  margin-left: 4px;
}

.menu-item {
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: var(--hover-bg);
  color: var(--doc-primary);
}

.window-controls {
  display: flex;
  gap: 8px;
}
</style>