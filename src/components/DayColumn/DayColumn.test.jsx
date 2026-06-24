import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DayColumn from './DayColumn'
import { minutesToHHMM } from '../../utils/timeUtils'

const noop = () => {}
const date = '2026-06-24'

const entries = [
  { id: 1, date, type: 'childcare', minutes: 233 },
  { id: 2, date, type: 'job', job_name: 'FreelanceCo', job_label: 'Frilans', minutes: 116 },
  { id: 3, date, type: 'job', job_name: 'AcmeCorp', job_label: 'Invoicery', minutes: 466 },
]

function renderCol(filter) {
  return render(
    <MemoryRouter>
      <DayColumn date={date} entries={entries} filter={filter}
        onAdd={noop} onEdit={noop} onDelete={noop} />
    </MemoryRouter>
  )
}

describe('DayColumn filtering', () => {
  it('shows only frilans cards when filter is "frilans"', () => {
    renderCol('frilans')
    expect(screen.getByText('FreelanceCo')).toBeInTheDocument()
    expect(screen.queryByText('AcmeCorp')).toBeNull()
    expect(screen.queryByText('Child Care')).toBeNull()
  })

  it('keeps the day total based on all entries when filtered', () => {
    const { container } = renderCol('frilans')
    const full = minutesToHHMM(233 + 116 + 466)
    expect(container.querySelector('.day-total').textContent).toBe(full)
  })
})
