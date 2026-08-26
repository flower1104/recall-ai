import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app'
import { startReview, submitReview } from '@/utils/api'
import type { Question, ReviewResult } from '@/types'

type ReviewStage = 'select' | 'answer' | 'result'

export default function ReviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { notebooks, fetchNotebooks } = useAppStore()

  const [stage, setStage] = useState<ReviewStage>('select')
  const [selectedNotebookIds, setSelectedNotebookIds] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [sessionId, setSessionId] = useState('')
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [result, setResult] = useState<ReviewResult | null>(null)

  useEffect(() => {
    fetchNotebooks()
  }, [fetchNotebooks])

  useEffect(() => {
    const state = location.state as { questionIds?: string[] }
    if (state?.questionIds && notebooks.length >= 0) {
    }
  }, [location.state, notebooks])

  const handleToggleNotebook = (id: string) => {
    setSelectedNotebookIds((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotebookIds.length === notebooks.length) {
      setSelectedNotebookIds([])
    } else {
      setSelectedNotebookIds(notebooks.map((nb) => nb.id))
    }
  }

  const handleStartReview = async () => {
    if (selectedNotebookIds.length === 0) {
      setError('请至少选择一个错题本 📓')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await startReview(selectedNotebookIds, questionCount)
      setSessionId(data.session_id)
      setReviewQuestions(data.questions)
      setStage('answer')
      setStartTime(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : '开始复习失败 😢')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    setShowAnswer(false)
    if (currentIdx < reviewQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      const res = await submitReview(sessionId, answers)
      setResult({ ...res, duration })
      setStage('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败 😢')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setStage('select')
    setSelectedNotebookIds([])
    setReviewQuestions([])
    setAnswers({})
    setCurrentIdx(0)
    setResult(null)
    setShowAnswer(false)
  }

  if (stage === 'select') {
    return (
      <div className="max-w-3xl mx-auto p-xl">
        <h1 className="text-h1 font-bold mb-xl text-center gradient-text">🔄 选择复习范围</h1>
        {error && (
          <div className="text-error text-caption bg-red-50 px-md py-sm rounded-btn mb-lg font-bold flex items-center gap-xs">
            <span>⚠️</span> {error}
          </div>
        )}
        <div className="card p-xl space-y-md">
          {notebooks.length === 0 ? (
            <p className="text-center text-text-secondary py-xl text-body">📝 暂无错题本，请先录入错题</p>
          ) : (
            <>
              <div className="flex items-center justify-between pb-sm border-b-2 border-cream">
                <span className="text-body text-text-secondary font-bold">📚 选择错题本</span>
                <button onClick={handleSelectAll} className="text-caption text-primary hover:underline font-bold">
                  {selectedNotebookIds.length === notebooks.length ? '取消全选' : '✅ 全选'}
                </button>
              </div>
              <div className="space-y-sm">
                {notebooks.map((nb) => (
                  <label
                    key={nb.id}
                    className={`flex items-center gap-md p-sm rounded-btn cursor-pointer transition-all border-2 ${
                      selectedNotebookIds.includes(nb.id) ? 'cartoon-selected' : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedNotebookIds.includes(nb.id)}
                      onChange={() => handleToggleNotebook(nb.id)}
                      className="w-8 h-8"
                      style={{ accentColor: '#6C5CE7' }}
                    />
                    <div
                      className="flex items-center justify-center text-white"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        backgroundColor: nb.color,
                        boxShadow: `0 4px 0 ${nb.color}88`,
                        fontSize: '12px',
                      }}
                    >
                      📓
                    </div>
                    <span className="text-body text-text-primary flex-1 font-bold">{nb.name}</span>
                    <span className="text-caption text-text-auxiliary font-bold bg-gray-100 px-sm py-xs rounded-tag">
                      {nb.question_count ?? 0} 题
                    </span>
                  </label>
                ))}
              </div>
              <div className="pt-md border-t-2 border-cream">
                <label className="block text-body text-text-secondary mb-sm font-bold">🎯 题目数量</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="input-base"
                >
                  <option value={5}>5题</option>
                  <option value={10}>10题</option>
                  <option value={20}>20题</option>
                  <option value={50}>50题</option>
                </select>
              </div>
            </>
          )}
        </div>
        <div className="mt-xl flex justify-center">
          <button
            onClick={handleStartReview}
            disabled={loading || selectedNotebookIds.length === 0}
            className="btn-primary px-2xl"
          >
            {loading ? '加载中... ⏳' : '🚀 开始复习'}
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'answer') {
    const currentQ = reviewQuestions[currentIdx]
    if (!currentQ) return null
    const options = currentQ.options || []

    return (
      <div className="max-w-3xl mx-auto p-xl">
        <div className="mb-xl">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-body text-text-secondary font-bold">
              📊 进度：{currentIdx + 1} / {reviewQuestions.length}
            </span>
            <span className="text-caption text-text-auxiliary font-bold">
              ⏱️ 已用时 {Math.floor((Date.now() - startTime) / 60000)} 分钟
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-bubble overflow-hidden">
            <div
              className="h-full rounded-bubble transition-all"
              style={{
                width: `${((currentIdx + 1) / reviewQuestions.length) * 100}%`,
                background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
              }}
            />
          </div>
        </div>

        <div className="card p-xl">
          <div className="p-lg mb-lg" style={{ borderLeft: '8px solid #74B9FF' }}>
            <h3 className="text-body font-bold text-text-primary mb-sm flex items-center gap-xs">
              <span style={{ fontSize: '14px' }}>📋</span>
              {currentQ.title}
            </h3>
            <p className="text-body text-text-primary whitespace-pre-wrap">{currentQ.content}</p>
          </div>

          {options.length > 0 ? (
            <div className="space-y-sm">
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-md p-md rounded-btn border-3 cursor-pointer transition-all ${
                    answers[currentQ.id] === opt.label
                      ? 'cartoon-selected'
                      : 'border-cream hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    checked={answers[currentQ.id] === opt.label}
                    onChange={() => handleAnswer(currentQ.id, opt.label)}
                    className="w-8 h-8"
                    style={{ accentColor: '#6C5CE7' }}
                  />
                  <span className="text-body font-bold w-8 text-primary">{opt.label}.</span>
                  <span className="text-body text-text-primary">{opt.content}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              className="input-base min-h-[140px] resize-y"
              placeholder="输入你的答案... ✍️"
            />
          )}

          {showAnswer && (
            <div className="mt-lg p-md rounded-btn border-2" style={{ background: 'rgba(0,184,148,0.08)', borderColor: 'rgba(0,184,148,0.2)' }}>
              <p className="text-caption text-text-secondary mb-xs font-bold">✅ 正确答案：</p>
              <p className="text-body font-bold text-success">{currentQ.correct_answer}</p>
              {currentQ.analysis && (
                <p className="text-caption text-text-secondary mt-sm whitespace-pre-wrap">{currentQ.analysis}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-xl flex justify-between">
          <button onClick={() => setShowAnswer(!showAnswer)} className="btn-secondary">
            {showAnswer ? '🙈 隐藏答案' : '👀 显示答案'}
          </button>
          <button onClick={handleNext} disabled={!answers[currentQ.id]} className="btn-primary">
            {currentIdx < reviewQuestions.length - 1 ? '➡️ 下一题' : '📝 提交批改'}
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'result' && result) {
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '32px 24px' }}>
        {/* 大标题 — 清新淡雅渐变 */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }} className="animate-bounce-sm">
            {result.accuracy >= 80 ? '🎉' : result.accuracy >= 60 ? '💪' : '📚'}
          </div>
          <h1
            className="font-bold"
            style={{
              fontSize: '36px',
              background: 'linear-gradient(135deg, #7BA889 0%, #5B8C5A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
            }}
          >
            复习完成！
          </h1>
        </div>

        {/* 大统计卡 */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #EDEAE2',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {[
            {
              value: `${result.accuracy}%`,
              label: '正确率',
              color: '#A8B5E5',
              bgColor: '#EEF1F8',
              icon: '🎯',
            },
            {
              value: result.correct,
              label: '答对',
              color: '#A8C5A0',
              bgColor: '#EDF3E8',
              icon: '✓',
            },
            {
              value: result.wrong,
              label: '答错',
              color: '#D9A0A0',
              bgColor: '#F6E8E8',
              icon: '✕',
            },
            {
              value: `${Math.floor(result.duration / 60)}'${String(result.duration % 60).padStart(2, '0')}''`,
              label: '用时',
              color: '#E5B894',
              bgColor: '#F8EFE3',
              icon: '⏱',
            },
          ].map((stat, i) => (
            <div key={i} className="text-center" style={{ minWidth: '120px' }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto 8px',
                  borderRadius: '12px',
                  background: stat.bgColor,
                  fontSize: '18px',
                  color: stat.color,
                  fontWeight: 700,
                }}
              >
                {stat.icon}
              </div>
              <div
                className="font-bold"
                style={{
                  fontSize: '36px',
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                {stat.value}
              </div>
              <div style={{ color: '#9B9B9B', fontSize: '13px', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* 逐题详情 */}
        <div className="space-y-sm" style={{ marginBottom: '32px' }}>
          <h2
            className="font-bold flex items-center gap-sm"
            style={{ color: '#3C3C3C', fontSize: '18px', marginBottom: '16px' }}
          >
            <span style={{ fontSize: '18px' }}>📝</span> 逐题详情
          </h2>
          {result.details.map((detail, i) => (
            <div
              key={detail.question_id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #EDEAE2',
                borderLeft: detail.is_correct ? '4px solid #7BA889' : '4px solid #D9A0A0',
                borderRadius: '14px',
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div className="flex items-start justify-between mb-sm">
                <span
                  className="flex items-center gap-sm font-semibold"
                  style={{
                    color: detail.is_correct ? '#5B8C5A' : '#B47A7A',
                    fontSize: '14px',
                  }}
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: detail.is_correct ? '#EDF3E8' : '#F6E8E8',
                      color: detail.is_correct ? '#5B8C5A' : '#B47A7A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {detail.is_correct ? '✓' : '✕'}
                  </span>
                  第{i + 1}题
                </span>
              </div>
              <p
                className="line-clamp-2"
                style={{ color: '#3C3C3C', fontSize: '14px', lineHeight: 1.6, marginBottom: '10px' }}
              >
                {detail.content}
              </p>
              <div className="flex flex-wrap gap-xl" style={{ fontSize: '13px' }}>
                <span style={{ color: '#7A7A7A' }}>
                  你的答案：
                  <span
                    style={{
                      color: detail.is_correct ? '#5B8C5A' : '#B47A7A',
                      fontWeight: 600,
                      marginLeft: '4px',
                    }}
                  >
                    {detail.user_answer || '未作答'}
                  </span>
                </span>
                <span style={{ color: '#7A7A7A' }}>
                  正确答案：
                  <span
                    style={{
                      color: detail.is_correct ? '#5B8C5A' : '#D9A0A0',
                      fontWeight: 600,
                      marginLeft: '4px',
                    }}
                  >
                    {detail.correct_answer}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-sm justify-center">
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#FAFAF7',
              color: '#6B6B6B',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              border: '1px solid #EDEAE2',
              cursor: 'pointer',
            }}
          >
            🏠 返回首页
          </button>
          <button
            onClick={handleRetry}
            style={{
              background: '#7BA889',
              color: '#FFFFFF',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🔄 错题重练
          </button>
        </div>
      </div>
    )
  }

  return null
}
