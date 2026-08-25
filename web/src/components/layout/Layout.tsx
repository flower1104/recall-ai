import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import NetworkBanner from '@/components/common/NetworkBanner'

const NAV_ITEMS = [
  { path: '/', label: '错题集', icon: '📚', color: '#6C5CE7' },
  { path: '/create', label: '录入', icon: '✏️', color: '#00B894' },
  { path: '/review', label: '复习', icon: '🔄', color: '#FDCB6E' },
  { path: '/qa', label: 'AI答疑', icon: '🤖', color: '#FD79A8' },
  { path: '/dashboard', label: '数据看板', icon: '📊', color: '#00CEC9' },
  { path: '/help', label: '帮助', icon: '💡', color: '#FF7675' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    if (confirm('确定退出登录？👋')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 浮动装饰背景 */}
      <div className="float-decoration" style={{ top: '10%', left: '5%' }}>📖</div>
      <div className="float-decoration" style={{ top: '60%', right: '8%', animation: 'float 4s ease-in-out infinite' }}>✏️</div>
      <div className="float-decoration" style={{ bottom: '15%', left: '15%', fontSize: '40px' }}>🌟</div>

      <NetworkBanner />

      {/* 顶部导航栏 — 卡通渐变 */}
      <header
        className="sticky top-0 z-50 flex items-center px-xl"
        style={{
          height: '88px',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
          boxShadow: '0 4px 0 rgba(72,52,212,0.3), 0 8px 24px rgba(108,92,231,0.2)',
        }}
      >
        {/* 移动端汉堡按钮 */}
        <button
          className="md:hidden mr-md text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="菜单"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo — 卡通泡泡 */}
        <div
          className="flex items-center gap-sm cursor-pointer mr-2xl"
          onClick={() => navigate('/')}
        >
          <div
            className="flex items-center justify-center text-white font-bold"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 4px 0 rgba(0,0,0,0.15), 0 6px 16px rgba(255,165,0,0.4)',
              fontSize: '14px',
            }}
          >
            📝
          </div>
          <span className="text-h2 font-bold text-white hidden sm:block" style={{ textShadow: '2px 2px 0 rgba(72,52,212,0.3)' }}>
            Recall
          </span>
        </div>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-sm flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-link text-white hover:text-white hover:bg-white/15 ${isActive ? 'nav-link-active' : ''} flex items-center gap-xs`}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* 用户区域 */}
        <div className="ml-auto flex items-center gap-md">
          <div className="hidden sm:flex items-center gap-sm">
            <div
              className="flex items-center justify-center text-white font-bold"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF7675 0%, #FD79A8 100%)',
                boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
                fontSize: '14px',
              }}
            >
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-body text-white font-bold">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-caption text-white/80 hover:text-white transition-colors font-bold bg-white/20 px-sm py-xs rounded-btn"
          >
            退出 👋
          </button>
        </div>
      </header>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b-2 border-cream animate-pop-in">
          <nav className="flex flex-col p-md gap-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`text-left px-lg py-sm rounded-btn font-bold flex items-center gap-md transition-all ${
                    isActive ? 'text-white' : 'text-text-secondary hover:bg-gray-50'
                  }`}
                  style={isActive ? { background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}DD 100%)` } : {}}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span className="text-body">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* 内容区 */}
      <main className="flex-1 overflow-hidden relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
