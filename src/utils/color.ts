/**
 * 生成随机标签颜色
 * @returns 返回十六进制颜色值字符串
 */
export function randomColor(): string {
    const hue = Math.floor(Math.random() * 360)
    const saturation = Math.floor(Math.random() * 100)
    const lightness = Math.floor(Math.random() * 100)
    return hslToHex(hue, saturation, lightness)
}

/**
 * 生成随机HSL颜色（蓝色系）
 * 提供更多颜色变化的选择
 * @returns 返回HSL颜色值字符串
 */
export function randomBlueHSL(): string {
    // 蓝色色相范围：200-260度
    const hue = Math.floor(Math.random() * 60) + 200
    // 饱和度：60-90%
    const saturation = Math.floor(Math.random() * 30) + 60
    // 亮度：45-65%
    const lightness = Math.floor(Math.random() * 20) + 45

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * 将HSL颜色转换为十六进制颜色
 * @param h 色相 (0-360)
 * @param s 饱和度 (0-100)
 * @param l 亮度 (0-100)
 * @returns 十六进制颜色值
 */
export function hslToHex(h: number, s: number, l: number): string {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
        const k = (n + h / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * 生成随机蓝色系十六进制颜色
 * 结合HSL生成和十六进制转换
 * @returns 十六进制颜色值字符串
 */
export function randomBlueColor(): string {
    const hue = Math.floor(Math.random() * 60) + 200
    const saturation = Math.floor(Math.random() * 30) + 60
    const lightness = Math.floor(Math.random() * 20) + 45

    return hslToHex(hue, saturation, lightness)
}