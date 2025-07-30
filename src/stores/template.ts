import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { matchText } from '../utils/pinyin'
import { DatabaseService } from '../services/database'
import type {
    Template,
    FilterOptions,
    CategoryView,
    TemplateID
} from '../types'
import { set } from '@vueuse/core'

/**
 * 模板管理状态store
 */
export const useTemplateStore = defineStore('template', () => {
    // 状态数据
    const templates = ref<Template[]>([])


    // 当前视图状态
    const currentView = ref<CategoryView>('disease')
    const selectedTemplate = ref<Template | null>(null)
    const selectedCategory = ref<string>('all')
    const filterOptions = ref<FilterOptions>({})
    const isFilterPanelOpen = ref(false)
    const searchKeyword = ref('')
    const isQueryExample = ref(false);

    // 编辑模式
    const isEditMode = ref(false)

    // 计算属性 - 过滤后的模板列表
    const diseases = computed(() => {
        const diseaseMap = new Map<string, number>()
        templates.value.forEach(template => {
            diseaseMap.set(template.disease, (diseaseMap.get(template.disease) || 0) + 1)
        })
        return Array.from(diseaseMap.entries()).map(([name, templateCount]) => ({
            name,
            templateCount
        }))
    })

    const templateTypes = computed(() => {
        const templateTypeMap = new Map<string, number>()
        templates.value.forEach(template => {
            templateTypeMap.set(template.templateType, (templateTypeMap.get(template.templateType) || 0) + 1)
        })
        return Array.from(templateTypeMap.entries()).map(([name, templateCount]) => ({
            name,
            templateCount
        }))
    })

    const tags = computed(() => {
        const tagMap = new Map<string, number>()
        templates.value.forEach(template => {
            template.tags.forEach(tag => {
                tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
            })
        })
        return Array.from(tagMap.entries()).map(([name, templateCount]) => ({
            name,
            templateCount,
            color: '#007bff' // todo! 随机生成颜色
        }))
    })
    // 计算属性 - 过滤后的模板列表
    const filteredTemplates = computed(() => {
        let result = templates.value

        // 按搜索关键词过滤（支持拼音搜索）
        if (searchKeyword.value) {
            const keyword = searchKeyword.value.trim()
            result = result.filter(template => {
                // 搜索模板标题
                if (matchText(template.title, keyword)) {
                    return true
                }

                // 搜索模板内容
                return template.sections.some(section =>
                    matchText(section.title, keyword) ||
                    matchText(section.content, keyword)
                )
            })
        }

        // 按分类过滤
        if (selectedCategory.value !== 'all') {
            switch (currentView.value) {
                case 'disease':
                    result = result.filter(template => template.disease === selectedCategory.value)
                    break
                case 'type':
                    result = result.filter(template => template.templateType === selectedCategory.value)
                    break
                case 'tag':
                    result = result.filter(template => template.tags.includes(selectedCategory.value))
                    break
            }
        }

        // 按筛选条件过滤
        if (filterOptions.value.isFavorite) {
            result = result.filter(template => template.isFavorite)
        }

        // 按病种筛选（多选）
        if (filterOptions.value.disease && filterOptions.value.disease.length > 0) {
            result = result.filter(template =>
                filterOptions.value.disease!.includes(template.disease)
            )
        }

        // 按模板类型筛选（多选）
        if (filterOptions.value.templateType && filterOptions.value.templateType.length > 0) {
            result = result.filter(template =>
                filterOptions.value.templateType!.includes(template.templateType)
            )
        }

        // 按标签筛选（多选）
        if (filterOptions.value.tags && filterOptions.value.tags.length > 0) {
            result = result.filter(template =>
                filterOptions.value.tags!.some(tag => template.tags.includes(tag))
            )
        }

        return result
    })

    // 计算属性 - 当前分类列表
    const currentCategories = computed(() => {
        switch (currentView.value) {
            case 'disease':
                return diseases.value
            case 'type':
                return templateTypes.value
            case 'tag':
                return tags.value
            default:
                return []
        }
    })

    // Actions

    /**
     * 从数据库加载数据
     */
    const loadDataFromDatabase = async () => {
        try {
            // // 加载疾病分类
            // const diseasesData = await DatabaseService.getAllDiseases()
            // diseases.value = diseasesData.map(d => ({
            //     id: d.id,
            //     name: d.name,
            //     templateCount: d.templateCount
            // }))

            // // 加载模板类型
            // const templateTypesData = await DatabaseService.getAllTemplateTypes()
            // templateTypes.value = templateTypesData.map(t => ({
            //     id: t.id,
            //     name: t.name,
            //     templateCount: t.templateCount
            // }))

            // 加载标签
            // const tagsData = await DatabaseService.getAllTags()
            // tags.value = tagsData



            // 加载模板
            const templatesData = await DatabaseService.getAllTemplates()
            templates.value = templatesData

            console.log('Data loaded from database successfully')
        } catch (error) {
            console.error('Failed to load data from database:', error)
            // 如果数据库加载失败，可以考虑使用默认数据或显示错误信息
        }
    }

    /**
     * 切换分类视图
     */
    const switchView = (view: CategoryView) => {
        currentView.value = view
        selectedCategory.value = 'all'
        selectedTemplate.value = null
    }

    /**
     * 选择分类
     */
    const selectCategory = (categoryId: string) => {
        selectedCategory.value = categoryId
        selectedTemplate.value = null

        // 自动选择第一个模板（如果有的话）
        setTimeout(() => {
            const filtered = filteredTemplates.value
            if (filtered.length > 0) {
                selectedTemplate.value = filtered[0]
            }
        }, 0)
    }

    /**
     * 选择模板
     */
    const selectTemplate = (templateId: TemplateID) => {
        const template = templates.value.find(t => t.id === templateId)
        selectedTemplate.value = template || null
    }

    /**
     * 切换收藏状态
     */
    const toggleFavorite = async (templateId: TemplateID) => {
        try {
            await DatabaseService.toggleTemplateFavorite(templateId)
            // 重新加载模板数据以反映更改
            const templatesData = await DatabaseService.getAllTemplates()
            templates.value = templatesData
        } catch (error) {
            console.error('Failed to toggle favorite:', error)
        }
    }

    /**
     * 更新模板
     */
    const updateTemplate = async (template: Template) => {
        try {
            await DatabaseService.saveTemplate(template)
            // 重新加载模板数据以反映更改
            const templatesData = await DatabaseService.getAllTemplates()
            templates.value = templatesData

            // 更新当前选中的模板
            if (selectedTemplate.value && selectedTemplate.value.id === template.id) {
                selectedTemplate.value = template
            }
        } catch (error) {
            console.error('Failed to update template:', error)
            throw error
        }
    }

    /**
     * 创建新模板
     */
    const createTemplate = async (templateData: Partial<Template>) => {
        try {
            // 创建新模板的完整数据
            // todo!
            const newTemplate: Template = {
                id: `template_${Date.now()}`,
                title: templateData.title || '新建模板',
                sections: templateData.sections || [
                    {
                        id: `section_${Date.now()}`,
                        title: '主诉',
                        content: ''
                    },
                    {
                        id: `section_${Date.now() + 1}`,
                        title: '现病史',
                        content: ''
                    },
                    {
                        id: `section_${Date.now() + 2}`,
                        title: '既往史',
                        content: ''
                    }
                ],
                disease: templateData.disease || diseases.value[0]?.name || '未分类',
                templateType: templateData.templateType || templateTypes.value[0]?.name || '未分类',
                tags: templateData.tags || [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                isFavorite: templateData.isFavorite || false
            }

            // 保存到数据库
            await DatabaseService.saveTemplate(newTemplate)

            // 重新加载模板数据
            const templatesData = await DatabaseService.getAllTemplates()
            templates.value = templatesData

            // 选择新创建的模板
            selectedTemplate.value = newTemplate

            return newTemplate
        } catch (error) {
            console.error('Failed to create template:', error)
            throw error
        }
    }

    /**
     * 设置搜索关键词
     */
    const setSearchKeyword = (keyword: string) => {
        searchKeyword.value = keyword
    }

    /**
     * 切换筛选面板
     */
    const toggleFilterPanel = () => {
        isFilterPanelOpen.value = !isFilterPanelOpen.value
    }

    /**
     * 关闭筛选面板
     */
    const closeFilterPanel = () => {
        isFilterPanelOpen.value = false
    }

    /**
     * 设置筛选选项
     */
    const setFilterOptions = (options: Partial<FilterOptions>) => {
        filterOptions.value = { ...filterOptions.value, ...options }
    }


    /**
     * 设置编辑模式
     */
    const setEditMode = (isEdit: boolean) => {
        isEditMode.value = isEdit
    }
    const toggleQueryExample = () => {
        isQueryExample.value = !isQueryExample.value;
    }
    return {
        // 状态
        templates,
        diseases,
        templateTypes,
        tags,
        currentView,
        selectedTemplate,
        selectedCategory,
        filterOptions,
        isFilterPanelOpen,
        searchKeyword,
        isEditMode,
        isQueryExample,

        // 计算属性
        filteredTemplates,
        currentCategories,

        // 方法
        loadDataFromDatabase,
        switchView,
        selectCategory,
        selectTemplate,
        toggleFavorite,
        updateTemplate,
        createTemplate,
        setSearchKeyword,
        toggleFilterPanel,
        closeFilterPanel,
        setFilterOptions,
        setEditMode,
        toggleQueryExample
    }
})