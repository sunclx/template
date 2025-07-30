import type { Template } from '../types'

export function copy(template: Template) {
    const templateText = template.sections
        .map(section => `${section.title}：${section.content}`)
        .join('\n')
    return templateText

}

export async function copyToClipboard(template: Template) {
    const templateText = copy(template)
    try {
        await navigator.clipboard.writeText(templateText)
        console.log('模板已复制到剪贴板')
        // TODO: 显示成功提示
    } catch (error) {
        console.error('复制失败:', error)
        // TODO: 显示错误提示
    }
}
/**
 * 创建默认模板对象
 * @returns 包含默认值的模板对象
 */
export function defaultTemplateValue(): Template {
    const now = Date.now()
    return {
        id: 'template-' + now, // 空ID，通常在保存时由数据库生成
        title: '新建模板',
        sections: [
            {
                title: '',
                content: ''
            },
        ],
        disease: '未分类', // 默认无病种
        templateType: '未分类', // 默认无类型
        tags: [], // 默认无标签
        createdAt: now,
        updatedAt: now,
        isFavorite: false
    }
}



// const copyTemplate = async () => {
//     if (selectedTemplate.value) {
//         try {
//             const templateText = selectedTemplate.value.sections
//                 .map(section => `${section.title}\n${section.content}`)
//                 .join('\n\n')

//             await navigator.clipboard.writeText(templateText)
//             console.log('模板已复制到剪贴板')
//             // TODO: 显示成功提示
//         } catch (error) {
//             console.error('复制失败:', error)
//             // TODO: 显示错误提示
//         }
//     }
//   }