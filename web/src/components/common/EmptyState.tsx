interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-2xl px-md">
      <div className="mb-xl animate-float" style={{ fontSize: '60px' }}>{icon}</div>
      <h3 className="text-h2 text-text-primary font-bold mb-sm">{title}</h3>
      {description && (
        <p className="text-body text-text-secondary mb-xl text-center max-w-[500px]">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
