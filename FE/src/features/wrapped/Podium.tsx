import type { WrappedPerson } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'

type Props = { title: string; people: WrappedPerson[]; value: (p: WrappedPerson) => number; unit: readonly [one: string, many: string] }

/** Classifica divertente (D-55: mai sui soldi). Se nessuno ha fatto nulla non c'è: nessun podio di zeri. */
export function Podium({ title, people, value, unit }: Props) {
  const ranked = people.filter((p) => value(p) > 0).sort((a, b) => value(b) - value(a))
  if (ranked.length === 0) return null
  const [top, rest] = [ranked.slice(0, 3), ranked.slice(3)]
  const label = (p: WrappedPerson) => `${value(p)} ${value(p) === 1 ? unit[0] : unit[1]}`
  return (
    <section className="card">
      <h2>{title}</h2>
      <ol className="podium">
        {top.map((p, i) => (
          <li key={p.participantId} className={i === 0 ? 'first' : ''}>
            <Avatar name={p.displayName} size={i === 0 ? 'lg' : 'md'} userId={p.userId ?? undefined} />
            <span>{p.displayName}</span>
            <small className="muted">{label(p)}</small>
          </li>
        ))}
      </ol>
      {rest.length > 0 && (
        <ul className="podium-rest">{rest.map((p) => <li key={p.participantId}><span>{p.displayName}</span><small className="muted">{label(p)}</small></li>)}</ul>
      )}
    </section>
  )
}
