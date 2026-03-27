import { useLocation, useNavigate } from 'react-router-dom'
import { today, getISOWeek } from '../../utils/dateUtils'
import './ViewSwitcher.css'

export default function ViewSwitcher() {
  const location = useLocation()
  const navigate = useNavigate()

  const path = location.pathname

  let activeView = 'week'
  if (path.startsWith('/month')) activeView = 'month'
  else if (path.startsWith('/day')) activeView = 'day'
  else if (path.startsWith('/week')) activeView = 'week'

  function switchTo(view) {
    const t = today()
    const { year, week } = getISOWeek(t)
    if (view === 'month') {
      const [y, m] = t.split('-')
      navigate(`/month/${y}/${parseInt(m, 10)}`)
    } else if (view === 'week') {
      navigate(`/week/${year}/${week}`)
    } else {
      navigate(`/day/${t}`)
    }
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
