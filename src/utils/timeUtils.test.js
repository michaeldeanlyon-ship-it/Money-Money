import { describe, it, expect } from 'vitest'
import {
  scaleInputHoursForDate,
  WEEK_TARGET_MINUTES,
  WEEK_REDUCTION_START_DATE,
  computeWeekSummary,
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
