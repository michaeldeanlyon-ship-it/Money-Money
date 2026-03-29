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
        const { totalMinutes, percent, isExact, remainingMinutes, overMinutes } = computeWeekSummary(weekDates, entries)
        const { year, week } = getISOWeek(days[0].date)

        return (
          <div key={wi} className="mg-row">
            {/* Week number */}
            <div className="mg-wk-cell" onClick={() => navigate(`/week/${year}/${week}`)}>
              <span className="wk-label">W{week}</span>
              {isExact && <span className="wk-status wk-exact">✓</span>}
              {!isExact && overMinutes > 0 && (
                <span className="wk-status wk-over">{minutesToHHMM(overMinutes)} over</span>
              )}
              {!isExact && remainingMinutes > 0 && totalMinutes > 0 && (
                <span className="wk-status wk-needed">{minutesToHHMM(remainingMinutes)} needed</span>
              )}
            </div>

            {/* Day cells */}
            {days.map(({ date, isCurrentMonth }) => {
              const dayEntries = entries.filter(e => e.date === date)
              const childcare  = dayEntries.filter(e => e.type === 'paid_time' && e.paid_time_category === 'childcare').reduce((s, e) => s + e.minutes, 0)
              const employment = dayEntries.filter(e => e.type === 'paid_time' && e.paid_time_category === 'employment').reduce((s, e) => s + e.minutes, 0)
              const frilans    = dayEntries.filter(e => e.type === 'job' && e.job_label === 'Frilans').reduce((s, e) => s + e.minutes, 0)
              const invoicery  = dayEntries.filter(e => e.type === 'job' && e.job_label === 'Invoicery').reduce((s, e) => s + e.minutes, 0)
              const hasData    = (childcare + employment + frilans + invoicery) > 0

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
                    <div className="mg-day-pills">
                      {childcare  > 0 && <span className="mg-pill mg-pill-childcare">{minutesToHHMM(childcare)}</span>}
                      {employment > 0 && <span className="mg-pill mg-pill-employment">{minutesToHHMM(employment)}</span>}
                      {frilans    > 0 && <span className="mg-pill mg-pill-frilans">{minutesToHHMM(frilans)}</span>}
                      {invoicery  > 0 && <span className="mg-pill mg-pill-invoicery">{minutesToHHMM(invoicery)}</span>}
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
