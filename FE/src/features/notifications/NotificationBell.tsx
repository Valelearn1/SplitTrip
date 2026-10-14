import { Link } from 'react-router'
import { Icon } from '../../shared/ui/Icon'
import { useUnreadCount } from './useNotifications'

export function NotificationBell() {
  const count = useUnreadCount().data?.count ?? 0
  return (
    <Link to="/notifications" className="bell" aria-label={count > 0 ? `Notifiche, ${count} non lette` : 'Notifiche'}>
      <Icon name="notifications" />
      {count > 0 && <span className="bell-count" aria-hidden="true">{count > 99 ? '99+' : count}</span>}
    </Link>
  )
}
