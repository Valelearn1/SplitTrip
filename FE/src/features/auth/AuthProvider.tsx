import { useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  const login = useCallback((state: AuthState) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
    setAuth(state)
  }, [])

  // Svuota anche la cache delle query: su un telefono condiviso chi entra dopo non deve vedere i dati di prima
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    queryClient.clear()
    setAuth(null)
  }, [queryClient])

  useEffect(() => {
    configureClient({ getToken, onUnauthorized: logout })
    return () => configureClient({ getToken, onUnauthorized: () => {} })
  }, [logout])

  const updateUser = useCallback((patch: Partial<AuthState['user']>) => {
    setAuth((prev) => {
      if (!prev) return prev
      const next = { ...prev, user: { ...prev.user, ...patch } }
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(() => ({ auth, login, logout, updateUser }), [auth, login, logout, updateUser])
  return <AuthContext value={value}>{children}</AuthContext>
}
