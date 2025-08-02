<template>
  <div  class="title-bar" data-tauri-drag-region>
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
      <BaseButton variant="secondary" size="small" icon="fas fa-thumbtack" class="pin-btn"
        @click="handleWindowAction('pin')" />
      <BaseButton variant="secondary" size="small" icon="fas fa-minus" class="minimize-btn"
        @click="handleWindowAction('minimize')" />
      <BaseButton variant="secondary" size="small" icon="fas fa-expand" class="maximize-btn"
        @click="handleWindowAction('maximize')" />
      <BaseButton variant="danger" size="small" icon="fas fa-times" class="close-btn"
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

const templateStore =  useTemplateStore();
const resetTagsMutation = useResetTagsMutation();

// 菜单数据定义
const fileMenuItems = [
  { key: 'new', label: '新建模板', icon: 'fas fa-file-plus', shortcut: 'Ctrl+N' },
  { key: 'open', label: '打开模板', icon: 'fas fa-folder-open', shortcut: 'Ctrl+O' },
  { key: 'reset-tags', label: '重置标签', icon: 'fas fa-undo' },
  { key: 'save', label: '保存', icon: 'fas fa-save', shortcut: 'Ctrl+S' },
  { key: 'save-as', label: '另存为', icon: 'fas fa-save', shortcut: 'Ctrl+Shift+S' },
  { key: 'divider1', label: '', divider: true },
  { key: 'import', label: '导入模板', icon: 'fas fa-file-import' },
  { key: 'export', label: '导出模板', icon: 'fas fa-file-export' },
  { key: 'divider2', label: '', divider: true },
  { key: 'exit', label: '退出', icon: 'fas fa-sign-out-alt', shortcut: 'Alt+F4' }
]

const editMenuItems = [
  { key: 'undo', label: '撤销', icon: 'fas fa-undo', shortcut: 'Ctrl+Z' },
  { key: 'redo', label: '重做', icon: 'fas fa-redo', shortcut: 'Ctrl+Y' },
  { key: 'divider1', label: '', divider: true },
  { key: 'cut', label: '剪切', icon: 'fas fa-cut', shortcut: 'Ctrl+X' },
  { key: 'copy', label: '复制', icon: 'fas fa-copy', shortcut: 'Ctrl+C' },
  { key: 'paste', label: '粘贴', icon: 'fas fa-paste', shortcut: 'Ctrl+V' },
  { key: 'divider2', label: '', divider: true },
  { key: 'select-all', label: '全选', icon: 'fas fa-check-square', shortcut: 'Ctrl+A' },
  { key: 'find', label: '查找', icon: 'fas fa-search', shortcut: 'Ctrl+F' }
]

const viewMenuItems = [
  { key: 'queryExample', label: 'TanStack Query 示例', icon: 'fas fa-sync-alt' },
  { key: 'refresh', label: '刷新', icon: 'fas fa-sync-alt', shortcut: 'F5' },
  { key: 'divider1', label: '', divider: true },
  { key: 'sidebar', label: '侧边栏', icon: 'fas fa-bars' },
  { key: 'status-bar', label: '状态栏', icon: 'fas fa-info-circle' },
  { key: 'divider2', label: '', divider: true },
  { key: 'zoom-in', label: '放大', icon: 'fas fa-search-plus', shortcut: 'Ctrl++' },
  { key: 'zoom-out', label: '缩小', icon: 'fas fa-search-minus', shortcut: 'Ctrl+-' },
  { key: 'zoom-reset', label: '重置缩放', icon: 'fas fa-search', shortcut: 'Ctrl+0' }
]

const helpMenuItems = [
  { key: 'help', label: '帮助文档', icon: 'fas fa-question-circle', shortcut: 'F1' },
  { key: 'shortcuts', label: '快捷键', icon: 'fas fa-keyboard' },
  { key: 'divider1', label: '', divider: true },
  { key: 'feedback', label: '反馈建议', icon: 'fas fa-comment' },
  { key: 'about', label: '关于', icon: 'fas fa-info-circle' }
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