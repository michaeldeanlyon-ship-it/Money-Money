import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
  BUCKET_MINUTES,
  minutesToNearestPercent,
  percentToMinutes,
} from '../utils/timeUtils'

const MIGRATION_KEY = 'entries_migration_v2_done'
const CANONICAL_MINUTES = new Set(Object.values(BUCKET_MINUTES))

function isCanonicalMinutes(minutes) {
  return CANONICAL_MINUTES.has(minutes)
}

export function needsMigration(entry) {
  if (entry.type === 'paid_time') return true
  if (entry.paid_time_category != null) return true
  if (entry.paid_time_name != null) return true
  if (!isCanonicalMinutes(entry.minutes)) return true
  return false
}

function defaultResolveJob(entry, jobs) {
  if (!jobs?.length) return null
  return jobs.find(j => j.name === entry.paid_time_name) || jobs[0]
}

// Returns the patch to apply (without `id`), or null if no migration needed.
export function migrateEntry(entry, jobs, resolveJob = defaultResolveJob) {
  if (!needsMigration(entry)) return null

  const snappedMinutes = isCanonicalMinutes(entry.minutes)
    ? entry.minutes
    : percentToMinutes(minutesToNearestPercent(entry.minutes))

  // childcare paid_time → type='childcare'
  if (entry.type === 'paid_time' && entry.paid_time_category === 'childcare') {
    return {
      type: 'childcare',
      job_id: null,
      job_name: null,
      job_label: null,
      paid_time_category: null,
      paid_time_name: null,
      minutes: snappedMinutes,
    }
  }

  // employment paid_time → type='job' with resolved job
  if (entry.type === 'paid_time' && entry.paid_time_category === 'employment') {
    const job = resolveJob(entry, jobs)
    return {
      type: 'job',
      job_id: job?.id || null,
      job_name: job?.name || null,
      job_label: job?.label || null,
      paid_time_category: null,
      paid_time_name: null,
      minutes: snappedMinutes,
    }
  }

  // Already on new type but needs minute snap and/or paid_time_* cleared
  return {
    type: entry.type,
    job_id: entry.job_id || null,
    job_name: entry.job_name || null,
    job_label: entry.job_label || null,
    paid_time_category: null,
    paid_time_name: null,
    minutes: snappedMinutes,
  }
}

export function useMigration(jobs, ready) {
  const running = useRef(false)

  useEffect(() => {
    if (!ready) return
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(MIGRATION_KEY) === '1') return
    if (running.current) return
    running.current = true
    runMigration(jobs).finally(() => {
      running.current = false
    })
  }, [ready, jobs])
}

async function runMigration(jobs) {
  const { data: entries, error } = await supabase.from('entries').select('*')
  if (error) {
    console.error('[migration] failed to load entries', error)
    return
  }

  let updated = 0
  for (const entry of entries) {
    const patch = migrateEntry(entry, jobs)
    if (!patch) continue
    const { error: updErr } = await supabase
      .from('entries')
      .update(patch)
      .eq('id', entry.id)
    if (updErr) {
      console.error('[migration] failed for entry', entry.id, updErr)
      return // abort and retry next session
    }
    updated++
  }

  window.localStorage.setItem(MIGRATION_KEY, '1')
  if (updated > 0) {
    console.info(`[migration] updated ${updated} entries — reload to see fresh data`)
    // Soft reload so all already-loaded entries in memory get re-fetched.
    window.location.reload()
  }
}
