<template>
    <div class="app-container">
        <!-- 标题栏 -->
        <TitleBar />
        <VueQueryDevtools />


        <!-- TanStack Query 示例页面 -->
        <div class="tanstack-container" v-if="isQueryExample">
            <TemplateQueryExample />
        </div>
        <!-- 主内容区域 -->
        <div class="main-container" v-else>
            <!-- 左侧边栏 -->
            <Sidebar />

            <!-- 中间列表区域 -->
            <TemplateList />

            <!-- 右侧详情区域 -->
            <TemplateDetail />
        </div>
        <!-- 视图切换按钮 -->
        <!-- <div class="view-switcher">
            <button @click="currentView = 'original'" :class="{ active: currentView === 'original' }" class="view-btn">
                原始界面
            </button>
            <button @click="currentView = 'tanstack'" :class="{ active: currentView === 'tanstack' }" class="view-btn">
                TanStack Query 示例
            </button>
        </div> -->
        <!-- 底部状态栏 -->
        <StatusBar />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import TemplateList from './components/TemplateList.vue'
import TemplateDetail from './components/TemplateDetail.vue'
import StatusBar from './components/StatusBar.vue'
import TemplateQueryExample from './components/TemplateQueryExample.vue'

import { useTemplateStore } from './stores/template.ts'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'


// 初始化状态管理
const templateStore = useTemplateStore()
const isQueryExample = computed(() => templateStore.isQueryExample);

/**
 * 组件挂载时初始化数据库和加载数据
 */
// onMounted(async () => {
//     try {
//         console.log('正在初始化数据库...')
//         useInitializeDatabaseMutation();

//         console.log('数据加载完成')
//     } catch (error) {
//         console.error('初始化失败:', error)
//     }
// })
</script>

<style>
:root {
    /* 主色调 */
    --doc-primary: #2e4ab8;
    --doc-secondary: #5c7cfa;

    /* 背景色 */
    --doc-bg: #f8faff;
    --section-bg: #edf2ff;
    --card-bg: #ffffff;

    /* 文字色 */
    --text-main: #1a237e;
    --text-secondary: #37474f;
    --text-label: #546e7a;

    /* 交互状态色 */
    --border-light: #cfd8dc;
    --border-emphasis: #90caf9;
    --hover-bg: #e3eaff;
    --active-bg: #d6e0ff;

    /* 功能状态色 */
    --success: #4caf50;
    --warning: #ff9800;
    --danger: #e53935;

    /* 尺寸 */
    --title-bar-height: 40px;
    --status-bar-height: 20px;
    --sidebar-width: 180px;
    --middle-list-width: 260px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

body {
    background-color: var(--doc-bg);
    color: var(--text-main);
    overflow: hidden;
}

.app-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.view-switcher {
    display: flex;
    gap: 10px;
    padding: 10px 20px;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-light);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.view-btn {
    padding: 8px 16px;
    border: 1px solid var(--border-light);
    background: var(--card-bg);
    color: var(--text-secondary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
}

.view-btn:hover {
    background: var(--hover-bg);
    border-color: var(--border-emphasis);
}

.view-btn.active {
    background: var(--doc-primary);
    color: white;
    border-color: var(--doc-primary);
}

.main-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    height: calc(100vh - var(--title-bar-height) - var(--status-bar-height) - 60px);
    margin-top: var(--title-bar-height);
    margin-bottom: var(--status-bar-height);
}

.tanstack-container {
    flex: 1;
    overflow: auto;
    height: calc(100vh - var(--title-bar-height) - var(--status-bar-height) - 60px);
    margin-top: var(--title-bar-height);
    margin-bottom: var(--status-bar-height);
    background: var(--doc-bg);
}
</style>