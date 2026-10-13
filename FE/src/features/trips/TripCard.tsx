import { Link } from 'react-router'
import type { TripSummary } from '../../shared/api/types'
import { Icon } from '../../shared/ui/Icon'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { formatDateRange } from '../../shared/utils/format'

export function TripCard({ trip }: { trip: TripSummary }) {
  return (
    <Link to={`/trips/${trip.id}`} className="card trip-card">
      <div className="trip-card-head">
        <h2>{trip.name}</h2>
        <StatusBadge status={trip.status} />
      </div>
      <p className="meta"><Icon name="location_on" />{trip.destination}</p>
      <p className="meta"><Icon name="calendar_month" />{formatDateRange(trip.startDate, trip.endDate)}</p>
      <p className="meta"><Icon name="group" />{trip.memberCount === 1 ? '1 partecipante' : `${trip.memberCount} partecipanti`}</p>
    </Link>
  )
}
