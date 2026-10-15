import { formatDistanceToNow, parseISO } from 'date-fns'
import { it as itLocale } from 'date-fns/locale'
import { useReducedMotion } from 'motion/react'
import { useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import type { AppNotification } from '../../shared/api/types'
import { Envelope } from '../../shared/ui/illustrations/Envelope'
import { Button } from '../../shared/ui/Button'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Spinner } from '../../shared/ui/Spinner'
import { useMarkAllRead, useMarkRead, useNotifications } from './useNotifications'

/** Notifiche in-app (D-36): toccandone una si apre ciò di cui parla e diventa letta. */
export function NotificationsPage() {
  const list = useNotifications()
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const unread = list.data?.filter((n) => n.readAt === null).length ?? 0
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [openingId, setOpeningId] = useState<string | null>(null)

  function open(e: MouseEvent<HTMLAnchorElement>, n: AppNotification) {
    if (n.readAt !== null) return
    e.preventDefault()
    markRead.mutate(n.id)
    setOpeningId(n.id)
    // la busta si apre (250 ms) e poi si va; con movimento ridotto si va subito (D-43)
    if (reduced) navigate(n.link)
    else setTimeout(() => navigate(n.link), 250)
  }

  return (
    <section className="stack">
      <div className="page-head">
        <h1>Notifiche</h1>
        {unread > 0 && <Button variant="secondary" className="btn-sm" loading={markAll.isPending} onClick={() => markAll.mutate()}>Segna tutte come lette</Button>}
      </div>
      {list.isPending && <Spinner />}
      <FormError error={list.error} />
      {list.data?.length === 0 && <EmptyState title="Nessuna notifica" icon="notifications" />}
      <ul className="list card">
        {list.data?.map((n, index) => (
          <li key={n.id}>
            <Link to={n.link} className={`row notification ${n.readAt === null ? 'unread' : ''}`} onClick={(e) => open(e, n)}>
              <span className="row-main">
                <Envelope open={n.readAt !== null || openingId === n.id} delay={markAll.isPending ? index * 0.04 : 0} />
                {n.readAt === null && <span className="unread-dot" aria-hidden="true" />}
                <span className="row-text">
                  <span>{n.message}</span>
                  <small>{formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true, locale: itLocale })}{n.readAt === null ? ' · non letta' : ''}</small>
                </span>
              </span>
              <Icon name="chevron_right" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
