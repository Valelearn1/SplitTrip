import type { WrappedBadge, WrappedPerson } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'
import { BADGE_STYLE } from './badges'

export function BadgeCard({ badge, person }: { badge: WrappedBadge; person: WrappedPerson | undefined }) {
  return (
    <article className="badge-card" style={{ background: BADGE_STYLE[badge.code] }}>
      <div className="badge-who">
        <Avatar name={person?.displayName ?? '?'} size="sm" userId={person?.userId ?? undefined} />
        <span>{person?.displayName}</span>
      </div>
      <strong>{badge.title}</strong>
      <small className="muted">{badge.detail}</small>
    </article>
  )
}
