import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { STATUS_LABELS, type TripStatus } from '../../../shared/api/types'
import { Button } from '../../../shared/ui/Button'
import { Field } from '../../../shared/ui/Field'
import { FormError } from '../../../shared/ui/FormError'
import { Modal } from '../../../shared/ui/Modal'
import { PlaceInput } from '../../../shared/ui/PlaceInput'
import { currencyLabel } from '../../../shared/utils/currencies'
import { formatDate } from '../../../shared/utils/format'
import type { TripContext } from '../TripLayout'
import { tripSettingsSchema, type TripForm } from '../tripSchema'
import { useDeleteTrip, useUpdateTrip } from '../useTrips'

const NEXT_STATUS: Record<TripStatus, TripStatus | null> = { PLANNING: 'ONGOING', ONGOING: 'CLOSED', CLOSED: null }

/** Scheda Viaggio: l'organizzatore modifica dettagli e stato; gli altri li leggono. */
export function TripTab({ trip, isOrganizer }: TripContext) {
  if (!isOrganizer) {
    return (
      <section className="card">
        <h2>Il viaggio</h2>
        <div className="kv">
          <div><span className="muted">Nome</span><span>{trip.name}</span></div>
          <div><span className="muted">Destinazione</span><span>{trip.destination}</span></div>
          <div><span className="muted">Date</span><span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span></div>
          <div><span className="muted">Valuta</span><span>{currencyLabel(trip.currency)}</span></div>
          <div><span className="muted">Stato</span><span>{STATUS_LABELS[trip.status]}</span></div>
        </div>
        <p className="muted kv-note">Questi dati li cambia solo chi organizza il viaggio.</p>
      </section>
    )
  }
  return <OrganizerTripTab trip={trip} />
}

function OrganizerTripTab({ trip }: Pick<TripContext, 'trip'>) {
  const navigate = useNavigate()
  const update = useUpdateTrip(trip.id)
  const deleteTrip = useDeleteTrip()
  const [confirm, setConfirm] = useState<'status' | 'delete' | null>(null)
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<TripForm>({
    resolver: zodResolver(tripSettingsSchema(trip.destination)),
    defaultValues: { name: trip.name, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, currency: trip.currency,
      latitude: trip.latitude ?? undefined, longitude: trip.longitude ?? undefined },
  })
  const [latitude, longitude] = useWatch({ control, name: ['latitude', 'longitude'] })
  const next = NEXT_STATUS[trip.status]

  function confirmAction() {
    if (confirm === 'status' && next) update.mutate({ status: next })
    if (confirm === 'delete') deleteTrip.mutate(trip.id, { onSuccess: () => navigate('/trips', { replace: true }) })
    setConfirm(null)
  }

  return (
    <div className="grid-2">
      <form className="card" noValidate onSubmit={handleSubmit((v) => update.mutate({
        name: v.name, destination: v.destination, startDate: v.startDate, endDate: v.endDate,
        ...(v.latitude !== undefined ? { latitude: v.latitude, longitude: v.longitude } : {}),
      }))}>
        <h2>Dettagli</h2>
        <Field label="Nome" error={errors.name?.message} {...register('name')} />
        <Controller control={control} name="destination" render={({ field }) => (
          <PlaceInput id="settings-destination" label="Destinazione" error={errors.destination?.message}
            value={{ name: field.value ?? '', latitude, longitude }}
            onChange={(v) => { field.onChange(v.name); setValue('latitude', v.latitude); setValue('longitude', v.longitude) }} />
        )} />
        <div className="grid-2">
          <Field label="Partenza" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <Field label="Ritorno" type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>
        <p className="muted hint">Valuta: {currencyLabel(trip.currency)}. Non si può cambiare: tutte le spese sono in questa valuta.</p>
        <FormError error={update.error} />
        {update.isSuccess && <p role="status" className="money-positive">Salvato</p>}
        <Button type="submit" loading={update.isPending}>Salva</Button>
      </form>

      <div className="stack">
        <section className="card">
          <h2>Stato: {STATUS_LABELS[trip.status]}</h2>
          {next ? (
            <>
              <p className="muted">{next === 'CLOSED' ? 'Chiudere il viaggio blocca nuove spese: i saldi restano visibili.' : 'Segna il viaggio come in corso.'}</p>
              <Button variant="secondary" onClick={() => setConfirm('status')}>Passa a «{STATUS_LABELS[next]}»</Button>
            </>
          ) : (
            <p className="muted">Il viaggio è chiuso.</p>
          )}
        </section>
        {trip.status === 'PLANNING' && (
          <section className="card">
            <h2>Zona pericolosa</h2>
            <p className="muted">Si può eliminare solo finché il viaggio è in preparazione.</p>
            <FormError error={deleteTrip.error} />
            <Button variant="danger" onClick={() => setConfirm('delete')}>Elimina viaggio</Button>
          </section>
        )}
      </div>

      <Modal open={confirm !== null} title={confirm === 'delete' ? 'Eliminare il viaggio?' : 'Cambiare stato?'} onClose={() => setConfirm(null)}>
        <p className="muted">{confirm === 'delete' ? 'Operazione irreversibile.' : next === 'CLOSED' ? 'Non si potranno più aggiungere spese.' : 'Confermi?'}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Annulla</Button>
          <Button variant={confirm === 'delete' ? 'danger' : 'primary'} onClick={confirmAction}>Conferma</Button>
        </div>
      </Modal>
    </div>
  )
}
