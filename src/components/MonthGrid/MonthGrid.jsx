import { useNavigate } from 'react-router-dom'
import { getISOWeek, isToday, dayOfMonth, shortMonthName } from '../../utils/dateUtils'
import { computeWeekSummary, minutesToHHMM } from '../../utils/timeUtils'
import './MonthGrid.css'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthGrid({ weeks, entries }) {
  const navigate = useNavigate()

  return (
    <div className="month-grid">
      {/* Header */}
      <div className="mg-header">
        <div className="mg-wk-cell mg-head-cell">W#</div>
        {DOW.map(d => (
          <div key={d} className="mg-head-cell">{d}</div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((days, wi) => {
        const weekDates = days.map(d => d.date)
        const { totalMinutes, percent, isExact } = computeWeekSummary(weekDates, entries)
        const { year, week } = getISOWeek(days[0].date)

        return (
          <div key={wi} className="mg-row">
            {/* Week number */}
            <div className="mg-wk-cell" onClick={() => navigate(`/week/${year}/${week}`)}>
              <span className="wk-label">W{week}</span>
              <span
                className="wk-dot"
                style={{ background: isExact ? 'var(--color-success)' : totalMinutes > 0 ? 'var(--color-danger)' : 'var(--color-border)' }}
              />
              {totalMinutes > 0 && (
                <span className={`wk-pct ${isExact ? 'exact' : 'off'}`}>{percent}%</span>
              )}
            </div>

            {/* Day cells */}
            {days.map(({ date, isCurrentMonth }) => {
              const dayEntries = entries.filter(e => e.date === date)
              const dayTotal = dayEntries.reduce((sum, e) => sum + e.minutes, 0)
              const hasData = dayTotal > 0

              return (
                <div
                  key={date}
                  className={`mg-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
                  onClick={() => navigate(`/day/${date}`)}
                >
                  <span className={`mg-day-num ${isToday(date) ? 'today-badge' : ''}`}>
                    {dayOfMonth(date)}
                  </span>
                  {hasData && (
                    <>
                      <span className="mg-day-time">{minutesToHHMM(dayTotal)}</span>
                      <div className="mg-day-bar" style={{
                        background: 'var(--color-accent)',
                        opacity: 0.6 + (dayTotal / 480) * 0.4,
                      }} />
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
