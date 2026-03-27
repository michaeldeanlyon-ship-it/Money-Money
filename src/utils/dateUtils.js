// ── Primitives ──────────────────────────────────────────────────

export function dateToString(date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function today() {
  return dateToString(new Date())
}

export function isToday(dateStr) {
  return dateStr === today()
}

export function addDays(dateStr, n) {
  const d = parseDate(dateStr)
  d.setUTCDate(d.getUTCDate() + n)
  return dateToString(d)
}

// ── ISO Week ────────────────────────────────────────────────────

export function getISOWeek(dateStr) {
  const d = parseDate(dateStr)
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  const year = d.getUTCFullYear()
  return { year, week }
}

export function getWeekDays(year, week) {
  // Monday of ISO week
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Dow = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - (jan4Dow - 1) + (week - 1) * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() + i)
    return dateToString(d)
  })
}

export function prevWeek(year, week) {
  const mon = getWeekDays(year, week)[0]
  const prev = addDays(mon, -7)
  return getISOWeek(prev)
}

export function nextWeek(year, week) {
  const mon = getWeekDays(year, week)[0]
  const next = addDays(mon, 7)
  return getISOWeek(next)
}

// ── Month ───────────────────────────────────────────────────────

export function getMonthWeeks(year, month) {
  // month: 1-12
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1))
  const lastOfMonth = new Date(Date.UTC(year, month, 0))

  let start = new Date(firstOfMonth)
  const startDow = start.getUTCDay() || 7
  start.setUTCDate(start.getUTCDate() - (startDow - 1))

  const weeks = []
  let cur = new Date(start)
  while (cur <= lastOfMonth) {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push({
        date: dateToString(cur),
        isCurrentMonth: cur.getUTCMonth() === month - 1 && cur.getUTCFullYear() === year,
      })
      cur = new Date(cur)
      cur.setUTCDate(cur.getUTCDate() + 1)
    }
    weeks.push(days)
  }
  return weeks
}

export function prevMonth(year, month) {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

export function nextMonth(year, month) {
  if (month === 12) return { year: year + 1, month: 1 }
  return { year, month: month + 1 }
}

// ── Labels ──────────────────────────────────────────────────────

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const SHORT_DAY = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export function formatMonthLabel(year, month) {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

export function formatWeekLabel(year, week) {
  const days = getWeekDays(year, week)
  const mon = parseDate(days[0])
  const sun = parseDate(days[6])
  const monDay = mon.getUTCDate()
  const sunDay = sun.getUTCDate()
  const monMonth = SHORT_MONTH[mon.getUTCMonth()]
  const sunMonth = SHORT_MONTH[sun.getUTCMonth()]
  const range = monMonth === sunMonth
    ? `${monDay}–${sunDay} ${monMonth}`
    : `${monDay} ${monMonth} – ${sunDay} ${sunMonth}`
  return `Week ${week} — ${range} ${sun.getUTCFullYear()}`
}

export function formatDayLabel(dateStr) {
  const d = parseDate(dateStr)
  const dow = (d.getUTCDay() + 6) % 7 // 0=Mon
  return `${DAY_NAMES[dow]}, ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function shortDayName(dateStr) {
  const d = parseDate(dateStr)
  const dow = (d.getUTCDay() + 6) % 7
  return SHORT_DAY[dow]
}

export function dayOfMonth(dateStr) {
  return parseDate(dateStr).getUTCDate()
}

export function shortMonthName(dateStr) {
  return SHORT_MONTH[parseDate(dateStr).getUTCMonth()]
}
