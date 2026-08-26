import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudyChecklist } from '@/utils/api'
import EmptyState from '@/components/common/EmptyState'
import type { StudyChecklist, ChecklistItem, ChecklistStatus } from '@/types'

// 状态配置（清新淡雅配色）
const STATUS_META: Record<ChecklistStatus, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  weak: { label: '薄弱', color: '#B47A7A', bg: '#F6E8E8', icon: '⚠️', desc: '错误率较高，优先攻克' },
  medium: { label: '待巩固', color: '#B08B5E', bg: '#F8EFE3', icon: '📌', desc: '偶尔出错，需要加强' },
  new: { label: '新收录', color: '#7A7A7A', bg: '#F2F1EC', icon: '🆕', desc: '已收录，尚未复习' },
  good: { label: '已掌握', color: '#5B8C5A', bg: '#EDF3E8', icon: '✅', desc: '错误率低，保持复习' },
}

export default function ChecklistPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<StudyChecklist | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      try {
        const res = await getStudyChecklist()
        if (!cancelled) setData(res)
      } catch (err) {
        console.error('获取冲刺清单失败:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleExpand = (tag: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  if (loading) {
    return (
      <div className="p-xl max-w-[1100px] mx-auto">
        <h1 className="text-h1 font-bold mb-xl" style={{ color: '#3C3C3C' }}>🎯 考前冲刺清单</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[90px] rounded-card animate-pulse" style={{ background: '#EDEAE2' }} />
          ))}
        </div>
        <div className="space-y-sm">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[110px] rounded-card animate-pulse" style={{ background: '#EDEAE2' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.summary.total_points === 0) {
    const hasQuestions = data?.summary.total_questions && data.summary.total_questions > 0
    return (
      <div className="p-xl">
        <EmptyState
          icon="🎯"
          title={hasQuestions ? '错题还没有知识点标签' : '暂无数据'}
          description={
            hasQuestions
              ? '录入错题时填写「知识点」标签，即可自动生成考前冲刺清单 📌'
              : '录入错题后，系统会根据你的错题自动提炼必备知识清单 📚'
          }
          actionLabel="去录入"
          onAction={() => navigate('/create')}
        />
      </div>
    )
  }

  const { summary } = data

  return (
    <div className="p-xl max-w-[1100px] mx-auto">
      <div className="mb-xl">
        <h1 className="text-h1 font-bold" style={{ color: '#3C3C3C' }}>🎯 考前冲刺清单</h1>
        <p className="mt-sm" style={{ color: '#9B9B9B', fontSize: '13px' }}>
          根据你的 {summary.total_questions} 道错题自动提炼必备知识点，按薄弱程度排序，帮你高效查漏补缺
        </p>
      </div>

      {/* 统计卡 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
        <SummaryCard label="知识点总数" value={summary.total_points} color="#7BA889" bg="#EDF3E8" icon="📚" />
        <SummaryCard label="薄弱知识点" value={summary.weak_points} color="#B47A7A" bg="#F6E8E8" icon="⚠️" />
        <SummaryCard label="待巩固" value={summary.medium_points} color="#B08B5E" bg="#F8EFE3" icon="📌" />
        <SummaryCard label="已掌握" value={summary.mastered_points} color="#5B8C5A" bg="#EAF3E6" icon="✅" />
      </div>

      {/* 知识清单列表 */}
      <div className="space-y-sm">
        {data.items.map((item, idx) => (
          <ChecklistCard
            key={item.tag}
            item={item}
            index={idx}
            expanded={expanded.has(item.tag)}
            onToggle={() => toggleExpand(item.tag)}
          />
        ))}
      </div>

      {/* 说明 */}
      <div
        className="mt-xl p-md"
        style={{
          background: '#FAFAF7',
          border: '1px dashed #D8D4C8',
          borderRadius: '12px',
          color: '#9B9B9B',
          fontSize: '12px',
          lineHeight: 1.7,
        }}
      >
        💡 清单说明：知识点来自你录入错题时填写的「知识点」标签；错误率 = 该知识点相关题目中做错过的比例。
        点击卡片可展开「触类旁通」——与你错题同题出现的关联知识点，值得一起复习。
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color, bg, icon }: { label: string; value: string | number; color: string; bg: string; icon: string }) {
  return (
    <div
      className="p-lg"
      style={{
        background: '#FFFFFF',
        border: '1px solid #EDEAE2',
        borderRadius: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      <div className="flex items-center justify-between mb-sm">
        <span className="text-caption font-bold" style={{ color: '#9B9B9B', fontSize: '12px' }}>{label}</span>
        <div
          className="flex items-center justify-center"
          style={{ width: '40px', height: '40px', borderRadius: '12px', background: bg, fontSize: '16px' }}
        >
          {icon}
        </div>
      </div>
      <div className="font-bold" style={{ color, fontSize: '28px', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function ChecklistCard({ item, index, expanded, onToggle }: { item: ChecklistItem; index: number; expanded: boolean; onToggle: () => void }) {
  const meta = STATUS_META[item.status]
  const hasExtra = item.related.length > 0 || item.sample_titles.length > 0

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #EDEAE2',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        borderLeft: `4px solid ${meta.color}`,
      }}
    >
      {/* 主行 */}
      <div className="flex items-center gap-md flex-wrap">
        {/* 序号 + 知识点名 + 状态 */}
        <div className="flex items-center gap-sm" style={{ minWidth: '200px', flex: 1 }}>
          <span
            className="flex items-center justify-center font-bold"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: meta.bg,
              color: meta.color,
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {index + 1}
          </span>
          <div>
            <div className="font-bold" style={{ color: '#3C3C3C', fontSize: '15px' }}>{item.tag}</div>
            <div
              className="inline-flex items-center gap-xs mt-xs font-bold"
              style={{
                color: meta.color,
                background: meta.bg,
                borderRadius: '999px',
                padding: '2px 10px',
                fontSize: '11px',
              }}
            >
              {meta.icon} {meta.label}
            </div>
          </div>
        </div>

        {/* 错误率进度条 */}
        <div style={{ minWidth: '180px', flex: 1.2 }}>
          <div className="flex items-center justify-between mb-xs">
            <span style={{ color: '#9B9B9B', fontSize: '12px' }}>错误率</span>
            <span className="font-bold" style={{ color: meta.color, fontSize: '14px' }}>{item.error_rate}%</span>
          </div>
          <div className="h-2 overflow-hidden" style={{ background: '#F4F2EC', borderRadius: '999px' }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${item.error_rate}%`, background: meta.color, borderRadius: '999px' }}
            />
          </div>
          <div style={{ color: '#B8B4A8', fontSize: '11px', marginTop: '6px' }}>
            涉及 {item.total} 题 · 做错 {item.wrong} 题
          </div>
        </div>

        {/* 展开按钮 */}
        <div className="flex items-center gap-sm">
          <button
            onClick={onToggle}
            style={{
              background: hasExtra ? (expanded ? meta.bg : '#FAFAF7') : '#FAFAF7',
              color: hasExtra ? meta.color : '#B8B4A8',
              border: '1px solid #EDEAE2',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: hasExtra ? 'pointer' : 'not-allowed',
              opacity: hasExtra ? 1 : 0.6,
            }}
          >
            {hasExtra ? (expanded ? '收起 ▲' : '触类旁通 ▼') : '暂无关联'}
          </button>
        </div>
      </div>

      {/* 展开区：触类旁通 + 相关错题 */}
      {expanded && hasExtra && (
        <div
          className="mt-md"
          style={{
            background: '#FAFAF7',
            border: '1px solid #F0EEE7',
            borderRadius: '12px',
            padding: '14px 16px',
          }}
        >
          {item.related.length > 0 && (
            <div className="mb-sm">
              <div className="font-bold mb-xs" style={{ color: '#6B6B6B', fontSize: '12px' }}>
                📎 触类旁通 · 关联知识点
              </div>
              <div className="flex flex-wrap gap-xs">
                {item.related.map((r) => (
                  <span
                    key={r}
                    className="font-bold"
                    style={{
                      background: '#EDF3E8',
                      color: '#5B8C5A',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      fontSize: '12px',
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
          {item.sample_titles.length > 0 && (
            <div>
              <div className="font-bold mb-xs" style={{ color: '#6B6B6B', fontSize: '12px' }}>
                📖 相关错题
              </div>
              <div className="space-y-xs">
                {item.sample_titles.map((t, i) => (
                  <div key={i} className="flex items-center gap-xs" style={{ color: '#7A7A7A', fontSize: '12px' }}>
                    <span style={{ color: meta.color }}>·</span> {t}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
