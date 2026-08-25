import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'recall-ai-secret-key-2026'
const JWT_EXPIRES_IN = '7d'

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

/** JWT认证中间件 - 除 /auth/* 外所有接口需认证 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, msg: '未提供认证令牌', data: null })
  }

  const token = authHeader.slice(7)
  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ code: 401, msg: '认证令牌无效或已过期', data: null })
  }

  req.userId = decoded.userId
  next()
}
