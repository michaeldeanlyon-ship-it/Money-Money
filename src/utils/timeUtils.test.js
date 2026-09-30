import { describe, it, expect } from 'vitest'
import { minutesToClock, minutesToDecimalHours, formatDecimalHours } from './timeUtils'

describe('minutesToClock', () => {
  it('formats hours and minutes as H:MM with zero-padded minutes', () => {
    expect(minutesToClock(150)).toBe('2:30')
    expect(minutesToClock(65)).toBe('1:05')
  })

  it('shows :00 for whole hours', () => {
    expect(minutesToClock(60)).toBe('1:00')
    expect(minutesToClock(120)).toBe('2:00')
  })

  it('handles sub-hour and zero values', () => {
    expect(minutesToClock(45)).toBe('0:45')
    expect(minutesToClock(0)).toBe('0:00')
    expect(minutesToClock(null)).toBe('0:00')
  })
})

describe('minutesToDecimalHours', () => {
  it('returns the numeric decimal hours', () => {
    expect(minutesToDecimalHours(150)).toBeCloseTo(2.5)
    expect(minutesToDecimalHours(90)).toBeCloseTo(1.5)
    expect(minutesToDecimalHours(0)).toBe(0)
  })
})

describe('formatDecimalHours', () => {
  it('formats decimal hours to two places', () => {
    expect(formatDecimalHours(150)).toBe('2.50')
    expect(formatDecimalHours(90)).toBe('1.50')
    expect(formatDecimalHours(0)).toBe('0.00')
  })
})
