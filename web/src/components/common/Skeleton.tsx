interface SkeletonProps {
  width?: string
  height?: string
  className?: string
}

export function Skeleton({ width = '100%', height = '28px', className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={{ width, height }} />
}

export function NotebookSkeleton() {
  return (
    <div className="space-y-sm">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-sm p-sm">
          <Skeleton width="48px" height="48px" className="rounded-btn" />
          <Skeleton width="160px" height="28px" />
          <Skeleton width="48px" height="24px" className="ml-auto rounded-tag" />
        </div>
      ))}
    </div>
  )
}

export function QuestionCardSkeleton() {
  return (
    <div className="card p-lg space-y-md">
      <Skeleton width="80%" height="32px" />
      <Skeleton width="100%" height="28px" />
      <Skeleton width="100%" height="28px" />
      <Skeleton width="60%" height="28px" />
      <div className="flex gap-md pt-sm">
        <Skeleton width="120px" height="48px" className="rounded-btn" />
        <Skeleton width="120px" height="48px" className="rounded-btn" />
        <Skeleton width="120px" height="48px" className="rounded-btn" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return <Skeleton width="100%" height="320px" className="rounded-card" />
}
