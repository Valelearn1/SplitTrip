import { Icon } from '../shared/ui/Icon'
import { profileApi } from '../features/profile/profileApi'
import { useAuth } from '../features/auth/useAuth'
import { resolveTheme } from '../shared/utils/theme'

/** Luna/sole nell'intestazione: passa tra chiaro e scuro e salva sull'account (ottimistico, ripristino su errore). */
export function ThemeToggle() {
  const { auth, updateUser } = useAuth()
  if (!auth) return null
  const dark = resolveTheme(auth.user.theme, window.matchMedia('(prefers-color-scheme: dark)').matches) === 'dark'
  const next = dark ? 'LIGHT' : 'DARK'
  const before = auth.user.theme
  function toggle() {
    updateUser({ theme: next })
    profileApi.updatePreferences({ theme: next }).catch(() => updateUser({ theme: before }))
  }
  return (
    <button type="button" className="btn btn-secondary btn-sm icon-btn theme-toggle" aria-label={dark ? 'Attiva il tema chiaro' : 'Attiva il tema scuro'} onClick={toggle}>
      <Icon name={dark ? 'light_mode' : 'dark_mode'} />
    </button>
  )
}
