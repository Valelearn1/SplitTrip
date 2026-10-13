import type { ExpenseCategory } from '../api/types'

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  FOOD: 'restaurant', TRANSPORT: 'directions_car', LODGING: 'hotel', ACTIVITY: 'local_activity', OTHER: 'shopping_bag',
}
