import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app'
import { ocrRecognize } from '@/utils/api'
import { NOTEBOOK_COLORS, SUBJECTS, ERROR_TYPES } from '@/utils/tokens'
import ColorPicker from '@/components/notebook/ColorPicker'
import type { CreateQuestionRequest, QuestionOption } from '@/types'

type EntryMode = 'menu' | 'image' | 'text'

export default function CreatePage() {
  const navigate = useNavigate()
  const { notebooks, createQuestion } = useAppStore()
  const [mode, setMode] = useState<EntryMode>('menu')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [notebookId, setNotebookId] = useState('')
  const [newNotebookName, setNewNotebookName] = useState('')
  const [newNotebookColor, setNewNotebookColor] = useState('#6C5CE7')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [knowledgePoints, setKnowledgePoints] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [options, setOptions] = useState<Partial<QuestionOption>[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('仅支持JPG/PNG/WEBP格式 📷')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过10MB 📦')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await ocrRecognize(file)
      setContent(result.text)
      if (result.options && result.options.length > 0) {
        setOptions(result.options.map((opt, i) => ({
          label: opt.label || String.fromCharCode(65 + i),
          content: opt.content,
          is_correct: false,
        })))
      }
      setImageUrl(URL.createObjectURL(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR识别失败，请手动输入 😅')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetNotebookId = notebookId || (newNotebookName ? 'new' : '')
    if (targetNotebookId === 'new' && !newNotebookName.trim()) {
      setError('请输入新错题本名称 📓')
      return
    }
    if (!content.trim()) {
      setError('请输入题目内容 📝')
      return
    }
    if (!correctAnswer.trim()) {
      setError('请输入正确答案 ✅')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data: CreateQuestionRequest = {
        notebook_id: notebookId || undefined,
        new_notebook_name: newNotebookName || undefined,
        new_notebook_color: newNotebookColor || undefined,
        title: title.trim() || content.slice(0, 30),
        content: content.trim(),
        correct_answer: correctAnswer.trim(),
        analysis: analysis.trim() || undefined,
        knowledge_points: knowledgePoints.trim() || undefined,
        image_url: imageUrl || undefined,
        options: options.length > 0 ? options as QuestionOption[] : undefined,
      }
      await createQuestion(data)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败 😢')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setCorrectAnswer('')
    setAnalysis('')
    setKnowledgePoints('')
    setImageUrl('')
    setOptions([])
    setNotebookId('')
    setNewNotebookName('')
    setError('')
  }

  if (mode === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-xl">
        <h1 className="text-h1 font-bold mb-xl text-center gradient-text">➕ 添加新错题</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
          {[
            { mode: 'image' as const, icon: '📸', title: '识图录入', desc: '拍照/截图上传，OCR自动识别', color: '#6C5CE7' },
            { mode: 'text' as const, icon: '📝', title: '文本录入', desc: '直接粘贴或输入题目内容', color: '#00B894' },
            { mode: null, icon: '🤖', title: '对话录入', desc: '通过AI对话方式录入', color: '#FD79A8' },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => item.mode ? setMode(item.mode) : navigate('/qa')}
              className="card p-2xl flex flex-col items-center gap-md hover:-translate-y-2 hover:shadow-cartoon-hover transition-all duration-300"
            >
              <div
                className="flex items-center justify-center text-white animate-float"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '28px',
                  background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}DD 100%)`,
                  boxShadow: `0 6px 0 ${item.color}88`,
                  fontSize: '24px',
                }}
              >
                {item.icon}
              </div>
              <h3 className="text-h2 text-text-primary font-bold">{item.title}</h3>
              <p className="text-caption text-text-secondary text-center">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-xl">
      <div className="flex items-center gap-md mb-xl">
        <button onClick={() => setMode('menu')} className="btn-secondary">
          ← 返回
        </button>
        <h1 className="text-h2 text-text-primary font-bold">
          {mode === 'image' ? '📸 识图录入' : '📝 文本录入'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-xl space-y-lg">
        {mode === 'image' && (
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">📤 上传错题图片</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full border-3 border-dashed border-primary-light rounded-card p-2xl text-center hover:border-primary hover:bg-purple-50 transition-all"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-sm">
                  <div className="w-16 h-16 border-4 border-primary-light border-t-primary rounded-full animate-spin" />
                  <span className="text-body text-text-secondary font-bold">🔍 OCR识别中...</span>
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="预览" className="max-w-full max-h-[300px] mx-auto rounded-btn" />
              ) : (
                <div className="flex flex-col items-center gap-sm">
                  <div style={{ fontSize: '32px' }}>📸</div>
                  <span className="text-body text-text-secondary font-bold">点击上传图片</span>
                  <span className="text-caption text-text-auxiliary">支持JPG/PNG/WEBP，≤10MB</span>
                </div>
              )}
            </button>
          </div>
        )}

        <div>
          <label className="block text-body text-text-secondary mb-sm font-bold">📁 选择错题本</label>
          {notebooks.length > 0 ? (
            <select
              value={notebookId}
              onChange={(e) => setNotebookId(e.target.value)}
              className="input-base"
            >
              <option value="">选择已有错题本...</option>
              {notebooks.map((nb) => (
                <option key={nb.id} value={nb.id}>{nb.name}</option>
              ))}
            </select>
          ) : (
            <p className="text-caption text-text-auxiliary">📝 暂无错题本，请在下方创建</p>
          )}
          {!notebookId && (
            <div className="mt-sm space-y-sm">
              <input
                type="text"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                className="input-base"
                placeholder="或输入新错题本名称"
              />
              {newNotebookName && (
                <ColorPicker value={newNotebookColor} onChange={setNewNotebookColor} />
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-body text-text-secondary mb-sm font-bold">🏷️ 题目标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-base"
            placeholder="如：2024年高考数学第15题"
          />
        </div>

        <div>
          <label className="block text-body text-text-secondary mb-sm font-bold">📝 题目内容 *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-base min-h-[180px] resize-y"
            placeholder="输入或粘贴题目内容..."
          />
        </div>

        {options.length > 0 && (
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">📋 选项</label>
            <div className="space-y-sm">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-sm bg-blue-50 p-sm rounded-btn">
                  <input
                    type="checkbox"
                    checked={opt.is_correct || false}
                    onChange={(e) => {
                      const newOpts = [...options]
                      newOpts[i] = { ...opt, is_correct: e.target.checked }
                      setOptions(newOpts)
                    }}
                    className="w-8 h-8"
                    style={{ accentColor: '#6C5CE7' }}
                  />
                  <span className="text-body font-bold w-8 text-primary">{opt.label}.</span>
                  <input
                    type="text"
                    value={opt.content || ''}
                    onChange={(e) => {
                      const newOpts = [...options]
                      newOpts[i] = { ...opt, content: e.target.value }
                      setOptions(newOpts)
                    }}
                    className="input-base flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-body text-text-secondary mb-sm font-bold">✅ 正确答案 *</label>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="input-base"
            placeholder="如：B 或 具体答案"
          />
        </div>

        <div>
          <label className="block text-body text-text-secondary mb-sm font-bold">💡 解析（选填）</label>
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            className="input-base min-h-[120px] resize-y"
            placeholder="输入解题思路和解析..."
          />
        </div>

        <div>
          <label className="block text-body text-text-secondary mb-sm font-bold">🏷️ 知识点标签（选填）</label>
          <input
            type="text"
            value={knowledgePoints}
            onChange={(e) => setKnowledgePoints(e.target.value)}
            className="input-base"
            placeholder="用逗号分隔，如：函数,导数,极值"
          />
        </div>

        {error && (
          <div className="text-error text-caption bg-red-50 px-md py-sm rounded-btn font-bold flex items-center gap-xs">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="flex gap-sm justify-end pt-sm">
          <button type="button" onClick={resetForm} className="btn-secondary">
            🧹 清空
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            取消
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '保存中... ⏳' : '✅ 确认录入'}
          </button>
        </div>
      </form>
    </div>
  )
}
