import { useLocation, useNavigate } from 'react-router-dom'
import { pathForViewSwitch, today, getISOWeek } from '../../utils/dateUtils'
import './ViewSwitcher.css'

export default function ViewSwitcher() {
  const location = useLocation()
  const navigate = useNavigate()

  const path = location.pathname
  const segments = path.split('/').filter(Boolean)

  let activeView = 'week'
  if (path.startsWith('/month')) activeView = 'month'
  else if (path.startsWith('/day')) activeView = 'day'
  else if (path.startsWith('/week')) activeView = 'week'

  // Reconstruct the current view's params from the URL so we can keep the user
  // on the period they're viewing instead of jumping to today. On routes that
  // aren't a period view (e.g. /jobs), fall back to today's week.
  let current
  if (path.startsWith('/day')) {
    current = { view: 'day', date: segments[1] }
  } else if (path.startsWith('/month')) {
    current = { view: 'month', year: parseInt(segments[1], 10), month: parseInt(segments[2], 10) }
  } else if (path.startsWith('/week')) {
    current = { view: 'week', year: parseInt(segments[1], 10), week: parseInt(segments[2], 10) }
  } else {
    const { year, week } = getISOWeek(today())
    current = { view: 'week', year, week }
  }

  function switchTo(view) {
    navigate(pathForViewSwitch(current, view))
  }

  return (
    <div className="view-switcher">
      <button
        className={`vsw-btn ${activeView === 'month' ? 'active' : ''}`}
        onClick={() => switchTo('month')}
      >Month</button>
      <button
        className={`vsw-btn ${activeView === 'week' ? 'active' : ''}`}
        onClick={() => switchTo('week')}
      >Week</button>
      <button
        className={`vsw-btn ${activeView === 'day' ? 'active' : ''}`}
        onClick={() => switchTo('day')}
      >Day</button>
    </div>
  )
}
