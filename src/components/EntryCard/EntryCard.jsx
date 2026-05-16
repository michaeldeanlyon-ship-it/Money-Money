import { formatEntryDuration } from '../../utils/timeUtils'
import './EntryCard.css'

const LABEL_META = {
  Frilans:    { cls: 'frilans',    text: 'Frilans' },
  Invoicery:  { cls: 'invoicery',  text: 'Invoicery' },
  employment: { cls: 'employment', text: 'Employment' },
  childcare:  { cls: 'childcare',  text: 'Childcare' },
}

export default function EntryCard({ entry, onEdit, onDelete }) {
  const isJob = entry.type === 'job'

  const badgeKey = isJob ? entry.job_label : entry.paid_time_category
  const badge = LABEL_META[badgeKey] || { cls: '', text: badgeKey || '' }

  const title = isJob
    ? (entry.job_name || 'Unknown Job')
    : (entry.paid_time_name || (entry.paid_time_category === 'childcare' ? 'Childcare' : 'Employment'))

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
        <span className="ec-time">{formatEntryDuration(entry.minutes, entry.date)}</span>
      </div>
    </div>
  )
}
