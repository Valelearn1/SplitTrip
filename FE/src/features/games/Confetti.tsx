import * as m from 'motion/react-m'
import { reduceMotion } from '../../shared/utils/motion'

/** 24 coriandoli per il verdetto; con «Riduci le animazioni» niente. Decorativi. */
export function Confetti({ active, colors }: { active: boolean; colors: readonly string[] }) {
  if (!active || reduceMotion()) return null
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <m.span key={i} style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length] }}
          initial={{ y: -20, opacity: 1, rotate: 0 }} animate={{ y: 320, opacity: 0, rotate: 360 }}
          transition={{ duration: 1.5, delay: (i % 6) * 0.08, ease: 'easeIn' }} />
      ))}
    </div>
  )
}
