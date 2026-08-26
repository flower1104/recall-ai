import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useAppStore } from '@/store/app'
import { getAnalyticsOverview, getQuestions } from '@/utils/api'
import { MOTIVATIONAL_QUOTES, getGreeting, recordTodayLogin, getRecentCheckInDates } from '@/utils/quotes'
import type { AnalyticsOverview, Question } from '@/types'

// 清新淡雅配色（莫兰迪低饱和度）
const SUBJECT_COLORS: Record<string, string> = {
  数学: '#A8C5A0',
  英语: '#E5B894',
  物理: '#A2B8D3',
  化学: '#C5A8C5',
  生物: '#9EC8B5',
  语文: '#D6B98C',
  政治: '#C99494',
  历史: '#B5A47E',
  地理: '#9BB5A0',
  default: '#9B9B9B',
}

function pickSubjectColor(subject?: string): string {
  if (!subject) return SUBJECT_COLORS.default
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default
}

export default function HomePage() {
  const navigate = useNavigate()
  const { notebooks, fetchNotebooks } = useAppStore()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [todayReviewQuestions, setTodayReviewQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  // 励志语：进入页面随机抽一条，刷新按钮可换
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length))
  const refreshQuote = () => setQuoteIdx((i) => (i + 1) % MOTIVATIONAL_QUOTES.length)

  // 进入页面自动记录今日打卡
  useEffect(() => {
    recordTodayLogin()
  }, [])

  // 拉取所有错题本和首页数据
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        await fetchNotebooks()
        const ov = await getAnalyticsOverview()
        setOverview(ov)
      } catch (err) {
        console.error('获取首页数据失败:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [fetchNotebooks])

  // 从每个错题本中拼凑"今日待复习"——最新的 3 题
  useEffect(() => {
    const loadTodayReview = async () => {
      if (notebooks.length === 0) {
        setTodayReviewQuestions([])
        return
      }
      try {
        // 取最近创建的有题目的本子的最新题目（最多取 3 题）
        const all: Question[] = []
        for (const nb of notebooks.slice(0, 5)) {
          if (all.length >= 3) break
          try {
            const { list } = await getQuestions(nb.id, 1, 3)
            all.push(...list)
          } catch {
            // 单个错题本失败不影响其他
          }
        }
        // 按创建时间倒序
        all.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        setTodayReviewQuestions(all.slice(0, 3))
      } catch {
        // 静默
      }
    }
    loadTodayReview()
  }, [notebooks])

  // 倒计时天数（按错题录入时间 vs 现在）
  const daysSinceLastEntry = useMemo(() => {
    if (todayReviewQuestions.length === 0) return 0
    const last = todayReviewQuestions[0]
    return Math.max(0, dayjs().diff(dayjs(last.created_at), 'day'))
  }, [todayReviewQuestions])

  const greeting = getGreeting()
  const username = useAppStore((s) => s.notebooks.length) // placeholder
  void username

  // 重新计算"仍需加强"
  const stats = useMemo(() => {
    if (!overview) return null
    const total = overview.total
    const mastered = overview.mastered
    const pending = overview.pending
    const needPractice = Math.max(0, total - mastered - pending)
    return {
      total,
      pending,
      mastered,
      needPractice,
      streak: overview.streak_days,
    }
  }, [overview])

  // 学习进度（以掌握率呈现）
  const masteryPercent = overview ? overview.mastery : 0

  return (
    <div className="px-xl py-xl" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* 顶部 — 欢迎语 + 励志语句 */}
      <header className="mb-xl">
        <h1
          className="font-bold flex items-center gap-sm"
          style={{ color: '#3C3C3C', fontSize: '26px', marginBottom: '8px' }}
        >
          {greeting}, 今天也要加油 <span style={{ fontSize: '22px' }}>💪</span>
        </h1>
        <p style={{ color: '#7A7A7A', fontSize: '14px' }}>
          你有{' '}
          <span style={{ color: '#5B8C5A', fontWeight: 600 }}>
            {stats?.pending ?? 0}
          </span>{' '}
          道错题到了复习时间，别让它们等到明天
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-lg">
        {/* 主区 */}
        <div className="flex-1 min-w-0 space-y-lg">
          {/* 复习提醒卡 */}
          <div
            className="flex items-center justify-between p-md"
            style={{
              background: '#EDF3E8',
              border: '1px solid #D2E2C7',
              borderRadius: '16px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center gap-md">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                🌱
              </div>
              <div>
                <div style={{ color: '#3C5A35', fontWeight: 600, fontSize: '14px' }}>
                  {stats?.pending ?? 0} 道错题已到复习时间
                </div>
                <div style={{ color: '#7A9C72', fontSize: '12px', marginTop: '2px' }}>
                  {daysSinceLastEntry > 0
                    ? `距上次录入已过 ${daysSinceLastEntry} 天，是时候重新写一遍加深记忆了`
                    : '今日新录入，是时候重新写一遍加深记忆了'}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/review')}
              className="flex-shrink-0 px-lg"
              style={{
                height: '38px',
                background: '#FFFFFF',
                color: '#5B8C5A',
                border: '1px solid #C9DDC1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              去复习 →
            </button>
          </div>

          {/* 4 个统计指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <StatCard
              icon="📚"
              value={stats?.total ?? 0}
              label="累计错题"
              color="#A8B5E5"
              bgColor="#EEF1F8"
            />
            <StatCard
              icon="🏆"
              value={stats?.pending ?? 0}
              label="待复习"
              color="#E5B894"
              bgColor="#F8EFE3"
            />
            <StatCard
              icon="✅"
              value={stats?.mastered ?? 0}
              label="已掌握"
              color="#A8C5A0"
              bgColor="#EDF3E8"
            />
            <StatCard
              icon="⚠️"
              value={stats?.needPractice ?? 0}
              label="仍需加强"
              color="#D9A0A0"
              bgColor="#F6E8E8"
            />
          </div>

          {/* 今日待复习 */}
          <section
            className="p-lg"
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #EDEAE2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center justify-between mb-md">
              <h2 className="flex items-center gap-sm font-bold" style={{ color: '#3C3C3C', fontSize: '16px' }}>
                <span style={{ fontSize: '16px' }}>✨</span> 今日待复习
              </h2>
              <span style={{ color: '#9B9B9B', fontSize: '12px' }}>共 {todayReviewQuestions.length} 道</span>
            </div>

            {loading ? (
              <div className="space-y-sm">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '64px' }} />
                ))}
              </div>
            ) : todayReviewQuestions.length === 0 ? (
              <div className="py-xl text-center" style={{ color: '#9B9B9B', fontSize: '13px' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
                <p>暂无错题，先去录入吧～</p>
                <button
                  onClick={() => navigate('/create')}
                  className="mt-md"
                  style={{
                    background: '#7BA889',
                    color: '#FFFFFF',
                    padding: '8px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  ➕ 录入错题
                </button>
              </div>
            ) : (
              <div className="space-y-sm">
                {todayReviewQuestions.map((q) => {
                  const subject = (q.knowledge_points?.split(',')[0] || '').trim()
                  const accent = pickSubjectColor(subject)
                  const createdDays = dayjs().diff(dayjs(q.created_at), 'day')
                  return (
                    <div
                      key={q.id}
                      onClick={() => navigate('/review', { state: { questionIds: [q.id] } })}
                      className="flex items-start gap-md p-md"
                      style={{
                        background: '#FAFAF7',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        borderLeft: `3px solid ${accent}`,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F2F1ED')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#FAFAF7')}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-sm mb-xs">
                          {subject && (
                            <span
                              style={{
                                background: `${accent}33`,
                                color: '#3C3C3C',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 600,
                              }}
                            >
                              {subject}
                            </span>
                          )}
                          <span
                            style={{
                              color: '#E89B6E',
                              fontSize: '11px',
                              border: '1px solid #F5D5BD',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              background: '#FFF7EE',
                            }}
                          >
                            待复习
                          </span>
                        </div>
                        <p
                          className="line-clamp-2"
                          style={{ color: '#3C3C3C', fontSize: '13px', lineHeight: 1.5 }}
                        >
                          {q.title}
                        </p>
                        <div className="mt-xs" style={{ color: '#9B9B9B', fontSize: '11px' }}>
                          录入于 {createdDays} 天前，已复习 0 次
                        </div>
                      </div>
                      <div className="flex items-center gap-xs flex-shrink-0" style={{ color: '#E89B6E', fontSize: '12px' }}>
                        ✍ 待写答
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* 右侧栏 */}
        <aside className="flex flex-col gap-md lg:w-[320px] flex-shrink-0">
          {/* 励志语句卡 */}
          <div
            className="p-md text-center"
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #EDEAE2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center justify-between mb-sm">
              <span style={{ color: '#9B9B9B', fontSize: '11px' }}>🌟 今日励志</span>
              <button
                onClick={refreshQuote}
                title="换一条"
                style={{
                  color: '#9B9B9B',
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  background: '#FAFAF7',
                  border: '1px solid #EDEAE2',
                  cursor: 'pointer',
                }}
              >
                🔄 换一句
              </button>
            </div>
            <p
              className="font-medium"
              style={{
                color: '#5B8C5A',
                fontSize: '15px',
                lineHeight: 1.7,
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {MOTIVATIONAL_QUOTES[quoteIdx]}
            </p>
          </div>

          {/* 打卡日历 */}
          <CheckInCalendar />

          {/* 学习进度 */}
          <div
            className="p-md"
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #EDEAE2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-center justify-between mb-md">
              <h3 className="font-bold flex items-center gap-sm" style={{ color: '#3C3C3C', fontSize: '14px' }}>
                <span>📈</span> 学习进度
              </h3>
            </div>
            <div className="space-y-md">
              <ProgressBar label="掌握率" value={masteryPercent} color="#A8C5A0" />
              <ProgressBar label="近 7 天活跃" value={Math.min(100, (overview?.weekly || 0) * 8)} color="#A2B8D3" />
              <ProgressBar label="连续学习" value={Math.min(100, (overview?.streak_days || 0) * 5)} color="#E5B894" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

/** 单个统计卡片 */
function StatCard({
  icon,
  value,
  label,
  color,
  bgColor,
}: {
  icon: string
  value: number | string
  label: string
  color: string
  bgColor: string
}) {
  return (
    <div
      className="p-md"
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #EDEAE2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between mb-sm">
        <span style={{ color: '#9B9B9B', fontSize: '12px', fontWeight: 500 }}>{label}</span>
        <div
          className="flex items-center justify-center"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: bgColor,
            fontSize: '16px',
          }}
        >
          {icon}
        </div>
      </div>
      <div className="font-bold" style={{ color, fontSize: '32px', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

/** 进度条组件 */
function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-xs">
        <span style={{ color: '#7A7A7A', fontSize: '12px' }}>{label}</span>
        <span className="font-bold" style={{ color, fontSize: '12px' }}>
          {Math.round(value)}%
        </span>
      </div>
      <div style={{ background: '#F7F6F2', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: color,
            borderRadius: '6px',
            transition: 'width 0.4s',
          }}
        />
      </div>
    </div>
  )
}

/** 本月打卡日历 */
function CheckInCalendar() {
  const navigate = useNavigate()
  const [checkInDates, setCheckInDates] = useState<string[]>([])
  const [monthOffset, setMonthOffset] = useState(0)

  useEffect(() => {
    recordTodayLogin()
    setCheckInDates(getRecentCheckInDates())
  }, [])

  const target = dayjs().add(monthOffset, 'month')
  const year = target.year()
  const month = target.month() + 1
  const today = dayjs().format('YYYY-MM-DD')
  const daysInMonth = target.daysInMonth()
  const firstWeekday = target.startOf('month').day() // 0=Sun

  const checkInSet = useMemo(() => new Set(checkInDates), [checkInDates])

  // 显示的标题月份
  const titleMonth = `${month}月`

  return (
    <div
      className="p-md"
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #EDEAE2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-bold" style={{ color: '#3C3C3C', fontSize: '14px' }}>
          📅 {titleMonth}
        </h3>
        <div className="flex gap-xs">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#FAFAF7',
              border: '1px solid #EDEAE2',
              color: '#7A7A7A',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ‹
          </button>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#FAFAF7',
              border: '1px solid #EDEAE2',
              color: '#7A7A7A',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            disabled={monthOffset >= 0}
          >
            ›
          </button>
        </div>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 gap-xs mb-xs">
        {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
          <div
            key={d}
            className="text-center"
            style={{
              color: i === 0 || i === 6 ? '#D9A0A0' : '#9B9B9B',
              fontSize: '11px',
              padding: '4px 0',
              fontWeight: 500,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-xs">
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isChecked = checkInSet.has(dateStr)
          const isToday = dateStr === today
          const isFuture = dateStr > today
          return (
            <div
              key={day}
              className="text-center"
              style={{
                fontSize: '12px',
                padding: '6px 0',
                borderRadius: '6px',
                background: isChecked ? '#E8F0E1' : isToday ? '#F5E6D3' : 'transparent',
                color: isChecked ? '#5B8C5A' : isFuture ? '#CCCCCC' : '#3C3C3C',
                fontWeight: isToday || isChecked ? 600 : 400,
                border: isToday ? '1px solid #D4B98C' : 'none',
                cursor: isChecked ? 'pointer' : 'default',
              }}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* 底部说明 + 跳转 */}
      <div
        className="mt-md pt-md flex items-center justify-between"
        style={{ borderTop: '1px solid #F2F1ED' }}
      >
        <div style={{ color: '#9B9B9B', fontSize: '11px' }}>
          已打卡{' '}
          <span style={{ color: '#5B8C5A', fontWeight: 600 }}>
            {checkInDates.filter((d) => d.startsWith(`${year}-${String(month).padStart(2, '0')}`)).length}
          </span>{' '}
          天
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            color: '#5B8C5A',
            fontSize: '12px',
            fontWeight: 600,
            background: 'transparent',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          查看数据 →
        </button>
      </div>
    </div>
  )
}
