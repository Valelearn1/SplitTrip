import type { BadgeCode } from '../../shared/api/types'

/** Fondo di ogni badge: tinte dei token (con la versione scura), mai il lampone, che è il debito. L'icona è l'emoji del titolo. */
export const BADGE_STYLE: Record<BadgeCode, string> = {
  BANKER: 'var(--accent-tint)',
  PHOTOGRAPHER: 'var(--amber-tint)',
  VOICE: 'var(--surface-2)',
  FOODIE: 'var(--amber-tint)',
  PUNCTUAL: 'var(--accent-tint)',
  LOVED: 'var(--surface-2)',
  EXPLORER: 'var(--accent-tint)',
  COMPANION: 'var(--surface-1)',
}
