import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRef, Ref } from 'vue'
import { DatabaseService, get_all_templates_sample } from '../services/database'
import type { Template, Tag } from '../types'

/**
 * 查询键常量
 */
export const QUERY_KEYS = {
  templates: ['templates'] as const,
  template: (id: MaybeRef<string>) => ['template', id] as const,
  diseases: ['diseases'] as const,
  templateTypes: ['templateTypes'] as const,
  tags: ['tags'] as const,
  search: (keyword: MaybeRef<string>) => ['search', keyword] as const,
} as const

/**
 * 获取所有模板的查询钩子
 */
export function useTemplatesQuery(enabled: MaybeRef<boolean> = true) {
  return useQuery({
    queryKey: QUERY_KEYS.templates,
    queryFn: () => DatabaseService.getAllTemplates(),
    enabled,
  })
}

/**
 * 根据ID获取模板的查询钩子
 */
export function useTemplateQuery(id: Ref<string>) {
  return useQuery({
    queryKey: QUERY_KEYS.template(id),
    queryFn: () => DatabaseService.getTemplateById(id.value),
    enabled: !!id.value, // 只有当id存在时才执行查询
  })
}

/**
 * 搜索模板的查询钩子
 */
export function useSearchTemplatesQuery(keyword: Ref<string>) {
  return useQuery({
    queryKey: computed(() => QUERY_KEYS.search(keyword.value)),
    queryFn: () => DatabaseService.searchTemplates(keyword.value),
    enabled: computed(() => !!keyword.value && keyword.value.trim().length > 0), // 只有当关键词存在时才执行查询
  })
}

/**
 * 获取所有疾病分类的查询钩子
 */
export function useDiseasesQuery(enabled: MaybeRef<boolean> = true) {
  return useQuery({
    queryKey: QUERY_KEYS.diseases,
    queryFn: () => DatabaseService.getAllDiseases(),
    enabled,
  })
}

/**
 * 获取所有模板类型的查询钩子
 */
export function useTemplateTypesQuery(enabled: MaybeRef<boolean> = true) {
  return useQuery({
    queryKey: QUERY_KEYS.templateTypes,
    queryFn: () => DatabaseService.getAllTemplateTypes(),
    enabled,
  })
}

/**
 * 获取所有标签的查询钩子
 */
export function useTagsQuery(enabled: MaybeRef<boolean> = true) {
  return useQuery({
    queryKey: QUERY_KEYS.tags,
    queryFn: () => DatabaseService.getAllTags(),
    enabled,
  })
}

/**
 * 保存模板的变更钩子
 */
export function useSaveTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (template: Template) => DatabaseService.saveTemplate(template),
    onSuccess: () => {
      // 保存成功后，使相关查询失效以触发重新获取
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.diseases })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templateTypes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags })
    },
  })
}

/**
 * 删除模板的变更钩子
 */
export function useDeleteTemplateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => DatabaseService.deleteTemplate(id),
    onSuccess: (_, deletedId) => {
      // 删除成功后，移除特定模板的缓存并使模板列表失效
      queryClient.removeQueries({ queryKey: QUERY_KEYS.template(deletedId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.diseases })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templateTypes })
    },
  })
}

/**
 * 切换模板收藏状态的变更钩子
 */
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => DatabaseService.toggleTemplateFavorite(id),
    onSuccess: (_, templateId) => {
      // 收藏状态变更后，使相关查询失效
      console.log('收藏状态变更成功', templateId)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.template(templateId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates })
    },
  })
}


/**
 * 保存标签的变更钩子
 */
export function useSaveTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tag: Tag) => DatabaseService.saveTag(tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags })
    },
  })
}

/**
 * 重置标签的变更钩子
 */
export function useResetTagsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => DatabaseService.resetTags(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags })
    },
  })
}

/**
 * 数据库初始化的变更钩子
 */
export function useInitializeDatabaseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      console.log('数据库初始化中...');
      await DatabaseService.initDatabase();

      // 检查是否需要初始化示例数据
      const templates = await DatabaseService.getAllTemplates();
      if (templates.length === 0) {
        console.log('未找到模板，正在初始化示例数据...')
        await DatabaseService.importTemplates(get_all_templates_sample())
        console.log('示例数据初始化成功')
      }
    },
    onSuccess: () => {
      // 初始化完成后，清除所有缓存并重新获取数据
      queryClient.clear()
      console.log('数据库初始化成功')
    },
  })
}

/**
 * 导入模板的变更钩子
 */
export function useImportTemplatesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templates: Template[]) => {
      return await DatabaseService.importTemplates(templates)
    },
    onSuccess: () => {
      // 导入成功后，刷新相关查询
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.diseases })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templateTypes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags })
    },
  })
}

/**
 * 清空模板的变更钩子
 */
export function useClearTemplatesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return await DatabaseService.clearTemplates()
    },
    onSuccess: () => {
      // 清空成功后，刷新相关查询
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.diseases })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templateTypes })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags })
    },
  })
}
