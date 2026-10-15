import { format, parseISO } from 'date-fns'
import * as Motion from 'motion/react-m'
import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router'
import type { ChatMessage } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'
import { Icon } from '../../shared/ui/Icon'
import { ReactionBar } from './ReactionBar'
import { ReactionPills } from './ReactionPills'

const eventIcon = { EXPENSE_CREATED: 'receipt_long', SETTLEMENT_CREATED: 'payments', PARTICIPANT_JOINED: 'person_add' } as const

type Props = {
  tripId: string; message: ChatMessage; mine: boolean; showAuthor: boolean; canDelete: boolean; onDelete: () => void; live?: boolean
  /** reazioni (D-47): il mio partecipante, se posso reagire (testo, non eliminato, viaggio aperto) e cosa fare al tocco */
  me?: string; canReact?: boolean; onReact?: (emoji: string, mine: boolean) => void
}

const LONG_PRESS_MS = 500

export function ChatMessageItem({ tripId, message: m, mine, showAuthor, canDelete, onDelete, live = false, me = '', canReact = false, onReact }: Props) {
  const time = format(parseISO(m.createdAt), 'HH:mm')
  const [bar, setBar] = useState(false)
  const press = useRef<number | null>(null)
  const closeBar = useCallback(() => setBar(false), [])
  const isMine = (emoji: string) => m.reactions.some((r) => r.emoji === emoji && r.participantIds.includes(me))
  const react = (emoji: string) => { setBar(false); onReact?.(emoji, isMine(emoji)) }
  // sul telefono la striscia si apre con il tocco lungo sulla bolla
  const startPress = (e: PointerEvent) => {
    if (!canReact || e.pointerType !== 'touch') return
    press.current = window.setTimeout(() => setBar(true), LONG_PRESS_MS)
  }
  const cancelPress = () => { if (press.current) window.clearTimeout(press.current); press.current = null }
  if (m.kind === 'EVENT') {
    const text = <><Icon name={eventIcon[m.eventType!]} />{m.content}</>
    return (
      <Motion.div className="msg-event" initial={live ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {m.eventType === 'EXPENSE_CREATED' && m.refId ? <Link to={`/trips/${tripId}/expenses/${m.refId}/edit`}>{text}</Link> : <span>{text}</span>}
        <small className="muted">{time}</small>
      </Motion.div>
    )
  }
  return (
    <Motion.div className={`msg ${mine ? 'mine' : ''} ${showAuthor ? 'first' : ''}`}
      initial={live ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      {!mine && <span className="msg-avatar">{showAuthor && <Avatar name={m.authorName ?? '?'} size="sm" userId={m.authorUserId ?? undefined} hasAvatar={m.authorHasAvatar} />}</span>}
      <div className="msg-body">
        {/* chi scrive è sempre detto a parole, anche per i propri (D-24) */}
        {showAuthor ? <span className="msg-author">{mine ? 'Tu' : m.authorName}</span> : <span className="sr-only">{mine ? 'Tu' : m.authorName}</span>}
        {bar && <ReactionBar mine={isMine} onPick={react} onClose={closeBar} />}
        <p className={`msg-bubble ${m.deleted ? 'msg-deleted' : ''}`}
          onPointerDown={startPress} onPointerUp={cancelPress} onPointerLeave={cancelPress} onPointerMove={cancelPress}
          onContextMenu={(e) => { if (canReact && bar) e.preventDefault() }}>
          {m.deleted ? 'Messaggio eliminato' : m.content}
        </p>
        <ReactionPills reactions={m.reactions} me={me} canReact={canReact} onToggle={(emoji, own) => onReact?.(emoji, own)} />
        <span className="msg-meta">
          <small className="muted">{time}</small>
          {canReact && (
            <button type="button" className="link-button msg-react" aria-label="Reagisci" aria-expanded={bar} onClick={() => setBar((b) => !b)}>
              <Icon name="add_reaction" />
            </button>
          )}
          {canDelete && !m.deleted && (
            <button type="button" className="link-button msg-delete" aria-label="Elimina il messaggio" onClick={onDelete}><Icon name="delete" /></button>
          )}
        </span>
      </div>
    </Motion.div>
  )
}
