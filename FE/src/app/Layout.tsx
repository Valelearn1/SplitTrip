import { Link, Outlet, useLocation, useMatch } from 'react-router'
import { useAuth } from '../features/auth/useAuth'
import { OfflineBanner } from '../features/pwa/OfflineBanner'
import { NotificationBell } from '../features/notifications/NotificationBell'
import { Avatar } from '../shared/ui/Avatar'
import { BackButton } from '../shared/ui/BackButton'
import { Icon } from '../shared/ui/Icon'
import { Logo } from '../shared/ui/Logo'
import { SeasonBackground } from '../shared/season/SeasonBackground'
import { SeasonProvider } from '../shared/season/SeasonProvider'
import { ThemeToggle } from './ThemeToggle'
import { WakingBanner } from './WakingBanner'

export function Layout() {
  const { auth, logout } = useAuth()
  const inTrip = useMatch('/trips/:tripId/*')
  const path = useLocation().pathname.replace(/\/+$/, '') || '/'
  // ovunque tranne Home, landing, accesso, registrazione e ripristino della password; la Chat ha il suo nell'intestazione
  const showBack = !!auth && !['/', '/trips', '/login', '/register', '/password-dimenticata', '/reimposta-password'].includes(path) && !path.endsWith('/chat')
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
        <OfflineBanner />
        <WakingBanner />
        <main className="app-main">
          {showBack && <div className="back-bar"><BackButton /></div>}
          <Outlet />
        </main>
      </div>
    </SeasonProvider>
  )
}
