import { pinyin, match } from 'pinyin-pro'

/**
 * 获取中文字符串的拼音首字母
 * @param text 中文字符串
 * @returns 拼音首字母字符串（小写）
 */
export function getPinyinInitials(text: string): string {
  if (!text) return ''

  try {
    // 获取拼音首字母，去除音调，转为小写
    const initials = pinyin(text, {
      pattern: 'initial',
      toneType: 'none',
      type: 'string'
    })

    return initials.toLowerCase().replace(/\s+/g, '')
  } catch (error) {
    console.warn('获取拼音首字母失败:', error)
    return ''
  }
}

/**
 * 获取中文字符串的完整拼音
 * @param text 中文字符串
 * @returns 完整拼音字符串（小写，无空格）
 */
export function getFullPinyin(text: string): string {
  if (!text) return ''

  try {
    // 获取完整拼音，去除音调，转为小写
    const fullPinyin = pinyin(text, {
      toneType: 'none',
      type: 'string'
    })

    return fullPinyin.toLowerCase().replace(/\s+/g, '')
  } catch (error) {
    console.warn('获取完整拼音失败:', error)
    return ''
  }
}

/**
 * 检查搜索关键词是否匹配文本（支持中文、拼音首字母、完整拼音）
 * @param text 要搜索的文本
 * @param keyword 搜索关键词
 * @returns 是否匹配
 */
export function matchText(text: string, keyword: string): boolean {
  if (!text || !keyword) return false

  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()

  // 1. 直接匹配中文或英文
  if (lowerText.includes(lowerKeyword)) {
    return true
  }

  // 2. 匹配拼音首字母
  if (match(lowerText, lowerKeyword, { continuous: true })) {
    return true
  }


  // // 2. 匹配拼音首字母
  // const initials = getPinyinInitials(text)
  // if (initials.includes(lowerKeyword)) {
  //   return true
  // }

  // // 3. 匹配完整拼音
  // const fullPinyin = getFullPinyin(text)
  // if (fullPinyin.includes(lowerKeyword)) {
  //   return true
  // }

  return false
}

/**
 * 为模板数据预处理拼音信息（用于提升搜索性能）
 * @param text 文本内容
 * @returns 包含原文本、拼音首字母、完整拼音的对象
 */
export function preprocessTextForSearch(text: string) {
  return {
    original: text,
    initials: getPinyinInitials(text),
    fullPinyin: getFullPinyin(text)
  }
}