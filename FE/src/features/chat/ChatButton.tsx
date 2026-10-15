import { Link } from 'react-router'
import { Icon } from '../../shared/ui/Icon'
import { useChatUnread } from './useChat'

/** D-42: la chat sta nell'intestazione del viaggio, accanto all'ingranaggio, come la campanella. */
export function ChatButton({ tripId }: { tripId: string }) {
  const count = useChatUnread(tripId).data?.count ?? 0
  return (
    <Link to={`/trips/${tripId}/chat`} className="btn btn-secondary btn-sm icon-btn chat-btn"
      aria-label={count > 0 ? `Chat, ${count} messaggi non letti` : 'Chat'}>
      <Icon name="chat_bubble" />
      {count > 0 && <span className="bell-count" aria-hidden="true">{count > 99 ? '99+' : count}</span>}
    </Link>
  )
}
