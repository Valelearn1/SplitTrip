import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { PlaceInput } from '../../shared/ui/PlaceInput'
import { currencyLabel, TRAVEL_CURRENCIES } from '../../shared/utils/currencies'
import { useAuth } from '../auth/useAuth'
import { tripSchema, type TripForm } from './tripSchema'
import { useCreateTrip } from './useTrips'

export function NewTripPage() {
  const navigate = useNavigate()
  const create = useCreateTrip()
  const { auth } = useAuth()
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: { currency: auth?.user.preferredCurrency ?? 'EUR' }, // valuta predefinita dal Profilo (D-48)
  })
  const [latitude, longitude] = useWatch({ control, name: ['latitude', 'longitude'] })

  return (
    <section>
      <h1>Nuovo viaggio</h1>
      <form noValidate onSubmit={handleSubmit((values) => create.mutate(values, { onSuccess: (trip) => navigate(`/trips/${trip.id}/benvenuto`) }))}>
        <Field label="Nome del viaggio" placeholder="Es. Roma 2026" error={errors.name?.message} {...register('name')} />
        <Controller control={control} name="destination" render={({ field }) => (
          <PlaceInput id="trip-destination" label="Destinazione" placeholder="Es. Lisbona" error={errors.destination?.message}
            hint="Scrivi almeno 3 lettere e scegli una proposta: il meteo sarà più preciso"
            value={{ name: field.value ?? '', latitude, longitude }}
            onChange={(v) => { field.onChange(v.name); setValue('latitude', v.latitude); setValue('longitude', v.longitude) }} />
        )} />
        <Field label="Partenza" type="date" error={errors.startDate?.message} {...register('startDate')} />
        <Field label="Ritorno" type="date" error={errors.endDate?.message} {...register('endDate')} />
        <div className="field">
          <label htmlFor="trip-currency">Valuta</label>
          <select id="trip-currency" className="select" {...register('currency')}>
            {TRAVEL_CURRENCIES.map((c) => <option key={c} value={c}>{currencyLabel(c)}</option>)}
          </select>
          <small className="muted">Non si può cambiare dopo: tutte le spese del viaggio sono in questa valuta.</small>
          {errors.currency && <p className="field-error">{errors.currency.message}</p>}
        </div>
        <FormError error={create.error} />
        <Button type="submit" loading={create.isPending}>Crea viaggio</Button>
      </form>
    </section>
  )
}
