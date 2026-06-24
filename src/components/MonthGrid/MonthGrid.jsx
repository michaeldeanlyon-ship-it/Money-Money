import { useNavigate } from 'react-router-dom'
import { getISOWeek, isToday, dayOfMonth, shortMonthName } from '../../utils/dateUtils'
import { computeWeekSummary, minutesToHHMM } from '../../utils/timeUtils'
import './MonthGrid.css'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthGrid({ weeks, entries, filter = 'all' }) {
  const navigate = useNavigate()
  const show = key => filter === 'all' || filter === key

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
        const { totalMinutes, isExact, remainingPercent, overPercent } = computeWeekSummary(weekDates, entries)
        const { year, week } = getISOWeek(days[0].date)

        return (
          <div key={wi} className="mg-row">
            {/* Week number */}
            <div className="mg-wk-cell" onClick={() => navigate(`/week/${year}/${week}`)}>
              <span className="wk-label">W{week}</span>
              {isExact && <span className="wk-status wk-exact">✓</span>}
              {!isExact && overPercent > 0 && (
                <span className="wk-status wk-over">{overPercent}% over</span>
              )}
              {!isExact && remainingPercent > 0 && totalMinutes > 0 && (
                <span className="wk-status wk-needed">{remainingPercent}% needed</span>
              )}
            </div>

            {/* Day cells */}
            {days.map(({ date, isCurrentMonth }) => {
              const dayEntries = entries.filter(e => e.date === date)
              const childcare  = dayEntries.filter(e => e.type === 'childcare').reduce((s, e) => s + e.minutes, 0)
              const frilans    = dayEntries.filter(e => e.type === 'job' && e.job_label === 'Frilans').reduce((s, e) => s + e.minutes, 0)
              const invoicery  = dayEntries.filter(e => e.type === 'job' && e.job_label === 'Invoicery').reduce((s, e) => s + e.minutes, 0)
              const hasVisible =
                (show('childcare') && childcare > 0) ||
                (show('frilans') && frilans > 0) ||
                (show('invoicery') && invoicery > 0)

              return (
                <div
                  key={date}
                  className={`mg-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday(date) ? 'today' : ''}`}
                  onClick={() => navigate(`/day/${date}`)}
                >
                  <span className={`mg-day-num ${isToday(date) ? 'today-badge' : ''}`}>
                    {dayOfMonth(date)}
                  </span>
                  {hasVisible && (
                    <div className="mg-day-pills">
                      {show('childcare') && childcare > 0 && <span className="mg-pill mg-pill-childcare">{minutesToHHMM(childcare)}</span>}
                      {show('frilans')   && frilans   > 0 && <span className="mg-pill mg-pill-frilans">{minutesToHHMM(frilans)}</span>}
                      {show('invoicery') && invoicery > 0 && <span className="mg-pill mg-pill-invoicery">{minutesToHHMM(invoicery)}</span>}
                    </div>
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
