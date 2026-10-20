import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'

type Props = { show: boolean; onUpdate: () => void; onLater: () => void }

/** Versione nuova pronta (D-63): si ricarica solo quando lo decidi, così un modulo a metà non si perde. */
export function UpdateBanner({ show, onUpdate, onLater }: Props) {
  if (!show) return null
  return (
    <div className="update-banner" role="status">
      <div className="ub-text"><Icon name="system_update" /><span>C'è una nuova versione di SplitTrip</span></div>
      <div className="ub-actions">
        <Button type="button" variant="primary" className="btn-sm" needsNetwork={false} onClick={onUpdate}>Aggiorna</Button>
        <Button type="button" variant="secondary" className="btn-sm" needsNetwork={false} onClick={onLater}>Dopo</Button>
      </div>
    </div>
  )
}
