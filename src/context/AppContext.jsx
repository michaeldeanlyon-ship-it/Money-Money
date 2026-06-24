import { createContext, useContext, useEffect, useState } from 'react'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '../hooks/useAuth'

const AppContext = createContext(null)

const FILTER_KEY = 'category_filter'

export function AppProvider({ children }) {
  const auth = useAuth()
  const jobsData = useJobs(!!auth.user)

  const [filter, setFilter] = useState(() => {
    if (typeof window === 'undefined') return 'all'
    return window.localStorage.getItem(FILTER_KEY) || 'all'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FILTER_KEY, filter)
    }
  }, [filter])

  return (
    <AppContext.Provider value={{ jobsData, auth, filter, setFilter }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
