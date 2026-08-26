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
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid #E5E2D9',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '14px',
    color: '#3C3C3C',
    outline: 'none',
    background: '#FAFAF7',
  }
  const labelStyle = { color: '#6B6B6B', fontSize: '14px' } as const

  return (
    <div
      className="min-h-screen flex items-center justify-center px-md py-xl relative overflow-hidden"
      style={{ background: '#F7F6F2' }}
    >
      {/* 淡雅装饰 */}
      <div className="float-decoration" style={{ top: '5%', left: '8%', animation: 'float 4s ease-in-out infinite', opacity: 0.3 }}>🎉</div>
      <div className="float-decoration" style={{ top: '65%', right: '8%', animation: 'float 5s ease-in-out infinite', fontSize: '50px', opacity: 0.3 }}>📝</div>
      <div className="float-decoration" style={{ bottom: '8%', left: '18%', fontSize: '40px', opacity: 0.3 }}>⭐</div>

      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo区域 */}
        <div className="flex flex-col items-center" style={{ marginBottom: '28px' }}>
          <div
            className="flex items-center justify-center mb-sm"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #A8C5A0 0%, #7BA889 100%)',
              boxShadow: '0 4px 12px rgba(123,168,137,0.3)',
              fontSize: '28px',
            }}
          >
            🎓
          </div>
          <h1 className="font-bold" style={{ color: '#3C3C3C', fontSize: '28px', letterSpacing: '1px' }}>
            创建账号
          </h1>
          <p className="mt-xs" style={{ color: '#9B9B9B', fontSize: '13px' }}>
            开始你的智能错题管理之旅 🌿
          </p>
        </div>

        {/* 表单卡片 */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#FFFFFF',
            border: '1px solid #EDEAE2',
            borderRadius: '20px',
            padding: '32px 32px 28px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <label className="block mb-sm font-bold" style={labelStyle}>👤 用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#A8C5A0')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E2D9')}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="block mb-sm font-bold" style={labelStyle}>📧 邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#A8C5A0')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E2D9')}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="block mb-sm font-bold" style={labelStyle}>🔒 密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#A8C5A0')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E2D9')}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="block mb-sm font-bold" style={labelStyle}>🔐 确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#A8C5A0')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E2D9')}
            />
          </div>
          {error && (
            <div
              className="flex items-center gap-xs font-bold"
              style={{
                color: '#B47A7A',
                background: '#F8EFEF',
                border: '1px solid #F0DFDF',
                borderRadius: '10px',
                padding: '9px 12px',
                fontSize: '12px',
                marginBottom: '14px',
              }}
            >
              <span>⚠️</span> {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#7BA889',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              letterSpacing: '2px',
            }}
          >
            {loading ? '注册中... ⏳' : '注 册'}
          </button>
        </form>

        <p className="text-center mt-lg" style={{ color: '#9B9B9B', fontSize: '13px' }}>
          已有账号？{' '}
          <Link to="/login" className="hover:underline font-bold" style={{ color: '#5B8C5A' }}>
            返回登录 ✨
          </Link>
        </p>
      </div>
    </div>
  )
}
