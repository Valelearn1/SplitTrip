import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import { useLivePublish, useLiveStatus, useTripChannel } from '../../shared/live/useLive'
import { Button } from '../../shared/ui/Button'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { Spinner } from '../../shared/ui/Spinner'
import type { TripContext } from '../trips/TripLayout'
import { buildTimeline } from './chatGrouping'
import { ChatComposer } from './ChatComposer'
import { ChatMessageItem } from './ChatMessageItem'
import { useDeleteMessage, useMarkChatRead, useMessages, useSendMessage } from './useChat'

/** Chat del viaggio (spec v3 §5): si scrive via REST, i messaggi degli altri arrivano dal canale. */
export function ChatPage() {
  const { trip, me, canWrite } = useOutletContext<TripContext>()
  const messages = useMessages(trip.id)
  const send = useSendMessage(trip.id)
  const remove = useDeleteMessage(trip.id)
  const markRead = useMarkChatRead(trip.id)
  const status = useLiveStatus()
  const publish = useLivePublish()
  const [typing, setTyping] = useState<{ name: string; until: number } | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [newBelow, setNewBelow] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)

  const oldestFirst = useMemo(() => (messages.data?.pages.flatMap((p) => p.items) ?? []).slice().reverse(), [messages.data])
  const timeline = useMemo(() => buildTimeline(oldestFirst), [oldestFirst])
  const newestId = oldestFirst.at(-1)?.id

  useTripChannel(trip.id, (e) => {
    if (e.type === 'typing' && e.data.participantId !== me.id) setTyping({ name: e.data.name, until: Date.now() + 4000 })
    if (e.type === 'message.created' && e.data.authorParticipantId !== me.id) setTyping(null)
  })

  useEffect(() => {
    if (!typing) return
    const t = setTimeout(() => setTyping(null), typing.until - Date.now())
    return () => clearTimeout(t)
  }, [typing])

  // all'apertura e a ogni messaggio nuovo con la pagina visibile: letti fin qui
  const { mutate: read } = markRead
  useEffect(() => {
    if (newestId && document.visibilityState === 'visible') read()
  }, [newestId, read])

  useEffect(() => {
    if (!newestId) return
    if (atBottom.current) end.current?.scrollIntoView?.({ block: 'end' })
    else setNewBelow(true)
  }, [newestId])

  return (
    <section className="chat">
      {status === 'connecting' && <div className="waking" role="status"><Icon name="sync" /><span>Riconnessione…</span></div>}
      {messages.isPending && <Spinner />}
      <FormError error={messages.error} />
      {messages.hasNextPage && (
        <Button variant="secondary" className="btn-sm" loading={messages.isFetchingNextPage} onClick={() => void messages.fetchNextPage()}>Messaggi precedenti</Button>
      )}
      <div className="chat-log" role="log" aria-label="Messaggi"
        onScroll={(e) => {
          const el = e.currentTarget
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
          if (atBottom.current) setNewBelow(false)
        }}>
        {messages.data && oldestFirst.length === 0 && <p className="muted">Ancora nessun messaggio: scrivi il primo.</p>}
        {timeline.map((i) => i.kind === 'day'
          ? <p key={i.key} className="day-sep"><span>{i.label}</span></p>
          : <ChatMessageItem key={i.key} tripId={trip.id} message={i.message} mine={i.message.authorParticipantId === me.id}
              showAuthor={i.showAuthor} canDelete={canWrite && i.message.authorParticipantId === me.id} onDelete={() => setConfirmId(i.message.id)} />)}
        <div ref={end} />
      </div>
      {newBelow && (
        <button type="button" className="new-pill" onClick={() => { end.current?.scrollIntoView?.({ block: 'end' }); setNewBelow(false) }}>
          Nuovi messaggi <Icon name="arrow_downward" />
        </button>
      )}
      <p className="typing muted">{typing ? `${typing.name} sta scrivendo…` : ''}</p>
      {canWrite
        ? <ChatComposer sending={send.isPending} onSend={(c) => send.mutateAsync(c)} onTyping={() => publish(`/app/trips/${trip.id}/typing`)} />
        : <p className="info"><Icon name="lock" />Il viaggio è chiuso: la chat è in sola lettura</p>}
      <FormError error={send.error ?? remove.error} />
      <Modal open={confirmId !== null} title="Eliminare il messaggio?" onClose={() => setConfirmId(null)}>
        <p>Il testo sparirà per tutti; resterà «Messaggio eliminato».</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirmId(null)}>Annulla</Button>
          <Button variant="danger" loading={remove.isPending} onClick={() => remove.mutate(confirmId!, { onSuccess: () => setConfirmId(null) })}>Elimina</Button>
        </div>
      </Modal>
    </section>
  )
}
