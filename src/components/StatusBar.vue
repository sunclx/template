<template>
  <div class="status-bar">
    <div class="connection-status">
      <div class="status-indicator" :class="{
        connected: isConnected,
        loading: initializeDatabase.isPending.value,
        error: initializeDatabase.isError.value
      }"></div>
      <span>{{ connectionText }}</span>
      <span class="separator">|</span>
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
      <span class="separator">|</span>
      <span>{{ currentTime }}</span>
      <span class="separator">|</span>
      <span>模板管理 v1.0.0</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTemplateStore } from '../stores/template.ts'
import { useInitializeDatabaseMutation } from '../composables/useDatabase'

const templateStore = useTemplateStore()
const initializeDatabase = useInitializeDatabaseMutation()

// 响应式数据
const currentTime = ref('')
let timeInterval: number | null = null

// 计算属性
const selectedTemplate = computed(() => templateStore.selectedTemplate)
const filteredCount = computed(() => templateStore.filteredTemplates.length)
const totalCount = computed(() => templateStore.templates?.length || 0)

/**
 * 数据库连接状态
 */
const isConnected = computed(() => {
  // 基于查询状态判断连接状态
  return !initializeDatabase.isError.value && !initializeDatabase.isPending.value
})

/**
 * 连接状态文本
 */
const connectionText = computed(() => {
  if (initializeDatabase.isPending.value) {
    return '正在连接数据库...'
  }
  if (initializeDatabase.isError.value) {
    return '数据库连接失败'
  }
  return '数据库已连接'
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
    minute: '2-digit'
  })
}

/**
 * 检查数据库连接状态
 */
const checkConnection = () => {
  // 连接状态现在通过initializeDatabase自动管理
  // 如果需要手动刷新，可以调用
  // initializeDatabase.mutate()
  if (initializeDatabase.isError.value) {
    console.warn('数据库连接检查失败:', initializeDatabase.error.value)
  }
}

// 生命周期钩子
onMounted(() => {
  updateTime()

  // 每秒更新时间和检查连接状态
  timeInterval = window.setInterval(() => {
    updateTime()
    checkConnection()
  }, 60 * 1000)
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
  padding: 0 12px;
  font-size: 12px;
  color: var(--text-secondary);
  z-index: 1000;
  user-select: none;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
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

.status-indicator.loading {
  background-color: var(--warning);
  animation: pulse 1.5s ease-in-out infinite;
}

.status-indicator.error {
  background-color: var(--danger);
  animation: blink 1s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0.3;
  }
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