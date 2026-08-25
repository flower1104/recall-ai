import { create } from 'zustand'
import type { Notebook, Question, QASession, QAMessage } from '@/types'
import * as notebookApi from '@/utils/api'

interface AppState {
  notebooks: Notebook[]
  currentNotebookId: string | null
  questions: Question[]
  questionsTotal: number
  qaSessions: QASession[]
  currentQASessionId: string | null
  qaMessages: QAMessage[]
  loading: boolean
  sidebarCollapsed: boolean

  fetchNotebooks: () => Promise<void>
  createNotebook: (name: string, color: string) => Promise<void>
  updateNotebook: (id: string, name: string, color: string) => Promise<void>
  deleteNotebook: (id: string) => Promise<void>
  selectNotebook: (id: string) => void

  fetchQuestions: (notebookId: string, page?: number, limit?: number) => Promise<void>
  createQuestion: (data: Partial<Question>) => Promise<void>
  updateQuestion: (id: string, data: Partial<Question>) => Promise<void>
  deleteQuestion: (id: string) => Promise<void>

  fetchQASessions: () => Promise<void>
  createQASession: (title?: string) => Promise<string>
  deleteQASession: (id: string) => Promise<void>
  selectQASession: (id: string) => void
  fetchQAMessages: (sessionId: string) => Promise<void>
  addQAMessage: (msg: QAMessage) => void

  toggleSidebar: () => void
  setLoading: (loading: boolean) => void
}

const CACHE_KEY = 'recall_notebook_cache'
const CACHE_TIME = 5 * 60 * 1000 // 5分钟

export const useAppStore = create<AppState>((set, get) => ({
  notebooks: [],
  currentNotebookId: null,
  questions: [],
  questionsTotal: 0,
  qaSessions: [],
  currentQASessionId: null,
  qaMessages: [],
  loading: false,
  sidebarCollapsed: false,

  fetchNotebooks: async () => {
    // ADR-001: localStorage缓存
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, time } = JSON.parse(cached)
      if (Date.now() - time < CACHE_TIME) {
        set({ notebooks: data })
        return
      }
    }
    set({ loading: true })
    try {
      const notebooks = await notebookApi.getNotebooks()
      set({ notebooks, loading: false })
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: notebooks, time: Date.now() }))
    } catch {
      set({ loading: false })
    }
  },

  createNotebook: async (name: string, color: string) => {
    const nb = await notebookApi.createNotebook(name, color)
    set({ notebooks: [...get().notebooks, nb] })
    localStorage.removeItem(CACHE_KEY)
  },

  updateNotebook: async (id: string, name: string, color: string) => {
    const nb = await notebookApi.updateNotebook(id, name, color)
    set({
      notebooks: get().notebooks.map((n) => (n.id === id ? nb : n)),
    })
    localStorage.removeItem(CACHE_KEY)
  },

  deleteNotebook: async (id: string) => {
    await notebookApi.deleteNotebook(id)
    const filtered = get().notebooks.filter((n) => n.id !== id)
    set({
      notebooks: filtered,
      currentNotebookId: get().currentNotebookId === id ? null : get().currentNotebookId,
    })
    localStorage.removeItem(CACHE_KEY)
  },

  selectNotebook: (id: string) => set({ currentNotebookId: id }),

  fetchQuestions: async (notebookId: string, page = 1, limit = 20) => {
    set({ loading: true })
    try {
      const { list, total } = await notebookApi.getQuestions(notebookId, page, limit)
      set({ questions: list, questionsTotal: total, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createQuestion: async (data: Partial<Question>) => {
    const q = await notebookApi.createQuestion(data)
    set({ questions: [q, ...get().questions] })
    const nbs = get().notebooks.map((n) =>
      n.id === data.notebook_id ? { ...n, question_count: (n.question_count || 0) + 1 } : n
    )
    set({ notebooks: nbs })
    localStorage.removeItem(CACHE_KEY)
  },

  updateQuestion: async (id: string, data: Partial<Question>) => {
    const q = await notebookApi.updateQuestion(id, data)
    set({ questions: get().questions.map((item) => (item.id === id ? q : item)) })
  },

  deleteQuestion: async (id: string) => {
    await notebookApi.deleteQuestion(id)
    set({ questions: get().questions.filter((q) => q.id !== id) })
    localStorage.removeItem(CACHE_KEY)
  },

  fetchQASessions: async () => {
    const sessions = await notebookApi.getQASessions()
    set({ qaSessions: sessions })
  },

  createQASession: async (title?: string) => {
    const session = await notebookApi.createQASession(title)
    set({ qaSessions: [session, ...get().qaSessions], currentQASessionId: session.id })
    return session.id
  },

  deleteQASession: async (id: string) => {
    await notebookApi.deleteQASession(id)
    set({
      qaSessions: get().qaSessions.filter((s) => s.id !== id),
      currentQASessionId: get().currentQASessionId === id ? null : get().currentQASessionId,
    })
  },

  selectQASession: (id: string) => set({ currentQASessionId: id, qaMessages: [] }),

  fetchQAMessages: async (sessionId: string) => {
    const messages = await notebookApi.getQAMessages(sessionId)
    set({ qaMessages: messages })
  },

  addQAMessage: (msg: QAMessage) => set({ qaMessages: [...get().qaMessages, msg] }),

  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setLoading: (loading: boolean) => set({ loading }),
}))
