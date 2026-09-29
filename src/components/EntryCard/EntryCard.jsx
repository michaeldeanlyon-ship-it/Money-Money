import { formatEntryDuration, minutesToHHMM, isExactBucket } from '../../utils/timeUtils'
import './EntryCard.css'

const LABEL_META = {
  Frilans:   { cls: 'frilans',   text: 'Frilans' },
  Invoicery: { cls: 'invoicery', text: 'Invoicery' },
  childcare: { cls: 'childcare', text: 'Childcare' },
  school:    { cls: 'school',    text: 'School' },
}

export default function EntryCard({ entry, onEdit, onDelete }) {
  const isJob = entry.type === 'job'
  const isSchool = entry.type === 'school'

  const badgeKey = isJob ? entry.job_label : entry.type
  const badge = LABEL_META[badgeKey] || { cls: '', text: badgeKey || '' }

  const title = isJob ? (entry.job_name || 'Unknown Job') : isSchool ? 'School' : 'Child Care'

  // Only exact 25/50/75/100 bucket entries get the "% · h/m" framing. School and
  // any h:m-entered Job/Childcare (non-bucket minutes) show plain h/m instead.
  const timeText =
    !isSchool && isExactBucket(entry.minutes)
      ? formatEntryDuration(entry.minutes)
      : minutesToHHMM(entry.minutes)

  function handleDelete() {
    if (window.confirm(`Delete "${title}"?`)) onDelete(entry.id)
  }

  return (
    <div className="entry-card">
      <div className="ec-header">
        <span className="ec-title">{title}</span>
        <div className="ec-actions">
          <button className="ec-btn" onClick={() => onEdit(entry)} title="Edit">✎</button>
          <button className="ec-btn ec-delete" onClick={handleDelete} title="Delete">×</button>
        </div>
      </div>
      <div className="ec-footer">
        {badge.text && (
          <span className={`ec-badge ${badge.cls}`}>{badge.text}</span>
        )}
        <span className="ec-time">{timeText}</span>
      </div>
    </div>
  )
}
