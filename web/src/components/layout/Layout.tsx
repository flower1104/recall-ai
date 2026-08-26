import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import NetworkBanner from '@/components/common/NetworkBanner'

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/notebooks', label: '错题', icon: '📔' },
  { path: '/checklist', label: '考前冲刺', icon: '🎯' },
  { path: '/dashboard', label: '仪表盘', icon: '📊' },
  { path: '/review', label: '复习中心', icon: '🔄' },
  { path: '/create', label: '录入错题', icon: '✏️' },
  { path: '/qa', label: 'AI 答疑', icon: '🤖' },
  { path: '/help', label: '帮助', icon: '💡' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    if (confirm('确定退出登录？👋')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className="flex flex-row min-h-screen" style={{ background: '#F7F6F2' }}>
      {/* 左侧边栏 */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0"
        style={{
          width: '232px',
          background: '#FFFFFF',
          borderRight: '1px solid #EDEAE2',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-sm px-lg cursor-pointer"
          style={{ height: '72px', borderBottom: '1px solid #EDEAE2' }}
          onClick={() => navigate('/')}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #A8C5A0 0%, #7BA889 100%)',
              boxShadow: '0 2px 6px rgba(123,168,137,0.25)',
              fontSize: '18px',
            }}
          >
            🌿
          </div>
          <span className="text-body font-bold" style={{ color: '#3C3C3C', fontSize: '16px' }}>
            Recall
          </span>
        </div>

        {/* 导航 */}
        <nav className="flex-1 px-sm py-md overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-sm text-left transition-all duration-150"
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '2px',
                  background: isActive ? 'rgba(168,197,160,0.18)' : 'transparent',
                  color: isActive ? '#5B8C5A' : '#6B6B6B',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                }}
              >
                <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* 用户区域 */}
        <div
          className="flex items-center gap-sm px-md py-md"
          style={{ borderTop: '1px solid #EDEAE2' }}
        >
          <div
            className="flex items-center justify-center text-white font-bold"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #A8C5A0 0%, #7BA889 100%)',
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate" style={{ color: '#3C3C3C', fontSize: '13px', fontWeight: 600 }}>
              {user?.username || '游客'}
            </div>
            <button
              onClick={handleLogout}
              className="hover:underline"
              style={{ color: '#9B9B9B', fontSize: '11px' }}
            >
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {/* 移动端顶部导航（简版） */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center px-md"
        style={{ height: '56px', background: '#FFFFFF', borderBottom: '1px solid #EDEAE2' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-sm"
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #A8C5A0 0%, #7BA889 100%)',
              fontSize: '16px',
            }}
          >
            🌿
          </div>
          <span className="font-bold" style={{ color: '#3C3C3C', fontSize: '15px' }}>Recall</span>
        </button>
        <div className="ml-auto flex gap-sm overflow-x-auto">
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(168,197,160,0.18)' : 'transparent',
                  color: isActive ? '#5B8C5A' : '#6B6B6B',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </button>
            )
          })}
        </div>
      </div>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <NetworkBanner />
        <Outlet />
      </main>
    </div>
  )
}
