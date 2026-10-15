import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router'
import { isSoundOn, setSoundOn } from '../../shared/live/sound'
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
  const navigate = useNavigate()
  const location = useLocation()
  const [typing, setTyping] = useState<{ name: string; until: number } | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [newBelow, setNewBelow] = useState(false)
  const [sound, setSound] = useState(isSoundOn)
  const end = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)
  const logRef = useRef<HTMLDivElement>(null)
  const [liveIds, setLiveIds] = useState<ReadonlySet<string>>(new Set())

  const alive = useRef(true)
  const restore = useRef<{ page: number; log: number } | null>(null)

  /** In fondo? Su desktop scorre l'elenco, su mobile la pagina: si guardano entrambi. */
  const nearBottom = () => {
    const log = logRef.current
    const logAtEnd = !log || log.scrollHeight <= log.clientHeight || log.scrollHeight - log.scrollTop - log.clientHeight < 40
    const pageAtEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80
    return logAtEnd && pageAtEnd
  }

  useEffect(() => {
    alive.current = true
    const onScroll = () => {
      atBottom.current = nearBottom()
      if (atBottom.current) setNewBelow(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      alive.current = false
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // si va in fondo al frame successivo, quando l'altezza è quella finale
  // (jsdom non ha scrollIntoView: nei test non si scorre)
  const scrollToEnd = () => {
    if (!end.current?.scrollIntoView) return
    const toBottom = () => {
      if (!alive.current) return // uscita dalla chat: niente scorrimenti sulla pagina che c'è adesso
      const log = logRef.current
      if (log) log.scrollTop = log.scrollHeight // su desktop l'elenco ha un suo scorrimento…
      window.scrollTo({ top: document.documentElement.scrollHeight }) // …su mobile scorre la pagina
    }
    requestAnimationFrame(toBottom)
    // i font arrivano dopo e allungano i messaggi: si scorre di nuovo quando sono pronti
    void document.fonts?.ready.then(() => requestAnimationFrame(toBottom))
  }

  const oldestFirst = useMemo(() => (messages.data?.pages.flatMap((p) => p.items) ?? []).slice().reverse(), [messages.data])
  const timeline = useMemo(() => buildTimeline(oldestFirst), [oldestFirst])
  const newestId = oldestFirst.at(-1)?.id
  const newestMine = oldestFirst.at(-1)?.authorParticipantId === me.id

  useTripChannel(trip.id, (e) => {
    if (e.type === 'typing' && e.data.participantId !== me.id) setTyping({ name: e.data.name, until: Date.now() + 4000 })
    if (e.type === 'message.created') setLiveIds((prev) => new Set(prev).add(e.data.id))
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
    // i propri messaggi portano sempre in fondo; quelli degli altri solo se ci si era già
    if (atBottom.current || newestMine) scrollToEnd()
    else setNewBelow(true)
  }, [newestId]) // eslint-disable-line react-hooks/exhaustive-deps -- reagisce solo all'arrivo di un messaggio nuovo

  // Messaggi precedenti: compaiono sopra, quindi si sposta lo scorrimento di quanto è cresciuto il contenuto
  function loadOlder() {
    restore.current = { page: document.documentElement.scrollHeight, log: logRef.current?.scrollHeight ?? 0 }
    void messages.fetchNextPage()
  }
  const pageCount = messages.data?.pages.length ?? 0
  useLayoutEffect(() => {
    const before = restore.current
    if (!before) return
    restore.current = null
    const log = logRef.current
    if (log) log.scrollTop += log.scrollHeight - before.log
    const grown = document.documentElement.scrollHeight - before.page
    if (grown > 0) window.scrollBy(0, grown)
  }, [pageCount])

  return (
    <section className="chat">
      <div className="chat-head">
        {/* torna da dove si è venuti; aperta da un link diretto (nessuna pagina prima) torna alla panoramica */}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => (location.key === 'default' ? navigate(`/trips/${trip.id}`) : navigate(-1))}>
          <Icon name="arrow_back" />Indietro
        </button>
        <h2>Chat</h2>
        <button type="button" className="btn btn-secondary btn-sm icon-btn chat-sound" aria-label="Suono dei messaggi" aria-pressed={sound}
          title={sound ? 'Suono attivo' : 'Suono spento'} onClick={() => { setSoundOn(!sound); setSound(!sound) }}>
          <Icon name={sound ? 'volume_up' : 'volume_off'} />
        </button>
      </div>
      {status === 'connecting' && <div className="waking" role="status"><Icon name="sync" /><span>Riconnessione…</span></div>}
      {messages.isPending && <Spinner />}
      <FormError error={messages.error} />
      {messages.hasNextPage && (
        <Button variant="secondary" className="btn-sm" loading={messages.isFetchingNextPage} onClick={loadOlder}>Messaggi precedenti</Button>
      )}
      <div ref={logRef} className="chat-log" role="log" aria-label="Messaggi"
        onScroll={() => {
          atBottom.current = nearBottom()
          if (atBottom.current) setNewBelow(false)
        }}>
        {messages.data && oldestFirst.length === 0 && <p className="muted">Ancora nessun messaggio: scrivi il primo.</p>}
        {timeline.map((i) => i.kind === 'day'
          ? <p key={i.key} className="day-sep"><span>{i.label}</span></p>
          : <ChatMessageItem key={i.key} tripId={trip.id} message={i.message} mine={i.message.authorParticipantId === me.id}
              showAuthor={i.showAuthor} canDelete={canWrite && i.message.authorParticipantId === me.id} onDelete={() => setConfirmId(i.message.id)} live={liveIds.has(i.message.id)} />)}
        <div ref={end} />
      </div>
      {newBelow && (
        <button type="button" className="new-pill" onClick={() => { scrollToEnd(); setNewBelow(false) }}>
          Nuovi messaggi <Icon name="arrow_downward" />
        </button>
      )}
      <div className="chat-footer">
        <p className="typing muted">{typing ? `${typing.name} sta scrivendo…` : ''}</p>
        <FormError error={send.error ?? remove.error} />
        {canWrite
          ? <ChatComposer sending={send.isPending} onSend={(c) => send.mutateAsync(c)} onTyping={() => publish(`/app/trips/${trip.id}/typing`)} />
          : <p className="info"><Icon name="lock" />Il viaggio è chiuso: la chat è in sola lettura</p>}
      </div>
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
