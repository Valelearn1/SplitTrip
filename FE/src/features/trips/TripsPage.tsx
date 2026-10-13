import { Link } from 'react-router'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { Spinner } from '../../shared/ui/Spinner'
import { TripCard } from './TripCard'
import { useTrips } from './useTrips'

export function TripsPage() {
  const { data, isPending, error } = useTrips()

  return (
    <section>
      <div className="page-head">
        <h1>I miei viaggi</h1>
        <Link to="/join" className="btn btn-secondary">Ho un codice</Link>
      </div>
      {isPending && <Spinner />}
      <FormError error={error} />
      {data && data.length === 0 && (
        <EmptyState title="Nessun viaggio ancora">
          <Link to="/trips/new" className="btn btn-primary">Crea il tuo primo viaggio</Link>
        </EmptyState>
      )}
      {data && data.length > 0 && (
        <div className="card-list">
          {data.map((t) => <TripCard key={t.id} trip={t} />)}
        </div>
      )}
      <Link to="/trips/new" className="fab" aria-label="Nuovo viaggio">+</Link>
    </section>
  )
}
