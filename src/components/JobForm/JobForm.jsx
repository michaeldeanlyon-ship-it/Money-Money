import { useState } from 'react'
import './JobForm.css'

const LABELS = ['Frilans', 'Invoicery']

export default function JobForm({ initialJob = null, onSave, onCancel }) {
  const [name, setName] = useState(initialJob?.name ?? '')
  const [label, setLabel] = useState(initialJob?.label ?? 'Frilans')
  const [runtimeHours, setRuntimeHours] = useState(
    initialJob ? Math.floor(initialJob.runtime_minutes / 60).toString() : ''
  )
  const [runtimeMins, setRuntimeMins] = useState(
    initialJob ? (initialJob.runtime_minutes % 60).toString() : ''
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const h = parseInt(runtimeHours) || 0
    const m = parseInt(runtimeMins) || 0
    const runtime_minutes = h * 60 + m
    if (!name.trim() || runtime_minutes <= 0) return
    setSaving(true)
    await onSave({ name: name.trim(), label, runtime_minutes })
    setSaving(false)
  }

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <div className="jf-field">
        <label className="jf-label">Job name</label>
        <input
          className="jf-input"
          type="text"
          placeholder="e.g. Acme Project"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          required
        />
      </div>

      <div className="jf-field">
        <label className="jf-label">Label</label>
        <div className="jf-label-btns">
          {LABELS.map(l => (
            <button
              key={l}
              type="button"
              className={`jf-label-btn label-${l.toLowerCase()} ${label === l ? 'active' : ''}`}
              onClick={() => setLabel(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="jf-field">
        <label className="jf-label">Runtime budget</label>
        <div className="jf-time-row">
          <input
            className="jf-input jf-time-input"
            type="number"
            min="0"
            placeholder="0"
            value={runtimeHours}
            onChange={e => setRuntimeHours(e.target.value)}
          />
          <span className="jf-time-sep">h</span>
          <input
            className="jf-input jf-time-input"
            type="number"
            min="0"
            max="59"
            placeholder="0"
            value={runtimeMins}
            onChange={e => setRuntimeMins(e.target.value)}
          />
          <span className="jf-time-sep">m</span>
        </div>
      </div>

      <div className="jf-actions">
        <button type="button" className="jf-btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="jf-btn-save" disabled={saving}>
          {saving ? 'Saving…' : initialJob ? 'Save changes' : 'Add job'}
        </button>
      </div>
    </form>
  )
}
