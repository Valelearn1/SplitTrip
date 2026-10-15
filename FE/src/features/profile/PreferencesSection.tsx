import { useMutation } from '@tanstack/react-query'
import type { User } from '../../shared/api/types'
import { FormError } from '../../shared/ui/FormError'
import { currencyLabel, TRAVEL_CURRENCIES } from '../../shared/utils/currencies'
import { useAuth } from '../auth/useAuth'
import { profileApi, type Preferences } from './profileApi'

function Switch({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="pref-row">
      <span className="row-text"><strong>{label}</strong><small className="muted">{hint}</small></span>
      {/* stato anche a parole: mai solo il colore (D-24) */}
      <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)}>
        <span className="switch-track" aria-hidden="true"><span className="switch-thumb" /></span>
        <span className="switch-text">{checked ? 'Sì' : 'No'}</span>
      </button>
    </div>
  )
}

/** Preferenze sull'account (D-48): si salvano subito e valgono su ogni dispositivo. */
export function PreferencesSection({ user }: { user: User }) {
  const { updateUser } = useAuth()
  const save = useMutation({ mutationFn: profileApi.updatePreferences, onSuccess: (u) => updateUser(u) })
  // subito a schermo, poi conferma dal server; se non va, si torna al valore di prima
  function set(patch: Preferences) {
    const before = Object.fromEntries(Object.keys(patch).map((k) => [k, user[k as keyof Preferences]])) as Preferences
    updateUser(patch)
    save.mutate(patch, { onError: () => updateUser(before) })
  }
  return (
    <div className="stack">
      <Switch label="Suono dei messaggi" hint="Due note brevi quando arriva un messaggio in chat" checked={user.chatSound} onChange={(v) => set({ chatSound: v })} />
      <Switch label="Riduci le animazioni" hint="Niente movimenti: utile se danno fastidio" checked={user.reduceMotion} onChange={(v) => set({ reduceMotion: v })} />
      <div className="field">
        <label htmlFor="pref-currency">Valuta predefinita per i nuovi viaggi</label>
        <select id="pref-currency" className="select" value={user.preferredCurrency} onChange={(e) => set({ preferredCurrency: e.target.value })}>
          {TRAVEL_CURRENCIES.map((c) => <option key={c} value={c}>{currencyLabel(c)}</option>)}
        </select>
      </div>
      <FormError error={save.error} />
    </div>
  )
}
