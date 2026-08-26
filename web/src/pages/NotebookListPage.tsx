import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/app'
import { NotebookSkeleton as NotebookListSkeleton, QuestionCardSkeleton } from '@/components/common/Skeleton'
import QuestionCard from '@/components/question/QuestionCard'
import CreateNotebookModal from '@/components/notebook/CreateNotebookModal'
import type { Notebook } from '@/types'

export default function NotebookListPage() {
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
    <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 0px)' }}>
      {/* 左侧 — 错题本列表 */}
      <aside
        className={`${
          mobileListVisible ? 'fixed inset-y-0 left-0 z-40 w-[320px] shadow-2xl' : 'hidden'
        } md:relative md:inset-auto md:z-auto md:block flex-shrink-0 flex flex-col`}
        style={{
          width: '280px',
          background: '#FFFFFF',
          borderRight: '1px solid #EDEAE2',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div className="p-md" style={{ borderBottom: '1px solid #EDEAE2' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-sm"
            style={{
              background: '#7BA889',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span>➕</span> 新建错题本
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-sm py-sm">
          {loading ? (
            <NotebookListSkeleton />
          ) : notebooks.length === 0 ? (
            <div className="p-lg text-center" style={{ color: '#9B9B9B', fontSize: '12px' }}>
              <div style={{ fontSize: '32px' }}>📭</div>
              <p className="mt-md">暂无错题本</p>
            </div>
          ) : (
            notebooks.map((nb) => {
              const isSelected = currentNotebookId === nb.id
              return (
                <div
                  key={nb.id}
                  onClick={() => handleSelectNotebook(nb.id)}
                  className="flex items-center gap-sm cursor-pointer transition-all duration-150"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    marginBottom: '2px',
                    background: isSelected ? '#EDF3E8' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#FAFAF7'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center text-white"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: nb.color,
                      fontSize: '14px',
                    }}
                  >
                    📓
                  </div>
                  <span
                    className="flex-1 truncate"
                    style={{
                      color: isSelected ? '#3C5A35' : '#3C3C3C',
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    {nb.name}
                  </span>
                  <span
                    style={{
                      color: '#9B9B9B',
                      fontSize: '11px',
                      background: '#FAFAF7',
                      padding: '1px 8px',
                      borderRadius: '10px',
                      border: '1px solid #EDEAE2',
                    }}
                  >
                    {nb.question_count ?? 0}
                  </span>
                </div>
              )
            })
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
      <div className="flex-1 overflow-y-auto" style={{ background: '#F7F6F2' }}>
        {/* 移动端返回按钮 */}
        {!mobileListVisible && currentNotebook && (
          <button
            className="md:hidden p-md"
            onClick={() => setMobileListVisible(true)}
            style={{ color: '#6B6B6B', fontSize: '14px', fontWeight: 600 }}
          >
            ← 错题本列表
          </button>
        )}

        {!currentNotebook ? (
          <div className="flex flex-col items-center justify-center py-2xl px-md">
            <div className="animate-float" style={{ fontSize: '60px', marginBottom: '24px' }}>
              📚
            </div>
            <h3 className="font-bold mb-sm" style={{ color: '#3C3C3C', fontSize: '18px' }}>
              还没有错题本
            </h3>
            <p className="mb-xl text-center max-w-[500px]" style={{ color: '#9B9B9B', fontSize: '13px' }}>
              点击下方按钮创建你的第一个错题本吧
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#7BA889',
                color: '#FFFFFF',
                padding: '10px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ➕ 新建错题本
            </button>
          </div>
        ) : (
          <>
            {/* 错题本头部 */}
            <div
              className="px-xl py-md flex items-center justify-between"
              style={{
                background: '#FFFFFF',
                borderBottom: '1px solid #EDEAE2',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div className="flex items-center gap-sm">
                <div
                  className="flex items-center justify-center text-white"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: currentNotebook.color,
                    fontSize: '16px',
                  }}
                >
                  📓
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: '#3C3C3C', fontSize: '16px' }}>
                    {currentNotebook.name}
                  </h2>
                  <span style={{ color: '#9B9B9B', fontSize: '12px' }}>
                    📝 {currentNotebook.question_count ?? currentQuestions.length} 道题
                  </span>
                </div>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => handleEditNotebook(currentNotebook)}
                  style={{
                    color: '#6B6B6B',
                    background: '#FAFAF7',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: '1px solid #EDEAE2',
                    cursor: 'pointer',
                  }}
                >
                  ✏ 编辑
                </button>
                <button
                  onClick={() => handleDeleteNotebook(currentNotebook.id, currentNotebook.name)}
                  style={{
                    color: '#9B6E5E',
                    background: '#F8EFE3',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: '1px solid #F2E0CC',
                    cursor: 'pointer',
                  }}
                >
                  🗑 删除
                </button>
              </div>
            </div>

            {/* 错题列表 */}
            <div className="px-xl py-lg space-y-md" style={{ maxWidth: '980px', margin: '0 auto' }}>
              {loading ? (
                [1, 2, 3].map((i) => <QuestionCardSkeleton key={i} />)
              ) : currentQuestions.length === 0 ? (
                <div
                  className="text-center p-2xl"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px dashed #E5E2D8',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
                  <p className="mb-lg" style={{ color: '#7A7A7A', fontSize: '14px' }}>
                    这个本子还是空的，快来添加错题吧
                  </p>
                  <button
                    onClick={() => navigate('/create')}
                    style={{
                      background: '#7BA889',
                      color: '#FFFFFF',
                      padding: '8px 20px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ➕ 去录入错题
                  </button>
                </div>
              ) : (
                currentQuestions.map((q) => (
                  <QuestionCard key={q.id} question={q} onDelete={() => deleteQuestion(q.id)} />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* 弹窗 */}
      {showCreateModal && (
        <CreateNotebookModal onClose={() => setShowCreateModal(false)} />
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

// （占位 — 此页无需额外导出）

