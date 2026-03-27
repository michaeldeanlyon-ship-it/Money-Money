import { useState } from 'react'
import { minutesToHHMM } from '../../utils/timeUtils'
import './JobsPanel.css'

function labelClass(label) {
  return label === 'Frilans' ? 'badge-frilans' : 'badge-invoicery'
}

function timeSpentForJob(jobId, entries) {
  return entries
    .filter(e => e.job_id === jobId)
    .reduce((sum, e) => sum + e.minutes, 0)
}

export default function JobsPanel({ jobs, entries, onDragStart, onDragEnd }) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="jobs-panel collapsed">
        <button className="jp-toggle" onClick={() => setCollapsed(false)} title="Show jobs">
          &#9001;
        </button>
      </div>
    )
  }

  return (
    <div className="jobs-panel">
      <div className="jp-header">
        <span className="jp-title">Jobs</span>
        <button className="jp-toggle" onClick={() => setCollapsed(true)} title="Hide jobs">
          &#9002;
        </button>
      </div>

      <div className="jp-list">
        {jobs.length === 0 && (
          <p className="jp-empty">No jobs yet.<br />Add one on the Jobs page.</p>
        )}
        {jobs.map(job => {
          const spent = timeSpentForJob(job.id, entries)
          const remaining = job.runtime_minutes - spent

          return (
            <div
              key={job.id}
              className="jp-card"
              draggable
              onDragStart={() => onDragStart(job)}
              onDragEnd={onDragEnd}
            >
              <div className="jp-card-top">
                <span className="jp-card-name">{job.name}</span>
                <span className={`badge ${labelClass(job.label)}`}>{job.label}</span>
              </div>
              <div className="jp-card-stats">
                <span className="jp-stat">
                  <span className="jp-stat-label">RT</span>
                  <span className="jp-stat-val">{minutesToHHMM(job.runtime_minutes)}</span>
                </span>
                <span className="jp-stat">
                  <span className="jp-stat-label">Spent</span>
                  <span className="jp-stat-val">{minutesToHHMM(spent)}</span>
                </span>
                {remaining !== 0 && (
                  <span className={`jp-stat ${remaining < 0 ? 'over' : ''}`}>
                    <span className="jp-stat-label">{remaining < 0 ? 'Over' : 'Left'}</span>
                    <span className="jp-stat-val">{minutesToHHMM(Math.abs(remaining))}</span>
                  </span>
                )}
              </div>
              <div className="jp-drag-hint">drag to day</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
