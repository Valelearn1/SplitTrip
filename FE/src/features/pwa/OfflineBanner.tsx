import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Icon } from '../../shared/ui/Icon'
import { dataAgeLabel, oldestActiveData } from './dataAge'
import { useOnline } from './useOnline'

/** Barra in cima senza rete (D-63): età dei dati e perché non si salva; al ritorno «Di nuovo online» per 3 s. */
export function OfflineBanner() {
  const online = useOnline()
  const cache = useQueryClient().getQueryCache()
  const oldest = useSyncExternalStore((notify) => cache.subscribe(notify), () => oldestActiveData(cache), () => null)
  const [wasOffline, setWasOffline] = useState(!online)
  const [back, setBack] = useState(false)
  if (!online && !wasOffline) setWasOffline(true)
  if (online && wasOffline) { setWasOffline(false); setBack(true) }
  useEffect(() => {
    if (!back) return
    const t = setTimeout(() => setBack(false), 3000)
    return () => clearTimeout(t)
  }, [back])
  if (!online) {
    return (
      <div className="offline-banner" role="status">
        <Icon name="cloud_off" />
        <span>{dataAgeLabel(oldest)} · <span id="offline-reason">serve la rete per salvare</span></span>
      </div>
    )
  }
  if (back) return <div className="offline-banner back" role="status"><Icon name="cloud_done" /><span>Di nuovo online</span></div>
  return null
}
