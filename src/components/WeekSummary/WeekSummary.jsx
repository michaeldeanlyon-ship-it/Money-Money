import ProgressBar from '../ProgressBar/ProgressBar'
import './WeekSummary.css'

export default function WeekSummary({ percent, isExact, remainingPercent, overPercent }) {
  const colorClass = isExact ? 'exact' : 'off'

  return (
    <div className="week-summary">
      <span className={`ws-pct ${colorClass}`}>{percent}%</span>
      <ProgressBar percent={percent} isExact={isExact} />
      {!isExact && remainingPercent > 0 && (
        <span className="ws-remaining">
          {remainingPercent}% still needed
        </span>
      )}
      {overPercent > 0 && (
        <span className="ws-remaining">
          {overPercent}% over
        </span>
      )}
      {isExact && (
        <span className="ws-done">✓ On target</span>
      )}
    </div>
  )
}
