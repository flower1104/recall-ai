import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

/**
 * In-memory data store (模拟 PostgreSQL)
 * 对应开发设计文档中的数据模型: User, Notebook, Question, QuestionOption,
 * QASession, QAMessage, ReviewRecord
 */
const db = {
  users: [],
  notebooks: [],
  questions: [],
  options: [],
  qaSessions: [],
  qaMessages: [],
  reviewRecords: [],
}

// 初始化默认数据
export function seedDatabase() {
  // 创建测试用户
  const testPassword = bcrypt.hashSync('123456', 10)
  const testUser = {
    id: uuidv4(),
    username: 'demo',
    email: 'demo@recall.ai',
    password_hash: testPassword,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  db.users.push(testUser)

  // 创建默认错题本
  const defaultNotebooks = [
    { name: '高中数学', color: '#007AFF' },
    { name: '初中英语', color: '#34C759' },
  ]
  for (const nb of defaultNotebooks) {
    db.notebooks.push({
      id: uuidv4(),
      user_id: testUser.id,
      name: nb.name,
      color: nb.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // 创建示例错题
  const mathNb = db.notebooks[0]
  const sampleQuestion = {
    id: uuidv4(),
    notebook_id: mathNb.id,
    title: '函数极值问题',
    content: '已知函数 f(x) = x³ - 3x + 1，求 f(x) 在区间 [-2, 2] 上的最大值和最小值。',
    correct_answer: '最大值3，最小值-1',
    analysis: 'f\'(x) = 3x² - 3 = 3(x+1)(x-1)\n令 f\'(x) = 0，得 x = -1 或 x = 1\nf(-2) = -8 + 6 + 1 = -1\nf(-1) = -1 + 3 + 1 = 3\nf(1) = 1 - 3 + 1 = -1\nf(2) = 8 - 6 + 1 = 3\n最大值3（x=-1或x=2），最小值-1（x=-2或x=1）',
    image_url: null,
    knowledge_points: '函数,导数,极值',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
  db.questions.push(sampleQuestion)

  // 添加选项（示例选择题）
  const choiceQuestion = {
    id: uuidv4(),
    notebook_id: mathNb.id,
    title: '导数定义选择题',
    content: '函数 f(x) = ln(x) 在 x = 1 处的导数值为：',
    correct_answer: 'A',
    analysis: 'f\'(x) = 1/x，f\'(1) = 1/1 = 1',
    image_url: null,
    knowledge_points: '导数,对数函数',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
  db.questions.push(choiceQuestion)

  // 为选择题添加选项
  const choiceOptions = [
    { label: 'A', content: '1', is_correct: true },
    { label: 'B', content: '0', is_correct: false },
    { label: 'C', content: '-1', is_correct: false },
    { label: 'D', content: 'e', is_correct: false },
  ]
  for (const opt of choiceOptions) {
    db.options.push({
      id: uuidv4(),
      question_id: choiceQuestion.id,
      ...opt,
    })
  }

  console.log('[DB] Seed data initialized:', {
    users: db.users.length,
    notebooks: db.notebooks.length,
    questions: db.questions.length,
    options: db.options.length,
  })
}

export default db
