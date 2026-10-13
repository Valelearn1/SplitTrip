import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger'; loading?: boolean }

export function Button({ variant = 'primary', loading = false, disabled, children, className = '', ...rest }: Props) {
  return (
    <button className={`btn btn-${variant} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? 'Attendi…' : children}
    </button>
  )
}
