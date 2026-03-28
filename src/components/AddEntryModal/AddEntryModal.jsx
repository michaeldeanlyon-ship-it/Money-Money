import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { minutesToHHMM } from '../../utils/timeUtils'
import { formatDayLabel } from '../../utils/dateUtils'
import './AddEntryModal.css'

export default function AddEntryModal({ date, jobs, onSave, onUpdate, onClose, initialEntry, preselectedJob }) {
  const isEdit = !!initialEntry

  const [type, setType] = useState(initialEntry?.type || (preselectedJob ? 'job' : 'job'))
  const [selectedJobId, setSelectedJobId] = useState(
    initialEntry?.job_id || preselectedJob?.id || (jobs[0]?.id || '')
  )
  const [hours, setHours] = useState(
    initialEntry?.minutes ? (initialEntry.minutes / 60).toString() : ''
  )
  const [paidCategory, setPaidCategory] = useState(initialEntry?.paid_time_category || 'employment')
  const [paidName, setPaidName] = useState(initialEntry?.paid_time_name || '')
  const [jobTimeSpent, setJobTimeSpent] = useState(null)
  const [saving, setSaving] = useState(false)

  const selectedJob = jobs.find(j => j.id === selectedJobId)

  useEffect(() => {
    if (type === 'job' && selectedJobId) {
      loadJobTimeSpent(selectedJobId)
    }
  }, [type, selectedJobId])

  async function loadJobTimeSpent(jobId) {
    setJobTimeSpent(null)
    const { data } = await supabase
      .from('entries')
      .select('minutes, id')
      .eq('job_id', jobId)
    if (data) {
      const total = data
        .filter(e => !isEdit || e.id !== initialEntry.id)
        .reduce((sum, e) => sum + e.minutes, 0)
      setJobTimeSpent(total)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const mins = Math.round(parseFloat(hours) * 60)
    if (!mins || mins <= 0) return

    setSaving(true)
    try {
      const job = jobs.find(j => j.id === selectedJobId)
      const entry = {
        date,
        type,
        jobId: type === 'job' ? selectedJobId : null,
        jobName: type === 'job' ? (job?.name || null) : null,
        jobLabel: type === 'job' ? (job?.label || null) : null,
        paidTimeCategory: type === 'paid_time' ? paidCategory : null,
        paidTimeName: type === 'paid_time' ? (paidName || null) : null,
        minutes: mins,
      }
      if (isEdit) {
        await onUpdate(initialEntry.id, entry)
      } else {
        await onSave(entry)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const runtime = selectedJob?.runtime_minutes || 0
  const spent = jobTimeSpent ?? 0
  const remaining = Math.max(0, runtime - spent)

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">{isEdit ? 'Edit entry' : `Add to ${formatDayLabel(date)}`}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type tabs */}
            <div className="type-tabs">
              <button type="button" className={`type-tab ${type === 'job' ? 'active' : ''}`} onClick={() => setType('job')}>
                Job
              </button>
              <button type="button" className={`type-tab ${type === 'paid_time' ? 'active' : ''}`} onClick={() => setType('paid_time')}>
                Paid Time
              </button>
            </div>

            {type === 'job' && (
              <>
                <div className="form-field">
                  <label>Job</label>
                  {jobs.length === 0 ? (
                    <p className="no-jobs-msg">No jobs yet. <a href="/jobs">Add a job first.</a></p>
                  ) : (
                    <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.name} — {j.label}</option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedJob && (
                  <div className="job-info-box">
                    <div className="ji-cell">
                      <div className="ji-val">{minutesToHHMM(runtime)}</div>
                      <div className="ji-label">Runtime</div>
                    </div>
                    <div className="ji-cell">
                      <div className="ji-val">{jobTimeSpent === null ? '…' : minutesToHHMM(spent)}</div>
                      <div className="ji-label">Spent</div>
                    </div>
                    <div className="ji-cell">
                      <div className={`ji-val ${remaining > 0 ? 'remaining' : 'done'}`}>
                        {jobTimeSpent === null ? '…' : minutesToHHMM(remaining)}
                      </div>
                      <div className="ji-label">Remaining</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {type === 'paid_time' && (
              <>
                <div className="form-field">
                  <label>Category</label>
                  <div className="cat-tabs">
                    <button type="button" className={`cat-tab ${paidCategory === 'employment' ? 'employment' : ''}`} onClick={() => setPaidCategory('employment')}>
                      Employment
                    </button>
                    <button type="button" className={`cat-tab ${paidCategory === 'childcare' ? 'childcare' : ''}`} onClick={() => setPaidCategory('childcare')}>
                      Childcare
                    </button>
                  </div>
                </div>
                <div className="form-field">
                  <label>Description (optional)</label>
                  <input
                    type="text"
                    value={paidName}
                    onChange={e => setPaidName(e.target.value)}
                    placeholder="e.g. School run, Regular work..."
                  />
                </div>
              </>
            )}

            <div className="form-field">
              <label>Hours</label>
              <input
                type="number"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="e.g. 1.5 (= 1h 30m)"
                min="0"
                step="any"
                required
                autoFocus={!preselectedJob}
              />
              {hours && parseFloat(hours) > 0 && (
                <span className="minutes-hint">{minutesToHHMM(Math.round(parseFloat(hours) * 60))}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
