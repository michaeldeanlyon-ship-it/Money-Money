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

  it('School tab shows Hours and Minutes fields instead of percentage buttons', () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'School' }))
    expect(screen.queryByRole('button', { name: '25%' })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    // two numeric fields (hours + minutes) are shown instead
    expect(screen.getByLabelText('Hours')).toBeInTheDocument()
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument()
  })

  it('submitting School at 6h 30m sends type=school, minutes=390, no job fields', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    renderModal({ onSave })
    fireEvent.click(screen.getByRole('button', { name: 'School' }))
    fireEvent.change(screen.getByLabelText('Hours'), { target: { value: '6' } })
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: /^Save$/ }))
    await Promise.resolve()
    await Promise.resolve()
    expect(onSave).toHaveBeenCalledTimes(1)
    const arg = onSave.mock.calls[0][0]
    expect(arg.type).toBe('school')
    expect(arg.minutes).toBe(390)
    expect(arg.jobId).toBeFalsy()
    expect(arg.jobName).toBeFalsy()
    expect(arg.jobLabel).toBeFalsy()
  })

  it('editing a 390-min school entry pre-fills 6 hours and 30 minutes', () => {
    renderModal({ initialEntry: { id: 42, type: 'school', minutes: 390 } })
    expect(screen.getByLabelText('Hours')).toHaveValue(6)
    expect(screen.getByLabelText('Minutes')).toHaveValue(30)
  })

  it('Job % / h:m toggle switches inputs; % saves the bucket, h:m saves typed minutes', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    renderModal({ onSave })
    fireEvent.click(screen.getByRole('button', { name: 'Job' }))
    // new Job entry defaults to % mode: buckets shown, no h/m fields
    expect(screen.getByRole('button', { name: '75%' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Hours')).not.toBeInTheDocument()
    // switch to h:m mode
    fireEvent.click(screen.getByRole('button', { name: 'h:m' }))
    expect(screen.queryByRole('button', { name: '75%' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Hours'), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText('Minutes'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /^Save$/ }))
    await Promise.resolve()
    await Promise.resolve()
    const arg = onSave.mock.calls[0][0]
    expect(arg.type).toBe('job')
    expect(arg.minutes).toBe(240)
  })

  it('editing an exact-bucket Job entry opens in % mode with that bucket active', () => {
    const initialEntry = {
      id: 7,
      type: 'job',
      job_id: 'j2',
      job_name: 'Beta Co',
      job_label: 'Frilans',
      minutes: 233, // exact 50% bucket
    }
    renderModal({ initialEntry })
    const btn50 = screen.getByRole('button', { name: '50%' })
    expect(btn50.className).toMatch(/active/)
  })

  it('editing a non-bucket Job entry opens in h:m mode, pre-filled', () => {
    const initialEntry = {
      id: 99,
      type: 'job',
      job_id: 'j2',
      job_name: 'Beta Co',
      job_label: 'Frilans',
      minutes: 240, // not a bucket → h:m mode showing 4h 0m
    }
    renderModal({ initialEntry })
    expect(screen.queryByRole('button', { name: '50%' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Hours')).toHaveValue(4)
    expect(screen.getByLabelText('Minutes')).toHaveValue(0)
  })
})
