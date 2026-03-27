import { Link, useLocation } from 'react-router-dom'
import ViewSwitcher from '../ViewSwitcher/ViewSwitcher'
import './Layout.css'

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-nav">
        <Link to="/" className="nav-logo">
          <img src="/favicon.svg" alt="" width="24" height="24" />
          Money Money
        </Link>
        <div className="nav-center">
          <ViewSwitcher />
        </div>
        <nav className="nav-right">
          <Link to="/jobs" className="nav-jobs-link">Jobs</Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
