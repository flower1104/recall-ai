import { useState, useCallback, useImperativeHandle, forwardRef } from 'react'

export interface MathCaptchaHandle {
  /** 重置验证码并清空输入 */
  reset: () => void
}

interface MathCaptchaProps {
  /** 由父组件校验结果，通过后返回 true 表示验证通过 */
  onValidate?: (ok: boolean) => void
  /** 输入框的值 */
  value: string
  /** 输入变化回调 */
  onChange: (v: string) => void
  /** 是否已通过验证 */
  passed?: boolean
}

/** 随机生成一道两位以内的加法算式 */
function genCaptcha(): { a: number; b: number; answer: number; expr: string } {
  const a = Math.floor(Math.random() * 90) + 10 // 10~99
  const b = Math.floor(Math.random() * 90) + 10 // 10~99
  return { a, b, answer: a + b, expr: `${a} + ${b}` }
}

/**
 * 计算验证码 — 清新淡雅风格
 * 用于登录/注册等表单，验证用户是否真人操作
 */
const MathCaptcha = forwardRef<MathCaptchaHandle, MathCaptchaProps>((props, ref) => {
  const { onValidate, value, onChange, passed } = props
  const [captcha, setCaptcha] = useState(genCaptcha)
  const [error, setError] = useState('')

  const refresh = useCallback(() => {
    setCaptcha(genCaptcha())
    setError('')
    onChange('')
    onValidate?.(false)
  }, [onChange, onValidate])

  useImperativeHandle(ref, () => ({ reset: refresh }), [refresh])

  const handleInput = (v: string) => {
    onChange(v)
    const num = parseInt(v, 10)
    if (v !== '' && !Number.isNaN(num) && v.trim() !== '') {
      const ok = num === captcha.answer
      setError(ok ? '' : '计算结果不正确，请重新计算')
      onValidate?.(ok)
    } else {
      setError('')
      onValidate?.(false)
    }
  }

  return (
    <div>
      <label className="block text-body mb-sm font-bold" style={{ color: '#6B6B6B', fontSize: '14px' }}>
        🧮 计算验证
      </label>
      <div
        className="flex items-center gap-sm"
        style={{
          border: passed ? '1px solid #A8C5A0' : error ? '1px solid #D9A0A0' : '1px solid #E5E2D9',
          background: '#FAFAF7',
          borderRadius: '10px',
          padding: '8px 12px',
        }}
      >
        <span
          className="flex items-center justify-center font-bold"
          style={{
            background: '#EDF3E8',
            color: '#5B8C5A',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '16px',
            letterSpacing: '1px',
            flexShrink: 0,
            minWidth: '76px',
            textAlign: 'center',
          }}
        >
          {captcha.expr} = ?
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="输入答案"
          className="flex-1"
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '15px',
            color: '#3C3C3C',
            padding: '4px 0',
            minWidth: '0',
          }}
        />
        <button
          type="button"
          onClick={refresh}
          title="换一题"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#9B9B9B',
            flexShrink: 0,
            padding: '4px',
          }}
        >
          🔄
        </button>
      </div>
      <div className="mt-xs" style={{ minHeight: '18px', fontSize: '12px' }}>
        {passed ? (
          <span style={{ color: '#5B8C5A', fontWeight: 600 }}>✓ 验证通过</span>
        ) : error ? (
          <span style={{ color: '#B47A7A', fontWeight: 600 }}>{error}</span>
        ) : (
          <span style={{ color: '#B8B4A8' }}>输入上面算式的计算结果</span>
        )}
      </div>
    </div>
  )
})

MathCaptcha.displayName = 'MathCaptcha'

export default MathCaptcha
