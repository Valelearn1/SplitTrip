import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { currencyLabel, TRAVEL_CURRENCIES } from '../../shared/utils/currencies'
import { tripSchema, type TripForm } from './tripSchema'
import { useCreateTrip } from './useTrips'

export function NewTripPage() {
  const navigate = useNavigate()
  const create = useCreateTrip()
  const { register, handleSubmit, formState: { errors } } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: { currency: 'EUR' },
  })

  return (
    <section>
      <h1>Nuovo viaggio</h1>
      <form noValidate onSubmit={handleSubmit((values) => create.mutate(values, { onSuccess: (trip) => navigate(`/trips/${trip.id}`) }))}>
        <Field label="Nome del viaggio" placeholder="Es. Roma 2026" error={errors.name?.message} {...register('name')} />
        <Field label="Destinazione" error={errors.destination?.message} {...register('destination')} />
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
