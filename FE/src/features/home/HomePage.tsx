import { formatDistanceToNow, parseISO } from 'date-fns'
import { it as itLocale } from 'date-fns/locale'
import { Link } from 'react-router'
import { BalancePill } from '../../shared/ui/BalancePill'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { Spinner } from '../../shared/ui/Spinner'
import { Suitcase } from '../../shared/ui/illustrations/Suitcase'
import { useAuth } from '../auth/useAuth'
import { TripCard } from '../trips/TripCard'
import { FeaturedTripCard } from './FeaturedTripCard'
import { useHome } from './useHome'

const inTrips = (n: number) => `in ${n} ${n === 1 ? 'viaggio' : 'viaggi'}`

/** Home da loggati (D-49): tutto da una chiamata. */
export function HomePage() {
  const { auth } = useAuth()
  const home = useHome()
  const d = home.data
  const noTrips = d !== undefined && d.trips.current.length === 0 && d.trips.past.length === 0
  // «in corso» secondo le date (anche se l'organizzatore non ha cambiato lo stato), come il viaggio in evidenza
  const ongoing = d?.featured?.status === 'ONGOING' ? d.featured.trip : undefined
  // i totali hanno senso solo se tutti i saldi sono nella stessa valuta; altrimenti restano le righe per viaggio
  const currencies = new Set(d?.balances.map((b) => b.currency))
  const totalsCurrency = currencies.size === 1 ? [...currencies][0] : null

  return (
    <div className="stack home">
      <h1>Ciao {auth?.user.displayName}</h1>
      {home.isPending && <Spinner />}
      <FormError error={home.error} />
      {d?.featured && <FeaturedTripCard featured={d.featured} />}

      {d && !noTrips && (
        <div className="actions">
          <Link to="/trips/new" className="btn btn-primary"><Icon name="add" />Nuovo viaggio</Link>
          <Link to="/join" className="btn btn-soft"><Icon name="key" />Ho un codice</Link>
          {ongoing && <Link to={`/trips/${ongoing.id}/expenses/new`} className="btn btn-secondary"><Icon name="receipt_long" />Nuova spesa</Link>}
        </div>
      )}

      {noTrips && (
        <EmptyState title="Nessun viaggio ancora" icon="flight_takeoff">
          <Suitcase size={48} />
          <p className="muted">Crea il primo viaggio e invita gli amici con un codice.</p>
          <div className="actions">
            <Link to="/trips/new" className="btn btn-primary">Crea il tuo primo viaggio</Link>
            <Link to="/join" className="btn btn-soft">Ho un codice</Link>
          </div>
        </EmptyState>
      )}

      {d && (
        <section className="card">
          <h2>I tuoi conti</h2>
          {d.balances.length === 0 ? (
            <p className="muted"><Icon name="check_circle" className="inline-icon" /> Sei in pari con tutti</p>
          ) : (
            <>
              {totalsCurrency && (
                <div className="kv home-totals">
                  {d.totals.toReceive > 0 && (
                    <div><span className="home-total-label"><BalancePill net={1} /><small>{inTrips(d.totals.tripsToReceive)}</small></span><MoneyText amount={d.totals.toReceive} currency={totalsCurrency} /></div>
                  )}
                  {d.totals.toGive > 0 && (
                    <div><span className="home-total-label"><BalancePill net={-1} /><small>{inTrips(d.totals.tripsToGive)}</small></span><MoneyText amount={d.totals.toGive} currency={totalsCurrency} /></div>
                  )}
                </div>
              )}
              <ul className="list">
                {d.balances.map((b) => (
                  <li key={b.tripId}>
                    <Link to={`/trips/${b.tripId}/balances`} className="row"><span>{b.tripName}</span><MoneyText amount={b.myNet} currency={b.currency} signed /></Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {d && d.latestNotifications.length > 0 && (
        <section className="card">
          <div className="section-head"><h2>Ultime novità</h2><Link to="/notifications">Vedi tutte</Link></div>
          <ul className="list">
            {d.latestNotifications.map((n) => (
              <li key={n.id}>
                <Link to={n.link} className="row">
                  <span className="row-text"><span>{n.message}</span><small>{formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true, locale: itLocale })}</small></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d && d.trips.current.length > 0 && (
        <section><h2>In corso e in arrivo</h2><div className="card-list">{d.trips.current.map((t) => <TripCard key={t.id} trip={t} />)}</div></section>
      )}
      {d && d.trips.past.length > 0 && (
        <section><h2>Passati</h2><div className="card-list">{d.trips.past.map((t) => <TripCard key={t.id} trip={t} />)}</div></section>
      )}
    </div>
  )
}
