import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../shared/ui/Icon'
import { EMOJI_GRID } from './emojiList'

/** Bottone «Emoji» del campo (D-47): una griglia scelta a mano, senza librerie. Esc o un tocco fuori la chiudono. */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLButtonElement>('.emoji-popover button')?.focus()
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus() } }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', esc) }
  }, [open])

  return (
    <div ref={root} className="emoji-picker">
      <button ref={toggle} type="button" className="btn btn-secondary icon-btn" aria-label="Emoji" aria-haspopup="dialog" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        <Icon name="mood" />
      </button>
      {open && (
        <div className="emoji-popover" role="dialog" aria-label="Scegli un’emoji">
          {EMOJI_GRID.map((e) => (
            <button key={e.emoji} type="button" aria-label={e.name} onClick={() => { setOpen(false); onPick(e.emoji) }}>
              <span aria-hidden="true">{e.emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
