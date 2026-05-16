import ProgressBar from '../ProgressBar/ProgressBar'
import { minutesToHHMM } from '../../utils/timeUtils'
import './WeekSummary.css'

export default function WeekSummary({ totalMinutes, percent, isExact, remainingMinutes, overMinutes }) {
  const colorClass = isExact ? 'exact' : 'off'

  return (
    <div className="week-summary">
      <span className="ws-time">{minutesToHHMM(totalMinutes)} / 38.8h</span>
      <span className={`ws-pct ${colorClass}`}>{percent}%</span>
      <ProgressBar percent={percent} isExact={isExact} />
      {!isExact && remainingMinutes > 0 && (
        <span className="ws-remaining">
          {minutesToHHMM(remainingMinutes)} still needed
        </span>
      )}
      {overMinutes > 0 && (
        <span className="ws-remaining">
          {minutesToHHMM(overMinutes)} over
        </span>
      )}
      {isExact && (
        <span className="ws-done">✓ On target</span>
      )}
    </div>
  )
}
