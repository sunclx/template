<template>
  <div class="floating-widget" @mouseenter="showMenu" @mouseleave="hideMenu">
    <!-- 圆形图标 -->
    <div data-tauri-drag-region class="floating-icon" :class="{ expanded: isMenuVisible }" @click="toggleMainWindow">
      <Icon data-tauri-drag-region icon="mdi:account-circle" size="32" />
    </div>

    <!-- 展开的菜单面板 -->
    <Transition name="menu-fade">
      <div v-if="isMenuVisible" class="menu-panel">
        <!-- 菜单项 -->
        <div class="menu-items">
          <div class="menu-item" @click="handleMenuClick('call')">
            <Icon icon="mdi:phone" size="16" />
            <span>语音通话</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('screen')">
            <Icon icon="mdi:monitor-share" size="16" />
            <span>共享应用或屏幕</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('meeting')">
            <Icon icon="mdi:record-circle" size="16" />
            <span>记录会议</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('question')">
            <Icon icon="mdi:help-circle" size="16" />
            <span>截图提问</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('translate')">
            <Icon icon="mdi:translate" size="16" />
            <span>实时双语字幕</span>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-section">
          <div class="search-input-wrapper">
            <Icon icon="mdi:magnify" size="16" class="search-icon" />
            <input v-model="searchKeyword" type="text" placeholder="问豆包..." class="search-input"
              @input="handleSearch" />
          </div>

          <!-- 搜索结果 -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="template in searchResults" :key="template.id" class="search-result-item"
              @click="selectTemplate(template)">
              <div class="template-title">{{ template.title }}</div>
              <div class="template-meta">
                <span class="template-disease">{{ template.disease }}</span>
                <span class="template-type">{{ template.templateType }}</span>
              </div>
            </div>
          </div>

          <!-- 无结果提示 -->
          <div v-if="searchKeyword && searchResults.length === 0" class="no-results">
            <Icon icon="mdi:magnify" size="24" />
            <span>未找到匹配的模板</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { WebviewWindow, getCurrentWebviewWindow } from '@tauri-apps/api/webviewwindow'

import { useTemplateStore } from '../stores/template'
import { matchText } from '../utils/pinyin'
import Icon from './common/Icon.vue'
import type { Template } from '../types'

const templateStore = useTemplateStore()

// 组件状态
const isMenuVisible = ref(false)
const searchKeyword = ref('')
const searchResults = ref<Template[]>([])

// 获取所有模板
const { templates } = templateStore

/**
 * 显示菜单
 */
const showMenu = () => {
  isMenuVisible.value = true
}

/**
 * 隐藏菜单
 */
const hideMenu = () => {
  // 延迟隐藏，给用户时间操作菜单
  setTimeout(() => {
    isMenuVisible.value = false
    searchKeyword.value = ''
    searchResults.value = []
  }, 500)
}

/**
 * 切换主窗口可见性
 */
const toggleMainWindow = async () => {
  const appWindow = new WebviewWindow('main');
  const isVisible = await appWindow.isVisible();
  if (isVisible) {
    await appWindow.hide();
  } else {
    await appWindow.show();
  }
}

/**
 * 处理菜单项点击
 */
const handleMenuClick = (action: string) => {
  console.log(`点击菜单项: ${action}`)
  // TODO: 实现具体的菜单功能
}

/**
 * 处理搜索输入
 */
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  const keyword = searchKeyword.value.trim()
  const results = templates.filter(template => {
    // 搜索模板标题
    if (matchText(template.title, keyword)) {
      return true
    }

    // 搜索模板内容
    return template.sections.some(section =>
      matchText(section.title, keyword) ||
      matchText(section.content, keyword)
    )
  }).slice(0, 10) // 限制前10个结果

  searchResults.value = results
}

/**
 * 选择模板
 */
const selectTemplate = (template: Template) => {
  templateStore.selectTemplate(template.id)
  // 隐藏菜单
  isMenuVisible.value = false
  searchKeyword.value = ''
  searchResults.value = []
}

// 监听搜索关键词变化
watch(searchKeyword, handleSearch)

onMounted(async () => {
  // 初始化时隐藏菜单
  const appWindow = getCurrentWebviewWindow();
  await appWindow.setIgnoreCursorEvents(true);
})
</script>
<style></style>


<style scoped>
.floating-widget {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 9999;
}

.floating-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.floating-icon.expanded {
  transform: scale(0.9);
}

.menu-panel {
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.menu-items {
  margin-bottom: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #333;
}

.menu-item:hover {
  background-color: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.search-section {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 16px;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.search-input::placeholder {
  color: #999;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.search-result-item:hover {
  background-color: rgba(102, 126, 234, 0.05);
}

.search-result-item:last-child {
  border-bottom: none;
}

.template-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.4;
}

.template-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.template-disease,
.template-type {
  padding: 2px 6px;
  background-color: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  font-size: 11px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: #999;
  font-size: 14px;
}

/* 动画效果 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-fade-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(20px) scale(0.9);
}

.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(20px) scale(0.9);
}

/* 滚动条样式 */
.menu-panel::-webkit-scrollbar,
.search-results::-webkit-scrollbar {
  width: 4px;
}

.menu-panel::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.menu-panel::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.menu-panel::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>