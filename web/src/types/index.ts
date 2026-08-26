/** TypeScript 类型定义 - 对应开发设计文档中的数据模型 */

// User
export interface User {
  id: string
  username: string
  email: string
  created_at: string
  updated_at: string
}

// Notebook
export interface Notebook {
  id: string
  user_id: string
  name: string
  color: string
  question_count?: number
  created_at: string
  updated_at: string
}

// Question
export interface Question {
  id: string
  notebook_id: string
  title: string
  content: string
  correct_answer: string
  analysis?: string
  image_url?: string
  knowledge_points?: string
  options?: QuestionOption[]
  created_at: string
  updated_at: string
}

/** 创建题目时的请求扩展字段 */
export interface CreateQuestionRequest extends Partial<Question> {
  new_notebook_name?: string
  new_notebook_color?: string
}

// QuestionOption
export interface QuestionOption {
  id: string
  question_id: string
  label: string
  content: string
  is_correct: boolean
}

// QASession
export interface QASession {
  id: string
  user_id: string
  title?: string
  created_at: string
  updated_at: string
}

// QAMessage
export interface QAMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// ReviewRecord
export interface ReviewRecord {
  id: string
  user_id: string
  question_id: string
  session_id: string
  user_answer: string
  is_correct: boolean
  created_at: string
}

// Review Result
export interface ReviewResult {
  session_id: string
  total: number
  correct: number
  wrong: number
  accuracy: number
  duration: number
  details: ReviewDetail[]
}

export interface ReviewDetail {
  question_id: string
  title: string
  content: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
}

// Analytics
export interface AnalyticsOverview {
  total: number
  weekly: number
  mastery: number
  mastered: number
  pending: number
  streak_days: number
}

export interface AnalyticsTrend {
  dates: string[]
  values: number[]
}

export interface WeakPoint {
  tag: string
  error_rate: number
  count: number
}

// 考前冲刺清单
export type ChecklistStatus = 'weak' | 'medium' | 'new' | 'good'

export interface ChecklistItem {
  tag: string
  total: number
  wrong: number
  error_rate: number
  status: ChecklistStatus
  /** 触类旁通：共现知识点 */
  related: string[]
  /** 相关错题标题 */
  sample_titles: string[]
}

export interface StudyChecklist {
  items: ChecklistItem[]
  summary: {
    total_points: number
    weak_points: number
    medium_points: number
    new_points: number
    mastered_points: number
    total_questions: number
  }
}

// API Response
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

// Auth
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

// OCR
export interface OCRResponse {
  text: string
  options?: { label: string; content: string }[]
}
