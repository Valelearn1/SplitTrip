import { Link, useOutletContext } from 'react-router'
import { Avatar } from '../../shared/ui/Avatar'
import { BalancePill } from '../../shared/ui/BalancePill'
import { CategoryIcon } from '../../shared/ui/CategoryIcon'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { formatDate, localToday } from '../../shared/utils/format'
import { useBalances, useSummary } from '../balances/useBalances'
import { useExpenses } from '../expenses/useExpenses'
import { WeatherCard } from '../weather/WeatherCard'
import { AiTipsCard } from '../ai/AiTipsCard'
import { GamesCard } from '../games/GamesCard'
import { InviteCodeBox } from './InviteCodeBox'
import type { TripContext } from './TripLayout'

export function TripDashboardPage() {
  const { trip, me, canWrite } = useOutletContext<TripContext>()
  const balances = useBalances(trip.id)
  const summary = useSummary(trip.id)
  const expenses = useExpenses(trip.id)
  const mine = balances.data?.balances.find((b) => b.participantId === me.id)
  const net = mine?.net ?? 0

  return (
    <div className="grid-2">
      <div className="card span-2">
        <p className="label">Il tuo saldo</p>
        <div className="balance-head">
          <MoneyText amount={net} currency={trip.currency} signed className="amount-xl" />
          <BalancePill net={net} />
        </div>
        <div className="kv">
          <div><span>Spesa totale del gruppo</span><MoneyText amount={summary.data?.total ?? 0} currency={trip.currency} /></div>
          <div><span>La tua quota</span><MoneyText amount={mine?.owed ?? 0} currency={trip.currency} /></div>
        </div>
        <div className="actions" style={{ marginTop: 12 }}>
          {canWrite && <Link to="expenses/new" className="btn btn-primary"><Icon name="add" />Nuova spesa</Link>}
          <Link to="balances" className="btn btn-soft"><Icon name="sync_alt" />Regola conti</Link>
        </div>
      </div>

      <WeatherCard tripId={trip.id} />
      <AiTipsCard tripId={trip.id} destination={trip.destination} canWrite={canWrite} />
      <GamesCard trip={trip} me={me} canWrite={canWrite} over={trip.status === 'CLOSED' || trip.endDate < localToday()} />

      <div className="card">
        <div className="page-head" style={{ marginBottom: 8 }}>
          <h2>Compagni di viaggio</h2>
          <span className="badge badge-plain">{trip.participants.length}</span>
        </div>
        <div className="people">
          {trip.participants.map((p) => (
            <div key={p.id} className="person">
              <Avatar name={p.displayName} me={p.id === me.id} size="lg" userId={p.userId} hasAvatar={p.hasAvatar} />
              <span>{p.id === me.id ? 'Tu' : firstName(p.displayName)}</span>
              {p.userId === null && <small className="muted">senza account</small>}
            </div>
          ))}
        </div>
        <InviteCodeBox code={trip.inviteCode} tripName={trip.name} />
      </div>

      <div className="card">
        <div className="page-head" style={{ marginBottom: 8 }}>
          <h2>Ultime spese</h2>
          {expenses.data && expenses.data.length > 3 && <Link to="expenses">Vedi tutte ({expenses.data.length})</Link>}
        </div>
        {expenses.data?.length === 0 && (
          <p className="muted">Nessuna spesa ancora. {canWrite && <Link to="expenses/new">Aggiungi la prima</Link>}</p>
        )}
        {expenses.data?.slice(0, 3).map((e) => (
          <Link key={e.id} to={`expenses/${e.id}/edit`} className="row expense-row">
            <span className="row-main">
              <CategoryIcon category={e.category} />
              <span className="row-text">
                <strong>{e.description}</strong>
                <small>{formatDate(e.date)} · pagato da {e.payerId === me.id ? 'te' : e.payerName}</small>
              </span>
            </span>
            <MoneyText amount={e.amount} currency={trip.currency} />
          </Link>
        ))}
      </div>

      {summary.data && Object.keys(summary.data.byCategory).length > 0 && (
        <div className="card span-2">
          <h2>Per categoria</h2>
          <div className="kv">
            {Object.entries(summary.data.byCategory).map(([cat, amount]) => (
              <div key={cat}><span>{categoryLabel(cat)}</span><MoneyText amount={amount} currency={trip.currency} /></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0]
}

function categoryLabel(cat: string) {
  const labels: Record<string, string> = { FOOD: 'Cibo', TRANSPORT: 'Trasporti', LODGING: 'Alloggio', ACTIVITY: 'Attività', OTHER: 'Altro' }
  return labels[cat] ?? cat
}
