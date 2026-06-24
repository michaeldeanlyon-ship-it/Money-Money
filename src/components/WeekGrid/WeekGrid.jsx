import { useState } from 'react'
import DayColumn from '../DayColumn/DayColumn'
import WeekSummary from '../WeekSummary/WeekSummary'
import AddEntryModal from '../AddEntryModal/AddEntryModal'
import JobsPanel from '../JobsPanel/JobsPanel'
import { computeWeekSummary } from '../../utils/timeUtils'
import './WeekGrid.css'

export default function WeekGrid({ weekDays, entries, jobs, filter = 'all', onAddEntry, onUpdateEntry, onDeleteEntry }) {
  const [modal, setModal] = useState(null) // { date, entry?, preselectedJob? }
  const [draggedJob, setDraggedJob] = useState(null)
  const [dropTargetDate, setDropTargetDate] = useState(null)

  const summary = computeWeekSummary(weekDays, entries)

  function openAdd(date, preselectedJob = null) {
    setModal({ date, preselectedJob })
  }

  function openEdit(entry) {
    setModal({ date: entry.date, entry })
  }

  function closeModal() {
    setModal(null)
    setDropTargetDate(null)
    setDraggedJob(null)
  }

  function handleDrop(date) {
    if (draggedJob) {
      openAdd(date, draggedJob)
      setDropTargetDate(null)
    }
  }

  return (
    <div className="week-grid-wrap">
      <div className="week-grid-summary">
        <WeekSummary {...summary} />
      </div>

      <div className="week-grid-body">
        <div className="week-grid">
          {weekDays.map(date => (
            <DayColumn
              key={date}
              date={date}
              entries={entries}
              filter={filter}
              onAdd={d => openAdd(d)}
              onEdit={openEdit}
              onDelete={onDeleteEntry}
              onDragOver={d => setDropTargetDate(d)}
              onDrop={handleDrop}
              isDropTarget={dropTargetDate === date}
            />
          ))}
        </div>

        <JobsPanel
          jobs={jobs}
          entries={entries}
          onDragStart={job => setDraggedJob(job)}
          onDragEnd={() => { if (!dropTargetDate) setDraggedJob(null) }}
        />
      </div>

      {modal && (
        <AddEntryModal
          date={modal.date}
          jobs={jobs}
          initialEntry={modal.entry}
          preselectedJob={modal.preselectedJob}
          onSave={onAddEntry}
          onUpdate={onUpdateEntry}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
