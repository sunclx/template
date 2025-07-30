import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { DatabaseService } from '../services/database'
import type { Template, Disease, TemplateTypeInfo, Tag, TemplateID } from '../types'

/**
 * 查询键常量
 */
export const QUERY_KEYS = {
  templates: ['templates'] as const,
  template: (id: string) => ['template', id] as const,
  diseases: ['diseases'] as const,
  templateTypes: ['templateTypes'] as const,
  tags: ['tags'] as const,
  search: (keyword: string) => ['search', keyword] as const,
} as const

/**
 * 获取所有模板的查询钩子
 */
export function useTemplatesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.templates,
    queryFn: () => DatabaseService.getAllTemplates(),
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
  })
}

/**
 * 根据ID获取模板的查询钩子
 */
export function useTemplateQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.template(id),
    queryFn: () => DatabaseService.getTemplateById(id),
    enabled: !!id, // 只有当id存在时才执行查询
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    staleTime: 2 * 60 * 1000, // 搜索结果2分钟内有效
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * 获取所有疾病分类的查询钩子
 */
export function useDiseasesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.diseases,
    queryFn: () => DatabaseService.getAllDiseases(),
    staleTime: 10 * 60 * 1000, // 疾病分类变化较少，10分钟内有效
    gcTime: 30 * 60 * 1000,
  })
}

/**
 * 获取所有模板类型的查询钩子
 */
export function useTemplateTypesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.templateTypes,
    queryFn: () => DatabaseService.getAllTemplateTypes(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

/**
 * 获取所有标签的查询钩子
 */
export function useTagsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.tags,
    queryFn: () => DatabaseService.getAllTags(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.template(templateId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates })
    },
  })
}

/**
 * 保存疾病分类的变更钩子
 */
export function useSaveDiseaseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (disease: Disease) => DatabaseService.saveDisease(disease),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.diseases })
    },
  })
}

/**
 * 保存模板类型的变更钩子
 */
export function useSaveTemplateTypeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateType: TemplateTypeInfo) => DatabaseService.saveTemplateType(templateType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templateTypes })
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
 * 数据库初始化的变更钩子
 */
export function useInitializeDatabaseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await DatabaseService.initDatabase()
      // 检查是否需要初始化示例数据
      const templates = await DatabaseService.getAllTemplates()
      if (templates.length === 0) {
        await DatabaseService.initSampleData()
        console.log('数据库样本数据初始化成功')
      }
      console.log('数据库初始化成功')
      return '数据库初始化成功'
    },
    onSuccess: () => {
      // 初始化完成后，清除所有缓存并重新获取数据
      queryClient.clear()
    },
  })
}