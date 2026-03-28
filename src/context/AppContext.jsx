import { createContext, useContext } from 'react'
import { useJobs } from '../hooks/useJobs'
import { useAuth } from '../hooks/useAuth'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const auth = useAuth()
  const jobsData = useJobs(!!auth.user)
  return (
    <AppContext.Provider value={{ jobsData, auth }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
