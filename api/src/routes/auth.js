import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import db from '../models/db.js'
import { generateToken, authMiddleware } from '../middleware/auth.js'
import { success, fail } from '../middleware/errorHandler.js'
import { seedDatabase } from '../models/db.js'

const router = Router()

// 初始化种子数据
seedDatabase()

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body

  if (!username || !password || !email) {
    return fail(res, '请填写用户名、密码和邮箱')
  }
  if (password.length < 6) {
    return fail(res, '密码长度至少6位')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail(res, '邮箱格式不正确')
  }

  // 检查用户名和邮箱唯一性
  if (db.users.find((u) => u.username === username)) {
    return fail(res, '用户名已存在')
  }
  if (db.users.find((u) => u.email === email)) {
    return fail(res, '邮箱已被注册')
  }

  const userId = uuidv4()
  const passwordHash = bcrypt.hashSync(password, 10)
  const now = new Date().toISOString()

  const user = {
    id: userId,
    username,
    email,
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  }
  db.users.push(user)

  // 自动创建默认错题本
  const defaultNotebooks = [
    { name: '数学', color: '#007AFF' },
    { name: '英语', color: '#34C759' },
  ]
  for (const nb of defaultNotebooks) {
    db.notebooks.push({
      id: uuidv4(),
      user_id: userId,
      name: nb.name,
      color: nb.color,
      created_at: now,
      updated_at: now,
    })
  }

  const token = generateToken(userId)
  const { password_hash, ...userWithoutPassword } = user
  success(res, { token, user: userWithoutPassword }, '注册成功')
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return fail(res, '请输入用户名和密码')
  }

  const user = db.users.find((u) => u.username === username)
  if (!user) {
    return fail(res, '用户名或密码错误', 401)
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return fail(res, '用户名或密码错误', 401)
  }

  const token = generateToken(user.id)
  const { password_hash, ...userWithoutPassword } = user
  success(res, { token, user: userWithoutPassword }, '登录成功')
})

// GET /auth/me - 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  const user = db.users.find((u) => u.id === req.userId)
  if (!user) {
    return fail(res, '用户不存在', 404)
  }
  const { password_hash, ...userWithoutPassword } = user
  success(res, userWithoutPassword)
})

export default router
