import type { Member } from '../../shared/api/types'

export function MembersList({ members, onRemove }: { members: Member[]; onRemove?: (m: Member) => void }) {
  return (
    <ul className="list">
      {members.map((m) => (
        <li key={m.userId} className="row">
          <span>{m.displayName} {m.role === 'ORGANIZER' && <span className="badge">organizzatore</span>}</span>
          {onRemove && m.role !== 'ORGANIZER' && (
            <button type="button" className="btn btn-secondary" onClick={() => onRemove(m)}>Rimuovi</button>
          )}
        </li>
      ))}
    </ul>
  )
}
