import type { ButtonHTMLAttributes } from 'react'
import { useOnline } from '../../features/pwa/useOnline'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'soft' | 'danger'; loading?: boolean
  /** Serve la rete? Di base sì per i submit (salvano), no per gli altri. */
  needsNetwork?: boolean
}

export function Button({ variant = 'primary', loading = false, needsNetwork, disabled, children, className = '', type, title, ...rest }: Props) {
  const online = useOnline()
  const blocked = !online && (needsNetwork ?? type === 'submit')   // D-63: offline si guarda, non si salva
  return (
    <button type={type} className={`btn btn-${variant} ${className}`} disabled={disabled || loading || blocked} aria-busy={loading || undefined}
      {...rest} title={blocked ? 'Serve la rete per salvare' : title} aria-describedby={blocked ? 'offline-reason' : rest['aria-describedby']}>
      {loading ? 'Attendi…' : children}
    </button>
  )
}
