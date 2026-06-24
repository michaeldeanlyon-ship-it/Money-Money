import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MonthGrid from './MonthGrid'

// One ISO week, Mon–Sun, with all entries on the first day.
const weeks = [
  ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28']
    .map(date => ({ date, isCurrentMonth: true })),
]

const entries = [
  { id: 1, date: '2026-06-22', type: 'childcare', minutes: 233 },
  { id: 2, date: '2026-06-22', type: 'job', job_label: 'Frilans', minutes: 116 },
  { id: 3, date: '2026-06-22', type: 'job', job_label: 'Invoicery', minutes: 466 },
]

function renderGrid(filter) {
  return render(
    <MemoryRouter>
      <MonthGrid weeks={weeks} entries={entries} filter={filter} />
    </MemoryRouter>
  )
}

describe('MonthGrid filtering', () => {
  it('shows all three pills when filter is "all"', () => {
    const { container } = renderGrid('all')
    expect(container.querySelector('.mg-pill-childcare')).toBeTruthy()
    expect(container.querySelector('.mg-pill-frilans')).toBeTruthy()
    expect(container.querySelector('.mg-pill-invoicery')).toBeTruthy()
  })

  it('shows only frilans pills when filter is "frilans"', () => {
    const { container } = renderGrid('frilans')
    expect(container.querySelector('.mg-pill-frilans')).toBeTruthy()
    expect(container.querySelector('.mg-pill-childcare')).toBeNull()
    expect(container.querySelector('.mg-pill-invoicery')).toBeNull()
  })

  it('keeps the week summary based on all entries regardless of filter', () => {
    const all = renderGrid('all').container.querySelector('.mg-wk-cell').textContent
    const frilans = renderGrid('frilans').container.querySelector('.mg-wk-cell').textContent
    expect(frilans).toBe(all)
  })
})
