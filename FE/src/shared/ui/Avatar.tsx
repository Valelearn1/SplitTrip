import { avatarPath } from '../api/avatar'
import { AuthImage } from './AuthImage'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[parts.length - 1][0]
}

type Props = {
  name: string; me?: boolean; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string
  /** Con userId e hasAvatar il cerchio mostra la foto profilo (v2); altrimenti le iniziali. */
  userId?: string | null; hasAvatar?: boolean
}

/** Cerchio con la foto o le iniziali: il segno ricorrente dei partecipanti. */
export function Avatar({ name, me = false, size = 'md', className = '', userId, hasAvatar = false }: Props) {
  const cls = `avatar ${me ? 'avatar-me' : ''} ${size === 'md' ? '' : `avatar-${size}`} ${className}`
  if (userId && hasAvatar) {
    return (
      <span className={`${cls} avatar-photo`} aria-hidden="true">
        <AuthImage path={avatarPath(userId)} alt="" />
      </span>
    )
  }
  return <span className={cls} aria-hidden="true">{initials(name)}</span>
}
