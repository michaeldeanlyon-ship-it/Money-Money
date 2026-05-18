import { describe, it, expect } from 'vitest'
import { migrateEntry, needsMigration } from './useMigration'

const JOBS = [
  { id: 'j-inv', name: 'Acme Corp', label: 'Invoicery' },
  { id: 'j-fri', name: 'Beta Co',   label: 'Frilans' },
]

// match-by-name resolver, falls back to the first job
const resolveJob = (entry, jobs) =>
  jobs.find(j => j.name === entry.paid_time_name) || jobs[0]

describe('migrateEntry', () => {
  it('childcare paid_time → type=childcare with snapped minutes', () => {
    const out = migrateEntry(
      {
        type: 'paid_time',
        paid_time_category: 'childcare',
        paid_time_name: 'School run',
        minutes: 480,
      },
      JOBS,
      resolveJob
    )
    expect(out.type).toBe('childcare')
    expect(out.minutes).toBe(466)
    expect(out.paid_time_category).toBeNull()
    expect(out.paid_time_name).toBeNull()
  })

  it('employment paid_time → type=job using resolver, snaps minutes', () => {
    const out = migrateEntry(
      {
        type: 'paid_time',
        paid_time_category: 'employment',
        paid_time_name: 'Beta Co',
        minutes: 240, // legacy 4h → 50% = 233
      },
      JOBS,
      resolveJob
    )
    expect(out.type).toBe('job')
    expect(out.job_id).toBe('j-fri')
    expect(out.job_name).toBe('Beta Co')
    expect(out.job_label).toBe('Frilans')
    expect(out.minutes).toBe(233)
    expect(out.paid_time_category).toBeNull()
    expect(out.paid_time_name).toBeNull()
  })

  it('employment paid_time with unknown name → fallback to first job', () => {
    const out = migrateEntry(
      {
        type: 'paid_time',
        paid_time_category: 'employment',
        paid_time_name: 'Mystery Co',
        minutes: 480,
      },
      JOBS,
      resolveJob
    )
    expect(out.type).toBe('job')
    expect(out.job_id).toBe('j-inv') // fallback (first)
    expect(out.minutes).toBe(466)
  })

  it('already-canonical job entry is unchanged', () => {
    const entry = {
      type: 'job',
      job_id: 'j-inv',
      job_name: 'Acme Corp',
      job_label: 'Invoicery',
      minutes: 466,
      paid_time_category: null,
      paid_time_name: null,
    }
    expect(migrateEntry(entry, JOBS, resolveJob)).toBeNull()
  })

  it('already-canonical childcare entry is unchanged', () => {
    const entry = { type: 'childcare', minutes: 233, paid_time_category: null, paid_time_name: null }
    expect(migrateEntry(entry, JOBS, resolveJob)).toBeNull()
  })

  it('job entry with non-bucket minutes gets snapped', () => {
    const entry = {
      type: 'job',
      job_id: 'j-inv',
      job_name: 'Acme Corp',
      job_label: 'Invoicery',
      minutes: 240,
    }
    const out = migrateEntry(entry, JOBS, resolveJob)
    expect(out.type).toBe('job')
    expect(out.minutes).toBe(233)
    expect(out.job_id).toBe('j-inv')
  })
})

describe('needsMigration', () => {
  it('returns true for paid_time entry', () => {
    expect(needsMigration({ type: 'paid_time', minutes: 466 })).toBe(true)
  })
  it('returns true for non-canonical minutes', () => {
    expect(needsMigration({ type: 'job', minutes: 480 })).toBe(true)
  })
  it('returns false for canonical job entry', () => {
    expect(needsMigration({ type: 'job', minutes: 466 })).toBe(false)
  })
  it('returns false for canonical childcare entry', () => {
    expect(needsMigration({ type: 'childcare', minutes: 116 })).toBe(false)
  })
  it('returns true if paid_time_category is set on a job', () => {
    expect(needsMigration({ type: 'job', minutes: 466, paid_time_category: 'employment' })).toBe(true)
  })
})
