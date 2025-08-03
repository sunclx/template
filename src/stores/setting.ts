import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 模板管理状态store
 */
export const useTemplateStore = defineStore('template', () => {
    // 状态数据
    const isMainShow = ref(true);
    const isFloatShow = ref(false);

    // 方法
    const toggleMainShow = () => {
        isMainShow.value = !isMainShow.value;
    }
    const toggleFloatShow = () => {
        isFloatShow.value = !isFloatShow.value;
    }
    const toggleAllShow = () => {
        isMainShow.value = true;
        isFloatShow.value = true;
    }
    const toggleNoneShow = () => {
        isMainShow.value = false;
        isFloatShow.value = false;
    }



    return {
        // 状态
        isMainShow,
        isFloatShow,

        // 计算属性


        // 方法
        toggleMainShow,
        toggleFloatShow,
        toggleAllShow,
        toggleNoneShow,
    }
})