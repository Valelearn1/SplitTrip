import type { Participant, TodoItem } from '../../shared/api/types'
import { Icon } from '../../shared/ui/Icon'

type Props = {
  item: TodoItem
  participants: Participant[]
  canEdit: boolean
  onToggle: () => void
  onAssign: (participantId: string | null) => void
  onDelete: () => void
}

/** Una voce: casella (anche a viaggio chiuso), assegnatario, elimina. «fatto» detto anche a parole (D-24). */
export function TodoItemRow({ item, participants, canEdit, onToggle, onAssign, onDelete }: Props) {
  const assigneeGone = item.assigneeParticipantId !== null && !participants.some((p) => p.id === item.assigneeParticipantId)
  return (
    <li className={`row row-wrap todo-item ${item.done ? 'done' : ''}`}>
      <label className="check">
        <input type="checkbox" aria-label={item.text} checked={item.done} onChange={onToggle} />
        <span>{item.text}</span>
        {item.done && <span className="sr-only"> fatto</span>}
      </label>
      <span className="row-actions">
        <select
          aria-label={`Assegna ${item.text}`}
          className="assign-select"
          value={item.assigneeParticipantId ?? ''}
          disabled={!canEdit}
          onChange={(e) => onAssign(e.target.value || null)}
        >
          <option value="">Nessuno</option>
          {participants.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
          {assigneeGone && <option value={item.assigneeParticipantId!} disabled>{item.assigneeName} (ha lasciato)</option>}
        </select>
        {canEdit && (
          <button type="button" className="btn btn-secondary btn-sm icon-btn" aria-label={`Elimina ${item.text}`} onClick={onDelete}>
            <Icon name="delete" />
          </button>
        )}
      </span>
    </li>
  )
}
