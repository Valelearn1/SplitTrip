import { format, parseISO } from 'date-fns'
import { Link } from 'react-router'
import type { ChatMessage } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'
import { Icon } from '../../shared/ui/Icon'

const eventIcon = { EXPENSE_CREATED: 'receipt_long', SETTLEMENT_CREATED: 'payments', PARTICIPANT_JOINED: 'person_add' } as const

type Props = { tripId: string; message: ChatMessage; mine: boolean; showAuthor: boolean; canDelete: boolean; onDelete: () => void }

export function ChatMessageItem({ tripId, message: m, mine, showAuthor, canDelete, onDelete }: Props) {
  const time = format(parseISO(m.createdAt), 'HH:mm')
  if (m.kind === 'EVENT') {
    const text = <><Icon name={eventIcon[m.eventType!]} />{m.content}</>
    return (
      <div className="msg-event">
        {m.eventType === 'EXPENSE_CREATED' && m.refId ? <Link to={`/trips/${tripId}/expenses/${m.refId}/edit`}>{text}</Link> : <span>{text}</span>}
        <small className="muted">{time}</small>
      </div>
    )
  }
  return (
    <div className={`msg ${mine ? 'mine' : ''} ${showAuthor ? 'first' : ''}`}>
      {!mine && <span className="msg-avatar">{showAuthor && <Avatar name={m.authorName ?? '?'} size="sm" userId={m.authorUserId ?? undefined} hasAvatar={m.authorHasAvatar} />}</span>}
      <div className="msg-body">
        {/* chi scrive è sempre detto a parole, anche per i propri (D-24) */}
        {showAuthor ? <span className="msg-author">{mine ? 'Tu' : m.authorName}</span> : <span className="sr-only">{mine ? 'Tu' : m.authorName}</span>}
        <p className={`msg-bubble ${m.deleted ? 'msg-deleted' : ''}`}>{m.deleted ? 'Messaggio eliminato' : m.content}</p>
        <span className="msg-meta">
          <small className="muted">{time}</small>
          {canDelete && !m.deleted && (
            <button type="button" className="link-button msg-delete" aria-label="Elimina il messaggio" onClick={onDelete}><Icon name="delete" /></button>
          )}
        </span>
      </div>
    </div>
  )
}
