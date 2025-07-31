import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { matchText } from '../utils/pinyin'
import {
  useTemplatesQuery,
  useTemplateQuery,
  useDiseasesQuery,
  useTemplateTypesQuery,
  useTagsQuery,
  // useSearchTemplatesQuery,
  useToggleFavoriteMutation,
  useSaveTemplateMutation,
  useDeleteTemplateMutation,
  useInitializeDatabaseMutation
} from '../composables/useDatabase'
import type {
  Template,
  FilterOptions,
  CategoryView,
  TemplateID
} from '../types'

/**
 * 基于TanStack Query的模板管理状态store
 */
export const useTemplateStore = defineStore('template', () => {
  // 当前视图状态
  const currentView = ref<CategoryView>('disease')
  const selectedCategory = ref<string>('all')
  const filterOptions = ref<FilterOptions>({})
  const isFilterPanelOpen = ref(false)
  const searchKeyword = ref('')
  const selectedTemplateId = ref<TemplateID>('没有')

  const isQueryExample = ref(false);
  const isEditMode = ref(false)

  // TanStack Query钩子
  // 初始化数据库
  const { mutate: initDatabase, isSuccess } = useInitializeDatabaseMutation();
  initDatabase()

  const templatesQuery = useTemplatesQuery(isSuccess);
  const { data: templatesData } = templatesQuery;
  const { data: diseasesData } = useDiseasesQuery();
  const { data: templateTypesData } = useTemplateTypesQuery();
  const { data: tagsData } = useTagsQuery();
  const { data: selectedTemplate } = useTemplateQuery(selectedTemplateId);


  const templates = computed(() => templatesData.value || [])
  const diseases = computed(() => diseasesData.value || [])
  const templateTypes = computed(() => templateTypesData.value || [])
  const tags = computed(() => tagsData.value || [])

  // 搜索查询（仅在有搜索关键词时启用）
  // const searchQuery = useSearchTemplatesQuery(searchKeyword)

  // 变更钩子
  const toggleFavoriteMutation = useToggleFavoriteMutation()
  const saveTemplateMutation = useSaveTemplateMutation()
  const deleteTemplateMutation = useDeleteTemplateMutation()

  // 计算属性 - 获取当前使用的模板数据
  const currentTemplates = computed(() => {
    // 如果有搜索关键词，使用搜索结果
    // if (searchKeyword.value && searchKeyword.value.trim().length > 0) {
    //   return searchQuery.data.value || []
    // }
    // 否则使用所有模板
    return templates.value || []
  })

  // 计算属性 - 过滤后的模板列表
  const filteredTemplates = computed(() => {
    let result = currentTemplates.value

    // 如果没有使用搜索API，则在前端进行拼音搜索
    if (searchKeyword.value && searchKeyword.value.trim().length > 0) {
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


  // 计算属性 - 过滤后的模板列表
  // const filteredDiseases = computed(() => {
  //   if (!filteredTemplates.value) {
  //     return []
  //   }
  //   const diseaseMap = new Map<string, number>();
  //   filteredTemplates.value.forEach(template => {
  //     diseaseMap.set(template.disease, (diseaseMap.get(template.disease) || 0) + 1)
  //   })
  //   return Array.from(diseaseMap.entries()).map(([name, templateCount]) => ({
  //     name,
  //     templateCount
  //   }))
  // })

  // const filteredTemplateTypes = computed(() => {
  //   if (!filteredTemplates.value) {
  //     return []
  //   }
  //   const templateTypeMap = new Map<string, number>()
  //   filteredTemplates.value.forEach(template => {
  //     templateTypeMap.set(template.templateType, (templateTypeMap.get(template.templateType) || 0) + 1)
  //   })
  //   return Array.from(templateTypeMap.entries()).map(([name, templateCount]) => ({
  //     name,
  //     templateCount
  //   }))
  // })

  // const filteredTags = computed(() => {
  //   if (!filteredTemplates.value) {
  //     return []
  //   }
  //   const tagMap = new Map<string, number>();
  //   filteredTemplates.value.forEach(template => {
  //     template.tags.forEach(tag => {
  //       tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
  //     })
  //   })
  //   return Array.from(tagMap.entries()).map(([name, templateCount]) => ({
  //     name,
  //     templateCount,
  //     color: '#007bff' // todo! 随机生成颜色
  //   }))
  // })

  // 计算属性 - 当前分类列表
  const currentCategories = computed(() => {
    switch (currentView.value) {
      case 'disease':
        return diseases
      case 'type':
        return templateTypes
      case 'tag':
        return tags || []
      default:
        return []
    }
  })

  // 计算属性 - 加载状态
  // const isLoading = computed(() => {
  //   return templatesQuery.isLoading.value ||
  //     diseasesQuery.isLoading.value ||
  //     templateTypesQuery.isLoading.value ||
  //     tagsQuery.isLoading.value ||
  //     (searchKeyword.value && searchQuery.isLoading.value)
  // })


  // 计算属性 - 错误状态
  const error = computed(() => {
    return templatesQuery.error.value
    // ||diseasesQuery.error.value ||
    //   templateTypesQuery.error.value ||
    //   tagsQuery.error.value ||
    //   searchQuery.error.value
  })

  // Actions

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
    // const template = currentTemplates.value.find(t => t.id === templateId)

    // selectedTemplate.value = template.value || null
    selectedTemplateId.value = templateId
  }

  /**
   * 切换收藏状态
   */
  const toggleFavorite = async (templateId: TemplateID) => {
    try {
      await toggleFavoriteMutation.mutateAsync(templateId)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      throw error
    }
  }

  /**
   * 保存模板
   */
  const updateTemplate = async (template: Template) => {
    try {
      await saveTemplateMutation.mutateAsync(template)
      // templatesQuery.refetch()
    } catch (error) {
      console.error('Failed to save template:', error)
      throw error
    }
  }

  /**
   * 删除模板
   */
  const deleteTemplate = async (templateId: TemplateID) => {
    try {
      await deleteTemplateMutation.mutateAsync(templateId)
      // 如果删除的是当前选中的模板，清除选择
      if (selectedTemplate.value?.id === templateId) {
        selectedTemplate.value = null
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
      throw error
    }
  }

  /**
   * 设置搜索关键词
   */
  const setSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
    // TanStack Query会自动处理响应式更新，无需手动refetch
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
   * 刷新所有数据
   */
  const refreshData = async () => {
    await Promise.all([
      templatesQuery.refetch(),
      // diseasesQuery.refetch(),
      // templateTypesQuery.refetch(),
      // tagsQuery.refetch()
    ])
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

    // 查询状态
    // isLoading,
    error,

    // 计算属性
    filteredTemplates,
    // filteredDiseases,
    // filteredTags,
    // filteredTemplateTypes,
    currentCategories,
    currentTemplates,

    // 查询对象（用于访问更详细的状态）
    templatesQuery,
    // diseasesQuery,
    // templateTypesQuery,
    // tagsQuery,
    // searchQuery,

    // 变更对象
    toggleFavoriteMutation,
    saveTemplateMutation,
    deleteTemplateMutation,

    // 方法
    switchView,
    selectCategory,
    selectTemplate,
    toggleFavorite,
    updateTemplate,
    deleteTemplate,
    setSearchKeyword,
    toggleFilterPanel,
    closeFilterPanel,
    setFilterOptions,
    refreshData,
    setEditMode,
    toggleQueryExample,
  }
})