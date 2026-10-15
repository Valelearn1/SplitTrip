import { useEffect, useRef } from 'react'
import { REACTIONS } from './emojiList'

type Props = { mine: (emoji: string) => boolean; onPick: (emoji: string) => void; onClose: () => void }

/** Le sei reazioni (D-47) in una striscia sopra la bolla: si sceglie con un tocco, Esc chiude. */
export function ReactionBar({ mine, onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelector('button')?.focus()
    // un tocco fuori dalla striscia la chiude (sul telefono si apre col tocco lungo)
    const outside = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onClose() }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [onClose])
  return (
    <div ref={ref} className="reaction-bar" role="group" aria-label="Scegli una reazione"
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }}>
      {REACTIONS.map((r) => (
        <button key={r.emoji} type="button" aria-label={r.name} aria-pressed={mine(r.emoji)} className={mine(r.emoji) ? 'mine' : undefined}
          onClick={() => onPick(r.emoji)}>
          <span aria-hidden="true">{r.emoji}</span>
        </button>
      ))}
    </div>
  )
}
