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
