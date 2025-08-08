<template>
  <div class="floating-search" @mouseenter="handleMouseEnter">
    <!-- 搜索图标 -->
    <div class="search-icon-container" :class="{ expanded: isExpanded }">
      <Icon data-tauri-drag-region icon="mdi:magnify" size="50" class="search-icon" @click="handleIconClick"
        @dblclick="null" />

      <!-- 展开的搜索框 -->
      <Transition name="search-expand">
        <div v-if="isExpanded" class="search-input-container">
          <input ref="searchInputRef" v-model="searchKeyword" type="text" placeholder="搜索模板..." class="search-input"
            @input="handleSearch" @focus="handleInputFocus" @blur="handleInputBlur" />

          <!-- 搜索结果下拉列表 -->
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
            <!-- <Icon icon="mdi:magnify" size="16" /> -->
            <span>未找到匹配的模板</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTemplateStore } from '../stores/template'
import { matchText } from '../utils/pinyin'
import Icon from './common/Icon.vue'
import type { Template } from '../types'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { getMousePosition } from '../services/mouse'

const templateStore = useTemplateStore()

// 组件状态
const isExpanded = ref(false)
const searchKeyword = ref('')
const searchResults = ref<Template[]>([])
const searchInputRef = ref<HTMLInputElement>()
const isInputFocused = ref(false)

// 获取所有模板
const { templates } = storeToRefs(templateStore)

import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
const handleIconClick = async () => {

  const webview = new WebviewWindow('main', {
    url: 'index.html'
  });
  webview.once('tauri://created', function () {
    // webview successfully created
  });
  webview.once('tauri://error', function () {
    // an error happened creating the webview
  });
  if (isExpanded.value) {
    collapseSearch()
  } else {
    isExpanded.value = true
    // 
    // 延迟聚焦输入框，等待动画完成
    nextTick(() => {
      searchInputRef.value?.focus()
      // setTimeout(() => {
      //   if (searchInputRef.value && isExpanded.value) {
      //     searchInputRef.value.focus()
      //   }
      // }, 200)
    })
  }
}

/**
 * 处理鼠标进入事件
 */
const handleMouseEnter = () => {
  isExpanded.value = true
  // 延迟聚焦输入框，等待动画完成
  nextTick(() => {
    setTimeout(() => {
      if (searchInputRef.value && isExpanded.value) {
        searchInputRef.value.focus()
      }
    }, 200)
  })
}

/**
 * 处理鼠标离开事件
 */
// const handleMouseLeave = () => {
//   // 如果输入框没有焦点，则收起搜索框
//   if (!isInputFocused.value) {
//     collapseSearch()
//   }
// }

/**
 * 处理输入框获得焦点
 */
const handleInputFocus = () => {
  isInputFocused.value = true
}

/**
 * 处理输入框失去焦点
 */
const handleInputBlur = () => {
  isInputFocused.value = false
  if (!searchKeyword.value) {
    // 延迟隐藏结果，给用户时间点击结果项
    setTimeout(() => {
      // showResults.value = false
      collapseSearch()
    }, 200)
  }
}

/**
 * 收起搜索框
 */
const collapseSearch = () => {
  isExpanded.value = false
  searchKeyword.value = ''
  searchResults.value = []
  // showResults.value = false
}

/**
 * 处理搜索输入
 */
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    searchResults.value = []
    return
  }

  const results = templates.value.filter(template => {
    // 搜索模板标题
    if (matchText(template.title, keyword)) {
      return true
    }

    // 搜索模板内容
    return template.sections.some(section =>
      matchText(section.title, keyword) ||
      matchText(section.content, keyword)
    )
  }).slice(0, 8) // 限制前8个结果

  searchResults.value = results
}

/**
 * 选择模板
 */
const selectTemplate = (template: Template) => {
  templateStore.selectTemplate(template.id)
  collapseSearch()
  // 可以添加其他选择模板后的操作，比如打开主窗口
}

// 监听搜索关键词变化
watch(searchKeyword, handleSearch)

// 判断某点是否透明
function isTransparent(x: number, y: number): boolean {
  // 获取canvas快照并判断像素透明度
  const el = document.elementFromPoint(x, y);
  if (!el) return true;
  // 这里简单判断，如果是透明div返回true，否则false
  // 更精细可用canvas 2d context getImageData判定
  // console.log(el)
  if (el.id == "app") {
    return true
  }
  return false
  // const style = window.getComputedStyle(el);
  // console.log(style.backgroundColor, style.backgroundColor === 'rgba(0, 0, 0, 0)')
  // return style.pointerEvents === 'none' || style.opacity === '0' || style.backgroundColor === 'rgba(0, 0, 0, 0)';
}


// let ignoreTimer: NodeJS.Timeout | undefined = undefined;
let ignoring = false
// const _handleMouseMove = async (e: MouseEvent) => {
//   const win = getCurrentWebviewWindow()
//   const transparent = isTransparent(e.clientX, e.clientY)
//   // 假设 isTransparent 判断该点是否透明
//   if (transparent && ignoring) {
//     // clearTimeout(ignoreTimer);
//     await win.setIgnoreCursorEvents(true);
//     // 穿透一小会儿后自动恢复，否则监听不到事件
//     setTimeout(async () => {
//       await win.setIgnoreCursorEvents(false);
//       ignoring = false
//     }, 30); // 15ms内恢复
//   } else if (!transparent && ignoring) {
//     await win.setIgnoreCursorEvents(false);
//     ignoring = false
//   }

// }



onMounted(async () => {
  const win = getCurrentWebviewWindow();
  ignoring = true
  await win.setIgnoreCursorEvents(ignoring);
  setInterval(async () => {
    const position = await getMousePosition()
    if (position) {
      const x = position.clientX / window.devicePixelRatio - window.screenX;
      const y = position.clientY / window.devicePixelRatio - window.screenY;
      // console.log(x, y)
      const transparent = isTransparent(x, y)
      // 假设 isTransparent 判断该点是否透明
      if (transparent && !ignoring) {
        await win.setIgnoreCursorEvents(true);
        ignoring = true
        console.log("忽略", x, y)
        // clearTimeout(ignoreTimer);
        // await win.setIgnoreCursorEvents(true);
        // 穿透一小会儿后自动恢复，否则监听不到事件
      } else if (!transparent && ignoring) {
        await win.setIgnoreCursorEvents(false);
        ignoring = false
        console.log("恢复", x, y)
      }
    }
  }, 200)
  // document.addEventListener('mousemove', handleMouseMove);

});

onUnmounted(() => {
  // 移除鼠标移动事件监听
  // document.removeEventListener('mousemove', handleMouseMove);
});

</script>

<style scoped>
.floating-search {
  position: fixed;
  top: 1px;
  right: 1px;
  z-index: 9999;
}

.search-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 50px;
  height: 50px;
  /* padding: 0 15px; */
}

.search-icon-container:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.search-icon-container.expanded {
  min-width: 200px;
  border-radius: 25px;

}

.search-icon {
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  /* display: flex; */
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input-container {
  position: relative;
  flex: 1;
  margin-right: 10px;
}

.search-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  padding: 20px;
}

.search-input::placeholder {
  color: #999;
}

.search-results {
  position: absolute;
  width: calc(100% + 58px);
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
}

.search-result-item {
  padding: 12px 16px;
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
  position: absolute;
  width: calc(100% + 58px);
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 300px;
  overflow-y: auto;
  padding: 12px 16px;
}

/* 动画效果 */
.search-expand-enter-active,
.search-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-expand-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.search-expand-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 滚动条样式 */
.search-results::-webkit-scrollbar {
  width: 4px;
}

.search-results::-webkit-scrollbar-track {
  background: transparent;
}

.search-results::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>