import { describe, it, expect } from 'vitest'
import {
  PERCENT_OPTIONS,
  BUCKET_MINUTES,
  DAY_TARGET_HOURS,
  WEEK_TARGET_HOURS,
  WEEK_TARGET_MINUTES,
  percentToMinutes,
  percentToDecimalHours,
  minutesToNearestPercent,
  formatEntryDuration,
  minutesToHHMM,
  computeWeekSummary,
  computeDaySummary,
} from './timeUtils'

describe('constants', () => {
  it('WEEK_TARGET_HOURS is 38.8', () => {
    expect(WEEK_TARGET_HOURS).toBe(38.8)
  })
  it('WEEK_TARGET_MINUTES is 2330 (5 × BUCKET_MINUTES[100])', () => {
    expect(WEEK_TARGET_MINUTES).toBe(2330)
  })
  it('DAY_TARGET_HOURS is 7.76', () => {
    expect(DAY_TARGET_HOURS).toBeCloseTo(7.76, 5)
  })
  it('PERCENT_OPTIONS is [25, 50, 75, 100]', () => {
    expect(PERCENT_OPTIONS).toEqual([25, 50, 75, 100])
  })
  it('BUCKET_MINUTES maps 25→116, 50→233, 75→349, 100→466', () => {
    expect(BUCKET_MINUTES).toEqual({ 25: 116, 50: 233, 75: 349, 100: 466 })
  })
})

describe('percentToMinutes', () => {
  it('25 → 116', () => expect(percentToMinutes(25)).toBe(116))
  it('50 → 233', () => expect(percentToMinutes(50)).toBe(233))
  it('75 → 349', () => expect(percentToMinutes(75)).toBe(349))
  it('100 → 466', () => expect(percentToMinutes(100)).toBe(466))
})

describe('percentToDecimalHours', () => {
  it('100 → 7.76', () => expect(percentToDecimalHours(100)).toBeCloseTo(7.76, 5))
  it('75 → 5.82', () => expect(percentToDecimalHours(75)).toBeCloseTo(5.82, 5))
  it('50 → 3.88', () => expect(percentToDecimalHours(50)).toBeCloseTo(3.88, 5))
  it('25 → 1.94', () => expect(percentToDecimalHours(25)).toBeCloseTo(1.94, 5))
})

describe('minutesToNearestPercent', () => {
  it('exact bucket → that bucket', () => {
    expect(minutesToNearestPercent(116)).toBe(25)
    expect(minutesToNearestPercent(233)).toBe(50)
    expect(minutesToNearestPercent(349)).toBe(75)
    expect(minutesToNearestPercent(466)).toBe(100)
  })
  it('legacy 240 (old 4h) → 50%', () => {
    expect(minutesToNearestPercent(240)).toBe(50)
  })
  it('legacy 480 (old 8h) → 100%', () => {
    expect(minutesToNearestPercent(480)).toBe(100)
  })
  it('60 → 25%', () => {
    expect(minutesToNearestPercent(60)).toBe(25)
  })
  it('400 → 75%', () => {
    expect(minutesToNearestPercent(400)).toBe(75)
  })
  it('0 → 25% (clamp to lowest bucket)', () => {
    expect(minutesToNearestPercent(0)).toBe(25)
  })
  it('huge value → 100%', () => {
    expect(minutesToNearestPercent(99999)).toBe(100)
  })
})

describe('formatEntryDuration', () => {
  it('466 → "100% · 7h 46m"', () => {
    expect(formatEntryDuration(466)).toBe('100% · 7h 46m')
  })
  it('349 → "75% · 5h 49m"', () => {
    expect(formatEntryDuration(349)).toBe('75% · 5h 49m')
  })
  it('233 → "50% · 3h 53m"', () => {
    expect(formatEntryDuration(233)).toBe('50% · 3h 53m')
  })
  it('116 → "25% · 1h 56m"', () => {
    expect(formatEntryDuration(116)).toBe('25% · 1h 56m')
  })
  it('0 → "0m"', () => {
    expect(formatEntryDuration(0)).toBe('0m')
  })
  it('null → "0m"', () => {
    expect(formatEntryDuration(null)).toBe('0m')
  })
})

describe('minutesToHHMM', () => {
  it('466 → "7h 46m"', () => expect(minutesToHHMM(466)).toBe('7h 46m'))
  it('60 → "1h"', () => expect(minutesToHHMM(60)).toBe('1h'))
  it('45 → "45m"', () => expect(minutesToHHMM(45)).toBe('45m'))
  it('0 → "0m"', () => expect(minutesToHHMM(0)).toBe('0m'))
})

describe('computeWeekSummary', () => {
  const date = '2026-05-11'

  it('is exact at 5×100% days (2330 minutes)', () => {
    const result = computeWeekSummary(
      ['d1', 'd2', 'd3', 'd4', 'd5'],
      [
        { date: 'd1', minutes: 466 },
        { date: 'd2', minutes: 466 },
        { date: 'd3', minutes: 466 },
        { date: 'd4', minutes: 466 },
        { date: 'd5', minutes: 466 },
      ]
    )
    expect(result.isExact).toBe(true)
    expect(result.percent).toBe(100)
    expect(result.remainingMinutes).toBe(0)
    expect(result.overMinutes).toBe(0)
    expect(result.remainingPercent).toBe(0)
    expect(result.overPercent).toBe(0)
  })

  it('is 50% at half target (1165 minutes)', () => {
    const result = computeWeekSummary([date], [{ date, minutes: 1165 }])
    expect(result.percent).toBe(50)
    expect(result.isExact).toBe(false)
    expect(result.remainingPercent).toBe(50)
    expect(result.overPercent).toBe(0)
  })

  it('reports overPercent when above target', () => {
    const result = computeWeekSummary([date], [{ date, minutes: 2796 }]) // 6 × 466
    expect(result.isExact).toBe(false)
    expect(result.percent).toBe(120)
    expect(result.overPercent).toBe(20)
    expect(result.remainingPercent).toBe(0)
  })

  it('one full 100% day → 20% of week', () => {
    const result = computeWeekSummary([date], [{ date, minutes: 466 }])
    expect(result.percent).toBe(20)
    expect(result.remainingPercent).toBe(80)
  })
})

describe('computeDaySummary', () => {
  const date = '2026-05-11'

  it('sums job and childcare separately', () => {
    const entries = [
      { date, type: 'job', minutes: 466 },
      { date, type: 'childcare', minutes: 233 },
      { date, type: 'job', minutes: 116 },
    ]
    const result = computeDaySummary(date, entries)
    expect(result.workMinutes).toBe(582)
    expect(result.childcareMinutes).toBe(233)
    expect(result.totalMinutes).toBe(815)
  })

  it('ignores entries from other dates', () => {
    const entries = [
      { date, type: 'job', minutes: 466 },
      { date: '2026-05-10', type: 'job', minutes: 233 },
    ]
    const result = computeDaySummary(date, entries)
    expect(result.workMinutes).toBe(466)
    expect(result.totalMinutes).toBe(466)
  })

  it('returns zeros for an empty day', () => {
    const result = computeDaySummary(date, [])
    expect(result.workMinutes).toBe(0)
    expect(result.childcareMinutes).toBe(0)
    expect(result.totalMinutes).toBe(0)
  })
})
