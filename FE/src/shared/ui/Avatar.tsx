function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[parts.length - 1][0]
}

type Props = { name: string; me?: boolean; size?: 'sm' | 'md' | 'lg'; className?: string }

/** Cerchio con le iniziali: il segno ricorrente dei partecipanti (in v1 niente foto profilo). */
export function Avatar({ name, me = false, size = 'md', className = '' }: Props) {
  return (
    <span className={`avatar ${me ? 'avatar-me' : ''} ${size === 'md' ? '' : `avatar-${size}`} ${className}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
