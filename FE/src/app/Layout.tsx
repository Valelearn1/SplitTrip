import { Link, Outlet, useMatch } from 'react-router'
import { useAuth } from '../features/auth/useAuth'
import { NotificationBell } from '../features/notifications/NotificationBell'
import { Avatar } from '../shared/ui/Avatar'
import { Icon } from '../shared/ui/Icon'
import { Logo } from '../shared/ui/Logo'
import { SeasonBackground } from '../shared/season/SeasonBackground'
import { SeasonProvider } from '../shared/season/SeasonProvider'
import { ThemeToggle } from './ThemeToggle'
import { WakingBanner } from './WakingBanner'

export function Layout() {
  const { auth, logout } = useAuth()
  const inTrip = useMatch('/trips/:tripId/*')
  return (
    <SeasonProvider>
      <SeasonBackground />
      <div className={`app ${inTrip ? 'has-tabs' : ''}`}>
        <header className="app-header">
          <Link to="/trips" className="brand"><Logo size={26} />SplitTrip</Link>
          {auth && (
            <nav aria-label="Account">
              <ThemeToggle />
              <NotificationBell />
              <Link to="/profile" className="avatar-link" aria-label="Il tuo profilo">
                <Avatar name={auth.user.displayName} me size="sm" userId={auth.user.id} hasAvatar={auth.user.hasAvatar} />
                <span className="muted">{auth.user.displayName}</span>
              </Link>
              <button type="button" className="btn btn-secondary btn-sm logout-btn" aria-label="Esci" onClick={logout}><Icon name="logout" /><span className="logout-text">Esci</span></button>
            </nav>
          )}
        </header>
        <WakingBanner />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </SeasonProvider>
  )
}
