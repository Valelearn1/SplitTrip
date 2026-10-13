import type { Member } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'

export function MembersList({ members, onRemove }: { members: Member[]; onRemove?: (m: Member) => void }) {
  return (
    <ul className="list">
      {members.map((m) => (
        <li key={m.userId} className="row">
          <span className="row-main">
            <Avatar name={m.displayName} />
            <span className="row-text">
              <strong>{m.displayName}</strong>
              {m.role === 'ORGANIZER' && <small>organizzatore</small>}
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
