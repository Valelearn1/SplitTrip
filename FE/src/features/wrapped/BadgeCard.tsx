import type { WrappedBadge, WrappedPerson } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'
import { BADGE_STYLE } from './badges'

/** «🍝 Il buongustaio» → emoji a parte (accanto al nome) e «Il\u00a0buongustaio»: nessuna riga con una parola sola. */
function splitTitle(title: string): { emoji: string | null; text: string } {
  const m = title.match(/^(\p{Extended_Pictographic}\uFE0F?)\s+(.*)$/u)
  const [emoji, text] = m ? [m[1], m[2]] : [null, title]
  return { emoji, text: text.replace(/^(Il|Lo|La|I|Gli|Le) /u, '$1\u00a0') }
}

export function BadgeCard({ badge, person }: { badge: WrappedBadge; person: WrappedPerson | undefined }) {
  const { emoji, text } = splitTitle(badge.title)
  return (
    <article className="badge-card" style={{ background: BADGE_STYLE[badge.code] }}>
      <div className="badge-who">
        <Avatar name={person?.displayName ?? '?'} size="sm" userId={person?.userId ?? undefined} />
        <span>{person?.displayName}</span>
        {emoji && <span className="badge-emoji" aria-hidden="true">{emoji}</span>}
      </div>
      <strong>{text}</strong>
      <small className="muted">{badge.detail}</small>
    </article>
  )
}
