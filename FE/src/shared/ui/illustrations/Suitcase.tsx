import * as m from 'motion/react-m'

type Props = { closed?: boolean; bouncing?: boolean; size?: number }

/** Valigia (D-43): coperchio aperto finché la lista non è completa; saltella mentre il server si sveglia. */
export function Suitcase({ closed = false, bouncing = false, size = 24 }: Props) {
  return (
    <m.svg className="suitcase" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" data-state={closed ? 'closed' : 'open'}
      animate={bouncing ? { y: [0, -4, 0] } : { y: 0 }} transition={bouncing ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}>
      <rect x="3" y="9" width="18" height="12" rx="2.5" fill="var(--teal-tint)" stroke="currentColor" strokeWidth="1.6" />
      <m.g style={{ originX: 0, originY: 1, transformBox: 'fill-box' }} initial={false}
        animate={{ rotate: closed ? 0 : -28 }} transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}>
        <rect x="3" y="6" width="18" height="4" rx="1.5" fill="var(--surface)" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 6 V4.5 a1.5 1.5 0 0 1 1.5 -1.5 h3 a1.5 1.5 0 0 1 1.5 1.5 V6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </m.g>
      <m.path d="M8.5 15 l2.5 2.5 l4.5 -5" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={false} animate={{ pathLength: closed ? 1 : 0, opacity: closed ? 1 : 0 }} transition={{ duration: 0.3, delay: closed ? 0.3 : 0 }} />
    </m.svg>
  )
}
