import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useEntries } from '../hooks/useEntries'
import { minutesToHHMM } from '../utils/timeUtils'
import JobForm from '../components/JobForm/JobForm'
import './JobsPage.css'

function labelClass(label) {
  return label === 'Frilans' ? 'badge-frilans' : 'badge-invoicery'
}

export default function JobsPage() {
  const { jobsData } = useAppContext()
  const { jobs, loading, addJob, updateJob, deleteJob } = jobsData
  const [editing, setEditing] = useState(null) // null | 'new' | job object
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Load all entries to compute time spent per job
  const { entries } = useEntries('2000-01-01', '2099-12-31')

  function timeSpentForJob(jobId) {
    return entries.filter(e => e.job_id === jobId).reduce((sum, e) => sum + e.minutes, 0)
  }

  async function handleSave(data) {
    if (editing === 'new') {
      await addJob(data)
    } else {
      await updateJob(editing.id, data)
    }
    setEditing(null)
  }

  async function handleDelete(job) {
    if (confirmDelete?.id === job.id) {
      await deleteJob(job.id)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(job)
    }
  }

  return (
    <div className="jobs-page">
      <div className="jobs-page-header">
        <h1 className="jobs-page-title">Job Templates</h1>
        {editing === null && (
          <button className="jobs-add-btn" onClick={() => setEditing('new')}>
            + Add job
          </button>
        )}
      </div>

      {editing && (
        <div className="jobs-form-wrap">
          <div className="jobs-form-card">
            <h2 className="jobs-form-title">
              {editing === 'new' ? 'New job' : `Edit: ${editing.name}`}
            </h2>
            <JobForm
              initialJob={editing === 'new' ? null : editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : jobs.length === 0 ? (
        <p className="jobs-empty">No job templates yet. Click "+ Add job" to create one.</p>
      ) : (
        <div className="jobs-table-wrap">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Label</th>
                <th>Runtime</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => {
                const spent = timeSpentForJob(job.id)
                const remaining = job.runtime_minutes - spent
                return (
                  <tr key={job.id} className={confirmDelete?.id === job.id ? 'confirm-row' : ''}>
                    <td className="jt-name">{job.name}</td>
                    <td>
                      <span className={`badge ${labelClass(job.label)}`}>{job.label}</span>
                    </td>
                    <td>{minutesToHHMM(job.runtime_minutes)}</td>
                    <td>{minutesToHHMM(spent)}</td>
                    <td className={remaining < 0 ? 'td-over' : ''}>
                      {remaining < 0 ? '−' : ''}{minutesToHHMM(Math.abs(remaining))}
                    </td>
                    <td className="jt-actions">
                      {confirmDelete?.id === job.id ? (
                        <>
                          <span className="jt-confirm-msg">Delete?</span>
                          <button
                            className="jt-btn jt-btn-danger"
                            onClick={() => handleDelete(job)}
                          >
                            Yes
                          </button>
                          <button
                            className="jt-btn"
                            onClick={() => setConfirmDelete(null)}
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="jt-btn"
                            onClick={() => setEditing(job)}
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            className="jt-btn jt-btn-danger"
                            onClick={() => handleDelete(job)}
                            title="Delete"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
