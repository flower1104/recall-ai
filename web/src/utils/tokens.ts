/** Design Tokens — 卡通风格设计系统 */

export const COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4834D4',
  pageBg: '#FFF8F0',
  cardBg: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textAuxiliary: '#B2BEC3',
  borderDefault: '#FFE0D0',
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF6B6B',
  questionBorder: '#74B9FF',
  analysisBorder: '#55EFC4',
} as const

export const NOTEBOOK_COLORS = [
  { name: '紫色', value: '#6C5CE7' },
  { name: '绿色', value: '#00B894' },
  { name: '珊瑚红', value: '#FF7675' },
  { name: '淡紫', value: '#A29BFE' },
  { name: '粉色', value: '#FD79A8' },
  { name: '青色', value: '#00CEC9' },
  { name: '琥珀', value: '#FDCB6E' },
  { name: '深紫', value: '#4834D4' },
] as const

export const SPACING = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
  '3xl': '80px',
} as const

export const RADIUS = {
  btn: '20px',
  card: '28px',
  tag: '16px',
  bubble: '50%',
} as const

export const FONT_SIZE = {
  h1: '28px',
  h2: '20px',
  body: '14px',
  caption: '12px',
} as const

/** 艾宾浩斯复习间隔（分钟） */
export const REVIEW_INTERVALS = [5, 30, 720, 1440, 4320, 10080, 21600, 43200] as const

/** 掌握度等级 */
export const MASTERY_LEVELS = {
  weak: { min: 0, max: 40, label: '薄弱', color: '#FF6B6B' },
  normal: { min: 41, max: 70, label: '一般', color: '#FDCB6E' },
  mastered: { min: 71, max: 89, label: '已掌握', color: '#00B894' },
  expert: { min: 90, max: 100, label: '精通', color: '#6C5CE7' },
} as const

/** 错因类型 */
export const ERROR_TYPES = [
  '概念混淆',
  '公式误用',
  '审题不清',
  '计算失误',
  '逻辑错误',
  '粗心',
] as const

/** 学科列表 */
export const SUBJECTS = [
  '数学', '英语', '物理', '化学', '生物',
  '语文', '政治', '历史', '地理',
  '行测', '申论',
] as const
