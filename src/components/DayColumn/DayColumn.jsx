import { useNavigate } from 'react-router-dom'
import EntryCard from '../EntryCard/EntryCard'
import { minutesToHHMM } from '../../utils/timeUtils'
import { shortDayName, dayOfMonth, isToday } from '../../utils/dateUtils'
import './DayColumn.css'

export default function DayColumn({ date, entries, onAdd, onEdit, onDelete, onDragOver, onDrop, isDropTarget }) {
  const navigate = useNavigate()
  const dayEntries = entries.filter(e => e.date === date)
  const total = dayEntries.reduce((sum, e) => sum + e.minutes, 0)

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
        {dayEntries.length === 0 && isDropTarget && (
          <div className="drop-hint">Drop here</div>
        )}
        {dayEntries.map(entry => (
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
