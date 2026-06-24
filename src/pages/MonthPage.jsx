import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useEntries } from '../hooks/useEntries'
import { getMonthWeeks, prevMonth, nextMonth, formatMonthLabel } from '../utils/dateUtils'
import MonthGrid from '../components/MonthGrid/MonthGrid'
import './MonthPage.css'

export default function MonthPage() {
  const { year, month } = useParams()
  const navigate = useNavigate()
  const { filter } = useAppContext()

  const y = parseInt(year)
  const m = parseInt(month)

  const weeks = getMonthWeeks(y, m)
  const allDays = weeks.flat()
  const fromDate = allDays[0].date
  const toDate = allDays[allDays.length - 1].date

  const { entries, loading } = useEntries(fromDate, toDate)

  function goToPrev() {
    const { year: py, month: pm } = prevMonth(y, m)
    navigate(`/month/${py}/${pm}`)
  }

  function goToNext() {
    const { year: ny, month: nm } = nextMonth(y, m)
    navigate(`/month/${ny}/${nm}`)
  }

  function goToToday() {
    const now = new Date()
    navigate(`/month/${now.getFullYear()}/${now.getMonth() + 1}`)
  }

  return (
    <div className="month-page">
      <div className="page-nav">
        <button className="page-nav-btn" onClick={goToPrev}>&#8249;</button>
        <div className="page-nav-center">
          <span className="page-nav-label">{formatMonthLabel(y, m)}</span>
          <button className="page-nav-today" onClick={goToToday}>Today</button>
        </div>
        <button className="page-nav-btn" onClick={goToNext}>&#8250;</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="month-page-body">
          <MonthGrid weeks={weeks} entries={entries} filter={filter} />
        </div>
      )}
    </div>
  )
}
