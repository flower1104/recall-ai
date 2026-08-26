/** 励志语句列表 — 每次进入首页随机抽一条显示 */

export const MOTIVATIONAL_QUOTES = [
  '每一道错题，都是进步的阶梯 🌱',
  '坚持就是胜利，每天进步一点点 ✨',
  '今日不肯吃苦，明日就要吃亏 🍵',
  '慢慢来，比较快 🌿',
  '书山有路勤为径，学海无涯苦作舟 📖',
  '你走的每一步都算数 🎯',
  '不怕慢，就怕站 🦶',
  '把平凡的日子过得不平凡 ⭐',
  '日拱一卒，功不唐捐 🪴',
  '心静如水，自有花开 🌸',
  '专注当下，未来可期 🔥',
  '好问的人只会失去五分钟的光阴，害羞的人会失去更多 💡',
  '学习是最好的投资自己 📚',
  '继续走，慢慢走，不停步 🌾',
  '懂得反思的人，走得更远 🪞',
  '今日复今日，明日复明年，蹉跎白发添 🌅',
  '把注意力放在能改变的事情上 🌊',
  '用错题本，把自己写明白 ✏️',
  '没有白走的路，每一步都算数 🚶',
  '保持热爱，奔赴山海 🌊',
]

/** 根据用户最近一次错题录入的小时数返回不同时段的问候语 */
export function getGreeting(now: Date = new Date()): string {
  const h = now.getHours()
  if (h < 6) return '夜深啦'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  if (h < 22) return '晚上好'
  return '夜深啦'
}

const DAILY_LOGIN_KEY = 'recall_daily_login_dates'

/** 记录今日已登录（用于首页日历打卡） */
export function recordTodayLogin(): void {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const raw = localStorage.getItem(DAILY_LOGIN_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    if (!list.includes(today)) {
      list.push(today)
      // 仅保留最近 90 天
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 90)
      const cutoffStr = cutoff.toISOString().slice(0, 10)
      const filtered = list.filter((d) => d >= cutoffStr)
      localStorage.setItem(DAILY_LOGIN_KEY, JSON.stringify(filtered))
    }
  } catch {
    // ignore
  }
}

/** 取回最近 90 天内所有打卡日期 (YYYY-MM-DD) */
export function getRecentCheckInDates(): string[] {
  try {
    const raw = localStorage.getItem(DAILY_LOGIN_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}
