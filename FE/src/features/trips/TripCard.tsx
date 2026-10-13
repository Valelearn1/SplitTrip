import { Link } from 'react-router'
import type { TripSummary } from '../../shared/api/types'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { formatDateRange } from '../../shared/utils/format'

export function TripCard({ trip }: { trip: TripSummary }) {
  return (
    <Link to={`/trips/${trip.id}`} className="card trip-card">
      <div className="trip-card-head">
        <h2>{trip.name}</h2>
        <StatusBadge status={trip.status} />
      </div>
      <p className="muted">{trip.destination}</p>
      <p>{formatDateRange(trip.startDate, trip.endDate)}</p>
      <p className="muted">{trip.memberCount === 1 ? '1 partecipante' : `${trip.memberCount} partecipanti`}</p>
    </Link>
  )
}
