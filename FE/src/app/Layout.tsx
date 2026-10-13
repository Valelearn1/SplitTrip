import { Link, Outlet, useMatch } from 'react-router'
import { useAuth } from '../features/auth/useAuth'
import { Avatar } from '../shared/ui/Avatar'
import { Icon } from '../shared/ui/Icon'
import { WakingBanner } from './WakingBanner'

export function Layout() {
  const { auth, logout } = useAuth()
  const inTrip = useMatch('/trips/:tripId/*')
  return (
    <div className={`app ${inTrip ? 'has-tabs' : ''}`}>
      <header className="app-header">
        <Link to="/trips" className="brand"><Icon name="luggage" fill />SplitTrip</Link>
        {auth && (
          <nav aria-label="Account">
            <Avatar name={auth.user.displayName} me size="sm" />
            <span className="muted">{auth.user.displayName}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={logout}><Icon name="logout" />Esci</button>
          </nav>
        )}
      </header>
      <WakingBanner />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
