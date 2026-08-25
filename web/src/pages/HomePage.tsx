import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app'
import { NotebookSkeleton, QuestionCardSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import QuestionCard from '@/components/question/QuestionCard'
import CreateNotebookModal from '@/components/notebook/CreateNotebookModal'
import ColorPicker from '@/components/notebook/ColorPicker'
import type { Notebook } from '@/types'

export default function HomePage() {
  const navigate = useNavigate()
  const {
    notebooks, currentNotebookId, questions, loading,
    fetchNotebooks, selectNotebook, fetchQuestions,
    deleteNotebook, updateNotebook, deleteQuestion,
  } = useAppStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null)
  const [mobileListVisible, setMobileListVisible] = useState(false)

  useEffect(() => {
    fetchNotebooks()
  }, [fetchNotebooks])

  useEffect(() => {
    if (currentNotebookId) {
      fetchQuestions(currentNotebookId)
    }
  }, [currentNotebookId, fetchQuestions])

  useEffect(() => {
    if (notebooks.length > 0 && !currentNotebookId) {
      selectNotebook(notebooks[0].id)
    }
  }, [notebooks, currentNotebookId, selectNotebook])

  const currentNotebook = notebooks.find((n) => n.id === currentNotebookId)
  const currentQuestions = questions.filter((q) => q.notebook_id === currentNotebookId)

  const handleSelectNotebook = (id: string) => {
    selectNotebook(id)
    setMobileListVisible(false)
  }

  const handleDeleteNotebook = (id: string, name: string) => {
    if (confirm(`确定删除错题本「${name}」及其所有错题？此操作不可恢复。🗑️`)) {
      deleteNotebook(id)
    }
  }

  const handleEditNotebook = (nb: Notebook) => {
    setEditingNotebook(nb)
  }

  return (
    <div className="flex" style={{ height: 'calc(100vh - 88px)' }}>
      {/* 左侧 — 错题本列表 */}
      <aside
        className={`${
          mobileListVisible ? 'fixed inset-y-22 left-0 z-40 w-[400px] bg-white shadow-2xl' : 'hidden'
        } md:relative md:inset-auto md:z-auto md:block w-[360px] flex-shrink-0 border-r-2 border-cream bg-white flex flex-col`}
      >
        <div className="p-md border-b-2 border-cream">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary w-full flex items-center justify-center gap-sm"
          >
            <span style={{ fontSize: '16px' }}>➕</span> 新建错题本
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-sm">
          {loading ? (
            <NotebookSkeleton />
          ) : notebooks.length === 0 ? (
            <div className="p-lg text-center text-text-auxiliary text-caption">
              <div style={{ fontSize: '32px' }}>📭</div>
              <p className="mt-md">暂无错题本</p>
            </div>
          ) : (
            notebooks.map((nb) => (
              <div
                key={nb.id}
                onClick={() => handleSelectNotebook(nb.id)}
                className={`flex items-center gap-sm px-lg py-md cursor-pointer transition-all duration-200 mb-xs rounded-btn ${
                  currentNotebookId === nb.id ? 'cartoon-selected' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center text-white font-bold"
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
                <span className={`text-body flex-1 truncate font-bold ${currentNotebookId === nb.id ? 'text-primary' : 'text-text-primary'}`}>
                  {nb.name}
                </span>
                <span className="text-caption text-text-auxiliary font-bold bg-gray-100 px-sm py-xs rounded-tag">
                  {nb.question_count ?? 0}
                </span>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {mobileListVisible && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMobileListVisible(false)}
        />
      )}

      {/* 右侧 — 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* 移动端返回按钮 */}
        {!mobileListVisible && currentNotebook && (
          <button
            className="md:hidden p-md text-text-secondary font-bold"
            onClick={() => setMobileListVisible(true)}
          >
            ← 错题本列表
          </button>
        )}

        {!currentNotebook ? (
          <EmptyState
            icon="📚"
            title="还没有错题本"
            description="点击下方按钮创建你的第一个错题本吧 🎈"
            actionLabel="新建错题本"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <>
            {/* 错题本头部 */}
            <div className="px-xl py-lg border-b-2 border-cream bg-white sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div
                  className="flex items-center justify-center text-white"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: currentNotebook.color,
                    boxShadow: `0 4px 0 ${currentNotebook.color}88`,
                    fontSize: '14px',
                  }}
                >
                  📓
                </div>
                <div>
                  <h2 className="text-h2 text-text-primary font-bold">{currentNotebook.name}</h2>
                  <span className="text-caption text-text-auxiliary font-bold">
                    📝 {currentNotebook.question_count ?? currentQuestions.length} 道题
                  </span>
                </div>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => handleEditNotebook(currentNotebook)}
                  className="btn-secondary text-caption"
                >
                  ✏️ 编辑
                </button>
                <button
                  onClick={() => handleDeleteNotebook(currentNotebook.id, currentNotebook.name)}
                  className="btn-secondary text-caption"
                  style={{ color: '#FF6B6B', borderColor: '#FF6B6B' }}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>

            {/* 错题列表 */}
            <div className="p-xl space-y-lg max-w-[1000px] mx-auto">
              {loading ? (
                [1, 2].map((i) => <QuestionCardSkeleton key={i} />)
              ) : currentQuestions.length === 0 ? (
                <div className="card p-2xl text-center">
                  <div style={{ fontSize: '40px' }} className="mb-md">📝</div>
                  <p className="text-body text-text-secondary mb-lg font-bold">
                    这个本子还是空的，快来添加错题吧！🎈
                  </p>
                  <button onClick={() => navigate('/create')} className="btn-primary">
                    🚀 去录入错题
                  </button>
                </div>
              ) : (
                currentQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onDelete={() => deleteQuestion(q.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* 弹窗 */}
      {showCreateModal && (
        <CreateNotebookModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {editingNotebook && (
        <CreateNotebookModal
          notebook={editingNotebook}
          onClose={() => setEditingNotebook(null)}
        />
      )}
    </div>
  )
}
