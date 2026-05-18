import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AddEntryModal from './AddEntryModal'

// supabase isn't needed for these tests — the modal only calls it inside the
// Job tab to load runtime. Stub the module so the import doesn't break.
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}))

const JOBS = [
  { id: 'j1', name: 'Acme Corp', label: 'Invoicery', runtime_minutes: 4660 },
  { id: 'j2', name: 'Beta Co',   label: 'Frilans',   runtime_minutes: 2330 },
]

function renderModal(props = {}) {
  return render(
    <AddEntryModal
      date="2026-05-18"
      jobs={JOBS}
      onSave={props.onSave || vi.fn()}
      onUpdate={props.onUpdate || vi.fn()}
      onClose={props.onClose || vi.fn()}
      initialEntry={props.initialEntry}
      preselectedJob={props.preselectedJob}
    />
  )
}

describe('AddEntryModal', () => {
  it('renders four percentage buttons (25/50/75/100)', () => {
    renderModal()
    expect(screen.getByRole('button', { name: '25%' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '50%' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '75%' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '100%' })).toBeInTheDocument()
  })

  it('shows decimal-hour preview for the selected percentage', () => {
    renderModal()
    // default 100%
    expect(screen.getByText('7.76h')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '50%' }))
    expect(screen.getByText('3.88h')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '25%' }))
    expect(screen.getByText('1.94h')).toBeInTheDocument()
  })

  it('Job tab shows a jobs <select>', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Job' }))
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('Child Care tab hides the jobs <select>', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Child Care' }))
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('submitting Job at 75% sends type=job, minutes=349, jobId', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    renderModal({ onSave })
    fireEvent.click(screen.getByRole('button', { name: 'Job' }))
    fireEvent.click(screen.getByRole('button', { name: '75%' }))
    fireEvent.click(screen.getByRole('button', { name: /^Save$/ }))
    // wait a microtask for the async submit handler
    await Promise.resolve()
    await Promise.resolve()
    expect(onSave).toHaveBeenCalledTimes(1)
    const arg = onSave.mock.calls[0][0]
    expect(arg.type).toBe('job')
    expect(arg.minutes).toBe(349)
    expect(arg.jobId).toBe('j1')
    expect(arg.jobName).toBe('Acme Corp')
    expect(arg.jobLabel).toBe('Invoicery')
    expect(arg.paidTimeCategory).toBeFalsy()
    expect(arg.paidTimeName).toBeFalsy()
  })

  it('submitting Child Care at 50% sends type=childcare, minutes=233, no paid_time_* fields', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    renderModal({ onSave })
    fireEvent.click(screen.getByRole('button', { name: 'Child Care' }))
    fireEvent.click(screen.getByRole('button', { name: '50%' }))
    fireEvent.click(screen.getByRole('button', { name: /^Save$/ }))
    await Promise.resolve()
    await Promise.resolve()
    expect(onSave).toHaveBeenCalledTimes(1)
    const arg = onSave.mock.calls[0][0]
    expect(arg.type).toBe('childcare')
    expect(arg.minutes).toBe(233)
    expect(arg.jobId).toBeFalsy()
    expect(arg.paidTimeCategory).toBeFalsy()
    expect(arg.paidTimeName).toBeFalsy()
  })

  it('editing a legacy entry pre-selects the nearest % bucket (240→50%)', () => {
    const initialEntry = {
      id: 99,
      type: 'job',
      job_id: 'j2',
      job_name: 'Beta Co',
      job_label: 'Frilans',
      minutes: 240, // legacy 4h → nearest bucket is 50% (233)
    }
    renderModal({ initialEntry })
    // 50% button should have the active class
    const btn50 = screen.getByRole('button', { name: '50%' })
    expect(btn50.className).toMatch(/active/)
    const btn100 = screen.getByRole('button', { name: '100%' })
    expect(btn100.className).not.toMatch(/active/)
  })
})
