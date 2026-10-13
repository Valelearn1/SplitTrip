import { Link, useOutletContext } from 'react-router'
import { CATEGORY_LABELS, type ExpenseCategory } from '../../shared/api/types'
import { MoneyText } from '../../shared/ui/MoneyText'
import { formatDate } from '../../shared/utils/format'
import { useBalances, useSummary } from '../balances/useBalances'
import { useExpenses } from '../expenses/useExpenses'
import { InviteCodeBox } from './InviteCodeBox'
import { MembersList } from './MembersList'
import type { TripContext } from './TripLayout'

export function TripDashboardPage() {
  const { trip, me } = useOutletContext<TripContext>()
  const balances = useBalances(trip.id)
  const summary = useSummary(trip.id)
  const expenses = useExpenses(trip.id)
  const mine = balances.data?.balances.find((b) => b.userId === me.userId)
  const net = mine?.net ?? 0

  return (
    <div className="grid-2">
      <div className="card stat">
        <p className="muted">Il tuo saldo</p>
        <MoneyText amount={net} currency={trip.currency} signed className="big" />
        <p className="muted">{net > 0 ? 'Devi ricevere' : net < 0 ? 'Devi dare' : 'Sei in pari'}</p>
        <Link to="balances">Vedi come pareggiare</Link>
      </div>
      <div className="card stat">
        <p className="muted">Totale speso</p>
        <MoneyText amount={summary.data?.total ?? 0} currency={trip.currency} className="big" />
        {summary.data && (
          <ul className="muted">
            {Object.entries(summary.data.byCategory).map(([cat, amount]) => (
              <li key={cat}>{CATEGORY_LABELS[cat as ExpenseCategory]}: <MoneyText amount={amount} currency={trip.currency} /></li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <h2>Ultime spese</h2>
        {expenses.data?.length === 0 && <p className="muted">Nessuna spesa ancora. <Link to="expenses/new">Aggiungi la prima</Link></p>}
        {expenses.data?.slice(0, 3).map((e) => (
          <div key={e.id} className="row">
            <span>{e.description}<br /><small className="muted">{formatDate(e.date)} · pagato da {e.payerName}</small></span>
            <MoneyText amount={e.amount} currency={trip.currency} />
          </div>
        ))}
        {expenses.data && expenses.data.length > 3 && <Link to="expenses">Tutte le spese</Link>}
      </div>
      <div className="card">
        <h2>Partecipanti</h2>
        <MembersList members={trip.members} />
      </div>
      <InviteCodeBox code={trip.inviteCode} tripName={trip.name} />
    </div>
  )
}
