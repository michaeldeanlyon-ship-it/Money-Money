import ProgressBar from '../ProgressBar/ProgressBar'
import { minutesToHHMM } from '../../utils/timeUtils'
import './WeekSummary.css'

export default function WeekSummary({ totalMinutes, percent, isExact, remainingMinutes }) {
  const colorClass = isExact ? 'exact' : 'off'

  return (
    <div className="week-summary">
      <span className="ws-time">{minutesToHHMM(totalMinutes)} / 40h</span>
      <span className={`ws-pct ${colorClass}`}>{percent}%</span>
      <ProgressBar percent={percent} isExact={isExact} />
      {!isExact && (
        <span className="ws-remaining">
          {minutesToHHMM(remainingMinutes)} still to allocate
        </span>
      )}
      {isExact && (
        <span className="ws-done">✓ On target</span>
      )}
    </div>
  )
}
