import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(read)
  // Il client API legge il token dal ref, così non va riconfigurato a ogni login/logout
  const authRef = useRef(auth)
  useEffect(() => {
    authRef.current = auth
  }, [auth])

  const login = useCallback((state: AuthState) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
    setAuth(state)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
  }, [])

  useEffect(() => {
    configureClient({ getToken: () => authRef.current?.token ?? null, onUnauthorized: logout })
  }, [logout])

  const value = useMemo(() => ({ auth, login, logout }), [auth, login, logout])
  return <AuthContext value={value}>{children}</AuthContext>
}
