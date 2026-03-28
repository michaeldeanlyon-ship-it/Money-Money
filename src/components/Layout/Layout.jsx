import { Link } from 'react-router-dom'
import ViewSwitcher from '../ViewSwitcher/ViewSwitcher'
import { useAppContext } from '../../context/AppContext'
import './Layout.css'

export default function Layout({ children }) {
  const { auth } = useAppContext()
  const user = auth.user
  const avatarUrl = user?.user_metadata?.avatar_url
  const name = user?.user_metadata?.full_name || user?.email || ''

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
          <div className="nav-user">
            {avatarUrl
              ? <img src={avatarUrl} alt={name} className="nav-avatar" referrerPolicy="no-referrer" />
              : <div className="nav-avatar nav-avatar-initials">{name.charAt(0).toUpperCase()}</div>
            }
            <button className="nav-signout" onClick={auth.signOut} title="Sign out">
              Sign out
            </button>
          </div>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
