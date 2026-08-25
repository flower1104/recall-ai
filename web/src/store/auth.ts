import { create } from 'zustand'
import type { User } from '@/types'
import * as authApi from '@/utils/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, email: string) => Promise<void>
  logout: () => void
  restoreSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const res = await authApi.login(username, password)
    const { token, user } = res
    localStorage.setItem('recall_token', token)
    localStorage.setItem('recall_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  register: async (username: string, password: string, email: string) => {
    const res = await authApi.register(username, password, email)
    const { token, user } = res
    localStorage.setItem('recall_token', token)
    localStorage.setItem('recall_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('recall_token')
    localStorage.removeItem('recall_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  restoreSession: () => {
    const token = localStorage.getItem('recall_token')
    const userStr = localStorage.getItem('recall_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User
        set({ user, token, isAuthenticated: true })
      } catch {
        localStorage.removeItem('recall_token')
        localStorage.removeItem('recall_user')
      }
    }
  },
}))
