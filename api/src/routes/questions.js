import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import db from '../models/db.js'
import { authMiddleware } from '../middleware/auth.js'
import { success, fail } from '../middleware/errorHandler.js'

const router = Router()

// File upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (validTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持JPG/PNG/WEBP格式'))
    }
  },
})

router.use(authMiddleware)

// POST /questions - 创建错题
router.post('/', (req, res) => {
  const {
    notebook_id, new_notebook_name, new_notebook_color,
    title, content, correct_answer, analysis, image_url,
    knowledge_points, options,
  } = req.body

  if (!content || !correct_answer) {
    return fail(res, '题目内容和正确答案不能为空')
  }

  let targetNotebookId = notebook_id

  // 如果需要创建新错题本
  if (!targetNotebookId && new_notebook_name) {
    const now = new Date().toISOString()
    const newNb = {
      id: uuidv4(),
      user_id: req.userId,
      name: new_notebook_name.trim(),
      color: new_notebook_color || '#007AFF',
      created_at: now,
      updated_at: now,
    }
    db.notebooks.push(newNb)
    targetNotebookId = newNb.id
  }

  if (!targetNotebookId) {
    return fail(res, '请选择或创建错题本')
  }

  const nb = db.notebooks.find((n) => n.id === targetNotebookId && n.user_id === req.userId)
  if (!nb) {
    return fail(res, '错题本不存在', 404)
  }

  const now = new Date().toISOString()
  const question = {
    id: uuidv4(),
    notebook_id: targetNotebookId,
    title: title || content.slice(0, 30),
    content: content.trim(),
    correct_answer: correct_answer.trim(),
    analysis: analysis || null,
    image_url: image_url || null,
    knowledge_points: knowledge_points || null,
    created_at: now,
    updated_at: now,
  }
  db.questions.push(question)

  // 创建选项
  if (options && options.length > 0) {
    for (const opt of options) {
      db.options.push({
        id: uuidv4(),
        question_id: question.id,
        label: opt.label,
        content: opt.content,
        is_correct: opt.is_correct || false,
      })
    }
    question.options = db.options.filter((opt) => opt.question_id === question.id)
  } else {
    question.options = []
  }

  success(res, question, '创建成功')
})

// PUT /questions/:id - 更新错题
router.put('/:id', (req, res) => {
  const q = db.questions.find((item) => item.id === req.params.id)
  if (!q) {
    return fail(res, '错题不存在', 404)
  }

  // 验证归属
  const nb = db.notebooks.find((n) => n.id === q.notebook_id && n.user_id === req.userId)
  if (!nb) {
    return fail(res, '无权操作', 403)
  }

  const { title, content, correct_answer, analysis, image_url, knowledge_points } = req.body
  if (title) q.title = title
  if (content) q.content = content
  if (correct_answer) q.correct_answer = correct_answer
  if (analysis !== undefined) q.analysis = analysis
  if (image_url !== undefined) q.image_url = image_url
  if (knowledge_points !== undefined) q.knowledge_points = knowledge_points
  q.updated_at = new Date().toISOString()

  q.options = db.options.filter((opt) => opt.question_id === q.id)
  success(res, q, '更新成功')
})

// DELETE /questions/:id - 删除错题
router.delete('/:id', (req, res) => {
  const qIdx = db.questions.findIndex((item) => item.id === req.params.id)
  if (qIdx === -1) {
    return fail(res, '错题不存在', 404)
  }

  const q = db.questions[qIdx]
  const nb = db.notebooks.find((n) => n.id === q.notebook_id && n.user_id === req.userId)
  if (!nb) {
    return fail(res, '无权操作', 403)
  }

  // 删除关联选项
  db.options = db.options.filter((opt) => opt.question_id !== q.id)
  db.questions.splice(qIdx, 1)

  success(res, null, '删除成功')
})

// POST /questions/ocr - OCR识别图片
router.post('/ocr', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return fail(res, '请上传图片文件')
  }

  try {
    // 模拟OCR识别结果
    // 实际项目中应调用 PaddleOCR 或其他OCR服务
    const mockOcrResult = {
      text: '已知函数 f(x) = x² - 2x - 3，求 f(x) 的零点。\n解：令 f(x) = 0，即 x² - 2x - 3 = 0\n(x-3)(x+1) = 0\nx₁ = 3, x₂ = -1',
      options: [
        { label: 'A', content: 'x = 3 或 x = -1' },
        { label: 'B', content: 'x = 1 或 x = -3' },
        { label: 'C', content: 'x = 3 或 x = 1' },
        { label: 'D', content: 'x = -1 或 x = -3' },
      ],
    }

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 800))

    success(res, mockOcrResult, 'OCR识别成功')
  } catch (err) {
    fail(res, 'OCR识别失败: ' + err.message, 500)
  }
})

export default router
