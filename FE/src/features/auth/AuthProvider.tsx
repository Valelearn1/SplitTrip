import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { configureClient } from '../../shared/api/client'
import { AUTH_STORAGE_KEY, AuthContext, type AuthState } from './authContext'

function read(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthState) : null
  } catch {
    return null
  }
}

// Il token si legge sempre dallo storage (login/logout lo tengono aggiornato): così la prima query
// di una rotta protetta, che parte negli effetti dei figli prima di quelli del provider, ha già il Bearer.
const getToken = () => read()?.token ?? null
configureClient({ getToken, onUnauthorized: () => {} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(read)

  const login = useCallback((state: AuthState) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
    setAuth(state)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
  }, [])

  useEffect(() => {
    configureClient({ getToken, onUnauthorized: logout })
    return () => configureClient({ getToken, onUnauthorized: () => {} })
  }, [logout])

  const value = useMemo(() => ({ auth, login, logout }), [auth, login, logout])
  return <AuthContext value={value}>{children}</AuthContext>
}
