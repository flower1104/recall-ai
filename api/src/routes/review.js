import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../models/db.js'
import { authMiddleware } from '../middleware/auth.js'
import { success, fail } from '../middleware/errorHandler.js'

const router = Router()

router.use(authMiddleware)

// POST /review/start - 开始复习，生成题目列表
router.post('/start', (req, res) => {
  const { notebook_ids, question_count = 10 } = req.body

  if (!notebook_ids || notebook_ids.length === 0) {
    return fail(res, '请选择至少一个错题本')
  }

  // 验证错题本归属
  const validNotebookIds = db.notebooks
    .filter((nb) => nb.user_id === req.userId && notebook_ids.includes(nb.id))
    .map((nb) => nb.id)

  if (validNotebookIds.length === 0) {
    return fail(res, '未找到有效的错题本')
  }

  // 获取所有题目
  let allQuestions = db.questions.filter((q) => validNotebookIds.includes(q.notebook_id))

  // 随机打乱并截取指定数量
  allQuestions = allQuestions.sort(() => Math.random() - 0.5)
  const selected = allQuestions.slice(0, Math.min(question_count, allQuestions.length))

  if (selected.length === 0) {
    return fail(res, '选中的错题本中没有错题')
  }

  const sessionId = uuidv4()
  const questionsWithOptions = selected.map((q) => ({
    ...q,
    options: db.options.filter((opt) => opt.question_id === q.id),
    // 复习时不返回正确答案和解析
    correct_answer: undefined,
    analysis: undefined,
  }))

  success(res, { session_id: sessionId, questions: questionsWithOptions })
})

// POST /review/submit - 提交作答结果
router.post('/submit', (req, res) => {
  const { session_id, answers } = req.body

  if (!session_id || !answers) {
    return fail(res, '缺少会话ID或答案')
  }

  const questionIds = Object.keys(answers)
  if (questionIds.length === 0) {
    return fail(res, '请提交至少一道题的答案')
  }

  let correct = 0
  let wrong = 0
  const details = []

  for (const questionId of questionIds) {
    const q = db.questions.find((item) => item.id === questionId)
    if (!q) continue

    // 验证归属
    const nb = db.notebooks.find((n) => n.id === q.notebook_id && n.user_id === req.userId)
    if (!nb) continue

    const userAnswer = answers[questionId] || ''
    const isCorrect = userAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()

    if (isCorrect) {
      correct++
    } else {
      wrong++
    }

    // 保存复习记录
    db.reviewRecords.push({
      id: uuidv4(),
      user_id: req.userId,
      question_id: questionId,
      session_id,
      user_answer: userAnswer,
      is_correct: isCorrect,
      created_at: new Date().toISOString(),
    })

    details.push({
      question_id: questionId,
      title: q.title,
      content: q.content,
      user_answer: userAnswer,
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
    })
  }

  const total = correct + wrong
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  success(res, {
    session_id,
    total,
    correct,
    wrong,
    accuracy,
    details,
  })
})

export default router
