import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app'
import ColorPicker from './ColorPicker'
import type { Notebook } from '@/types'

interface CreateNotebookModalProps {
  notebook?: Notebook | null
  onClose: () => void
}

export default function CreateNotebookModal({ notebook, onClose }: CreateNotebookModalProps) {
  const { createNotebook, updateNotebook } = useAppStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6C5CE7')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (notebook) {
      setName(notebook.name)
      setColor(notebook.color)
    }
  }, [notebook])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('请输入错题本名称 📓')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (notebook) {
        await updateNotebook(notebook.id, name.trim(), color)
      } else {
        await createNotebook(name.trim(), color)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败 😢')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-md" onClick={onClose}>
      <div
        className="card w-full max-w-[560px] p-xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-h2 text-text-primary font-bold mb-xl flex items-center gap-xs">
          <span style={{ fontSize: '20px' }}>📓</span>
          {notebook ? '编辑错题本' : '新建错题本'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">🏷️ 名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              placeholder="如：高中数学"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">🎨 颜色标识</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          {error && (
            <div className="text-error text-caption bg-red-50 px-md py-sm rounded-btn font-bold flex items-center gap-xs">
              <span>⚠️</span> {error}
            </div>
          )}
          <div className="flex gap-sm justify-end pt-sm">
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? '保存中... ⏳' : '✅ 确认'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
