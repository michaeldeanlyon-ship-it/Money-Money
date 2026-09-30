import { describe, it, expect } from 'vitest'
import { buildReport, toReportCSV } from './reportUtils'

const entries = [
  { id: '1', date: '2026-01-10', type: 'job', job_name: 'Acme', job_label: 'Invoicery', minutes: 150, created_at: '2026-01-10T09:00:00Z' },
  { id: '2', date: '2026-01-05', type: 'job', job_name: 'Beta', job_label: 'Invoicery', minutes: 60, created_at: '2026-01-05T09:00:00Z' },
  { id: '3', date: '2026-01-07', type: 'job', job_name: 'Gamma', job_label: 'Frilans', minutes: 90, created_at: '2026-01-07T09:00:00Z' },
  { id: '4', date: '2026-01-08', type: 'childcare', job_name: null, job_label: null, minutes: 120, created_at: '2026-01-08T09:00:00Z' },
  { id: '5', date: '2026-02-01', type: 'job', job_name: 'Acme', job_label: 'Invoicery', minutes: 60, created_at: '2026-02-01T09:00:00Z' },
]

describe('buildReport', () => {
  it('filters to the category and inclusive date range, sorted by date', () => {
    const { rows } = buildReport(entries, 'invoicery', '2026-01-01', '2026-01-31')
    expect(rows.map(r => r.id)).toEqual(['2', '1']) // Jan 5 before Jan 10; Feb 1 excluded
    expect(rows[0]).toMatchObject({ date: '2026-01-05', description: 'Beta', minutes: 60 })
  })

  it('includes range boundary dates', () => {
    const { rows } = buildReport(entries, 'invoicery', '2026-01-10', '2026-02-01')
    expect(rows.map(r => r.id)).toEqual(['1', '5'])
  })

  it('uses "Child Care" as the description for childcare entries', () => {
    const { rows } = buildReport(entries, 'childcare', '2026-01-01', '2026-01-31')
    expect(rows).toHaveLength(1)
    expect(rows[0].description).toBe('Child Care')
  })

  it('sums total minutes across the matched rows', () => {
    const { totalMinutes } = buildReport(entries, 'invoicery', '2026-01-01', '2026-01-31')
    expect(totalMinutes).toBe(210)
  })

  it('returns empty rows and zero total when nothing matches', () => {
    const { rows, totalMinutes } = buildReport(entries, 'frilans', '2026-03-01', '2026-03-31')
    expect(rows).toEqual([])
    expect(totalMinutes).toBe(0)
  })
})

describe('toReportCSV', () => {
  it('produces a header, one line per row, and a total line', () => {
    const report = buildReport(entries, 'invoicery', '2026-01-01', '2026-01-31')
    const csv = toReportCSV(report, { category: 'invoicery', fromDate: '2026-01-01', toDate: '2026-01-31' })
    const lines = csv.trim().split('\n')
    expect(lines[0]).toBe('Date,For,Hours:Minutes,Decimal Hours')
    expect(lines[1]).toBe('2026-01-05,Beta,1:00,1.00')
    expect(lines[2]).toBe('2026-01-10,Acme,2:30,2.50')
    expect(lines[3]).toBe('Total,,3:30,3.50')
  })

  it('quotes fields containing commas or quotes', () => {
    const report = { rows: [{ id: '9', date: '2026-01-03', description: 'Acme, Inc', minutes: 30 }], totalMinutes: 30 }
    const csv = toReportCSV(report, { category: 'invoicery', fromDate: '2026-01-01', toDate: '2026-01-31' })
    expect(csv).toContain('"Acme, Inc"')
  })
})
