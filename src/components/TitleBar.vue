<template>
  <div class="title-bar">
    <div class="logo-section">
      <div class="app-logo">医</div>
      <div class="app-title">住院病历模板管理系统</div>
      <div class="menu-items">
        <div class="menu-item" @click="handleMenuClick('file')">文件</div>
        <div class="menu-item" @click="handleMenuClick('edit')">编辑</div>
        <div class="menu-item" @click="handleMenuClick('view')">视图</div>
        <div class="menu-item" @click="handleMenuClick('help')">帮助</div>
      </div>
    </div>
    <div class="window-controls">
      <div class="window-btn pin-btn" @click="handleWindowAction('pin')">
        <i class="fas fa-thumbtack"></i>
      </div>
      <div class="window-btn minimize-btn" @click="handleWindowAction('minimize')">
        <i class="fas fa-minus"></i>
      </div>
      <div class="window-btn maximize-btn" @click="handleWindowAction('maximize')">
        <i class="fas fa-expand"></i>
      </div>
      <div class="window-btn close-btn" @click="handleWindowAction('close')">
        <i class="fas fa-times"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'

/**
 * 处理菜单点击事件
 */
const handleMenuClick = (menu: string) => {
  console.log(`点击菜单: ${menu}`)
  // TODO: 实现菜单功能
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
        const isMaximized = await appWindow.isMaximized()
        if (isMaximized) {
          await appWindow.unmaximize()
        } else {
          await appWindow.maximize()
        }
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
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  border-bottom: 1px solid var(--border-light);
  user-select: none;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo {
  width: 30px;
  height: 30px;
  background-color: var(--doc-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--doc-primary);
}

.menu-items {
  display: flex;
  gap: 25px;
  margin-left: 30px;
}

.menu-item {
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: var(--hover-bg);
  color: var(--doc-primary);
}

.window-controls {
  display: flex;
  gap: 15px;
}

.window-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.window-btn:hover {
  background-color: var(--hover-bg);
}

.minimize-btn:hover {
  color: var(--warning);
}

.maximize-btn:hover {
  color: var(--success);
}

.close-btn:hover {
  background-color: var(--danger);
  color: white;
}

.pin-btn:hover {
  color: var(--doc-primary);
}
</style>