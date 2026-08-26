import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { getAnalyticsOverview, getAnalyticsTrend, getWeakPoints } from '@/utils/api'
import { ChartSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import type { AnalyticsOverview, AnalyticsTrend, WeakPoint } from '@/types'

/** 自动刷新间隔（毫秒） */
const AUTO_REFRESH_MS = 15000

// 莫兰迪淡雅配色
const PALETTE = {
  green: '#7BA889',
  greenLight: '#A8C5A0',
  purple: '#A8B5E5',
  orange: '#E5B894',
  pink: '#D9A0A0',
  gray: '#9B9B9B',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [trend, setTrend] = useState<AnalyticsTrend | null>(null)
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<number | null>(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [ov, tr, wp] = await Promise.all([
        getAnalyticsOverview(),
        getAnalyticsTrend(30),
        getWeakPoints(),
      ])
      setOverview(ov)
      setTrend(tr)
      setWeakPoints(wp)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('获取看板数据失败:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // 首次加载 + 自动轮询（实时更新）
  useEffect(() => {
    fetchData()

    timerRef.current = window.setInterval(() => {
      setRefreshing(true)
      fetchData(true)
    }, AUTO_REFRESH_MS)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [fetchData])

  const handleManualRefresh = () => {
    setRefreshing(true)
    fetchData(true)
  }

  if (loading) {
    return (
      <div className="p-xl max-w-[1400px] mx-auto">
        <h1 className="text-h1 font-bold mb-xl gradient-text">📊 数据看板</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  if (!overview || overview.total === 0) {
    return (
      <div className="p-xl">
        <EmptyState
          icon="📊"
          title="暂无数据"
          description="录入错题后即可查看学习数据分析 📈"
          actionLabel="去录入"
          onAction={() => navigate('/create')}
        />
      </div>
    )
  }

  const trendOption = trend
    ? {
        tooltip: { trigger: 'axis', textStyle: { fontSize: 20 } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category' as const,
          data: trend.dates,
          axisLabel: { fontSize: 14, color: '#9B9B9B' },
          axisLine: { lineStyle: { color: '#EDEAE2' } },
        },
        yAxis: {
          type: 'value' as const,
          axisLabel: { fontSize: 14, color: '#9B9B9B' },
          splitLine: { lineStyle: { color: '#F4F2EC' } },
        },
        series: [
          {
            data: trend.values,
            type: 'line' as const,
            smooth: true,
            symbol: 'circle',
            symbolSize: 7,
            lineStyle: { color: PALETTE.green, width: 3 },
            itemStyle: { color: PALETTE.green },
            areaStyle: {
              color: {
                type: 'linear' as const,
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(123,168,137,0.18)' },
                  { offset: 1, color: 'rgba(123,168,137,0)' },
                ],
              },
            },
          },
        ],
      }
    : {}

  const weakOption =
    weakPoints.length > 0
      ? {
          tooltip: { trigger: 'axis' as const, formatter: '{b}: 错误率 {c}%', textStyle: { fontSize: 20 } },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category' as const,
            data: weakPoints.map((w) => w.tag),
            axisLabel: { fontSize: 14, color: '#9B9B9B', rotate: 15 },
            axisLine: { lineStyle: { color: '#EDEAE2' } },
          },
          yAxis: {
            type: 'value' as const,
            max: 100,
            axisLabel: { fontSize: 14, color: '#9B9B9B', formatter: '{value}%' },
            splitLine: { lineStyle: { color: '#F4F2EC' } },
          },
          series: [
            {
              data: weakPoints.map((w) => w.error_rate),
              type: 'bar' as const,
              barWidth: '40%',
              itemStyle: {
                color: (params: { dataIndex: number }) => {
                  const colors = [PALETTE.pink, PALETTE.orange, PALETTE.orange, PALETTE.purple, PALETTE.green]
                  return colors[params.dataIndex % colors.length]
                },
                borderRadius: [8, 8, 0, 0],
              },
            },
          ],
        }
      : {}

  const lastUpdatedText = lastUpdated
    ? `${lastUpdated.getHours().toString().padStart(2, '0')}:${lastUpdated.getMinutes().toString().padStart(2, '0')}:${lastUpdated.getSeconds().toString().padStart(2, '0')}`
    : '--:--:--'

  return (
    <div className="p-xl max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-xl flex-wrap gap-sm">
        <h1 className="text-h1 font-bold gradient-text">📊 数据看板</h1>

        {/* 实时更新状态条 */}
        <div
          className="flex items-center gap-sm px-md py-sm"
          style={{
            background: '#FFFFFF',
            border: '1px solid #EDEAE2',
            borderRadius: '999px',
          }}
        >
          <span
            className="inline-block"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: PALETTE.green,
              boxShadow: '0 0 0 0 rgba(123,168,137,0.4)',
              animation: 'pulse-dot 1.8s ease-out infinite',
            }}
          />
          <span style={{ color: '#6B6B6B', fontSize: '12px', fontWeight: 600 }}>
            {refreshing ? '正在更新...' : `自动更新中 · 每 ${AUTO_REFRESH_MS / 1000}s`}
          </span>
          <span style={{ color: '#B8B4A8', fontSize: '12px' }}>最后更新 {lastUpdatedText}</span>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            style={{
              background: '#EDF3E8',
              color: '#5B8C5A',
              border: 'none',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? '更新中…' : '🔄 立即刷新'}
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
        <StatCard label="总错题数" value={overview.total} color={PALETTE.purple} bg="#EEF1F8" icon="📚" />
        <StatCard label="已掌握" value={overview.mastered} color={PALETTE.green} bg="#EDF3E8" icon="✅" />
        <StatCard label="待复习" value={overview.pending} color={PALETTE.orange} bg="#F8EFE3" icon="🔄" />
        <StatCard label="连续学习" value={`${overview.streak_days}天`} color={PALETTE.pink} bg="#F6E8E8" icon="🔥" />
      </div>

      {/* 图表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* 趋势图 */}
        <div className="card p-lg">
          <h3 className="text-h2 text-text-primary font-bold mb-md flex items-center gap-xs">
            <span style={{ fontSize: '16px' }}>📈</span> 错题趋势（近30天）
          </h3>
          {trend && trend.dates.length > 0 ? (
            <ReactECharts option={trendOption} style={{ height: '320px' }} notMerge />
          ) : (
            <div className="h-[320px] flex items-center justify-center text-text-auxiliary text-caption font-bold">
              📭 暂无数据
            </div>
          )}
        </div>

        {/* 薄弱知识点 */}
        <div className="card p-lg">
          <h3 className="text-h2 text-text-primary font-bold mb-md flex items-center gap-xs">
            <span style={{ fontSize: '16px' }}>⚠️</span> 薄弱知识点 TOP5
          </h3>
          {weakPoints.length > 0 ? (
            <ReactECharts option={weakOption} style={{ height: '320px' }} notMerge />
          ) : (
            <div className="h-[320px] flex items-center justify-center text-text-auxiliary text-caption font-bold">
              📭 暂无数据
            </div>
          )}
        </div>

        {/* 掌握率环形图 */}
        <div className="card p-lg">
          <h3 className="text-h2 text-text-primary font-bold mb-md flex items-center gap-xs">
            <span style={{ fontSize: '16px' }}>🎯</span> 掌握率
          </h3>
          <div className="h-[320px] flex flex-col items-center justify-center">
            <div className="relative" style={{ width: '220px', height: '220px' }}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
                <circle cx="110" cy="110" r="92" fill="none" stroke="#F4F2EC" strokeWidth="20" />
                <circle
                  cx="110" cy="110" r="92" fill="none" stroke={PALETTE.green} strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 92 * (overview.mastery / 100)} ${2 * Math.PI * 92}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-h1 font-bold text-text-primary">{overview.mastery}%</span>
                <span className="text-caption text-text-secondary font-bold">掌握率</span>
              </div>
            </div>
            <div className="mt-md text-caption text-text-secondary font-bold">
              📝 本周新增 {overview.weekly} 题
            </div>
          </div>
        </div>

        {/* 本周概览 */}
        <div className="card p-lg">
          <h3 className="text-h2 text-text-primary font-bold mb-md flex items-center gap-xs">
            <span style={{ fontSize: '16px' }}>📅</span> 本周概览
          </h3>
          <div className="space-y-md pt-sm">
            <WeeklyStat label="本周新增错题" value={overview.weekly} max={50} color={PALETTE.purple} />
            <WeeklyStat label="已掌握" value={overview.mastered} max={overview.total} color={PALETTE.green} />
            <WeeklyStat label="待复习" value={overview.pending} max={overview.total} color={PALETTE.orange} />
            <WeeklyStat
              label="未过关"
              value={overview.total - overview.mastered - overview.pending}
              max={overview.total}
              color={PALETTE.pink}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, bg, icon }: { label: string; value: string | number; color: string; bg: string; icon: string }) {
  return (
    <div
      className="p-lg transition-all duration-300"
      style={{
        background: '#FFFFFF',
        border: '1px solid #EDEAE2',
        borderRadius: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
    >
      <div className="flex items-center justify-between mb-sm">
        <span className="text-caption font-bold" style={{ color: '#9B9B9B' }}>{label}</span>
        <div
          className="flex items-center justify-center"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: bg,
            fontSize: '18px',
          }}
        >
          {icon}
        </div>
      </div>
      <div className="text-h1 font-bold" style={{ color }}>{value}</div>
    </div>
  )
}

function WeeklyStat({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-xs">
        <span className="text-body font-bold" style={{ color: '#9B9B9B' }}>{label}</span>
        <span className="text-body font-bold" style={{ color: '#3C3C3C' }}>{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden" style={{ background: '#F4F2EC', borderRadius: '999px' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${percent}%`, background: color, borderRadius: '999px' }}
        />
      </div>
    </div>
  )
}
