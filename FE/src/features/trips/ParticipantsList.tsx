import type { Participant } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'

export function ParticipantsList({ participants, onRemove }: { participants: Participant[]; onRemove?: (p: Participant) => void }) {
  return (
    <ul className="list">
      {participants.map((m) => (
        <li key={m.id} className="row">
          <span className="row-main">
            <Avatar name={m.displayName} />
            <span className="row-text">
              <strong>{m.displayName}</strong>
              {m.role === 'ORGANIZER' && <small>organizzatore</small>}
              {m.userId === null && <small>senza account</small>}
            </span>
          </span>
          {onRemove && m.role !== 'ORGANIZER' && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onRemove(m)}>Rimuovi</button>
          )}
        </li>
      ))}
    </ul>
  )
}
