import { describe, it, expect } from 'vitest'
import {
  PERCENT_OPTIONS,
  BUCKET_MINUTES,
  DAY_TARGET_HOURS,
  DAY_TARGET_MINUTES,
  WEEK_TARGET_HOURS,
  WEEK_TARGET_MINUTES,
  percentToMinutes,
  percentToDecimalHours,
  percentOfDayTarget,
  hoursToMinutes,
  hoursMinutesToMinutes,
  minutesToHM,
  isExactBucket,
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
  it('DAY_TARGET_MINUTES is 466 (a full 100% day)', () => {
    expect(DAY_TARGET_MINUTES).toBe(466)
  })
})

describe('hoursToMinutes', () => {
  it('2.5 → 150', () => expect(hoursToMinutes(2.5)).toBe(150))
  it('1 → 60', () => expect(hoursToMinutes(1)).toBe(60))
  it('0.25 → 15', () => expect(hoursToMinutes(0.25)).toBe(15))
  it('rounds to the nearest minute', () => expect(hoursToMinutes(1.008)).toBe(60))
})

describe('hoursMinutesToMinutes', () => {
  it('6h 30m → 390', () => expect(hoursMinutesToMinutes(6, 30)).toBe(390))
  it('accepts numeric strings from text inputs', () =>
    expect(hoursMinutesToMinutes('6', '30')).toBe(390))
  it('treats empty fields as zero', () => {
    expect(hoursMinutesToMinutes('', '')).toBe(0)
    expect(hoursMinutesToMinutes(2, '')).toBe(120)
    expect(hoursMinutesToMinutes('', 45)).toBe(45)
  })
})

describe('minutesToHM', () => {
  it('390 → { hours: 6, minutes: 30 }', () =>
    expect(minutesToHM(390)).toEqual({ hours: 6, minutes: 30 }))
  it('0 → { hours: 0, minutes: 0 }', () =>
    expect(minutesToHM(0)).toEqual({ hours: 0, minutes: 0 }))
  it('45 → { hours: 0, minutes: 45 }', () =>
    expect(minutesToHM(45)).toEqual({ hours: 0, minutes: 45 }))
  it('round-trips with hoursMinutesToMinutes', () => {
    for (const min of [0, 45, 116, 390, 466]) {
      const { hours, minutes } = minutesToHM(min)
      expect(hoursMinutesToMinutes(hours, minutes)).toBe(min)
    }
  })
})

describe('isExactBucket', () => {
  it('is true for the four bucket minute values', () => {
    expect(isExactBucket(116)).toBe(true)
    expect(isExactBucket(233)).toBe(true)
    expect(isExactBucket(349)).toBe(true)
    expect(isExactBucket(466)).toBe(true)
  })
  it('is false for a non-bucket value', () => {
    expect(isExactBucket(390)).toBe(false)
    expect(isExactBucket(0)).toBe(false)
    expect(isExactBucket(240)).toBe(false)
  })
})

describe('percentOfDayTarget', () => {
  it('full day → 100', () => expect(percentOfDayTarget(466)).toBe(100))
  it('half day → 50', () => expect(percentOfDayTarget(233)).toBe(50))
  it('0 → 0', () => expect(percentOfDayTarget(0)).toBe(0))
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

  it('excludes school entries from the week total', () => {
    const result = computeWeekSummary(
      [date],
      [
        { date, type: 'job', minutes: 466 },
        { date, type: 'school', minutes: 300 }, // must not count toward the week
      ]
    )
    expect(result.totalMinutes).toBe(466)
    expect(result.percent).toBe(20)
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

  it('excludes school from the credited total and reports work still owed', () => {
    const entries = [
      { date, type: 'job', minutes: 116 },        // work
      { date, type: 'childcare', minutes: 116 },  // childcare
      { date, type: 'school', minutes: 390 },      // school (does NOT credit the day)
    ]
    const result = computeDaySummary(date, entries)
    expect(result.workMinutes).toBe(116)
    expect(result.childcareMinutes).toBe(116)
    expect(result.schoolMinutes).toBe(390)
    // only work + childcare count toward the day target — school is excluded
    expect(result.totalMinutes).toBe(232)
    expect(result.remainingMinutes).toBe(234) // 466 − 232
    expect(result.overMinutes).toBe(0)
    // work still owed = school − work = 390 − 116
    expect(result.workNeededMinutes).toBe(274)
  })

  it('workNeededMinutes is zero once work covers the school hours', () => {
    const entries = [
      { date, type: 'job', minutes: 466 },
      { date, type: 'school', minutes: 300 },
    ]
    const result = computeDaySummary(date, entries)
    expect(result.schoolMinutes).toBe(300)
    // school excluded from the credited total even when fully worked
    expect(result.totalMinutes).toBe(466)
    expect(result.workNeededMinutes).toBe(0)
  })

  it('reports overMinutes when work + childcare exceed the 7.76h target', () => {
    const entries = [
      { date, type: 'job', minutes: 466 },
      { date, type: 'childcare', minutes: 60 },
      { date, type: 'school', minutes: 300 }, // still excluded from the total
    ]
    const result = computeDaySummary(date, entries)
    expect(result.totalMinutes).toBe(526)
    expect(result.remainingMinutes).toBe(0)
    expect(result.overMinutes).toBe(60)
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
    expect(result.schoolMinutes).toBe(0)
    expect(result.totalMinutes).toBe(0)
    expect(result.remainingMinutes).toBe(466)
    expect(result.overMinutes).toBe(0)
    expect(result.workNeededMinutes).toBe(0)
  })
})
