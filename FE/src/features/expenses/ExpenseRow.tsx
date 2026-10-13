import { Link } from 'react-router'
import { CATEGORY_LABELS, type Expense } from '../../shared/api/types'
import { MoneyText } from '../../shared/ui/MoneyText'

export function ExpenseRow({ expense, currency }: { expense: Expense; currency: string }) {
  return (
    <Link to={`${expense.id}/edit`} className="row expense-row">
      <span>
        <strong>{expense.description}</strong>
        <br />
        <small className="muted">{CATEGORY_LABELS[expense.category]} · pagato da {expense.payerName} · {expense.shares.length} persone</small>
      </span>
      <MoneyText amount={expense.amount} currency={currency} />
    </Link>
  )
}
