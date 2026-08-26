import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  onDelete?: () => void
}

export default function QuestionCard({ question, onDelete }: QuestionCardProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false) // 解析默认折叠
  const knowledgeTags = question.knowledge_points?.split(',').filter(Boolean) || []
  const options = question.options || []
  const hasAnalysis = !!(question.analysis || question.correct_answer)

  return (
    <div
      className="overflow-hidden transition-all duration-200"
      style={{
        background: '#FFFFFF',
        border: '1px solid #EDEAE2',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* 题目区 */}
      <div className="p-lg" style={{ borderLeft: '4px solid #C9DDC1' }}>
        <div className="flex items-center justify-between mb-sm gap-sm">
          <h3
            className="flex items-center gap-sm font-semibold min-w-0"
            style={{ color: '#3C3C3C', fontSize: '14px', lineHeight: 1.5 }}
          >
            <span style={{ fontSize: '14px' }}>📋</span>
            <span className="truncate">{question.title || '未命名题目'}</span>
          </h3>
          <span
            style={{
              color: '#9B9B9B',
              fontSize: '12px',
              background: '#FAFAF7',
              padding: '2px 10px',
              borderRadius: '10px',
              flexShrink: 0,
              border: '1px solid #EDEAE2',
            }}
          >
            {new Date(question.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>

        <p
          className="whitespace-pre-wrap"
          style={{ color: '#3C3C3C', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}
        >
          {question.content}
        </p>

        {options.length > 0 && (
          <div className="space-y-xs">
            {options.map((opt) => (
              <div
                key={opt.id}
                className="flex items-start gap-sm"
                style={{
                  background: '#FAFAF7',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#3C3C3C',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: '#5B8C5A', fontWeight: 600, minWidth: '20px' }}>{opt.label}.</span>
                <span>{opt.content}</span>
              </div>
            ))}
          </div>
        )}

        {question.image_url && (
          <div className="mt-sm">
            <img
              src={question.image_url}
              alt="错题图片"
              className="max-w-full max-h-[300px]"
              style={{ borderRadius: '10px', border: '1px solid #EDEAE2' }}
            />
          </div>
        )}
      </div>

      {/* 知识点标签 */}
      {knowledgeTags.length > 0 && (
        <div className="px-lg pb-sm flex flex-wrap gap-xs">
          {knowledgeTags.map((tag) => (
            <span
              key={tag}
              style={{
                background: '#EDF3E8',
                color: '#5B8C5A',
                padding: '2px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 解析区 — 默认折叠 */}
      {hasAnalysis && (
        <div
          className="mx-lg my-sm"
          style={{
            background: expanded ? '#F8F7F2' : 'transparent',
            borderRadius: '12px',
            border: expanded ? '1px solid #EDEAE2' : '1px dashed #E5E2D8',
            overflow: 'hidden',
            transition: 'all 0.2s',
          }}
        >
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="w-full flex items-center justify-center gap-sm"
              style={{
                padding: '12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#7BA889',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '12px',
              }}
            >
              <span>💡</span>
              <span>查看解析</span>
              <span style={{ fontSize: '11px', color: '#9B9B9B', fontWeight: 400 }}>（点击展开）</span>
            </button>
          ) : (
            <div style={{ padding: '16px' }}>
              <div className="flex items-center justify-between mb-sm">
                <span
                  className="flex items-center gap-sm font-semibold"
                  style={{ color: '#5B8C5A', fontSize: '13px' }}
                >
                  <span>💡</span> 解析
                </span>
                <button
                  onClick={() => setExpanded(false)}
                  style={{
                    color: '#9B9B9B',
                    fontSize: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 8px',
                  }}
                >
                  收起 ▲
                </button>
              </div>
              {question.analysis && (
                <p
                  className="whitespace-pre-wrap"
                  style={{ color: '#3C3C3C', fontSize: '13px', lineHeight: 1.7, marginBottom: '10px' }}
                >
                  {question.analysis}
                </p>
              )}
              {question.correct_answer && (
                <div
                  className="flex items-center gap-sm"
                  style={{
                    background: '#EDF3E8',
                    padding: '8px 12px',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ color: '#5B8C5A', fontSize: '12px', fontWeight: 600 }}>✅ 正确答案：</span>
                  <span style={{ color: '#3C5A35', fontSize: '14px', fontWeight: 600 }}>
                    {question.correct_answer}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div
        className="px-lg py-sm flex gap-sm items-center"
        style={{ borderTop: '1px solid #F2F1ED' }}
      >
        <button
          onClick={() => navigate('/qa', { state: { questionId: question.id, questionTitle: question.title } })}
          className="flex items-center gap-xs"
          style={{
            fontSize: '12px',
            color: '#9B6E5E',
            background: '#F8EFE3',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #F2E0CC',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          🤖 AI 答疑
        </button>
        <button
          onClick={() => navigate('/review', { state: { questionIds: [question.id] } })}
          className="flex items-center gap-xs"
          style={{
            fontSize: '12px',
            color: '#5B8C5A',
            background: '#EDF3E8',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #D2E2C7',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          🔄 复习
        </button>
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('确定删除这道错题？')) onDelete()
            }}
            className="ml-auto"
            style={{
              fontSize: '12px',
              color: '#9B9B9B',
              background: 'transparent',
              padding: '6px 10px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🗑 移出
          </button>
        )}
      </div>
    </div>
  )
}
