import type { Expense } from '../../shared/api/types'
import { formatCount } from '../../shared/utils/format'

/** Come è stata divisa una spesa, in parole; per la presenza mostra anche le mie notti o i miei giorni. */
export function splitLabel(e: Pick<Expense, 'splitType' | 'dayBasis' | 'shares'>, meId?: string): string {
  switch (e.splitType) {
    case 'EQUAL': return 'in parti uguali'
    case 'CUSTOM': return 'importi personalizzati'
    case 'WEIGHT': {
      // D-44: il «peso» si racconta come parti uguali dove qualcuno conta per più o meno di uno
      const counts = e.shares.filter((s) => s.weight != null && s.weight !== 1)
        .map((s) => `${s.displayName.trim().split(/\s+/)[0]} conta per ${formatCount(s.weight!)}`)
      return counts.length > 0 ? `in parti uguali · ${counts.join(', ')}` : 'in parti uguali'
    }
    case 'DAYS': {
      const mine = meId ? e.shares.find((s) => s.participantId === meId)?.weight : undefined
      const unit = e.dayBasis === 'NIGHTS' ? 'notti' : 'giorni'
      return mine == null ? `per presenza (${unit})` : `per presenza (${mine} ${unit})`
    }
  }
}
