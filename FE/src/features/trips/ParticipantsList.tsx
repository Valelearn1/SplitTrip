import type { Participant } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'

type Props = {
  participants: Participant[]
  onEdit?: (p: Participant) => void
  onUnlink?: (p: Participant) => void
  onRemove?: (p: Participant) => void
}

export function ParticipantsList({ participants, onEdit, onUnlink, onRemove }: Props) {
  return (
    <ul className="list">
      {participants.map((m) => (
        <li key={m.id} className="row row-wrap">
          <span className="row-main">
            <Avatar name={m.displayName} />
            <span className="row-text">
              <strong>{m.displayName}</strong>
              {m.role === 'ORGANIZER' && <small>organizzatore</small>}
              {m.userId === null && <small>senza account</small>}
            </span>
          </span>
          <span className="row-actions">
            {onEdit && (
              <button type="button" className="btn btn-secondary btn-sm" aria-label={`Modifica ${m.displayName}`} onClick={() => onEdit(m)}>Modifica</button>
            )}
            {onUnlink && m.userId !== null && m.role !== 'ORGANIZER' && (
              <button type="button" className="btn btn-secondary btn-sm" aria-label={`Scollega account di ${m.displayName}`} onClick={() => onUnlink(m)}>Scollega account</button>
            )}
            {onRemove && m.role !== 'ORGANIZER' && (
              <button type="button" className="btn btn-secondary btn-sm" aria-label={`Rimuovi ${m.displayName}`} onClick={() => onRemove(m)}>Rimuovi</button>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
