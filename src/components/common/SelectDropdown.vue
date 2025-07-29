<template>
  <div class="select-dropdown" ref="selectRef">
    <div class="select-input-wrapper" @click="toggleDropdown">
      <input ref="inputRef" v-model="inputValue" :placeholder="placeholder" class="select-input" @input="handleInput"
        @focus="handleFocus" @blur="handleBlur" @keydown="handleKeydown" />
      <i class="select-arrow" :class="{ 'select-arrow--open': isOpen }">▼</i>
    </div>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-list" ref="dropdownRef">
        <div v-for="(option, index) in filteredOptions" :key="option.value" class="dropdown-item" :class="{
          'dropdown-item--selected': option.value === modelValue,
          'dropdown-item--highlighted': index === highlightedIndex
        }" @click="selectOption(option)" @mouseenter="highlightedIndex = index">
          {{ option.label }}
        </div>
        <div v-if="filteredOptions.length === 0" class="dropdown-item dropdown-item--empty">
          暂无选项
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

/**
 * 选项接口定义
 */
interface Option {
  label: string
  value: string
}

/**
 * 组件属性定义
 */
interface Props {
  modelValue?: string
  options: Option[]
  placeholder?: string
  filterable?: boolean
}

/**
 * 组件事件定义
 */
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  filterable: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const selectRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLElement>()
const isOpen = ref(false)
const inputValue = ref('')
const highlightedIndex = ref(-1)

/**
 * 过滤后的选项列表
 */
const filteredOptions = computed(() => {
  if (!props.filterable || !inputValue.value) {
    return props.options
  }
  return props.options.filter(option =>
    option.label.toLowerCase().includes(inputValue.value.toLowerCase())
  )
})

/**
 * 监听 modelValue 变化，更新输入框显示值
 */
watch(() => props.modelValue, (newValue) => {
  const selectedOption = props.options.find(option => option.value === newValue)
  inputValue.value = selectedOption ? selectedOption.label : newValue || ''
}, { immediate: true })

/**
 * 切换下拉列表显示状态
 */
const toggleDropdown = () => {
  if (!isOpen.value) {
    isOpen.value = true
    inputRef.value?.focus()
  }
}

/**
 * 处理输入事件
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  highlightedIndex.value = -1

  if (props.filterable) {
    isOpen.value = true
  }

  // 如果输入的值不在选项中，直接更新 modelValue
  const exactMatch = props.options.find(option => option.label === target.value)
  if (!exactMatch && target.value) {
    emit('update:modelValue', target.value)
    emit('change', target.value)
  }
}

/**
   * 处理焦点事件
   */
const handleFocus = () => {
  // 只有当下拉列表未打开时才处理焦点事件
  if (!isOpen.value) {
    isOpen.value = true
  }
}

/**
 * 处理失焦事件
 */
const handleBlur = () => {
  // 延迟关闭，允许点击选项
  setTimeout(() => {
    isOpen.value = false
    highlightedIndex.value = -1
  }, 150)
}

/**
 * 处理键盘事件
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault()
    isOpen.value = true
    return
  }

  if (!isOpen.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      } else if (inputValue.value) {
        // 如果没有选中项但有输入值，使用输入值
        emit('update:modelValue', inputValue.value)
        emit('change', inputValue.value)
        isOpen.value = false
      }
      break
    case 'Escape':
      event.preventDefault()
      isOpen.value = false
      highlightedIndex.value = -1
      inputRef.value?.blur()
      break
  }
}

/**
 * 选择选项
 */
const selectOption = (option: Option) => {
  inputValue.value = option.label
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
  highlightedIndex.value = -1
  inputRef.value?.blur()
}

/**
 * 处理点击外部区域关闭下拉列表
 */
const handleClickOutside = (event: Event) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

/**
 * 组件挂载时添加事件监听
 */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

/**
 * 组件卸载时移除事件监听
 */
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.select-dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-input-wrapper {
  position: relative;
  cursor: pointer;
}

.select-input {
  width: 100%;
  padding: 6px 30px 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.select-input:hover {
  border-color: #007bff;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6c757d;
  transition: transform 0.2s ease;
  pointer-events: none;
}

.select-arrow--open {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #ced4da;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: #495057;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item--selected {
  background-color: #007bff;
  color: white;
}

.dropdown-item--selected:hover {
  background-color: #0056b3;
}

.dropdown-item--highlighted {
  background-color: #e9ecef;
}

.dropdown-item--highlighted.dropdown-item--selected {
  background-color: #0056b3;
}

.dropdown-item--empty {
  color: #6c757d;
  cursor: default;
  font-style: italic;
}

.dropdown-item--empty:hover {
  background-color: transparent;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 滚动条样式 */
.dropdown-list::-webkit-scrollbar {
  width: 6px;
}

.dropdown-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>