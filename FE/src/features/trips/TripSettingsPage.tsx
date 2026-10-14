import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router'
import { STATUS_LABELS, type Participant, type TripStatus } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { Modal } from '../../shared/ui/Modal'
import { ParticipantsList } from './ParticipantsList'
import type { TripContext } from './TripLayout'
import { tripSchema, type TripForm } from './tripSchema'
import { useDeleteTrip, useLeaveTrip, useRegenerateCode, useUpdateTrip } from './useTrips'

const NEXT_STATUS: Record<TripStatus, TripStatus | null> = { PLANNING: 'ONGOING', ONGOING: 'CLOSED', CLOSED: null }

type Confirm = { kind: 'member'; member: Participant } | { kind: 'status' } | { kind: 'delete' } | null

export function TripSettingsPage() {
  const { trip, isOrganizer } = useOutletContext<TripContext>()
  const navigate = useNavigate()
  const update = useUpdateTrip(trip.id)
  const regenerate = useRegenerateCode(trip.id)
  const removeMember = useLeaveTrip(trip.id)
  const deleteTrip = useDeleteTrip()
  const [confirm, setConfirm] = useState<Confirm>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: { name: trip.name, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, currency: trip.currency },
  })

  if (!isOrganizer) return <p role="alert">Solo l'organizzatore può modificare il viaggio.</p>
  const next = NEXT_STATUS[trip.status]

  function confirmAction() {
    if (confirm?.kind === 'member') removeMember.mutate(confirm.member.id)
    if (confirm?.kind === 'status' && next) update.mutate({ status: next })
    if (confirm?.kind === 'delete') deleteTrip.mutate(trip.id, { onSuccess: () => navigate('/trips') })
    setConfirm(null)
  }

  return (
    <div className="grid-2">
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

      <div className="card">
        <h2>Partecipanti</h2>
        <FormError error={removeMember.error} />
        <ParticipantsList participants={trip.participants} onRemove={(member) => setConfirm({ kind: 'member', member })} />
      </div>

      {trip.status === 'PLANNING' && (
        <div className="card">
          <h2>Zona pericolosa</h2>
          <FormError error={deleteTrip.error} />
          <Button variant="danger" onClick={() => setConfirm({ kind: 'delete' })}>Elimina viaggio</Button>
        </div>
      )}

      <Modal
        open={confirm !== null}
        title={confirm?.kind === 'member' ? `Rimuovere ${confirm.member.displayName}?` : confirm?.kind === 'delete' ? 'Eliminare il viaggio?' : 'Cambiare stato?'}
        onClose={() => setConfirm(null)}
      >
        <p className="muted">
          {confirm?.kind === 'delete' ? 'Operazione irreversibile.' : confirm?.kind === 'status' && next === 'CLOSED' ? 'Non si potranno più aggiungere spese.' : 'Confermi?'}
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Annulla</Button>
          <Button variant={confirm?.kind === 'delete' ? 'danger' : 'primary'} onClick={confirmAction}>Conferma</Button>
        </div>
      </Modal>
    </div>
  )
}
