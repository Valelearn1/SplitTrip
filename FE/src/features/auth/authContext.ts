import { createContext } from 'react'
import type { User } from '../../shared/api/types'

export type AuthState = { user: User; token: string }
export type AuthContextValue = {
  auth: AuthState | null
  login: (state: AuthState) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
export const AUTH_STORAGE_KEY = 'splittrip.auth'
