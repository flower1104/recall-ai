import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import MathCaptcha, { type MathCaptchaHandle } from '@/components/common/MathCaptcha'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaPassed, setCaptchaPassed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const captchaRef = useRef<MathCaptchaHandle>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码 🙏')
      return
    }
    if (!captchaPassed) {
      setError('请先完成计算验证 🧮')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试')
      captchaRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-md relative overflow-hidden"
      style={{ background: '#F7F6F2' }}
    >
      {/* 淡雅装饰 */}
      <div className="float-decoration" style={{ top: '6%', left: '10%', animation: 'float 4s ease-in-out infinite', opacity: 0.35 }}>📚</div>
      <div className="float-decoration" style={{ top: '72%', right: '10%', animation: 'float 5s ease-in-out infinite', fontSize: '50px', opacity: 0.3 }}>✏️</div>
      <div className="float-decoration" style={{ bottom: '10%', left: '20%', fontSize: '40px', opacity: 0.3 }}>🌟</div>
      <div className="float-decoration" style={{ top: '14%', right: '16%', fontSize: '45px', opacity: 0.28 }}>🎯</div>

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
            🌿
          </div>
          <h1 className="font-bold" style={{ color: '#3C3C3C', fontSize: '28px', letterSpacing: '1px' }}>
            Recall
          </h1>
          <p className="mt-xs" style={{ color: '#9B9B9B', fontSize: '13px' }}>
            AI 智能错题本 — 把错题变成真正会做的题
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
          <div style={{ marginBottom: '18px' }}>
            <label className="block mb-sm font-bold" style={{ color: '#6B6B6B', fontSize: '14px' }}>
              👤 用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              style={{
                width: '100%',
                border: '1px solid #E5E2D9',
                borderRadius: '10px',
                padding: '11px 14px',
                fontSize: '14px',
                color: '#3C3C3C',
                outline: 'none',
                background: '#FAFAF7',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#A8C5A0')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E2D9')}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label className="block mb-sm font-bold" style={{ color: '#6B6B6B', fontSize: '14px' }}>
              🔒 密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              style={{
                width: '100%',
                border: '1px solid #E5E2D9',
                borderRadius: '10px',
                padding: '11px 14px',
                fontSize: '14px',
                color: '#3C3C3C',
                outline: 'none',
                background: '#FAFAF7',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#A8C5A0')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E2D9')}
            />
          </div>

          {/* 计算验证码 */}
          <div style={{ marginBottom: '14px' }}>
            <MathCaptcha
              ref={captchaRef}
              value={captchaInput}
              onChange={setCaptchaInput}
              passed={captchaPassed}
              onValidate={setCaptchaPassed}
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
            {loading ? '登录中... ⏳' : '登 录'}
          </button>
        </form>

        <p className="text-center mt-lg" style={{ color: '#9B9B9B', fontSize: '13px' }}>
          还没有账号？{' '}
          <Link to="/register" className="hover:underline font-bold" style={{ color: '#5B8C5A' }}>
            立即注册 ✨
          </Link>
        </p>

        <div className="text-center mt-md">
          <p style={{ color: '#B8B4A8', fontSize: '12px' }}>
            🎮 测试账号：demo / 123456
          </p>
        </div>
      </div>
    </div>
  )
}
