import type { Participant } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'
import { formatCount, formatDayMonth } from '../../shared/utils/format'

type Props = {
  participants: Participant[]
  onEdit?: (p: Participant) => void
  onUnlink?: (p: Participant) => void
  onRemove?: (p: Participant) => void
}

/** «conta per 2 · arriva il 3 nov»: solo quello che non è il valore di base */
function details(m: Participant): string {
  return [
    m.defaultWeight !== 1 ? `conta per ${formatCount(m.defaultWeight)}` : null,
    m.arrivalDate ? `arriva il ${formatDayMonth(m.arrivalDate)}` : null,
    m.departureDate ? `parte il ${formatDayMonth(m.departureDate)}` : null,
  ].filter(Boolean).join(' · ')
}

export function ParticipantsList({ participants, onEdit, onUnlink, onRemove }: Props) {
  return (
    <ul className="list">
      {participants.map((m) => (
        <li key={m.id} className="row row-wrap">
          <span className="row-main">
            <Avatar name={m.displayName} userId={m.userId} hasAvatar={m.hasAvatar} />
            <span className="row-text">
              <strong>{m.displayName}</strong>
              {m.role === 'ORGANIZER' && <small>organizzatore</small>}
              {m.userId === null && <small>senza account</small>}
              {details(m) && <small className="muted">{details(m)}</small>}
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
