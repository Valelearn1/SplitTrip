import type { ReactionSummary } from '../../shared/api/types'
import { REACTIONS } from './emojiList'

const nameOf = (emoji: string) => REACTIONS.find((r) => r.emoji === emoji)?.name ?? emoji

type Props = { reactions: ReactionSummary[]; me: string; canReact: boolean; onToggle: (emoji: string, mine: boolean) => void }

/** Sotto la bolla: emoji e numero; le mie hanno bordo e testo in evidenza, e lo dicono a parole (D-24). */
export function ReactionPills({ reactions, me, canReact, onToggle }: Props) {
  if (reactions.length === 0) return null
  return (
    <div className="reaction-pills">
      {reactions.map((r) => {
        const mine = r.participantIds.includes(me)
        const label = `${nameOf(r.emoji)}, ${r.count}${mine ? ', tra cui tu' : ''}`
        return (
          <button key={r.emoji} type="button" className={`reaction-pill${mine ? ' mine' : ''}`} aria-label={label} aria-pressed={mine}
            disabled={!canReact} onClick={() => onToggle(r.emoji, mine)}>
            <span aria-hidden="true">{r.emoji}</span> <span aria-hidden="true">{r.count}</span>
          </button>
        )
      })}
    </div>
  )
}
