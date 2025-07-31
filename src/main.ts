import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import App from "./App.vue";

// 创建Vue应用实例
const app = createApp(App);

// 创建并使用Pinia状态管理
const pinia = createPinia();
app.use(pinia);

// 创建TanStack Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // 查询失败时重试3次
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避重试延迟
      refetchOnWindowFocus: true, // 窗口聚焦时不自动重新获取
      staleTime: 5 * 60 * 1000, // 默认5分钟内数据被认为是新鲜的
    },
    mutations: {
      retry: 1, // 变更失败时重试1次
    },
  },
});

// 使用TanStack Query插件
app.use(VueQueryPlugin, {
  queryClient,
});

// 挂载应用
app.mount("#app");
