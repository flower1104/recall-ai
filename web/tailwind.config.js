/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 卡通化主色调 — 更鲜艳饱和
        primary: '#6C5CE7',
        'primary-light': '#A29BFE',
        'primary-dark': '#4834D4',
        'page-bg': '#FFF8F0',
        'card-bg': '#FFFFFF',
        'text-primary': '#2D3436',
        'text-secondary': '#636E72',
        'text-auxiliary': '#B2BEC3',
        'border-default': '#FFE0D0',
        cream: '#FFE0D0',
        success: '#00B894',
        warning: '#FDCB6E',
        error: '#FF6B6B',
        'question-border': '#74B9FF',
        'analysis-border': '#55EFC4',
        // 错题本颜色 — 鲜艳卡通版
        'nb-blue': '#6C5CE7',
        'nb-green': '#00B894',
        'nb-orange': '#FF7675',
        'nb-purple': '#A29BFE',
        'nb-pink': '#FD79A8',
        'nb-cyan': '#00CEC9',
        'nb-amber': '#FDCB6E',
        'nb-indigo': '#4834D4',
        // 卡通渐变色
        'grad-1': '#667eea',
        'grad-2': '#764ba2',
        'grad-3': '#f093fb',
        'grad-4': '#4facfe',
        'grad-5': '#43e97b',
        'grad-6': '#fa709a',
      },
      fontFamily: {
        sans: ['"Comic Sans MS"', '"PingFang SC"', '"SF Pro"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // 字体恢复适中大小（在卡通风格基础上缩小一半）
        h1: ['28px', { fontWeight: '700', lineHeight: '1.3' }],
        h2: ['20px', { fontWeight: '700', lineHeight: '1.35' }],
        body: ['14px', { fontWeight: '400', lineHeight: '1.6' }],
        caption: ['12px', { fontWeight: '400', lineHeight: '1.5' }],
        'xl': ['16px', { fontWeight: '600' }],
      },
      borderRadius: {
        // 更圆 — 卡通泡泡感
        btn: '20px',
        card: '28px',
        tag: '16px',
        bubble: '50%',
      },
      borderWidth: {
        '3': '3px',
        '5': '5px',
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px',
        '3xl': '80px',
      },
      boxShadow: {
        'cartoon': '0 8px 0 0 rgba(0,0,0,0.08), 0 12px 32px rgba(108,92,231,0.15)',
        'cartoon-hover': '0 4px 0 0 rgba(0,0,0,0.06), 0 8px 24px rgba(108,92,231,0.2)',
        'cartoon-sm': '0 4px 0 0 rgba(0,0,0,0.06), 0 6px 16px rgba(108,92,231,0.1)',
        'bubble': '0 6px 20px rgba(0,0,0,0.1)',
        'inner-cartoon': 'inset 0 -4px 0 rgba(0,0,0,0.06)',
      },
      animation: {
        'bounce-sm': 'bounce-sm 0.4s ease',
        'wobble': 'wobble 0.5s ease',
        'pop-in': 'pop-in 0.3s ease',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease',
      },
      keyframes: {
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'wobble': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-2deg)' },
          '75%': { transform: 'rotate(2deg)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}
