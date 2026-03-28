import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useAppContext } from './context/AppContext'
import Layout from './components/Layout/Layout'
import LoginPage from './pages/LoginPage'
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

function AppRoutes() {
  const { auth } = useAppContext()

  // Still resolving session
  if (auth.user === undefined) return null

  // Not signed in
  if (auth.user === null) return <LoginPage />

  return (
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
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
