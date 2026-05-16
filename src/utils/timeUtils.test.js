import { describe, it, expect } from 'vitest'
import {
  scaleInputHoursForDate,
  WEEK_TARGET_MINUTES,
  WEEK_REDUCTION_START_DATE,
  computeWeekSummary,
  formatEntryDuration,
} from './timeUtils'

describe('scaleInputHoursForDate', () => {
  it('scales 4 → 3.88 on the cutoff date (2026-04-01)', () => {
    expect(scaleInputHoursForDate(4, '2026-04-01')).toBeCloseTo(3.88, 5)
  })

  it('scales 4 → 3.88 after the cutoff', () => {
    expect(scaleInputHoursForDate(4, '2026-05-16')).toBeCloseTo(3.88, 5)
  })

  it('scales 8 → 7.76 after the cutoff', () => {
    expect(scaleInputHoursForDate(8, '2026-04-15')).toBeCloseTo(7.76, 5)
  })

  it('does NOT scale before the cutoff (2026-03-31 → raw 4)', () => {
    expect(scaleInputHoursForDate(4, '2026-03-31')).toBe(4)
  })

  it('does NOT scale a 2025 date', () => {
    expect(scaleInputHoursForDate(8, '2025-12-15')).toBe(8)
  })

  it('scales 0 → 0 regardless of date', () => {
    expect(scaleInputHoursForDate(0, '2026-04-01')).toBe(0)
    expect(scaleInputHoursForDate(0, '2026-03-15')).toBe(0)
  })

  it('scales a full 40 → 38.8 after cutoff (the whole point)', () => {
    expect(scaleInputHoursForDate(40, '2026-04-01')).toBeCloseTo(38.8, 5)
  })
})

describe('WEEK_REDUCTION_START_DATE', () => {
  it('is 2026-04-01', () => {
    expect(WEEK_REDUCTION_START_DATE).toBe('2026-04-01')
  })
})

describe('WEEK_TARGET_MINUTES', () => {
  it('is 2328 (38.8h × 60)', () => {
    expect(WEEK_TARGET_MINUTES).toBe(2328)
  })
})

describe('formatEntryDuration', () => {
  it('shows "input → adjusted" for entries on/after cutoff', () => {
    // 4h input → 233 min stored; reverse-scaled back to 4h for display
    expect(formatEntryDuration(233, '2026-04-01')).toBe('4h → 3h 53m')
  })

  it('handles 8h input → 466 min on a post-cutoff date', () => {
    expect(formatEntryDuration(466, '2026-04-15')).toBe('8h → 7h 46m')
  })

  it('handles 1.5h input → 87 min on a post-cutoff date', () => {
    expect(formatEntryDuration(87, '2026-05-01')).toBe('1.5h → 1h 27m')
  })

  it('shows only the stored value for pre-cutoff entries', () => {
    // 240 min = 4h, entered before the reduction kicked in
    expect(formatEntryDuration(240, '2026-03-31')).toBe('4h')
  })

  it('shows only the stored value for 2025 entries', () => {
    expect(formatEntryDuration(480, '2025-12-15')).toBe('8h')
  })

  it('returns "0m" for zero/empty minutes regardless of date', () => {
    expect(formatEntryDuration(0, '2026-04-01')).toBe('0m')
    expect(formatEntryDuration(0, '2025-12-15')).toBe('0m')
  })

  it('rounds the reverse-scaled input to a clean quarter hour', () => {
    // 0.25h input → 15 min; reverse should round to 0.25
    expect(formatEntryDuration(15, '2026-04-10')).toBe('0.25h → 15m')
  })
})

describe('computeWeekSummary', () => {
  const date = '2026-05-11'

  it('is exact at 2328 minutes (38.8h)', () => {
    const result = computeWeekSummary([date], [{ date, minutes: 2328 }])
    expect(result.isExact).toBe(true)
    expect(result.percent).toBe(100)
    expect(result.remainingMinutes).toBe(0)
    expect(result.overMinutes).toBe(0)
  })

  it('is 50% at 1164 minutes (half of 2328)', () => {
    const result = computeWeekSummary([date], [{ date, minutes: 1164 }])
    expect(result.percent).toBe(50)
    expect(result.isExact).toBe(false)
    expect(result.remainingMinutes).toBe(1164)
  })

  it('reports overMinutes when above target', () => {
    const result = computeWeekSummary([date], [{ date, minutes: 2400 }])
    expect(result.isExact).toBe(false)
    expect(result.overMinutes).toBe(72)
    expect(result.remainingMinutes).toBe(0)
  })
})
