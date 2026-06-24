import { useNavigate } from 'react-router-dom'
import EntryCard from '../EntryCard/EntryCard'
import { minutesToHHMM } from '../../utils/timeUtils'
import { matchesFilter } from '../../utils/categoryUtils'
import { shortDayName, dayOfMonth, isToday } from '../../utils/dateUtils'
import './DayColumn.css'

export default function DayColumn({ date, entries, filter = 'all', onAdd, onEdit, onDelete, onDragOver, onDrop, isDropTarget }) {
  const navigate = useNavigate()
  const dayEntries = entries.filter(e => e.date === date)
  // Total stays based on all entries; the filter only hides cards.
  const total = dayEntries.reduce((sum, e) => sum + e.minutes, 0)
  const visibleEntries = dayEntries.filter(e => matchesFilter(e, filter))

  function handleDragOver(e) {
    e.preventDefault()
    onDragOver?.(date)
  }

  function handleDrop(e) {
    e.preventDefault()
    onDrop?.(date)
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      onDragOver?.(null)
    }
  }

  return (
    <div
      className={`day-col ${isDropTarget ? 'drop-target' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <div className="day-head" onClick={() => navigate(`/day/${date}`)}>
        <div className="day-name">{shortDayName(date)}</div>
        <div className={`day-num ${isToday(date) ? 'today' : ''}`}>{dayOfMonth(date)}</div>
      </div>

      <div className="day-entries">
        {visibleEntries.length === 0 && isDropTarget && (
          <div className="drop-hint">Drop here</div>
        )}
        {visibleEntries.map(entry => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="day-footer">
        <span className="day-total">{total > 0 ? minutesToHHMM(total) : '—'}</span>
        <button className="day-add-btn" onClick={() => onAdd(date)}>+ Add</button>
      </div>
    </div>
  )
}
