import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router'
import { STATUS_LABELS, type Participant, type TripStatus } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { Modal } from '../../shared/ui/Modal'
import { ParticipantForm } from './ParticipantForm'
import { ParticipantsList } from './ParticipantsList'
import type { TripContext } from './TripLayout'
import { tripSchema, type TripForm } from './tripSchema'
import { useAddParticipant, useDeleteTrip, useLeaveTrip, useRegenerateCode, useUnlinkParticipant, useUpdateTrip } from './useTrips'

const NEXT_STATUS: Record<TripStatus, TripStatus | null> = { PLANNING: 'ONGOING', ONGOING: 'CLOSED', CLOSED: null }

type Confirm =
  | { kind: 'member'; member: Participant }
  | { kind: 'unlink'; member: Participant }
  | { kind: 'leave' }
  | { kind: 'status' }
  | { kind: 'delete' }
  | null

function confirmTitle(confirm: Confirm): string {
  switch (confirm?.kind) {
    case 'member': return `Rimuovere ${confirm.member.displayName}?`
    case 'unlink': return `Scollegare l'account di ${confirm.member.displayName}?`
    case 'leave': return 'Lasciare il viaggio?'
    case 'delete': return 'Eliminare il viaggio?'
    default: return 'Cambiare stato?'
  }
}

function confirmText(confirm: Confirm, closing: boolean): string {
  switch (confirm?.kind) {
    case 'delete': return 'Operazione irreversibile.'
    case 'unlink': return 'Perderà l\'accesso al viaggio; le sue spese e i suoi rimborsi restano. Potrà rientrare scegliendo il suo nome col codice invito.'
    case 'leave': return 'Non vedrai più il viaggio. Puoi rientrare con il codice invito e ritroverai i tuoi dati.'
    case 'status': return closing ? 'Non si potranno più aggiungere spese.' : 'Confermi?'
    default: return 'Confermi?'
  }
}

export function TripSettingsPage() {
  const { trip, me, isOrganizer, canWrite } = useOutletContext<TripContext>()
  const navigate = useNavigate()
  const update = useUpdateTrip(trip.id)
  const regenerate = useRegenerateCode(trip.id)
  const leave = useLeaveTrip(trip.id)
  const unlink = useUnlinkParticipant(trip.id)
  const add = useAddParticipant(trip.id)
  const deleteTrip = useDeleteTrip()
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [editing, setEditing] = useState<Participant | null>(null)
  const [newName, setNewName] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: { name: trip.name, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, currency: trip.currency },
  })
  const next = NEXT_STATUS[trip.status]

  function confirmAction() {
    if (confirm?.kind === 'member') leave.mutate(confirm.member.id)
    if (confirm?.kind === 'unlink') unlink.mutate(confirm.member.id)
    if (confirm?.kind === 'leave') leave.mutate(me.id, { onSuccess: () => navigate('/trips') })
    if (confirm?.kind === 'status' && next) update.mutate({ status: next })
    if (confirm?.kind === 'delete') deleteTrip.mutate(trip.id, { onSuccess: () => navigate('/trips') })
    setConfirm(null)
  }

  function addParticipant() {
    add.mutate({ displayName: newName.trim() }, { onSuccess: () => setNewName('') })
  }

  return (
    <div className="grid-2">
      <section className="card">
        <h2>La mia partecipazione</h2>
        <ParticipantForm tripId={trip.id} participant={me} submitLabel="Salva la mia partecipazione" />
        {!isOrganizer && (
          <>
            <FormError error={leave.error} />
            <Button variant="danger" style={{ marginTop: 12 }} onClick={() => setConfirm({ kind: 'leave' })}>Lascia il viaggio</Button>
          </>
        )}
      </section>

      {isOrganizer && (
        <>
          <section className="card">
            <h2>Partecipanti</h2>
            <FormError error={leave.error ?? unlink.error} />
            <ParticipantsList
              participants={trip.participants}
              onEdit={setEditing}
              onUnlink={(member) => setConfirm({ kind: 'unlink', member })}
              onRemove={(member) => setConfirm({ kind: 'member', member })}
            />
            {canWrite && (
              <div className="stack" style={{ marginTop: 12 }}>
                <Field label="Nome del nuovo partecipante" placeholder="Es. Nonna Pina" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <p className="muted">Per chi non usa l'app: avrà la sua quota e potrà ritrovare il suo posto se si registra.</p>
                <FormError error={add.error} />
                <Button variant="secondary" disabled={newName.trim().length < 2} loading={add.isPending} onClick={addParticipant}>Aggiungi senza account</Button>
              </div>
            )}
          </section>

          <form className="card" noValidate onSubmit={handleSubmit((v) => update.mutate({ name: v.name, destination: v.destination, startDate: v.startDate, endDate: v.endDate }))}>
            <h2>Dettagli</h2>
            <Field label="Nome" error={errors.name?.message} {...register('name')} />
            <Field label="Destinazione" error={errors.destination?.message} {...register('destination')} />
            <Field label="Partenza" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Field label="Ritorno" type="date" error={errors.endDate?.message} {...register('endDate')} />
            <FormError error={update.error} />
            <Button type="submit" loading={update.isPending}>Salva</Button>
          </form>

          <div className="card">
            <h2>Stato: {STATUS_LABELS[trip.status]}</h2>
            {next ? (
              <>
                <p className="muted">{next === 'CLOSED' ? 'Chiudere il viaggio blocca nuove spese: i saldi restano visibili.' : 'Segna il viaggio come in corso.'}</p>
                <Button variant="secondary" onClick={() => setConfirm({ kind: 'status' })}>Passa a «{STATUS_LABELS[next]}»</Button>
              </>
            ) : (
              <p className="muted">Il viaggio è chiuso.</p>
            )}
          </div>

          <div className="card">
            <h2>Codice invito</h2>
            <p className="code">{trip.inviteCode}</p>
            <Button variant="secondary" loading={regenerate.isPending} onClick={() => regenerate.mutate()}>Genera un nuovo codice</Button>
          </div>

          {trip.status === 'PLANNING' && (
            <div className="card">
              <h2>Zona pericolosa</h2>
              <FormError error={deleteTrip.error} />
              <Button variant="danger" onClick={() => setConfirm({ kind: 'delete' })}>Elimina viaggio</Button>
            </div>
          )}
        </>
      )}

      {editing && (
        <Modal open title={`Modifica ${editing.displayName}`} onClose={() => setEditing(null)}>
          <ParticipantForm tripId={trip.id} participant={editing} submitLabel="Salva" onSaved={() => setEditing(null)} />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setEditing(null)}>Chiudi</Button>
          </div>
        </Modal>
      )}

      <Modal open={confirm !== null} title={confirmTitle(confirm)} onClose={() => setConfirm(null)}>
        <p className="muted">{confirmText(confirm, next === 'CLOSED')}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Annulla</Button>
          <Button variant={confirm?.kind === 'delete' || confirm?.kind === 'leave' ? 'danger' : 'primary'} onClick={confirmAction}>Conferma</Button>
        </div>
      </Modal>
    </div>
  )
}
