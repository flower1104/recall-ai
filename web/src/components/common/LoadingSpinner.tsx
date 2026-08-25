export default function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className="rounded-full animate-spin"
        style={{
          width: '48px',
          height: '48px',
          border: '5px solid #FFE0D0',
          borderTopColor: '#6C5CE7',
        }}
      />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8F0 50%, #F0F0FF 100%)' }}>
        {spinner}
      </div>
    )
  }

  return spinner
}
