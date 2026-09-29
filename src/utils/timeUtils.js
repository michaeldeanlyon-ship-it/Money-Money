// Time entries are quantised to four daily percentages: 25, 50, 75, 100.
// A 100% day = 7.76h = 38.8h / 5 working days. Stored minutes are the rounded
// equivalents (see BUCKET_MINUTES). Five 100% days sum to 2330 min, two minutes
// over the 2328 weekly target — percentage is the source of truth.
export const WEEK_TARGET_HOURS = 38.8
export const DAY_TARGET_HOURS = WEEK_TARGET_HOURS / 5

export const PERCENT_OPTIONS = [25, 50, 75, 100]
export const BUCKET_MINUTES = PERCENT_OPTIONS.reduce((acc, pct) => {
  acc[pct] = Math.round((DAY_TARGET_HOURS * pct * 60) / 100)
  return acc
}, {})

// A full 100% day. Only Job work and Childcare credit against this target;
// School is a required-work marker (see computeDaySummary) and does NOT count
// toward the day.
export const DAY_TARGET_MINUTES = BUCKET_MINUTES[100]

// Five 100% days = full week. Using this (rather than 38.8h × 60) keeps
// week% consistent with the day-percentage buckets.
export const WEEK_TARGET_MINUTES = DAY_TARGET_MINUTES * 5

export function percentToMinutes(percent) {
  return BUCKET_MINUTES[percent]
}

// Legacy: school time was once entered as a single decimal-hours field.
export function hoursToMinutes(hours) {
  return Math.round((Number(hours) || 0) * 60)
}

// School (and h:m-mode Job/Childcare) time is entered as separate Hours + Minutes
// fields. Inputs come from text boxes, so coerce and treat blanks as zero.
export function hoursMinutesToMinutes(hours, minutes) {
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0)
}

// Split minutes back into { hours, minutes } to rehydrate the edit form.
export function minutesToHM(minutes) {
  const safe = Math.max(0, minutes || 0)
  return { hours: Math.floor(safe / 60), minutes: safe % 60 }
}

// Whether a minute count exactly matches one of the 25/50/75/100 buckets.
export function isExactBucket(minutes) {
  return PERCENT_OPTIONS.some(pct => BUCKET_MINUTES[pct] === minutes)
}

export function percentToDecimalHours(percent) {
  return (percent * DAY_TARGET_HOURS) / 100
}

export function minutesToNearestPercent(minutes) {
  const safe = Math.max(0, minutes || 0)
  return PERCENT_OPTIONS.reduce((closest, pct) => {
    const closestDiff = Math.abs(BUCKET_MINUTES[closest] - safe)
    const pctDiff = Math.abs(BUCKET_MINUTES[pct] - safe)
    return pctDiff < closestDiff ? pct : closest
  }, PERCENT_OPTIONS[0])
}

export function formatEntryDuration(minutes) {
  if (!minutes || minutes <= 0) return '0m'
  const pct = minutesToNearestPercent(minutes)
  return `${pct}% · ${minutesToHHMM(minutes)}`
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

export function percentOfDayTarget(minutes) {
  return Math.round((minutes / DAY_TARGET_MINUTES) * 100)
}

export function computeWeekSummary(weekDates, entries) {
  // School is a required-work marker, not a credit, so it never counts toward
  // the week 100%.
  const weekEntries = entries.filter(
    e => weekDates.includes(e.date) && e.type !== 'school'
  )
  const totalMinutes = weekEntries.reduce((sum, e) => sum + e.minutes, 0)
  const percent = percentOfWeekTarget(totalMinutes)
  const isOver = totalMinutes > WEEK_TARGET_MINUTES
  return {
    totalMinutes,
    percent,
    isExact: totalMinutes === WEEK_TARGET_MINUTES,
    remainingMinutes: isOver ? 0 : WEEK_TARGET_MINUTES - totalMinutes,
    overMinutes: isOver ? totalMinutes - WEEK_TARGET_MINUTES : 0,
    remainingPercent: isOver ? 0 : Math.max(0, 100 - percent),
    overPercent: isOver ? Math.max(0, percent - 100) : 0,
  }
}

export function computeDaySummary(dateStr, entries) {
  const dayEntries = entries.filter(e => e.date === dateStr)
  const childcareMinutes = dayEntries
    .filter(e => e.type === 'childcare')
    .reduce((sum, e) => sum + e.minutes, 0)
  const schoolMinutes = dayEntries
    .filter(e => e.type === 'school')
    .reduce((sum, e) => sum + e.minutes, 0)
  const workMinutes = dayEntries
    .filter(e => e.type === 'job')
    .reduce((sum, e) => sum + e.minutes, 0)
  // Only work + childcare credit the day; school is excluded from the total.
  const totalMinutes = workMinutes + childcareMinutes
  const remainingMinutes = Math.max(0, DAY_TARGET_MINUTES - totalMinutes)
  const overMinutes = Math.max(0, totalMinutes - DAY_TARGET_MINUTES)
  // School time the parent must still cover with work: any school minutes not
  // yet matched by work that day.
  const workNeededMinutes = Math.max(0, schoolMinutes - workMinutes)
  return { childcareMinutes, schoolMinutes, workMinutes, totalMinutes, remainingMinutes, overMinutes, workNeededMinutes }
}
