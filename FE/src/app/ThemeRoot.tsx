import { useEffect, type ReactNode } from 'react'
import { useAuth } from '../features/auth/useAuth'
import { applyTheme, resolveTheme } from '../shared/utils/theme'

/** D-57: il tema dell'account (o del sistema) applicato a <html>; lo script in index.html l'ha già messo prima del primo disegno. */
export function ThemeRoot({ children }: { children: ReactNode }) {
  const { auth } = useAuth()
  const pref = auth?.user.theme ?? 'SYSTEM'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => applyTheme(resolveTheme(pref, mq.matches))
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [pref])
  return children
}
