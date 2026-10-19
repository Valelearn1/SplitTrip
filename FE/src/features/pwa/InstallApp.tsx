import { useSyncExternalStore } from 'react'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { installMode, installStore, isIos, isStandalone, type InstallStore } from './installPrompt'

/** Sezione «App» del Profilo (D-63): installare SplitTrip sul telefono, nel modo del proprio browser. */
export function InstallApp({ store = installStore }: { store?: InstallStore }) {
  useSyncExternalStore(store.subscribe, store.version, () => 0)
  const mode = installMode({ installed: store.installed(), standalone: isStandalone(), hasPrompt: store.hasPrompt(), ios: isIos() })
  if (mode === 'installed') return <p className="install-done"><Icon name="check_circle" />SplitTrip è installata su questo dispositivo</p>
  if (mode === 'prompt') {
    return (
      <div className="stack">
        <p className="muted">Si apre dall'icona sul telefono, a schermo intero, e mostra gli ultimi dati anche senza rete.</p>
        <Button type="button" needsNetwork={false} onClick={() => void store.prompt()}><Icon name="install_mobile" />Installa SplitTrip</Button>
      </div>
    )
  }
  if (mode === 'ios') {
    return (
      <ol className="install-steps">
        <li><Icon name="ios_share" />Tocca Condividi nella barra di Safari</li>
        <li><Icon name="add_box" />Scegli «Aggiungi alla schermata Home»</li>
      </ol>
    )
  }
  return <p className="muted">Puoi installarla dal menu del browser, se lo permette.</p>
}
