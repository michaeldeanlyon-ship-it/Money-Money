import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useEntries } from '../hooks/useEntries'
import { formatDayLabel, addDays, getISOWeek, today, getWeekDays } from '../utils/dateUtils'
import { minutesToHHMM, computeDaySummary, computeWeekSummary } from '../utils/timeUtils'
import EntryCard from '../components/EntryCard/EntryCard'
import AddEntryModal from '../components/AddEntryModal/AddEntryModal'
import JobsPanel from '../components/JobsPanel/JobsPanel'
import './DayPage.css'

export default function DayPage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { jobsData } = useAppContext()
  const { jobs } = jobsData
  const [modal, setModal] = useState(null)
  const [draggedJob, setDraggedJob] = useState(null)

  // Load entries for just this day
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useEntries(date, date)

  // Also load week entries for "time available" calc
  const { year, week } = getISOWeek(date)
  const weekDays = getWeekDays(year, week)
  const { entries: weekEntries } = useEntries(weekDays[0], weekDays[6])

  const daySummary = computeDaySummary(date, entries)
  const weekSummary = computeWeekSummary(weekDays, weekEntries)

  function goToPrev() {
    navigate(`/day/${addDays(date, -1)}`)
  }
  function goToNext() {
    navigate(`/day/${addDays(date, 1)}`)
  }
  function goToToday() {
    navigate(`/day/${today()}`)
  }

  function openAdd(preselectedJob = null) {
    setModal({ date, preselectedJob })
  }
  function openEdit(entry) {
    setModal({ date: entry.date, entry })
  }
  function closeModal() {
    setModal(null)
    setDraggedJob(null)
  }

  return (
    <div className="day-page">
      <div className="page-nav">
        <button className="page-nav-btn" onClick={goToPrev}>&#8249;</button>
        <div className="page-nav-center">
          <span className="page-nav-label">{formatDayLabel(date)}</span>
          <button className="page-nav-today" onClick={goToToday}>Today</button>
        </div>
        <button className="page-nav-btn" onClick={goToNext}>&#8250;</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="day-page-body">
          <div className="day-page-main">
            {/* Summary cards */}
            <div className="day-summary-grid">
              <div className="ds-card">
                <div className="ds-card-label">Work done</div>
                <div className="ds-card-value">{minutesToHHMM(daySummary.workMinutes)}</div>
              </div>
              <div className="ds-card">
                <div className="ds-card-label">Employment</div>
                <div className="ds-card-value">{minutesToHHMM(daySummary.employmentMinutes)}</div>
              </div>
              <div className="ds-card">
                <div className="ds-card-label">Childcare</div>
                <div className="ds-card-value">{minutesToHHMM(daySummary.childcareMinutes)}</div>
              </div>
              <div className="ds-card">
                <div className="ds-card-label">Day total</div>
                <div className="ds-card-value">{minutesToHHMM(daySummary.totalMinutes)}</div>
              </div>
            </div>

            {/* Week availability */}
            {!weekSummary.isExact && (
              <div className="day-week-avail">
                <span className="dwa-icon">&#9719;</span>
                <span>
                  <strong>{minutesToHHMM(weekSummary.remainingMinutes)}</strong> still to allocate this week
                  ({weekSummary.percent}% of 40h logged)
                </span>
              </div>
            )}
            {weekSummary.isExact && (
              <div className="day-week-avail exact">
                <span>&#10003; Week is on target — 40h logged</span>
              </div>
            )}

            {/* Entries list */}
            <div className="day-entries-section">
              <div className="day-entries-header">
                <span className="day-entries-title">Entries</span>
                <button className="day-add-btn" onClick={() => openAdd()}>+ Add entry</button>
              </div>

              {entries.length === 0 && (
                <p className="day-empty">No entries yet. Click "+ Add entry" to start.</p>
              )}

              <div className="day-entries-list">
                {entries.map(entry => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={openEdit}
                    onDelete={deleteEntry}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Jobs sidebar */}
          <JobsPanel
            jobs={jobs}
            entries={weekEntries}
            onDragStart={job => setDraggedJob(job)}
            onDragEnd={() => setDraggedJob(null)}
          />
        </div>
      )}

      {/* Drop zone for drag-and-drop onto the day */}
      {draggedJob && (
        <div
          className="day-drop-overlay"
          onDragOver={e => e.preventDefault()}
          onDrop={() => { openAdd(draggedJob); setDraggedJob(null) }}
        >
          Drop to add {draggedJob.name} to this day
        </div>
      )}

      {modal && (
        <AddEntryModal
          date={modal.date}
          jobs={jobs}
          initialEntry={modal.entry}
          preselectedJob={modal.preselectedJob}
          onSave={addEntry}
          onUpdate={updateEntry}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
