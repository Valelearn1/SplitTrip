import { useState } from 'react'
import { Link } from 'react-router'
import type { Expense } from '../../shared/api/types'
import { CategoryIcon } from '../../shared/ui/CategoryIcon'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { formatCount } from '../../shared/utils/format'
import { splitLabel } from './splitLabels'

/** Accanto al nome, nel dettaglio: per quanto conta o quante notti/giorni (D-44). */
function shareNote(e: Expense, weight: number | null): string {
  if (weight == null) return ''
  if (e.splitType === 'WEIGHT' && weight !== 1) return ` · conta per ${formatCount(weight)}`
  if (e.splitType === 'DAYS') return ` · ${formatCount(weight)} ${e.dayBasis === 'NIGHTS' ? 'notti' : 'giorni'}`
  return ''
}

export function ExpenseRow({ expense, currency, meId }: { expense: Expense; currency: string; meId: string }) {
  const [open, setOpen] = useState(false)
  const mine = expense.shares.find((s) => s.participantId === meId)
  const payer = expense.payerId === meId ? 'te' : expense.payerName
  return (
    <div className="expense-item">
      <Link to={`${expense.id}/edit`} className="row expense-row">
        <span className="row-main">
          <CategoryIcon category={expense.category} />
          <span className="row-text">
            <strong>{expense.description}{expense.receiptPhotoId && <Icon name="receipt" label="con scontrino" className="inline-icon receipt-mark" />}</strong>
            <small>{expense.shares.length} {expense.shares.length === 1 ? 'persona' : 'persone'} · pagato da {payer} · {splitLabel(expense, meId)}</small>
          </span>
        </span>
        <span className="row-side">
          <MoneyText amount={expense.amount} currency={currency} />
          {expense.payerId === meId ? (
            <small className="muted" style={{ display: 'block', color: 'var(--accent)' }}>Hai anticipato</small>
          ) : (
            mine && <small className="muted" style={{ display: 'block' }}>tua quota {mine.amount.toFixed(2).replace('.', ',')} €</small>
          )}
        </span>
      </Link>
      {/* v3.1: la riga taglia il testo; il dettaglio lo mostra per intero, con la quota di ognuno */}
      <button type="button" className="row-toggle" aria-expanded={open} aria-label={`Dettagli di ${expense.description}`} onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? 'expand_less' : 'expand_more'} />
      </button>
      {open && (
        <div className="row-details">
          <p>{`Pagato da ${payer} · ${splitLabel(expense)}`}</p>
          <ul aria-label={`Quote di ${expense.description}`}>
            {expense.shares.map((s) => (
              <li key={s.participantId}>
                <span>{s.participantId === meId ? 'Tu' : s.displayName}{shareNote(expense, s.weight)}</span>
                <MoneyText amount={s.amount} currency={currency} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
