import request from './request'
import type {
  ApiResponse, AuthResponse, LoginRequest, RegisterRequest,
  Notebook, Question, QASession, QAMessage, OCRResponse,
  AnalyticsOverview, AnalyticsTrend, WeakPoint, ReviewResult,
} from '@/types'

// ==================== Auth API ====================
export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await request.post<ApiResponse<AuthResponse>>('/auth/login', { username, password } as LoginRequest)
  return res.data.data
}

export async function register(username: string, password: string, email: string): Promise<AuthResponse> {
  const res = await request.post<ApiResponse<AuthResponse>>('/auth/register', { username, password, email } as RegisterRequest)
  return res.data.data
}

// ==================== Notebook API ====================
export async function getNotebooks(): Promise<Notebook[]> {
  const res = await request.get<ApiResponse<Notebook[]>>('/notebooks')
  return res.data.data
}

export async function createNotebook(name: string, color: string): Promise<Notebook> {
  const res = await request.post<ApiResponse<Notebook>>('/notebooks', { name, color })
  return res.data.data
}

export async function updateNotebook(id: string, name: string, color: string): Promise<Notebook> {
  const res = await request.put<ApiResponse<Notebook>>(`/notebooks/${id}`, { name, color })
  return res.data.data
}

export async function deleteNotebook(id: string): Promise<void> {
  await request.delete<ApiResponse>(`/notebooks/${id}`)
}

// ==================== Question API ====================
export async function getQuestions(notebookId: string, page = 1, limit = 20): Promise<{ list: Question[]; total: number }> {
  const res = await request.get<ApiResponse<{ list: Question[]; total: number }>>(`/notebooks/${notebookId}/questions`, {
    params: { page, limit },
  })
  return res.data.data
}

export async function createQuestion(data: Partial<Question>): Promise<Question> {
  const res = await request.post<ApiResponse<Question>>('/questions', data)
  return res.data.data
}

export async function updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
  const res = await request.put<ApiResponse<Question>>(`/questions/${id}`, data)
  return res.data.data
}

export async function deleteQuestion(id: string): Promise<void> {
  await request.delete<ApiResponse>(`/questions/${id}`)
}

export async function ocrRecognize(file: File): Promise<OCRResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await request.post<ApiResponse<OCRResponse>>('/questions/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
  return res.data.data
}

// ==================== QA API ====================
export async function getQASessions(): Promise<QASession[]> {
  const res = await request.get<ApiResponse<QASession[]>>('/qa/sessions')
  return res.data.data
}

export async function createQASession(title?: string): Promise<QASession> {
  const res = await request.post<ApiResponse<QASession>>('/qa/sessions', { title })
  return res.data.data
}

export async function deleteQASession(id: string): Promise<void> {
  await request.delete<ApiResponse>(`/qa/sessions/${id}`)
}

export async function getQAMessages(sessionId: string): Promise<QAMessage[]> {
  const res = await request.get<ApiResponse<QAMessage[]>>(`/qa/sessions/${sessionId}/messages`)
  return res.data.data
}

/** SSE流式问答 - 使用EventSource兼容方案 */
export function streamQA(
  sessionId: string,
  question: string,
  questionId: string | null,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): AbortController {
  const controller = new AbortController()
  const token = localStorage.getItem('recall_token')

  fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/qa/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId, question, question_id: questionId }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('SSE连接失败')
      const reader = response.body?.getReader()
      if (!reader) throw new Error('无法读取响应流')
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onDone()
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) onChunk(parsed.content)
            } catch {
              onChunk(data)
            }
          }
        }
      }
      onDone()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') onError(err)
    })

  return controller
}

// ==================== Review API ====================
export async function startReview(notebookIds: string[], questionCount: number = 10): Promise<{ session_id: string; questions: Question[] }> {
  const res = await request.post<ApiResponse<{ session_id: string; questions: Question[] }>>('/review/start', {
    notebook_ids: notebookIds,
    question_count: questionCount,
  })
  return res.data.data
}

export async function submitReview(sessionId: string, answers: Record<string, string>): Promise<ReviewResult> {
  const res = await request.post<ApiResponse<ReviewResult>>('/review/submit', {
    session_id: sessionId,
    answers,
  })
  return res.data.data
}

// ==================== Analytics API ====================
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await request.get<ApiResponse<AnalyticsOverview>>('/analytics/overview')
  return res.data.data
}

export async function getAnalyticsTrend(days: number = 30): Promise<AnalyticsTrend> {
  const res = await request.get<ApiResponse<AnalyticsTrend>>('/analytics/trend', { params: { days } })
  return res.data.data
}

export async function getWeakPoints(): Promise<WeakPoint[]> {
  const res = await request.get<ApiResponse<WeakPoint[]>>('/analytics/weak-points')
  return res.data.data
}
