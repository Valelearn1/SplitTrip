import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function EmptyState({ title, icon = 'luggage', children }: { title: string; icon?: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <Icon name={icon} />
      <h2>{title}</h2>
      {children}
    </div>
  )
}
