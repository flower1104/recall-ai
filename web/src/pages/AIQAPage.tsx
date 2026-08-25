import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/app'
import { streamQA } from '@/utils/api'
import EmptyState from '@/components/common/EmptyState'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'
import type { QAMessage } from '@/types'

export default function AIQAPage() {
  const location = useLocation()
  const {
    qaSessions, currentQASessionId, qaMessages,
    fetchQASessions, createQASession, deleteQASession,
    selectQASession, fetchQAMessages, addQAMessage,
  } = useAppStore()

  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [mobileHistoryVisible, setMobileHistoryVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const streamingTextRef = useRef('')

  const questionContext = (location.state as { questionId?: string; questionTitle?: string }) || {}

  useEffect(() => {
    fetchQASessions()
  }, [fetchQASessions])

  useEffect(() => {
    if (currentQASessionId) {
      fetchQAMessages(currentQASessionId)
    }
  }, [currentQASessionId, fetchQAMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [qaMessages, streamingText])

  const handleSend = async () => {
    if (!input.trim() || streaming) return

    let sessionId = currentQASessionId
    if (!sessionId) {
      sessionId = await createQASession(input.slice(0, 20))
    }

    const userMessage: QAMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    }
    addQAMessage(userMessage)
    const questionText = input.trim()
    setInput('')
    setStreaming(true)
    setStreamingText('')
    streamingTextRef.current = ''

    abortRef.current = streamQA(
      sessionId,
      questionText,
      questionContext.questionId || null,
      (chunk) => {
        streamingTextRef.current += chunk
        setStreamingText((prev) => prev + chunk)
      },
      () => {
        const aiMessage: QAMessage = {
          id: `temp-ai-${Date.now()}`,
          session_id: sessionId!,
          role: 'assistant',
          content: streamingTextRef.current,
          created_at: new Date().toISOString(),
        }
        addQAMessage(aiMessage)
        setStreaming(false)
        setStreamingText('')
        fetchQASessions()
      },
      (err) => {
        setStreaming(false)
        setStreamingText('')
        console.error('AI对话出错:', err)
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewSession = async () => {
    await createQASession()
    setMobileHistoryVisible(false)
  }

  return (
    <div className="flex" style={{ height: 'calc(100vh - 88px)' }}>
      {/* 左侧 — 历史对话 */}
      <aside
        className={`${
          mobileHistoryVisible ? 'fixed inset-y-22 left-0 z-40 w-[400px] bg-white shadow-2xl' : 'hidden'
        } md:relative md:inset-auto md:z-auto md:block w-[360px] flex-shrink-0 border-r-2 border-cream bg-white flex flex-col`}
      >
        <div className="p-md border-b-2 border-cream">
          <button onClick={handleNewSession} className="btn-primary w-full">
            ➕ 新建对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-sm">
          {qaSessions.length === 0 ? (
            <div className="p-lg text-center text-text-auxiliary text-caption">
              <div style={{ fontSize: '32px' }}>💬</div>
              <p className="mt-md">暂无对话记录</p>
            </div>
          ) : (
            qaSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => { selectQASession(session.id); setMobileHistoryVisible(false) }}
                className={`group flex items-center px-lg py-md cursor-pointer transition-all duration-200 mb-xs rounded-btn ${
                  currentQASessionId === session.id ? 'cartoon-selected' : 'hover:bg-gray-50'
                }`}
              >
                <span style={{ fontSize: '14px', marginRight: '12px' }}>💭</span>
                <span className={`text-body flex-1 truncate font-bold ${currentQASessionId === session.id ? 'text-primary' : 'text-text-primary'}`}>
                  {session.title || '新对话'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('确定删除此对话？🗑️')) deleteQASession(session.id)
                  }}
                  className="text-caption text-text-auxiliary opacity-0 group-hover:opacity-100 hover:text-error ml-xs font-bold"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {mobileHistoryVisible && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMobileHistoryVisible(false)} />
      )}

      {/* 右侧 — 对话区 */}
      <div className="flex-1 flex flex-col">
        {/* 移动端历史切换 */}
        <button
          className="md:hidden p-md text-text-secondary font-bold border-b-2 border-cream"
          onClick={() => setMobileHistoryVisible(true)}
        >
          ← 历史对话
        </button>

        {/* 上下文提示 */}
        {questionContext.questionTitle && (
          <div className="px-xl py-sm border-b-2 border-cream flex items-center gap-sm" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(162,155,254,0.08) 100%)' }}>
            <span className="text-caption text-primary font-bold">📌 当前话题：</span>
            <span className="text-caption text-text-secondary truncate font-bold">{questionContext.questionTitle}</span>
          </div>
        )}

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-xl max-w-[900px] w-full mx-auto">
          {qaMessages.length === 0 && !streaming ? (
            <EmptyState
              icon="🤖"
              title="AI智能答疑"
              description="输入你的问题，或从错题卡片点击「AI答疑」带入题目上下文。支持流式逐字输出回答。 ✨"
            />
          ) : (
            <div className="space-y-xl">
              {qaMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-md ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className="flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)'
                        : 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)',
                      boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
                      fontSize: '16px',
                    }}
                  >
                    {msg.role === 'user' ? '🧑' : '🤖'}
                  </div>
                  <div
                    className={`max-w-[70%] p-lg rounded-card ${
                      msg.role === 'user'
                        ? 'text-white'
                        : 'bg-white border-2 border-cream text-text-primary'
                    }`}
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                      boxShadow: '0 6px 0 rgba(72,52,212,0.2)',
                    } : {
                      boxShadow: '0 4px 0 rgba(0,0,0,0.04)',
                    }}
                  >
                    <div className="ai-message text-body">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                </div>
              ))}
              {streaming && (
                <div className="flex gap-md">
                  <div
                    className="flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)',
                      boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
                      fontSize: '16px',
                    }}
                  >
                    🤖
                  </div>
                  <div className="max-w-[70%] p-lg rounded-card bg-white border-2 border-cream text-text-primary" style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.04)' }}>
                    <div className="ai-message text-body typewriter-cursor">
                      <MarkdownRenderer content={streamingText || '🤔 思考中...'} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区 */}
        <div className="border-t-2 border-cream bg-white p-lg">
          <div className="max-w-[900px] mx-auto">
            <div className="flex gap-sm items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-base flex-1 min-h-[64px] max-h-[160px] resize-y"
                placeholder="输入你的问题... 💭"
                disabled={streaming}
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={streaming || !input.trim()}
                className="btn-primary"
                style={{ height: '64px', minWidth: '120px' }}
              >
                {streaming ? '回答中... ⏳' : '🚀 发送'}
              </button>
            </div>
            <p className="text-caption text-text-auxiliary mt-xs text-center font-bold">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
