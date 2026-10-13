import { NavLink, Outlet, useParams } from 'react-router'
import type { Member, Trip } from '../../shared/api/types'
import { FormError } from '../../shared/ui/FormError'
import { Spinner } from '../../shared/ui/Spinner'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { formatDateRange } from '../../shared/utils/format'
import { useAuth } from '../auth/useAuth'
import { useTrip } from './useTrips'

export type TripContext = { trip: Trip; me: Member; isOrganizer: boolean; canWrite: boolean }

export function TripLayout() {
  const { tripId = '' } = useParams()
  const { auth } = useAuth()
  const { data: trip, isPending, error } = useTrip(tripId)

  if (isPending) return <Spinner />
  if (error || !trip) return <FormError error={error ?? new Error('Viaggio non disponibile')} />

  const me = trip.members.find((m) => m.userId === auth?.user.id)
  if (!me) return <p role="alert">Non fai parte di questo viaggio.</p>
  const ctx: TripContext = { trip, me, isOrganizer: me.role === 'ORGANIZER', canWrite: trip.status !== 'CLOSED' }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{trip.name}</h1>
          <p className="muted">{trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <StatusBadge status={trip.status} />
      </div>
      <nav className="tabs" aria-label="Sezioni del viaggio">
        <NavLink to="" end>Panoramica</NavLink>
        <NavLink to="expenses">Spese</NavLink>
        <NavLink to="balances">Saldi</NavLink>
        {ctx.isOrganizer && <NavLink to="settings">Impostazioni</NavLink>}
      </nav>
      <Outlet context={ctx} />
    </section>
  )
}
