import { NOTEBOOK_COLORS } from '@/utils/tokens'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-sm">
      {NOTEBOOK_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={`flex items-center justify-center transition-all ${
            value === color.value ? 'scale-125' : 'hover:scale-110'
          }`}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: color.value,
            boxShadow: value === color.value
              ? `0 6px 0 ${color.value}88, 0 0 0 4px white, 0 0 0 8px ${color.value}`
              : `0 4px 0 ${color.value}88`,
          }}
          title={color.name}
        >
          {value === color.value && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}
