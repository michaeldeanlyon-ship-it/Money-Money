import { describe, it, expect } from 'vitest'
import { pathForViewSwitch } from './dateUtils'

describe('pathForViewSwitch', () => {
  describe('from a day', () => {
    const day = { view: 'day', date: '2026-03-18' }

    it('day → day is stable', () => {
      expect(pathForViewSwitch(day, 'day')).toBe('/day/2026-03-18')
    })
    it('day → week uses the ISO week of that date', () => {
      expect(pathForViewSwitch(day, 'week')).toBe('/week/2026/12')
    })
    it('day → month uses that date’s month', () => {
      expect(pathForViewSwitch(day, 'month')).toBe('/month/2026/3')
    })
  })

  describe('from a week', () => {
    const week = { view: 'week', year: 2026, week: 12 }

    it('week → day lands on the week’s Monday', () => {
      expect(pathForViewSwitch(week, 'day')).toBe('/day/2026-03-16')
    })
    it('week → week is stable', () => {
      expect(pathForViewSwitch(week, 'week')).toBe('/week/2026/12')
    })
    it('week → month uses the ISO-owning (Thursday) month for a straddling week', () => {
      // ISO week 1 of 2026: Mon = 29 Dec 2025, Thu = 1 Jan 2026.
      // Thursday wins, so it must resolve to January 2026, not December 2025.
      const straddling = { view: 'week', year: 2026, week: 1 }
      expect(pathForViewSwitch(straddling, 'month')).toBe('/month/2026/1')
    })
  })

  describe('from a month', () => {
    const month = { view: 'month', year: 2026, month: 3 }

    it('month → day lands on the 1st', () => {
      expect(pathForViewSwitch(month, 'day')).toBe('/day/2026-03-01')
    })
    it('month → week uses the week containing the 1st', () => {
      // 1 Mar 2026 is a Sunday → ISO week 9.
      expect(pathForViewSwitch(month, 'week')).toBe('/week/2026/9')
    })
    it('month → month is stable', () => {
      expect(pathForViewSwitch(month, 'month')).toBe('/month/2026/3')
    })
  })
})
