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