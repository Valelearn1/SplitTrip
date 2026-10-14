import { NavLink, Outlet, useLocation, useParams } from 'react-router'
import type { Participant, Trip } from '../../shared/api/types'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Spinner } from '../../shared/ui/Spinner'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { formatDateRange } from '../../shared/utils/format'
import { useAuth } from '../auth/useAuth'
import { useBalances } from '../balances/useBalances'
import { BalancePill } from '../../shared/ui/BalancePill'
import { MoneyText } from '../../shared/ui/MoneyText'
import { useTrip } from './useTrips'

/** me = il mio partecipante: me.id è l'id usato nei soldi, me.userId il mio utente. */
export type TripContext = { trip: Trip; me: Participant; isOrganizer: boolean; canWrite: boolean }

export function TripLayout() {
  const { tripId = '' } = useParams()
  const { auth } = useAuth()
  const { data: trip, isPending, error } = useTrip(tripId)
  const balances = useBalances(tripId)
  const location = useLocation()

  if (isPending) return <Spinner />
  if (error || !trip) return <FormError error={error ?? new Error('Viaggio non disponibile')} />

  const me = trip.participants.find((p) => p.userId === auth?.user.id)
  if (!me) return <p role="alert">Non fai parte di questo viaggio.</p>
  const ctx: TripContext = { trip, me, isOrganizer: me.role === 'ORGANIZER', canWrite: trip.status !== 'CLOSED' }
  // Panoramica e Saldi aprono già con la card grande del saldo: in testa lo mostriamo solo nelle altre sezioni
  const path = location.pathname.replace(/\/$/, '')
  const hasHeroBalance = path === `/trips/${tripId}` || path === `/trips/${tripId}/balances`
  const myNet = hasHeroBalance ? undefined : balances.data?.balances.find((b) => b.participantId === me.id)?.net

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{trip.name}</h1>
          <p className="muted"><Icon name="location_on" className="inline-icon" /> {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <div className="head-balance">
          <StatusBadge status={trip.status} />
          <NavLink to="settings" className="btn btn-secondary btn-sm icon-btn" aria-label="Impostazioni del viaggio"><Icon name="settings" /></NavLink>
          {myNet !== undefined && (
            <>
              <MoneyText amount={myNet} currency={trip.currency} signed className="amount-lg" />
              <BalancePill net={myNet} />
            </>
          )}
        </div>
      </div>
      <nav className="tabs" aria-label="Sezioni del viaggio">
        <NavLink to="" end><Icon name="explore" />Panoramica</NavLink>
        <NavLink to="expenses"><Icon name="receipt_long" />Spese</NavLink>
        <NavLink to="balances"><Icon name="balance" />Saldi</NavLink>
        <NavLink to="lists"><Icon name="checklist" />Liste</NavLink>
        <NavLink to="photos"><Icon name="photo_library" />Foto</NavLink>
      </nav>
      <Outlet context={ctx} />
    </section>
  )
}
