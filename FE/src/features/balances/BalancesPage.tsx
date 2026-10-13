import { Link, useOutletContext } from 'react-router'
import { Button } from '../../shared/ui/Button'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { MoneyText } from '../../shared/ui/MoneyText'
import { Spinner } from '../../shared/ui/Spinner'
import { formatDate } from '../../shared/utils/format'
import type { TripContext } from '../trips/TripLayout'
import { useBalances, useDeleteSettlement, useSettlements } from './useBalances'

export function BalancesPage() {
  const { trip, me, isOrganizer, canWrite } = useOutletContext<TripContext>()
  const balances = useBalances(trip.id)
  const settlements = useSettlements(trip.id)
  const remove = useDeleteSettlement(trip.id)
  const maxAbs = Math.max(1, ...(balances.data?.balances.map((b) => Math.abs(b.net)) ?? [1]))

  return (
    <div className="grid-2">
      <section className="card">
        <h2>Saldi</h2>
        {balances.isPending && <Spinner />}
        <FormError error={balances.error} />
        {balances.data?.balances.map((b) => (
          <div key={b.userId} className="balance-row">
            <div className="row">
              <span>{b.displayName}{b.userId === me.userId ? ' (io)' : ''}</span>
              <MoneyText amount={b.net} currency={trip.currency} signed />
            </div>
            <div className="bar">
              <div className={`bar-fill ${b.net >= 0 ? 'bar-positive' : 'bar-negative'}`} style={{ width: `${(Math.abs(b.net) / maxAbs) * 100}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Come pareggiare</h2>
        {balances.data?.suggestedTransfers.length === 0 && <EmptyState title="Siete in pari 🎉" />}
        {balances.data?.suggestedTransfers.map((t) => (
          <div key={`${t.fromUserId}-${t.toUserId}`} className="row">
            <span>{t.fromName} → {t.toName}</span>
            <span>
              <MoneyText amount={t.amount} currency={trip.currency} />{' '}
              {canWrite && (
                <Link className="btn btn-secondary" to={`/trips/${trip.id}/settlements/new?from=${t.fromUserId}&to=${t.toUserId}&amount=${t.amount.toFixed(2)}`}>
                  Salda
                </Link>
              )}
            </span>
          </div>
        ))}
        {canWrite && <p><Link to={`/trips/${trip.id}/settlements/new`}>Registra un altro rimborso</Link></p>}
      </section>

      <section className="card">
        <h2>Rimborsi registrati</h2>
        <FormError error={remove.error} />
        {settlements.data?.length === 0 && <p className="muted">Nessun rimborso ancora.</p>}
        {settlements.data?.map((s) => (
          <div key={s.id} className="row">
            <span>
              {s.fromName} → {s.toName}<br />
              <small className="muted">{formatDate(s.date)}{s.note ? ` · ${s.note}` : ''}</small>
            </span>
            <span>
              <MoneyText amount={s.amount} currency={trip.currency} />{' '}
              {canWrite && (s.createdBy === me.userId || isOrganizer) && (
                <Button variant="secondary" loading={remove.isPending} onClick={() => remove.mutate(s.id)}>Annulla</Button>
              )}
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
