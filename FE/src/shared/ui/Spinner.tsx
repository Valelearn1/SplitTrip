import { OfflineEmpty } from '../../features/pwa/OfflineEmpty'
import { useOnline } from '../../features/pwa/useOnline'

export function Spinner({ label = 'Caricamento…' }: { label?: string }) {
  const online = useOnline()
  if (!online) return <OfflineEmpty />   // offline uno spinner girerebbe per sempre (D-63)
  return <p className="spinner" role="status">{label}</p>
}
