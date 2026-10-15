import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { playChime } from '../../shared/live/sound'
import { useTripChannel } from '../../shared/live/useLive'
import { Icon } from '../../shared/ui/Icon'

type Props = { tripId: string | null; myParticipantId: string; onChatPage: boolean }

/** v3.1: un messaggio degli altri si sente (se il suono è attivo) e, fuori dalla chat, si vede in un avviso con il link. */
export function NewMessageToast({ tripId, myParticipantId, onChatPage }: Props) {
  const [toast, setToast] = useState<{ id: string; author: string; text: string } | null>(null)

  useTripChannel(tripId, (e) => {
    if (e.type !== 'message.created') return
    const m = e.data
    if (m.kind !== 'TEXT' || m.authorParticipantId === myParticipantId) return
    playChime()
    if (!onChatPage) setToast({ id: m.id, author: m.authorName ?? 'Qualcuno', text: (m.content ?? '').slice(0, 80) })
  })

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast || onChatPage || !tripId) return null
  return (
    <div className="message-toast" role="status" aria-label="Nuovo messaggio">
      <Icon name="chat_bubble" />
      <span className="message-toast-text"><strong>{toast.author}:</strong> {toast.text}</span>
      <Link to={`/trips/${tripId}/chat`} className="btn btn-primary btn-sm" onClick={() => setToast(null)}>Apri la chat</Link>
      <button type="button" className="row-toggle" aria-label="Chiudi l'avviso" onClick={() => setToast(null)}><Icon name="close" /></button>
    </div>
  )
}
