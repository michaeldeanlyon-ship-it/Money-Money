import './ProgressBar.css'

export default function ProgressBar({ percent, isExact }) {
  const capped = Math.min(percent, 100)
  const colorClass = isExact ? 'exact' : percent > 100 ? 'over' : 'under'
  return (
    <div className="progress-track">
      <div
        className={`progress-fill ${colorClass}`}
        style={{ width: `${capped}%` }}
      />
    </div>
  )
}
