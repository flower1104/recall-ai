import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('请填写所有字段 🙏')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('请输入有效的邮箱地址 📧')
      return
    }
    if (password.length < 6) {
      setError('密码长度至少6位 🔒')
      return
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致 😅')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(username, password, email)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败 😢')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-md py-xl relative overflow-hidden">
      {/* 浮动装饰 */}
      <div className="float-decoration" style={{ top: '5%', left: '8%', animation: 'float 4s ease-in-out infinite' }}>🎉</div>
      <div className="float-decoration" style={{ top: '65%', right: '8%', animation: 'float 5s ease-in-out infinite', fontSize: '50px' }}>📝</div>
      <div className="float-decoration" style={{ bottom: '8%', left: '18%', fontSize: '40px' }}>⭐</div>

      <div className="w-full max-w-[560px] relative z-10">
        {/* Logo区域 */}
        <div className="flex flex-col items-center mb-2xl">
          <div
            className="flex items-center justify-center text-white mb-md animate-float"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '36px',
              background: 'linear-gradient(135deg, #00B894 0%, #55EFC4 100%)',
              boxShadow: '0 8px 0 #009378, 0 12px 32px rgba(0,184,148,0.4)',
              fontSize: '28px',
            }}
          >
            🎓
          </div>
          <h1 className="text-h1 font-bold gradient-text">创建账号</h1>
          <p className="text-body text-text-secondary mt-sm">🌈 开始你的智能错题管理之旅</p>
        </div>

        {/* 表单卡片 */}
        <form onSubmit={handleSubmit} className="card p-xl space-y-lg">
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">👤 用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-base"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">📧 邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              placeholder="请输入邮箱"
            />
          </div>
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">🔒 密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              placeholder="至少6位"
            />
          </div>
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">🔐 确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base"
              placeholder="再次输入密码"
            />
          </div>
          {error && (
            <div className="text-error text-caption bg-red-50 px-md py-sm rounded-btn font-bold flex items-center gap-xs">
              <span>⚠️</span> {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full text-xl">
            {loading ? '注册中... ⏳' : '🎉 注册'}
          </button>
        </form>

        <p className="text-center text-body text-text-secondary mt-lg">
          已有账号？{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">返回登录 🚀</Link>
        </p>
      </div>
    </div>
  )
}
