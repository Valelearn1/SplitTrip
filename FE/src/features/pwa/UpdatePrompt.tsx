import { useRegisterSW } from 'virtual:pwa-register/react'
import { UpdateBanner } from './UpdateBanner'
import { checkForUpdate } from './updateCheck'

const HOUR = 60 * 60 * 1000

/** Registra il service worker e, se ne arriva uno nuovo, mostra la barra; l'app installata controlla ogni ora. */
export function UpdatePrompt() {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => checkForUpdate(registration), HOUR)
    },
  })
  return <UpdateBanner show={needRefresh} onUpdate={() => void updateServiceWorker(true)} onLater={() => setNeedRefresh(false)} />
}
