import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../features/auth/useAuth'

export function RequireAuth() {
  const { auth } = useAuth()
  const location = useLocation()
  if (!auth) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}
