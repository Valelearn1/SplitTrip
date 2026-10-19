import { Icon } from '../../shared/ui/Icon'

/** Al posto dello spinner infinito, offline, per una pagina mai aperta con la rete (D-63). */
export function OfflineEmpty() {
  return (
    <div className="empty-state offline-empty" role="status">
      <Icon name="cloud_off" />
      <p>Questa pagina non è ancora salvata sul telefono: aprila una volta con la rete.</p>
    </div>
  )
}
