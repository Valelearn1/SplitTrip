import { useState } from 'react'
import type { Settlement } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { formatDate, formatMoney } from '../../shared/utils/format'

type Props = { settlement: Settlement; currency: string; canCancel: boolean; cancelling: boolean; onCancel: () => void }

/** Un rimborso registrato; «Dettagli» mostra la nota per intero (v3.1: nella riga veniva tagliata). */
export function SettlementRow({ settlement: s, currency, canCancel, cancelling, onCancel }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="row row-wrap settlement-row">
      <span className="row-main">
        <Icon name="check_circle" className="money-positive" />
        <span className="row-text">
          <strong>{s.fromName} → {s.toName}</strong>
          <small>{formatDate(s.date)}{s.note ? ` · ${s.note}` : ''}</small>
        </span>
      </span>
      <span className="row-main">
        <span className="row-side">
          <MoneyText amount={s.amount} currency={s.currency} />
          {s.currency !== currency && <small className="muted">≈ {formatMoney(s.amountBase, currency)}</small>}
        </span>
        {canCancel && <Button variant="secondary" className="btn-sm" loading={cancelling} onClick={onCancel}>Annulla</Button>}
        <button type="button" className="row-toggle" aria-expanded={open} aria-label={`Dettagli del rimborso ${s.fromName} → ${s.toName}`} onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'expand_less' : 'expand_more'} />
        </button>
      </span>
      {open && (
        <div className="row-details">
          <p>{`${s.fromName} ha rimborsato ${s.toName} il ${formatDate(s.date)}`}</p>
          <p>{s.note ? `Nota: ${s.note}` : 'Nessuna nota'}</p>
        </div>
      )}
    </div>
  )
}
