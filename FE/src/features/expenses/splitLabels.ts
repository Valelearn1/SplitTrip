import type { Expense } from '../../shared/api/types'

/** Come è stata divisa una spesa, in parole; per la presenza mostra anche le mie notti o i miei giorni. */
export function splitLabel(e: Pick<Expense, 'splitType' | 'dayBasis' | 'shares'>, meId?: string): string {
  switch (e.splitType) {
    case 'EQUAL': return 'in parti uguali'
    case 'CUSTOM': return 'importi personalizzati'
    case 'WEIGHT': return 'per peso'
    case 'DAYS': {
      const mine = meId ? e.shares.find((s) => s.participantId === meId)?.weight : undefined
      const unit = e.dayBasis === 'NIGHTS' ? 'notti' : 'giorni'
      return mine == null ? `per presenza (${unit})` : `per presenza (${mine} ${unit})`
    }
  }
}
