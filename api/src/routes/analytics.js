import { Router } from 'express'
import db from '../models/db.js'
import { authMiddleware } from '../middleware/auth.js'
import { success } from '../middleware/errorHandler.js'

const router = Router()

router.use(authMiddleware)

// GET /analytics/overview - 总览数据
router.get('/overview', (req, res) => {
  const userId = req.userId

  const userQuestions = db.questions.filter((q) => {
    const nb = db.notebooks.find((n) => n.id === q.notebook_id && n.user_id === userId)
    return !!nb
  })

  const total = userQuestions.length
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekly = userQuestions.filter((q) => new Date(q.created_at) > weekAgo).length

  // 计算掌握度（基于复习记录）
  const userReviewRecords = db.reviewRecords.filter((r) => r.user_id === userId)
  const mastered = userQuestions.filter((q) => {
    const records = userReviewRecords.filter((r) => r.question_id === q.id)
    if (records.length === 0) return false
    const correctCount = records.filter((r) => r.is_correct).length
    return correctCount / records.length >= 0.8
  }).length

  const pending = total - mastered
  const mastery = total > 0 ? Math.round((mastered / total) * 100) : 0

  // 连续学习天数
  const streakDays = calculateStreakDays(userId)

  success(res, { total, weekly, mastery, mastered, pending, streak_days: streakDays })
})

// GET /analytics/trend - 掌握率趋势
router.get('/trend', (req, res) => {
  const userId = req.userId
  const days = parseInt(req.query.days) || 30

  const dates = []
  const values = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().slice(0, 10)
    dates.push(dateStr.slice(5)) // MM-DD

    const dayQuestions = db.questions.filter((q) => {
      const nb = db.notebooks.find((n) => n.id === q.notebook_id && n.user_id === userId)
      return nb && q.created_at.slice(0, 10) === dateStr
    })
    values.push(dayQuestions.length)
  }

  success(res, { dates, values })
})

// GET /analytics/weak-points - 薄弱知识点TOP5
router.get('/weak-points', (req, res) => {
  const userId = req.userId

  const userQuestions = db.questions.filter((q) => {
    const nb = db.notebooks.find((n) => n.id === q.notebook_id && n.user_id === userId)
    return !!nb
  })

  // 统计每个知识点的错误率
  const tagStats = {}
  for (const q of userQuestions) {
    if (!q.knowledge_points) continue
    const tags = q.knowledge_points.split(',').map((t) => t.trim())
    for (const tag of tags) {
      if (!tagStats[tag]) {
        tagStats[tag] = { total: 0, wrong: 0 }
      }
      tagStats[tag].total++

      const records = db.reviewRecords.filter((r) => r.question_id === q.id && r.user_id === userId)
      if (records.some((r) => !r.is_correct)) {
        tagStats[tag].wrong++
      }
    }
  }

  const weakPoints = Object.entries(tagStats)
    .map(([tag, stats]) => ({
      tag,
      error_rate: stats.total > 0 ? Math.round((stats.wrong / stats.total) * 100) : 0,
      count: stats.total,
    }))
    .sort((a, b) => b.error_rate - a.error_rate)
    .slice(0, 5)

  success(res, weakPoints)
})

// GET /analytics/checklist - 考前冲刺知识清单（错题知识点聚合 + 触类旁通）
router.get('/checklist', (req, res) => {
  const userId = req.userId

  const userQuestions = db.questions.filter((q) => {
    const nb = db.notebooks.find((n) => n.id === q.notebook_id && n.user_id === userId)
    return !!nb
  })

  // 1. 聚合知识点统计
  const tagStats = {}
  const tagQuestions = {}
  for (const q of userQuestions) {
    if (!q.knowledge_points) continue
    const tags = q.knowledge_points.split(',').map((t) => t.trim()).filter(Boolean)
    for (const tag of tags) {
      if (!tagStats[tag]) {
        tagStats[tag] = { total: 0, wrong: 0, reviewed: false }
        tagQuestions[tag] = []
      }
      tagStats[tag].total++
      tagQuestions[tag].push(q)

      const records = db.reviewRecords.filter((r) => r.question_id === q.id && r.user_id === userId)
      if (records.length > 0) tagStats[tag].reviewed = true
      if (records.some((r) => !r.is_correct)) tagStats[tag].wrong++
    }
  }

  // 2. 共现分析 → 触类旁通（同一道题里一起出现过的其他知识点）
  const cooccurrence = {}
  for (const tag of Object.keys(tagQuestions)) {
    const relatedCounts = {}
    for (const q of tagQuestions[tag]) {
      const otherTags = (q.knowledge_points.split(',').map((t) => t.trim()).filter(Boolean))
        .filter((t) => t !== tag)
      for (const ot of otherTags) {
        relatedCounts[ot] = (relatedCounts[ot] || 0) + 1
      }
    }
    cooccurrence[tag] = Object.entries(relatedCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t)
  }

  // 3. 组装清单项
  const items = Object.entries(tagStats).map(([tag, stats]) => {
    const errorRate = stats.total > 0 ? Math.round((stats.wrong / stats.total) * 100) : 0
    let status = 'new'
    if (stats.reviewed) {
      status = errorRate >= 60 ? 'weak' : errorRate >= 30 ? 'medium' : 'good'
    }
    return {
      tag,
      total: stats.total,
      wrong: stats.wrong,
      error_rate: errorRate,
      status,
      related: cooccurrence[tag] || [],
      sample_titles: (tagQuestions[tag] || []).slice(0, 3).map((q) => q.title || '未命名题目'),
    }
  })

  // 排序：薄弱优先 → 错误率降序 → 题数降序
  const order = { weak: 0, medium: 1, new: 2, good: 3 }
  items.sort((a, b) => {
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    if (b.error_rate !== a.error_rate) return b.error_rate - a.error_rate
    return b.total - a.total
  })

  const summary = {
    total_points: items.length,
    weak_points: items.filter((i) => i.status === 'weak').length,
    medium_points: items.filter((i) => i.status === 'medium').length,
    new_points: items.filter((i) => i.status === 'new').length,
    mastered_points: items.filter((i) => i.status === 'good').length,
    total_questions: userQuestions.length,
  }

  success(res, { items, summary })
})

/** 计算连续学习天数 */
function calculateStreakDays(userId) {
  const userQuestions = db.questions.filter((q) => {
    const nb = db.notebooks.find((n) => n.id === q.notebook_id && n.user_id === userId)
    return !!nb
  })

  const userRecords = db.reviewRecords.filter((r) => r.user_id === userId)

  const allDates = new Set([
    ...userQuestions.map((q) => q.created_at.slice(0, 10)),
    ...userRecords.map((r) => r.created_at.slice(0, 10)),
  ])

  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().slice(0, 10)
    if (allDates.has(dateStr)) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

export default router
