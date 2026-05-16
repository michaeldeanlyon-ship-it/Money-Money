// Work-week reduction: contracted week dropped from 40h → 38.8h on 2026-04-01.
// The user enters hours using the old 8h-day mental model (e.g. "4" = half a
// day). For entries dated on/after the cutoff, scale by 38.8/40 = 0.97 so the
// stored value matches the reduced week. Pre-cutoff entries save raw.
//
//   stored_hours = raw_hours × (WEEK_TARGET_HOURS / RAW_WEEK_HOURS)
//                = raw_hours × (38.8 / 40)
//                = raw_hours × 0.97
//
// Examples:  4 → 3.88,  8 → 7.76,  1.5 → 1.455,  40 → 38.8
export const RAW_WEEK_HOURS = 40
export const WEEK_TARGET_HOURS = 38.8
export const WEEK_TARGET_MINUTES = Math.round(WEEK_TARGET_HOURS * 60)
export const WEEK_REDUCTION_START_DATE = '2026-04-01'

const INPUT_SCALE = WEEK_TARGET_HOURS / RAW_WEEK_HOURS

export function scaleInputHoursForDate(rawHours, dateStr) {
  if (dateStr < WEEK_REDUCTION_START_DATE) return rawHours
  return rawHours * INPUT_SCALE
}

export function minutesToHHMM(minutes) {
  if (!minutes || minutes <= 0) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function percentOfWeekTarget(minutes) {
  return Math.round((minutes / WEEK_TARGET_MINUTES) * 100)
}

export function computeWeekSummary(weekDates, entries) {
  const weekEntries = entries.filter(e => weekDates.includes(e.date))
  const totalMinutes = weekEntries.reduce((sum, e) => sum + e.minutes, 0)
  const percent = percentOfWeekTarget(totalMinutes)
  const isOver = totalMinutes > WEEK_TARGET_MINUTES
  return {
    totalMinutes,
    percent,
    isExact: totalMinutes === WEEK_TARGET_MINUTES,
    remainingMinutes: isOver ? 0 : WEEK_TARGET_MINUTES - totalMinutes,
    overMinutes: isOver ? totalMinutes - WEEK_TARGET_MINUTES : 0,
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
