<template>
  <div class="status-bar">
    <div class="connection-status">
      <div class="status-indicator" :class="{ connected: isConnected }"></div>
      <span>{{ connectionText }}</span>
    </div>
    
    <div class="template-info">
      <span v-if="selectedTemplate">
        已选择: {{ selectedTemplate.title }}
      </span>
      <span v-if="filteredCount !== totalCount">
        显示 {{ filteredCount }} / {{ totalCount }} 个模板
      </span>
      <span v-else>
        共 {{ totalCount }} 个模板
      </span>
    </div>
    
    <div class="system-info">
      <span>{{ currentTime }}</span>
      <span class="separator">|</span>
      <span>医疗模板管理系统 v1.0.0</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTemplateStore } from '../stores/template'

const templateStore = useTemplateStore()

// 响应式数据
const isConnected = ref(true)
const currentTime = ref('')
let timeInterval: number | null = null

// 计算属性
const selectedTemplate = computed(() => templateStore.selectedTemplate)
const filteredCount = computed(() => templateStore.filteredTemplates.length)
const totalCount = computed(() => templateStore.templates.length)

const connectionText = computed(() => {
  return isConnected.value ? '数据库已连接' : '数据库连接断开'
})

/**
 * 更新当前时间
 */
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 模拟连接状态检查
 */
const checkConnection = () => {
  // 这里可以实现真实的连接状态检查
  // 目前模拟为始终连接
  isConnected.value = true
}

// 生命周期钩子
onMounted(() => {
  updateTime()
  checkConnection()
  
  // 每秒更新时间
  timeInterval = window.setInterval(() => {
    updateTime()
    checkConnection()
  }, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--status-bar-height);
  background-color: white;
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 13px;
  color: var(--text-secondary);
  z-index: 1000;
  user-select: none;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--danger);
  transition: background-color 0.3s;
}

.status-indicator.connected {
  background-color: var(--success);
}

.template-info {
  display: flex;
  gap: 20px;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.template-info span {
  white-space: nowrap;
}

.system-info {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 200px;
  justify-content: flex-end;
}

.separator {
  color: var(--border-light);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .template-info {
    gap: 15px;
  }
  
  .system-info {
    min-width: 150px;
  }
}

@media (max-width: 900px) {
  .status-bar {
    padding: 0 15px;
    font-size: 12px;
  }
  
  .template-info {
    gap: 10px;
  }
  
  .template-info span:nth-child(2) {
    display: none;
  }
}
</style>