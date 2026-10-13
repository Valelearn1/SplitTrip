import { Link, Outlet } from 'react-router'
import { useAuth } from '../features/auth/useAuth'

export function Layout() {
  const { auth, logout } = useAuth()
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/trips" className="brand">SplitTrip</Link>
        {auth && (
          <nav>
            <span>{auth.user.displayName}</span>
            <button type="button" onClick={logout}>Esci</button>
          </nav>
        )}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
