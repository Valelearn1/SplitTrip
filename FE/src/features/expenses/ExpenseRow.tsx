import { Link } from 'react-router'
import type { Expense } from '../../shared/api/types'
import { CategoryIcon } from '../../shared/ui/CategoryIcon'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { splitLabel } from './splitLabels'

export function ExpenseRow({ expense, currency, meId }: { expense: Expense; currency: string; meId: string }) {
  const mine = expense.shares.find((s) => s.participantId === meId)
  return (
    <Link to={`${expense.id}/edit`} className="row expense-row">
      <span className="row-main">
        <CategoryIcon category={expense.category} />
        <span className="row-text">
          <strong>{expense.description}{expense.receiptPhotoId && <Icon name="receipt" label="con scontrino" className="inline-icon receipt-mark" />}</strong>
          <small>{expense.shares.length} {expense.shares.length === 1 ? 'persona' : 'persone'} · pagato da {expense.payerId === meId ? 'te' : expense.payerName} · {splitLabel(expense, meId)}</small>
        </span>
      </span>
      <span className="row-side">
        <MoneyText amount={expense.amount} currency={currency} />
        {expense.payerId === meId ? (
          <small className="muted" style={{ display: 'block', color: 'var(--teal)' }}>Hai anticipato</small>
        ) : (
          mine && <small className="muted" style={{ display: 'block' }}>tua quota {mine.amount.toFixed(2).replace('.', ',')} €</small>
        )}
      </span>
    </Link>
  )
}
