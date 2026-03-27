import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout/Layout'
import WeekPage from './pages/WeekPage'
import MonthPage from './pages/MonthPage'
import DayPage from './pages/DayPage'
import JobsPage from './pages/JobsPage'
import { today, getISOWeek } from './utils/dateUtils'

function DefaultRedirect() {
  const t = today()
  const { year, week } = getISOWeek(t)
  return <Navigate to={`/week/${year}/${week}`} replace />
}

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DefaultRedirect />} />
          <Route path="/week/:year/:week" element={<WeekPage />} />
          <Route path="/month/:year/:month" element={<MonthPage />} />
          <Route path="/day/:date" element={<DayPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}
