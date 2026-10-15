import { useEffect, useRef, useState } from 'react'
import type { Participant, TodoItem, TodoListType } from '../../shared/api/types'
import { Icon } from '../../shared/ui/Icon'

type Props = {
  item: TodoItem
  listType: TodoListType
  participants: Participant[]
  canEdit: boolean
  onToggle: () => void
  onAssign: (participantId: string | null) => void
  onDelete: () => void
}

/**
 * Una voce: casella (anche a viaggio chiuso), chi la porta / chi se ne occupa, elimina. «fatto» detto anche a parole (D-24).
 * La scelta della persona si vede solo se è già decisa o se la si chiede: le liste sono del gruppo, l'assegnazione è un di più.
 */
export function TodoItemRow({ item, listType, participants, canEdit, onToggle, onAssign, onDelete }: Props) {
  const [picking, setPicking] = useState(false)
  const select = useRef<HTMLSelectElement>(null)
  const assigneeGone = item.assigneeParticipantId !== null && !participants.some((p) => p.id === item.assigneeParticipantId)
  const question = listType === 'PACKING' ? `Chi porta ${item.text}?` : `Chi si occupa di ${item.text}?`
  const showSelect = item.assigneeParticipantId !== null || picking

  useEffect(() => {
    if (picking) select.current?.focus()
  }, [picking])

  return (
    <li className={`row row-wrap todo-item ${item.done ? 'done' : ''}`}>
      <label className="check">
        <input type="checkbox" aria-label={item.text} checked={item.done} onChange={onToggle} />
        <span>{item.text}</span>
        {item.done && <span className="sr-only"> fatto</span>}
      </label>
      <span className="row-actions">
        {showSelect ? (
          <select ref={select} aria-label={question} className="assign-select" value={item.assigneeParticipantId ?? ''} disabled={!canEdit}
            onChange={(e) => onAssign(e.target.value || null)}>
            <option value="">Da decidere</option>
            {participants.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
            {assigneeGone && <option value={item.assigneeParticipantId!} disabled>{item.assigneeName} (ha lasciato)</option>}
          </select>
        ) : canEdit && !item.done && (
          <button type="button" className="link-button assign-ask" aria-label={question} onClick={() => setPicking(true)}>
            {listType === 'PACKING' ? 'Chi lo porta?' : 'Chi se ne occupa?'}
          </button>
        )}
        {canEdit && (
          <button type="button" className="btn btn-secondary btn-sm icon-btn" aria-label={`Elimina ${item.text}`} onClick={onDelete}>
            <Icon name="delete" />
          </button>
        )}
      </span>
    </li>
  )
}
