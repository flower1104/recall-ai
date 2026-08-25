import { useNavigate } from 'react-router-dom'
import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
  onDelete?: () => void
}

export default function QuestionCard({ question, onDelete }: QuestionCardProps) {
  const navigate = useNavigate()
  const knowledgeTags = question.knowledge_points?.split(',').filter(Boolean) || []
  const options = question.options || []

  return (
    <div className="card overflow-hidden hover:shadow-cartoon-hover transition-all duration-300 hover:-translate-y-1">
      {/* 题目区 — 蓝色卡通左边框 */}
      <div className="p-lg" style={{ borderLeft: '8px solid #74B9FF' }}>
        <div className="flex items-center justify-between mb-sm">
          <h3 className="text-body font-bold text-text-primary flex items-center gap-xs">
            <span style={{ fontSize: '14px' }}>📋</span>
            {question.title}
          </h3>
          <span className="text-caption text-text-auxiliary font-bold bg-gray-100 px-sm py-xs rounded-tag">
            {new Date(question.created_at).toLocaleDateString('zh-CN')}
          </span>
        </div>
        <p className="text-body text-text-primary whitespace-pre-wrap mb-sm">{question.content}</p>
        {options.length > 0 && (
          <div className="space-y-xs mt-sm">
            {options.map((opt) => (
              <div key={opt.id} className="flex items-start gap-sm text-body text-text-secondary bg-blue-50 px-md py-sm rounded-btn">
                <span className="font-bold text-primary" style={{ fontSize: '14px' }}>{opt.label}.</span>
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
              className="max-w-full max-h-[300px] rounded-btn border-2 border-cream"
            />
          </div>
        )}
      </div>

      {/* 解析区 — 绿色卡通左边框 */}
      {question.analysis && (
        <div className="p-lg border-t-2 border-cream" style={{ borderLeft: '8px solid #55EFC4' }}>
          <div className="flex items-center gap-xs mb-sm">
            <span style={{ fontSize: '14px' }}>💡</span>
            <span className="text-caption font-bold text-text-secondary">解析</span>
          </div>
          <p className="text-body text-text-secondary whitespace-pre-wrap">{question.analysis}</p>
          <div className="flex items-center gap-sm mt-sm bg-green-50 px-md py-sm rounded-btn">
            <span className="text-caption text-text-secondary font-bold">✅ 正确答案：</span>
            <span className="text-body font-bold text-success">{question.correct_answer}</span>
          </div>
        </div>
      )}

      {/* 知识点标签 */}
      {knowledgeTags.length > 0 && (
        <div className="px-lg pb-sm flex flex-wrap gap-xs">
          {knowledgeTags.map((tag) => (
            <span
              key={tag}
              className="tag"
              style={{
                background: 'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(162,155,254,0.1) 100%)',
                color: '#6C5CE7',
              }}
            >
              🏷️ {tag}
            </span>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="px-lg py-md border-t-2 border-cream flex gap-sm">
        <button
          onClick={() => navigate('/qa', { state: { questionId: question.id, questionTitle: question.title } })}
          className="btn-secondary text-caption"
          style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)', color: 'white', borderColor: '#FF6B6B', boxShadow: '0 4px 0 #E55353' }}
        >
          🤖 AI答疑
        </button>
        <button
          onClick={() => navigate('/review', { state: { questionIds: [question.id] } })}
          className="btn-secondary text-caption"
          style={{ background: 'linear-gradient(135deg, #FDCB6E 0%, #FFE0A0 100%)', color: '#8B6914', borderColor: '#FDCB6E', boxShadow: '0 4px 0 #E0B85A' }}
        >
          🔄 复习
        </button>
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('确定删除这道错题？🗑️')) onDelete()
            }}
            className="btn-secondary text-caption ml-auto"
            style={{ color: '#FF6B6B', borderColor: '#FF6B6B' }}
          >
            🗑️ 移出
          </button>
        )}
      </div>
    </div>
  )
}
