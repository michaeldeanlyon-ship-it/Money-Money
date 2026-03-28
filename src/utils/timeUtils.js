export function minutesToHHMM(minutes) {
  if (!minutes || minutes <= 0) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function percentOf2400(minutes) {
  return Math.round(minutes / 24)
}

export function computeWeekSummary(weekDates, entries) {
  const weekEntries = entries.filter(e => weekDates.includes(e.date))
  const totalMinutes = weekEntries.reduce((sum, e) => sum + e.minutes, 0)
  const percent = percentOf2400(totalMinutes)
  return {
    totalMinutes,
    percent,
    isExact: totalMinutes === 2400,
    remainingMinutes: Math.max(0, 2400 - totalMinutes),
  }
}

export function computeDaySummary(dateStr, entries) {
  const dayEntries = entries.filter(e => e.date === dateStr)
  const childcareMinutes = dayEntries
    .filter(e => e.type === 'paid_time' && e.paid_time_category === 'childcare')
    .reduce((sum, e) => sum + e.minutes, 0)
  const employmentMinutes = dayEntries
    .filter(e => e.type === 'paid_time' && e.paid_time_category === 'employment')
    .reduce((sum, e) => sum + e.minutes, 0)
  const workMinutes = dayEntries
    .filter(e => e.type === 'job')
    .reduce((sum, e) => sum + e.minutes, 0)
  const totalMinutes = dayEntries.reduce((sum, e) => sum + e.minutes, 0)
  return { childcareMinutes, employmentMinutes, workMinutes, totalMinutes }
}
