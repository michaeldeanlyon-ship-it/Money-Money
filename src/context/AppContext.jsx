import { createContext, useContext } from 'react'
import { useJobs } from '../hooks/useJobs'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const jobsData = useJobs()
  return (
    <AppContext.Provider value={{ jobsData }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
