import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../../shared/api/client'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { downscale } from '../../shared/utils/image'
import { useAuth } from '../auth/useAuth'
import { LegalFooter } from '../legal/LegalFooter'
import { InstallApp } from '../pwa/InstallApp'
import { PasswordSection } from './PasswordSection'
import { PreferencesSection } from './PreferencesSection'
import { ProfileDataSection } from './ProfileDataSection'
import { avatarPath, profileApi } from './profileApi'
import { StatsSection } from './StatsSection'

/** Profilo (v3.1): foto e dati, password, «i miei numeri», preferenze. La foto la vedono solo i compagni di viaggio (D-37). */
export function ProfilePage() {
  const { auth, updateUser } = useAuth()
  const qc = useQueryClient()
  const user = auth!.user
  const refresh = () => qc.removeQueries({ queryKey: ['blob', avatarPath(user.id)] })
  const set = useMutation({
    mutationFn: async (file: File) => profileApi.setAvatar(await downscale(file, 512)),
    onSuccess: () => { refresh(); updateUser({ hasAvatar: true }) },
  })
  const remove = useMutation({
    mutationFn: profileApi.removeAvatar,
    onSuccess: () => { refresh(); updateUser({ hasAvatar: false }) },
  })

  return (
    <div className="stack profile">
      <h1>Il tuo profilo</h1>
      <section className="card stack">
      <h2>Foto e dati</h2>
      <div className="row-main">
        <Avatar name={user.displayName} me size="xl" userId={user.id} hasAvatar={user.hasAvatar} />
        <span className="row-text"><strong>{user.displayName}</strong><small>{user.email}</small></span>
      </div>
      <p className="muted">La foto la vedono solo le persone con cui condividi un viaggio.</p>
      <div className="actions">
        <label className="btn btn-secondary file-pick">
          <Icon name="add_a_photo" />{user.hasAvatar ? 'Cambia foto' : 'Carica una foto'}
          <input type="file" accept="image/*" aria-label="Carica una foto profilo"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) set.mutate(f); e.target.value = '' }} />
        </label>
        {user.hasAvatar && (
          <Button variant="secondary" loading={remove.isPending} onClick={() => remove.mutate()} aria-label="Rimuovi la foto">
            <Icon name="delete" />Rimuovi
          </Button>
        )}
      </div>
      {set.isPending && <p role="status" className="muted">Caricamento…</p>}
      <FormError error={set.error instanceof ApiError ? set.error : remove.error} />
      <ProfileDataSection user={user} />
      </section>
      <section className="card"><h2>Password</h2><PasswordSection /></section>
      <section className="card"><h2>I miei numeri</h2><StatsSection /></section>
      <section className="card"><h2>Preferenze</h2><PreferencesSection user={user} /></section>
      <section className="card"><h2>App</h2><InstallApp /></section>
      <LegalFooter />
    </div>
  )
}
