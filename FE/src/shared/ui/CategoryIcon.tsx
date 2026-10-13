import type { ExpenseCategory } from '../api/types'
import { CATEGORY_ICONS } from './categoryIcons'
import { Icon } from './Icon'

export function CategoryIcon({ category }: { category: ExpenseCategory }) {
  return (
    <span className={`cat cat-${category.toLowerCase()}`}><Icon name={CATEGORY_ICONS[category]} /></span>
  )
}
