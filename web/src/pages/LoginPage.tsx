import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码 🙏')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败 😢')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-md relative overflow-hidden">
      {/* 浮动装饰 */}
      <div className="float-decoration" style={{ top: '5%', left: '10%', animation: 'float 4s ease-in-out infinite' }}>📚</div>
      <div className="float-decoration" style={{ top: '70%', right: '10%', animation: 'float 5s ease-in-out infinite', fontSize: '50px' }}>✏️</div>
      <div className="float-decoration" style={{ bottom: '10%', left: '20%', fontSize: '40px' }}>🌟</div>
      <div className="float-decoration" style={{ top: '15%', right: '15%', fontSize: '45px' }}>🎯</div>

      <div className="w-full max-w-[560px] relative z-10">
        {/* Logo区域 */}
        <div className="flex flex-col items-center mb-2xl">
          <div
            className="flex items-center justify-center text-white mb-md animate-float"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '36px',
              background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
              boxShadow: '0 8px 0 #4834D4, 0 12px 32px rgba(108,92,231,0.4)',
              fontSize: '28px',
            }}
          >
            📝
          </div>
          <h1 className="text-h1 font-bold gradient-text">Recall</h1>
          <p className="text-body text-text-secondary mt-sm">🤖 AI智能错题本 — 3分钟录入，练到真会为止</p>
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
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-body text-text-secondary mb-sm font-bold">🔒 密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="text-error text-caption bg-red-50 px-md py-sm rounded-btn font-bold flex items-center gap-xs">
              <span>⚠️</span> {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full text-xl">
            {loading ? '登录中... ⏳' : '🚀 登录'}
          </button>
        </form>

        <p className="text-center text-body text-text-secondary mt-lg">
          还没有账号？{' '}
          <Link to="/register" className="text-primary hover:underline font-bold">立即注册 ✨</Link>
        </p>

        {/* 测试提示 */}
        <div className="text-center mt-md">
          <p className="text-caption text-text-auxiliary">
            🎮 测试账号：demo / 123456
          </p>
        </div>
      </div>
    </div>
  )
}
