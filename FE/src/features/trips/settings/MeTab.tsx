import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../../shared/ui/Button'
import { FormError } from '../../../shared/ui/FormError'
import { Modal } from '../../../shared/ui/Modal'
import { ParticipantForm } from '../ParticipantForm'
import type { TripContext } from '../TripLayout'
import { useLeaveTrip } from '../useTrips'

/** Scheda Io: la mia partecipazione e, per chi non organizza, l'uscita dal viaggio. */
export function MeTab({ trip, me, isOrganizer }: TripContext) {
  const navigate = useNavigate()
  const leave = useLeaveTrip(trip.id)
  const [confirm, setConfirm] = useState(false)
  return (
    <section className="card">
      <h2>La mia partecipazione</h2>
      <ParticipantForm tripId={trip.id} participant={me} submitLabel="Salva la mia partecipazione" />
      <div className="settings-leave">
        {isOrganizer ? (
          <p className="muted">L’organizzatore non può lasciare il viaggio.</p>
        ) : (
          <>
            <FormError error={leave.error} />
            <Button variant="danger" onClick={() => setConfirm(true)}>Lascia il viaggio</Button>
          </>
        )}
      </div>
      <Modal open={confirm} title="Lasciare il viaggio?" onClose={() => setConfirm(false)}>
        <p className="muted">Non vedrai più il viaggio. Puoi rientrare con il codice invito e ritroverai i tuoi dati.</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>Annulla</Button>
          <Button variant="danger" onClick={() => { setConfirm(false); leave.mutate(me.id, { onSuccess: () => navigate('/trips') }) }}>Conferma</Button>
        </div>
      </Modal>
    </section>
  )
}
