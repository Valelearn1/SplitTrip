import { useState } from 'react'
import type { Participant } from '../../../shared/api/types'
import { Button } from '../../../shared/ui/Button'
import { Field } from '../../../shared/ui/Field'
import { FormError } from '../../../shared/ui/FormError'
import { Modal } from '../../../shared/ui/Modal'
import { InviteCodeBox } from '../InviteCodeBox'
import { ParticipantForm } from '../ParticipantForm'
import { ParticipantsList } from '../ParticipantsList'
import type { TripContext } from '../TripLayout'
import { useAddParticipant, useLeaveTrip, useRegenerateCode, useUnlinkParticipant } from '../useTrips'

type Confirm = { kind: 'remove' | 'unlink'; member: Participant } | null

/** Scheda Persone: codice invito e chi c'è; le azioni sulle persone sono dell'organizzatore. */
export function PeopleTab({ trip, isOrganizer, canWrite }: TripContext) {
  const regenerate = useRegenerateCode(trip.id)
  const remove = useLeaveTrip(trip.id)
  const unlink = useUnlinkParticipant(trip.id)
  const add = useAddParticipant(trip.id)
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [editing, setEditing] = useState<Participant | null>(null)
  const [newName, setNewName] = useState('')

  function confirmAction() {
    if (confirm?.kind === 'remove') remove.mutate(confirm.member.id)
    if (confirm?.kind === 'unlink') unlink.mutate(confirm.member.id)
    setConfirm(null)
  }

  return (
    <div className="stack">
      <section className="card">
        <InviteCodeBox code={trip.inviteCode} tripName={trip.name} />
        {isOrganizer && (
          <Button variant="secondary" className="btn-sm" style={{ marginTop: 12 }} loading={regenerate.isPending} onClick={() => regenerate.mutate()}>
            Genera un nuovo codice
          </Button>
        )}
      </section>

      <section className="card">
        <h2>Partecipanti</h2>
        <FormError error={remove.error ?? unlink.error} />
        <ParticipantsList
          participants={trip.participants}
          onEdit={isOrganizer ? setEditing : undefined}
          onUnlink={isOrganizer ? (member) => setConfirm({ kind: 'unlink', member }) : undefined}
          onRemove={isOrganizer ? (member) => setConfirm({ kind: 'remove', member }) : undefined}
        />
        {isOrganizer && canWrite && (
          <div className="stack" style={{ marginTop: 12 }}>
            <Field label="Nome del nuovo partecipante" placeholder="Es. Nonna Pina" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <p className="muted">Per chi non usa l’app: avrà la sua quota e potrà ritrovare il suo posto se si registra.</p>
            <FormError error={add.error} />
            <Button variant="secondary" disabled={newName.trim().length < 2} loading={add.isPending}
              onClick={() => add.mutate({ displayName: newName.trim() }, { onSuccess: () => setNewName('') })}>
              Aggiungi chi non usa l’app
            </Button>
          </div>
        )}
      </section>

      {editing && (
        <Modal open title={`Modifica ${editing.displayName}`} onClose={() => setEditing(null)}>
          <ParticipantForm tripId={trip.id} participant={editing} submitLabel="Salva" onSaved={() => setEditing(null)} />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setEditing(null)}>Chiudi</Button>
          </div>
        </Modal>
      )}

      <Modal open={confirm !== null}
        title={confirm?.kind === 'unlink' ? `Scollegare l’account di ${confirm.member.displayName}?` : `Rimuovere ${confirm?.member.displayName ?? ''}?`}
        onClose={() => setConfirm(null)}>
        <p className="muted">
          {confirm?.kind === 'unlink'
            ? 'Perderà l’accesso al viaggio; le sue spese e i suoi rimborsi restano. Potrà rientrare scegliendo il suo nome col codice invito.'
            : 'Confermi?'}
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Annulla</Button>
          <Button onClick={confirmAction}>Conferma</Button>
        </div>
      </Modal>
    </div>
  )
}
