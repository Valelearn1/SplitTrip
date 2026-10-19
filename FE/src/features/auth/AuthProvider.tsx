import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { configureClient } from '../../shared/api/client'
import { clearDeviceData } from '../pwa/deviceData'
import { authApi } from './authApi'
import { AUTH_STORAGE_KEY, AuthContext, type AuthState } from './authContext'

// sessioni salvate prima della v3.1 non hanno le preferenze (D-48): valori di base finché il server non le rimanda
const DEFAULT_PREFERENCES = { preferredCurrency: 'EUR', chatSound: true, reduceMotion: false, theme: 'SYSTEM' as const }

function read(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as AuthState
    return { ...state, user: { ...DEFAULT_PREFERENCES, ...state.user } }
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

  // Svuota cache, copia sul telefono e immagini salvate (D-63): su un telefono condiviso chi entra dopo non vede niente
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    void clearDeviceData(queryClient)
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

  // all'avvio (e a ogni nuovo accesso) l'account si rilegge dal server: nome e preferenze cambiati su un altro
  // dispositivo valgono anche qui (D-48); se il server non risponde resta la copia salvata
  const token = auth?.token
  useEffect(() => {
    if (!token) return
    let current = true
    authApi.me().then((user) => { if (current) updateUser(user) }).catch(() => {})
    return () => { current = false }
  }, [token, updateUser])

  const value = useMemo(() => ({ auth, login, logout, updateUser }), [auth, login, logout, updateUser])
  return <AuthContext value={value}>{children}</AuthContext>
}
