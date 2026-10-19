import { useEffect, useState } from 'react'
import { Icon } from '../../shared/ui/Icon'
import { networkNotice } from './networkNotice'

/** «Serve la rete» per 4 s quando un tocco (spunta, reazione, eliminazione) prova a cambiare qualcosa offline. */
export function NetworkToast() {
  const [shown, setShown] = useState(0)
  useEffect(() => networkNotice.subscribe(() => setShown(Date.now())), [])
  useEffect(() => {
    if (!shown) return
    const t = setTimeout(() => setShown(0), 4000)
    return () => clearTimeout(t)
  }, [shown])
  if (!shown) return null
  return <div className="network-toast" role="status"><Icon name="cloud_off" /><span>Serve la rete: non è stato salvato</span></div>
}
