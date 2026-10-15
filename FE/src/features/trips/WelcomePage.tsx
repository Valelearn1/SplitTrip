import { useNavigate, useOutletContext } from 'react-router'
import { Suitcase } from '../../shared/ui/illustrations/Suitcase'
import { ParticipantForm } from './ParticipantForm'
import type { TripContext } from './TripLayout'

/** Benvenuto (D-50): due domande in un tocco; poi tutto si cambia da Impostazioni › Io. */
export function WelcomePage() {
  const { trip, me } = useOutletContext<TripContext>()
  const navigate = useNavigate()
  const done = () => navigate(`/trips/${trip.id}`, { replace: true })
  return (
    <section className="card welcome">
      <Suitcase size={48} />
      <h2>Ti diamo il benvenuto in {trip.name}</h2>
      <p className="muted">Due cose veloci, poi si parte. Puoi cambiarle quando vuoi da Impostazioni › Io.</p>
      <ParticipantForm tripId={trip.id}
        participant={{ ...me, arrivalDate: me.arrivalDate ?? trip.startDate, departureDate: me.departureDate ?? trip.endDate }}
        tripStart={trip.startDate} tripEnd={trip.endDate} compact submitLabel="Va bene così" skipLabel="Salta" onSkip={done} onSaved={done} />
    </section>
  )
}
