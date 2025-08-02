/**
 * 图标注册文件
 * 预先导入项目中使用的图标，避免动态导入问题
 */

// Material Design Icons - 项目中实际使用的图标
import MdiHome from '~icons/mdi/home'
import MdiStar from '~icons/mdi/star'
import MdiPlus from '~icons/mdi/plus'
import MdiMinus from '~icons/mdi/minus'
import MdiClose from '~icons/mdi/close'
import MdiDelete from '~icons/mdi/delete'
import MdiRefresh from '~icons/mdi/refresh'
import MdiFilter from '~icons/mdi/filter'
import MdiMenu from '~icons/mdi/menu'
import MdiTag from '~icons/mdi/tag'
import MdiMagnify from '~icons/mdi/magnify'
import MdiFileDocumentPlus from '~icons/mdi/file-document-plus'
import MdiContentSave from '~icons/mdi/content-save'
import MdiContentCopy from '~icons/mdi/content-copy'
import MdiPencil from '~icons/mdi/pencil'
import MdiFileDocumentOutline from '~icons/mdi/file-document-outline'
import MdiDragVertical from '~icons/mdi/drag-vertical'
import MdiPin from '~icons/mdi/pin'
import MdiFullscreen from '~icons/mdi/fullscreen'
import MdiLoading from '~icons/mdi/loading'
import MdiFilePlus from '~icons/mdi/file-plus'
import MdiFolderOpen from '~icons/mdi/folder-open'
import MdiUndo from '~icons/mdi/undo'
import MdiRedo from '~icons/mdi/redo'
import MdiContentSaveOutline from '~icons/mdi/content-save-outline'
import MdiFileImport from '~icons/mdi/file-import'
import MdiFileExport from '~icons/mdi/file-export'
import MdiExitToApp from '~icons/mdi/exit-to-app'
import MdiContentCut from '~icons/mdi/content-cut'
import MdiContentPaste from '~icons/mdi/content-paste'
import MdiSelectAll from '~icons/mdi/select-all'
import MdiInformation from '~icons/mdi/information'
import MdiMagnifyPlus from '~icons/mdi/magnify-plus'
import MdiMagnifyMinus from '~icons/mdi/magnify-minus'
import MdiHelpCircle from '~icons/mdi/help-circle'
import MdiKeyboard from '~icons/mdi/keyboard'
import MdiComment from '~icons/mdi/comment'
import MdiStethoscope from '~icons/mdi/stethoscope'
import MdiChevronDown from '~icons/mdi/chevron-down'
import MdiChevronRight from '~icons/mdi/chevron-right'
import MdiAlert from '~icons/mdi/alert'
import MdiFileDocument from '~icons/mdi/file-document'
import MdiHeart from '~icons/mdi/heart'
import MdiHeartOutline from '~icons/mdi/heart-outline'
import MdiDeleteEmpty from '~icons/mdi/delete-empty'

// Carbon Icons - 项目中实际使用的图标
import CarbonAdd from '~icons/carbon/add'
import CarbonEdit from '~icons/carbon/edit'

// Tabler Icons - 项目中实际使用的图标
import TablerHeart from '~icons/tabler/heart'
import TablerStar from '~icons/tabler/star'

/**
 * 图标注册表
 * 键名格式: 'collection:name'
 */
export const iconRegistry: Record<string, any> = {
  // Material Design Icons
  'mdi:home': MdiHome,
  'mdi:star': MdiStar,
  'mdi:plus': MdiPlus,
  'mdi:minus': MdiMinus,
  'mdi:close': MdiClose,
  'mdi:delete': MdiDelete,
  'mdi:refresh': MdiRefresh,
  'mdi:filter': MdiFilter,
  'mdi:menu': MdiMenu,
  'mdi:tag': MdiTag,
  'mdi:magnify': MdiMagnify,
  'mdi:file-document-plus': MdiFileDocumentPlus,
  'mdi:content-save': MdiContentSave,
  'mdi:content-copy': MdiContentCopy,
  'mdi:pencil': MdiPencil,
  'mdi:file-document-outline': MdiFileDocumentOutline,
  'mdi:drag-vertical': MdiDragVertical,
  'mdi:pin': MdiPin,
  'mdi:fullscreen': MdiFullscreen,
  'mdi:loading': MdiLoading,
  'mdi:file-plus': MdiFilePlus,
  'mdi:folder-open': MdiFolderOpen,
  'mdi:undo': MdiUndo,
  'mdi:redo': MdiRedo,
  'mdi:content-save-outline': MdiContentSaveOutline,
  'mdi:file-import': MdiFileImport,
  'mdi:file-export': MdiFileExport,
  'mdi:exit-to-app': MdiExitToApp,
  'mdi:content-cut': MdiContentCut,
  'mdi:content-paste': MdiContentPaste,
  'mdi:select-all': MdiSelectAll,
  'mdi:information': MdiInformation,
  'mdi:magnify-plus': MdiMagnifyPlus,
  'mdi:magnify-minus': MdiMagnifyMinus,
  'mdi:help-circle': MdiHelpCircle,
  'mdi:keyboard': MdiKeyboard,
  'mdi:comment': MdiComment,
  'mdi:stethoscope': MdiStethoscope,
  'mdi:chevron-down': MdiChevronDown,
  'mdi:chevron-right': MdiChevronRight,
  'mdi:alert': MdiAlert,
  'mdi:file-document': MdiFileDocument,
  'mdi:heart': MdiHeart,
  'mdi:heart-outline': MdiHeartOutline,
  'mdi:delete-empty': MdiDeleteEmpty,

  // Carbon Icons
  'carbon:add': CarbonAdd,
  'carbon:edit': CarbonEdit,

  // Tabler Icons
  'tabler:heart': TablerHeart,
  'tabler:star': TablerStar,
}

/**
 * 获取图标组件
 * @param iconName 图标名称，格式: 'collection:name'
 * @returns 图标组件或null
 */
export function getIconComponent(iconName: string) {
  return iconRegistry[iconName] || null
}

/**
 * 检查图标是否已注册
 * @param iconName 图标名称
 * @returns 是否已注册
 */
export function hasIcon(iconName: string): boolean {
  return iconName in iconRegistry
}

/**
 * 获取所有已注册的图标名称
 * @returns 图标名称数组
 */
export function getRegisteredIcons(): string[] {
  return Object.keys(iconRegistry)
}