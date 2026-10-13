import { Link, useOutletContext } from 'react-router'
import type { Transfer } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'
import { BalancePill } from '../../shared/ui/BalancePill'
import { Button } from '../../shared/ui/Button'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { Spinner } from '../../shared/ui/Spinner'
import { formatDate } from '../../shared/utils/format'
import type { TripContext } from '../trips/TripLayout'
import { useBalances, useDeleteSettlement, useSettlements } from './useBalances'

/** Raggruppa i trasferimenti per chi paga: «Giulia → Tu 8 € e → Marco 10 €» (D-25). */
function groupByDebtor(transfers: Transfer[]): Transfer[][] {
  const groups = new Map<string, Transfer[]>()
  for (const t of transfers) groups.set(t.fromUserId, [...(groups.get(t.fromUserId) ?? []), t])
  return [...groups.values()]
}

export function BalancesPage() {
  const { trip, me, isOrganizer, canWrite } = useOutletContext<TripContext>()
  const balances = useBalances(trip.id)
  const settlements = useSettlements(trip.id)
  const remove = useDeleteSettlement(trip.id)
  const maxAbs = Math.max(1, ...(balances.data?.balances.map((b) => Math.abs(b.net)) ?? [1]))
  const mine = balances.data?.balances.find((b) => b.userId === me.userId)

  return (
    <div className="grid-2">
      <section className="card span-2">
        <p className="label">Il tuo saldo netto</p>
        <div className="balance-head">
          <MoneyText amount={mine?.net ?? 0} currency={trip.currency} signed className="amount-xl" />
          <BalancePill net={mine?.net ?? 0} />
        </div>
        <p className="muted">
          {(mine?.net ?? 0) === 0
            ? 'Tutto chiaro: non devi niente a nessuno.'
            : 'Quando i trasferimenti suggeriti qui sotto sono fatti, torni esattamente a zero.'}
        </p>
      </section>

      <section className="card">
        <h2>Situazione del gruppo</h2>
        {balances.isPending && <Spinner />}
        <FormError error={balances.error} />
        {balances.data?.balances.map((b) => (
          <div key={b.userId} className="balance-row">
            <div className="row">
              <span className="row-main">
                <Avatar name={b.displayName} me={b.userId === me.userId} />
                <span>{b.userId === me.userId ? 'Tu' : b.displayName}</span>
              </span>
              <span className="row-side">
                <MoneyText amount={b.net} currency={trip.currency} signed />
                <BalancePill net={b.net} person={b.userId === me.userId ? 'second' : 'third'} />
              </span>
            </div>
            <div className="bar">
              <div className={`bar-fill ${b.net >= 0 ? 'bar-positive' : 'bar-negative'}`} style={{ transform: `scaleX(${Math.abs(b.net) / maxAbs})` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Come pareggiare</h2>
        {balances.data?.suggestedTransfers.length === 0 && <EmptyState title="Siete in pari" icon="celebration" />}
        {balances.data && balances.data.suggestedTransfers.length > 0 && (
          <div className="info" style={{ marginBottom: 8 }}>
            <Icon name="auto_awesome" />
            <span>{balances.data.suggestedTransfers.length === 1 ? 'Basta un rimborso' : `Bastano ${balances.data.suggestedTransfers.length} rimborsi`} per azzerare tutti i debiti del gruppo.</span>
          </div>
        )}
        {groupByDebtor(balances.data?.suggestedTransfers ?? []).map((group) =>
          group.map((t) => (
            <div key={`${t.fromUserId}-${t.toUserId}`} className="transfer">
              <div className="transfer-who">
                <Avatar name={t.fromName} me={t.fromUserId === me.userId} size="sm" />
                <Icon name="arrow_forward" />
                <Avatar name={t.toName} me={t.toUserId === me.userId} size="sm" />
                <span>{t.fromName} → {t.toName}</span>
              </div>
              <div className="transfer-foot">
                <MoneyText amount={t.amount} currency={trip.currency} className="amount-lg" />
                {canWrite && (
                  <Link className="btn btn-primary btn-sm" to={`/trips/${trip.id}/settlements/new?from=${t.fromUserId}&to=${t.toUserId}&amount=${t.amount.toFixed(2)}`}>
                    <Icon name="payments" />Salda
                  </Link>
                )}
              </div>
            </div>
          )),
        )}
        {canWrite && <p style={{ marginTop: 12 }}><Link to={`/trips/${trip.id}/settlements/new`}>Registra un altro rimborso</Link></p>}
      </section>

      <section className="card span-2">
        <h2>Rimborsi registrati</h2>
        <FormError error={remove.error} />
        {settlements.data?.length === 0 && <p className="muted">Nessun rimborso ancora.</p>}
        {settlements.data?.map((s) => (
          <div key={s.id} className="row row-wrap">
            <span className="row-main">
              <Icon name="check_circle" className="money-positive" />
              <span className="row-text">
                <strong>{s.fromName} → {s.toName}</strong>
                <small>{formatDate(s.date)}{s.note ? ` · ${s.note}` : ''}</small>
              </span>
            </span>
            <span className="row-main">
              <MoneyText amount={s.amount} currency={trip.currency} />
              {canWrite && (s.createdBy === me.userId || isOrganizer) && (
                <Button variant="secondary" className="btn-sm" loading={remove.isPending} onClick={() => remove.mutate(s.id)}>Annulla</Button>
              )}
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
