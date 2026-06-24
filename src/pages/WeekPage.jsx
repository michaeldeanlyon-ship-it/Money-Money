import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useEntries } from '../hooks/useEntries'
import { getWeekDays, prevWeek, nextWeek, formatWeekLabel, today, getISOWeek } from '../utils/dateUtils'
import WeekGrid from '../components/WeekGrid/WeekGrid'
import './WeekPage.css'

export default function WeekPage() {
  const { year, week } = useParams()
  const navigate = useNavigate()
  const { jobsData, filter } = useAppContext()
  const { jobs } = jobsData

  const y = parseInt(year)
  const w = parseInt(week)

  const weekDays = getWeekDays(y, w)
  const fromDate = weekDays[0]
  const toDate = weekDays[6]

  const { entries, loading, addEntry, updateEntry, deleteEntry } = useEntries(fromDate, toDate)

  function goToPrev() {
    const { year: py, week: pw } = prevWeek(y, w)
    navigate(`/week/${py}/${pw}`)
  }

  function goToNext() {
    const { year: ny, week: nw } = nextWeek(y, w)
    navigate(`/week/${ny}/${nw}`)
  }

  function goToToday() {
    const { year: ty, week: tw } = getISOWeek(today())
    navigate(`/week/${ty}/${tw}`)
  }

  return (
    <div className="week-page">
      <div className="page-nav">
        <button className="page-nav-btn" onClick={goToPrev}>&#8249;</button>
        <div className="page-nav-center">
          <span className="page-nav-label">{formatWeekLabel(y, w)}</span>
          <button className="page-nav-today" onClick={goToToday}>Today</button>
        </div>
        <button className="page-nav-btn" onClick={goToNext}>&#8250;</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <WeekGrid
          weekDays={weekDays}
          entries={entries}
          jobs={jobs}
          filter={filter}
          onAddEntry={addEntry}
          onUpdateEntry={updateEntry}
          onDeleteEntry={deleteEntry}
        />
      )}
    </div>
  )
}
