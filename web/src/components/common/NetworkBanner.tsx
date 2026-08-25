import { useState, useEffect } from 'react'

export default function NetworkBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      className="text-white text-center py-sm text-caption font-bold fixed top-0 left-0 right-0 z-[100]"
      style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)' }}
    >
      ⚠️ 网络连接已断开，请检查你的网络设置。
    </div>
  )
}
