import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../models/db.js'
import { authMiddleware } from '../middleware/auth.js'
import { success, fail } from '../middleware/errorHandler.js'

const router = Router()

router.use(authMiddleware)

// GET /qa/sessions - 获取历史对话列表
router.get('/sessions', (req, res) => {
  const sessions = db.qaSessions
    .filter((s) => s.user_id === req.userId)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  success(res, sessions)
})

// POST /qa/sessions - 创建新对话
router.post('/sessions', (req, res) => {
  const { title } = req.body
  const now = new Date().toISOString()
  const session = {
    id: uuidv4(),
    user_id: req.userId,
    title: title || '新对话',
    created_at: now,
    updated_at: now,
  }
  db.qaSessions.push(session)
  success(res, session, '对话创建成功')
})

// DELETE /qa/sessions/:id - 删除对话
router.delete('/sessions/:id', (req, res) => {
  const idx = db.qaSessions.findIndex(
    (s) => s.id === req.params.id && s.user_id === req.userId
  )
  if (idx === -1) {
    return fail(res, '对话不存在', 404)
  }

  // 删除关联消息
  db.qaMessages = db.qaMessages.filter((m) => m.session_id !== req.params.id)
  db.qaSessions.splice(idx, 1)

  success(res, null, '删除成功')
})

// GET /qa/sessions/:id/messages - 获取对话历史消息
router.get('/sessions/:id/messages', (req, res) => {
  const session = db.qaSessions.find(
    (s) => s.id === req.params.id && s.user_id === req.userId
  )
  if (!session) {
    return fail(res, '对话不存在', 404)
  }

  const messages = db.qaMessages
    .filter((m) => m.session_id === req.params.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  success(res, messages)
})

// POST /qa/stream - SSE流式接口（接入 DeepSeek 大模型）
router.post('/stream', async (req, res) => {
  const { session_id, question, question_id } = req.body

  if (!session_id || !question) {
    return fail(res, '缺少会话ID或问题内容')
  }

  const session = db.qaSessions.find(
    (s) => s.id === session_id && s.user_id === req.userId
  )
  if (!session) {
    return fail(res, '对话不存在', 404)
  }

  // 输入长度限制，防止 token 爆炸
  const truncatedQuestion = question.slice(0, 2000)

  // 设置SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  // 保存用户消息
  const userMsg = {
    id: uuidv4(),
    session_id,
    role: 'user',
    content: truncatedQuestion,
    created_at: new Date().toISOString(),
  }
  db.qaMessages.push(userMsg)

  // 获取题目上下文
  let context = ''
  if (question_id) {
    const q = db.questions.find((item) => item.id === question_id)
    if (q) {
      context = `\n\n【错题上下文】\n题目标题：${q.title}\n题目内容：${q.content}\n正确答案：${q.correct_answer}\n解析：${q.analysis || '无'}`
    }
  }

  // 更新会话时间
  session.updated_at = new Date().toISOString()

  // ===== 接入外部大模型 =====
  const apiKey = process.env.LLM_API_KEY || process.env.DEEPSEEK_API_KEY
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1'
  const modelName = process.env.LLM_MODEL || 'deepseek-chat'

  // 没有 API Key 时降级为 mock 模式
  if (!apiKey) {
    return streamMockResponse(res, session_id, truncatedQuestion, context, session)
  }

  // 构建对话历史（最近 10 条，避免 token 过多）
  const historyMessages = db.qaMessages
    .filter((m) => m.session_id === session_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-10)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))

  // 系统提示词
  const systemPrompt = `你是一个友好的学习助手，专门帮助学生理解和解决错题。请用清晰、易懂的方式回答问题，适当使用步骤和示例。如果提供了错题上下文，请结合具体题目进行解答。回答使用 Markdown 格式。${context}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
  ]

  // 客户端断开时标记
  // 注意：不能用 req.on('close')——express.json() 读完请求体后它会立即触发
  // 正确做法：监听 res 的 close，且仅在响应未正常结束时视为客户端断开
  let clientDisconnected = false
  res.on('close', () => {
    if (!res.writableEnded) clientDisconnected = true
  })

  try {
    const aiResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    console.log('[QA] LLM 响应状态:', aiResponse.status)
    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      console.error('LLM API 错误:', aiResponse.status, errText)
      throw new Error(`LLM API 返回 ${aiResponse.status}`)
    }

    const reader = aiResponse.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullResponse = ''

    while (true) {
      if (clientDisconnected) break

      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullResponse += content
            res.write(`data: ${JSON.stringify({ content })}\n\n`)
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }

    // 保存完整的 AI 回复
    const aiMsg = {
      id: uuidv4(),
      session_id,
      role: 'assistant',
      content: fullResponse || '（AI 未返回内容）',
      created_at: new Date().toISOString(),
    }
    db.qaMessages.push(aiMsg)

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    console.error('LLM API 调用失败:', error.message)

    // 出错时降级为 mock，保证用户体验
    if (!res.writableEnded) {
      streamMockResponse(res, session_id, truncatedQuestion, context, session)
    }
  }
})

/**
 * Mock 流式回复（无 API Key 或 API 出错时降级使用）
 */
function streamMockResponse(res, sessionId, question, context, session) {
  const aiResponse = generateMockAIResponse(question, context)

  // 保存 AI 消息
  const aiMsg = {
    id: uuidv4(),
    session_id: sessionId,
    role: 'assistant',
    content: aiResponse,
    created_at: new Date().toISOString(),
  }
  db.qaMessages.push(aiMsg)
  session.updated_at = new Date().toISOString()

  // 逐字流式输出
  const chunks = aiResponse.split('')
  let sentCount = 0

  const sendChunk = () => {
    if (sentCount >= chunks.length) {
      res.write('data: [DONE]\n\n')
      res.end()
      return
    }

    const batchSize = Math.min(Math.floor(Math.random() * 3) + 1, chunks.length - sentCount)
    const text = chunks.slice(sentCount, sentCount + batchSize).join('')
    res.write(`data: ${JSON.stringify({ content: text })}\n\n`)
    sentCount += batchSize

    setTimeout(sendChunk, 30 + Math.random() * 40)
  }

  setTimeout(sendChunk, 300)
}

/** 模拟AI回答生成 */
function generateMockAIResponse(question, context) {
  const lowerQ = question.toLowerCase()

  if (lowerQ.includes('知识点') || lowerQ.includes('考的是什么')) {
    return `这道题主要考查的知识点如下：\n\n1. **函数的零点**：令函数值等于0，解方程得到零点\n2. **因式分解**：将二次方程分解为两个一次因式的乘积\n3. **二次方程求解**：利用十字相乘法或求根公式\n\n这类题目的解题关键在于熟练掌握因式分解技巧，建议多练习类似的题目来巩固。${context}`
  }

  if (lowerQ.includes('步骤') || lowerQ.includes('一步步') || lowerQ.includes('怎么做')) {
    return `好的，我来一步步教你：\n\n**第一步**：理解题意\n题目要求我们求函数的零点，即找到使 f(x) = 0 的 x 值。\n\n**第二步**：建立方程\n令 f(x) = 0，得到方程 x² - 2x - 3 = 0\n\n**第三步**：因式分解\n寻找两个数，它们的乘积为 -3，和为 -2\n这两个数是 -3 和 +1\n所以 x² - 2x - 3 = (x - 3)(x + 1) = 0\n\n**第四步**：求解\n由 (x - 3)(x + 1) = 0 得：\nx - 3 = 0 → x₁ = 3\nx + 1 = 0 → x₂ = -1\n\n**第五步**：验证\nf(3) = 9 - 6 - 3 = 0 ✓\nf(-1) = 1 + 2 - 3 = 0 ✓\n\n所以零点为 x = 3 和 x = -1。${context}`
  }

  if (lowerQ.includes('类似') || lowerQ.includes('变体') || lowerQ.includes('举一反三')) {
    return `好的，这里有一道类似的变体题：\n\n**变体题**：已知函数 g(x) = x² + 4x - 5，求 g(x) 的零点。\n\n**解析**：\n令 g(x) = 0，即 x² + 4x - 5 = 0\n因式分解：(x + 5)(x - 1) = 0\n解得：x₁ = -5，x₂ = 1\n\n这道题与原题考查的知识点完全一致，但数值和符号有所变化，帮助你巩固因式分解求零点的方法。${context}`
  }

  if (lowerQ.includes('错在哪') || lowerQ.includes('为什么错')) {
    return `让我来帮你分析错误原因：\n\n常见的错误有以下几种：\n\n1. **符号错误**：在因式分解时，正负号搞反了。比如把 (x-3)(x+1) 写成了 (x+3)(x-1)\n\n2. **计算错误**：在验证时计算出错。建议每步都仔细检查\n\n3. **方法选择错误**：可能尝试用求根公式但计算复杂，建议优先尝试因式分解\n\n建议你重新做一遍，注意每步的符号和计算。如果还有疑问，可以继续问我！${context}`
  }

  return `感谢你的提问！\n\n关于「${question}」，我的理解是：\n\n这是一个很好的学习问题。建议你从以下几个角度思考：\n\n1. 回顾相关的基础概念和公式\n2. 理解题目所给的条件和要求\n3. 尝试将问题分解为更小的步骤\n4. 验证你的答案是否合理\n\n如果你能提供更具体的题目内容，我可以给出更有针对性的解答。${context}`
}

export default router
