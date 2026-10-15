import * as m from 'motion/react-m'

/** Busta delle notifiche (D-43): il lembo si ribalta verso l'alto quando la notifica è letta. */
export function Envelope({ open, delay = 0 }: { open: boolean; delay?: number }) {
  return (
    <svg className="envelope" viewBox="0 0 32 26" width="32" height="26" aria-hidden="true" data-state={open ? 'open' : 'closed'}>
      <rect x="1.5" y="8" width="29" height="17" rx="3" fill="var(--surface-1)" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 24 L13 15.5 M29.5 24 L19 15.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <m.path d="M1.5 9 L16 19 L30.5 9" fill="var(--surface)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        style={{ originY: 0, transformBox: 'fill-box' }} initial={false}
        animate={{ scaleY: open ? -1 : 1 }} transition={{ duration: 0.25, delay, ease: [0.2, 0.8, 0.2, 1] }} />
    </svg>
  )
}
