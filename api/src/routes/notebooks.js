import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../models/db.js'
import { authMiddleware } from '../middleware/auth.js'
import { success, fail } from '../middleware/errorHandler.js'

const router = Router()

// All routes require auth
router.use(authMiddleware)

// GET /notebooks - 获取当前用户所有错题本
router.get('/', (req, res) => {
  const notebooks = db.notebooks
    .filter((nb) => nb.user_id === req.userId)
    .map((nb) => {
      const questionCount = db.questions.filter((q) => q.notebook_id === nb.id).length
      return { ...nb, question_count: questionCount }
    })
  success(res, notebooks)
})

// POST /notebooks - 创建错题本
router.post('/', (req, res) => {
  const { name, color } = req.body
  if (!name || !color) {
    return fail(res, '请输入名称和选择颜色')
  }

  const now = new Date().toISOString()
  const notebook = {
    id: uuidv4(),
    user_id: req.userId,
    name: name.trim(),
    color,
    created_at: now,
    updated_at: now,
  }
  db.notebooks.push(notebook)
  success(res, { ...notebook, question_count: 0 }, '创建成功')
})

// PUT /notebooks/:id - 更新错题本
router.put('/:id', (req, res) => {
  const { name, color } = req.body
  const nb = db.notebooks.find((n) => n.id === req.params.id && n.user_id === req.userId)
  if (!nb) {
    return fail(res, '错题本不存在', 404)
  }

  if (name) nb.name = name.trim()
  if (color) nb.color = color
  nb.updated_at = new Date().toISOString()

  const questionCount = db.questions.filter((q) => q.notebook_id === nb.id).length
  success(res, { ...nb, question_count: questionCount }, '更新成功')
})

// DELETE /notebooks/:id - 删除错题本（级联删除错题）
router.delete('/:id', (req, res) => {
  const nbIdx = db.notebooks.findIndex((n) => n.id === req.params.id && n.user_id === req.userId)
  if (nbIdx === -1) {
    return fail(res, '错题本不存在', 404)
  }

  // 级联删除错题和选项
  const questionsToDelete = db.questions.filter((q) => q.notebook_id === req.params.id)
  const questionIds = questionsToDelete.map((q) => q.id)
  db.options = db.options.filter((opt) => !questionIds.includes(opt.question_id))
  db.questions = db.questions.filter((q) => q.notebook_id !== req.params.id)
  db.notebooks.splice(nbIdx, 1)

  success(res, null, '删除成功')
})

// GET /notebooks/:id/questions - 获取某错题本下所有错题
router.get('/:id/questions', (req, res) => {
  const { id } = req.params
  const { page = 1, limit = 20 } = req.query

  const nb = db.notebooks.find((n) => n.id === id && n.user_id === req.userId)
  if (!nb) {
    return fail(res, '错题本不存在', 404)
  }

  const allQuestions = db.questions
    .filter((q) => q.notebook_id === id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const start = (pageNum - 1) * limitNum
  const list = allQuestions.slice(start, start + limitNum).map((q) => ({
    ...q,
    options: db.options.filter((opt) => opt.question_id === q.id),
  }))

  success(res, { list, total: allQuestions.length })
})

export default router
