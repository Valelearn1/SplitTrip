import { formatDistanceToNow, parseISO } from 'date-fns'
import { it as itLocale } from 'date-fns/locale'
import { Link } from 'react-router'
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
        {list.data?.map((n) => (
          <li key={n.id}>
            <Link to={n.link} className={`row notification ${n.readAt === null ? 'unread' : ''}`} onClick={() => { if (n.readAt === null) markRead.mutate(n.id) }}>
              <span className="row-main">
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
