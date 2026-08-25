import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { getAnalyticsOverview, getAnalyticsTrend, getWeakPoints } from '@/utils/api'
import { ChartSkeleton } from '@/components/common/Skeleton'
import EmptyState from '@/components/common/EmptyState'
import type { AnalyticsOverview, AnalyticsTrend, WeakPoint } from '@/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [trend, setTrend] = useState<AnalyticsTrend | null>(null)
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ov, tr, wp] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsTrend(30),
          getWeakPoints(),
        ])
        setOverview(ov)
        setTrend(tr)
        setWeakPoints(wp)
      } catch (err) {
        console.error('获取看板数据失败:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const trendOption = trend ? {
    tooltip: { trigger: 'axis', textStyle: { fontSize: 20 } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trend.dates,
      axisLabel: { fontSize: 18, color: '#636E72' },
      axisLine: { lineStyle: { color: '#FFE0D0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 18, color: '#636E72' },
      splitLine: { lineStyle: { color: '#FFF8F0' } },
    },
    series: [{
      data: trend.values,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#6C5CE7', width: 4 },
      itemStyle: { color: '#6C5CE7' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(108,92,231,0.2)' },
            { offset: 1, color: 'rgba(108,92,231,0)' },
          ],
        },
      },
    }],
  } : {}

  const weakOption = weakPoints.length > 0 ? {
    tooltip: { trigger: 'axis', formatter: '{b}: 错误率 {c}%', textStyle: { fontSize: 20 } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: weakPoints.map((w) => w.tag),
      axisLabel: { fontSize: 18, color: '#636E72', rotate: 15 },
      axisLine: { lineStyle: { color: '#FFE0D0' } },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { fontSize: 18, color: '#636E72', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#FFF8F0' } },
    },
    series: [{
      data: weakPoints.map((w) => w.error_rate),
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const colors = ['#FF6B6B', '#FDCB6E', '#FDCB6E', '#FF7675', '#00B894']
          return colors[params.dataIndex % colors.length]
        },
        borderRadius: [12, 12, 0, 0],
      },
    }],
  } : {}

  return (
    <div className="p-xl max-w-[1400px] mx-auto">
      <h1 className="text-h1 font-bold mb-xl gradient-text">📊 数据看板</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
        <StatCard label="总错题数" value={overview.total} color="#6C5CE7" icon="📚" />
        <StatCard label="已掌握" value={overview.mastered} color="#00B894" icon="✅" />
        <StatCard label="待复习" value={overview.pending} color="#FDCB6E" icon="🔄" />
        <StatCard label="连续学习" value={`${overview.streak_days}天`} color="#FD79A8" icon="🔥" />
      </div>

      {/* 图表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* 趋势图 */}
        <div className="card p-lg">
          <h3 className="text-h2 text-text-primary font-bold mb-md flex items-center gap-xs">
            <span style={{ fontSize: '16px' }}>📈</span> 错题趋势（近30天）
          </h3>
          {trend && trend.dates.length > 0 ? (
            <ReactECharts option={trendOption} style={{ height: '320px' }} />
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
            <ReactECharts option={weakOption} style={{ height: '320px' }} />
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
                <circle cx="110" cy="110" r="92" fill="none" stroke="#FFF8F0" strokeWidth="20" />
                <circle
                  cx="110" cy="110" r="92" fill="none" stroke="#00B894" strokeWidth="20"
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
            <WeeklyStat label="本周新增错题" value={overview.weekly} max={50} color="#6C5CE7" />
            <WeeklyStat label="已掌握" value={overview.mastered} max={overview.total} color="#00B894" />
            <WeeklyStat label="待复习" value={overview.pending} max={overview.total} color="#FDCB6E" />
            <WeeklyStat
              label="未过关"
              value={overview.total - overview.mastered - overview.pending}
              max={overview.total}
              color="#FF6B6B"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div className="card p-lg hover:-translate-y-2 hover:shadow-cartoon-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-sm">
        <span className="text-caption text-text-secondary font-bold">{label}</span>
        <div
          className="flex items-center justify-center text-white"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: color,
            boxShadow: `0 4px 0 ${color}88`,
            fontSize: '14px',
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
        <span className="text-body text-text-secondary font-bold">{label}</span>
        <span className="text-body font-bold text-text-primary">{value}</span>
      </div>
      <div className="h-4 bg-gray-100 rounded-bubble overflow-hidden">
        <div
          className="h-full rounded-bubble transition-all"
          style={{ width: `${percent}%`, background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)` }}
        />
      </div>
    </div>
  )
}
