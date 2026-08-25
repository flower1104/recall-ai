import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-md">
          <div className="animate-wobble" style={{ fontSize: '48px' }}>😵</div>
          <h2 className="text-h2 text-text-primary font-bold">页面出了点问题</h2>
          <p className="text-body text-text-secondary">{this.state.error?.message || '未知错误'}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            🔄 刷新页面
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
