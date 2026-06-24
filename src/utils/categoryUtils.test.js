import { describe, it, expect } from 'vitest'
import { CATEGORIES, entryCategory, matchesFilter } from './categoryUtils'

const childcare = { type: 'childcare', minutes: 233 }
const frilans   = { type: 'job', job_label: 'Frilans', minutes: 116 }
const invoicery = { type: 'job', job_label: 'Invoicery', minutes: 466 }

describe('CATEGORIES', () => {
  it('lists invoicery, frilans, childcare with display labels', () => {
    expect(CATEGORIES).toEqual([
      { key: 'invoicery', label: 'Invoicery' },
      { key: 'frilans', label: 'Frilans' },
      { key: 'childcare', label: 'Childcare' },
    ])
  })
})

describe('entryCategory', () => {
  it('maps childcare entries to "childcare"', () => {
    expect(entryCategory(childcare)).toBe('childcare')
  })
  it('maps Frilans job entries to "frilans"', () => {
    expect(entryCategory(frilans)).toBe('frilans')
  })
  it('maps Invoicery job entries to "invoicery"', () => {
    expect(entryCategory(invoicery)).toBe('invoicery')
  })
})

describe('matchesFilter', () => {
  it('matches everything when filter is "all"', () => {
    expect(matchesFilter(childcare, 'all')).toBe(true)
    expect(matchesFilter(frilans, 'all')).toBe(true)
    expect(matchesFilter(invoicery, 'all')).toBe(true)
  })
  it('matches only the entry of the selected category', () => {
    expect(matchesFilter(frilans, 'frilans')).toBe(true)
    expect(matchesFilter(childcare, 'frilans')).toBe(false)
    expect(matchesFilter(invoicery, 'frilans')).toBe(false)
  })
})
