import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useOutletContext, useSearchParams } from 'react-router'
import { useGoBack } from '../../shared/navigation/useGoBack'
import { Button } from '../../shared/ui/Button'
import { AmountField } from '../../shared/ui/AmountField'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { localToday } from '../../shared/utils/format'
import { parseCents } from '../expenses/expenseSchema'
import type { TripContext } from '../trips/TripLayout'
import { settlementSchema, type SettlementForm } from './settlementSchema'
import { useCreateSettlement } from './useBalances'

/** Precompilato dal bottone «Salda» tramite query string (from, to, amount). */
export function SettlementFormPage() {
  const { trip, me } = useOutletContext<TripContext>()
  const [params] = useSearchParams()
  const goBack = useGoBack()
  const create = useCreateSettlement(trip.id)
  const { register, handleSubmit, formState: { errors } } = useForm<SettlementForm>({
    resolver: zodResolver(settlementSchema(trip.currency)),
    defaultValues: {
      fromParticipantId: params.get('from') ?? me.id,
      toParticipantId: params.get('to') ?? '',
      amount: (params.get('amount') ?? '').replace('.', ','),
      date: localToday(),
      note: '',
    },
  })

  return (
    <form noValidate className="card" onSubmit={handleSubmit((v) =>
      create.mutate(
        { fromParticipantId: v.fromParticipantId, toParticipantId: v.toParticipantId, amount: (parseCents(v.amount, trip.currency) ?? 0) / 100, date: v.date, note: v.note || undefined },
        { onSuccess: () => goBack(`/trips/${trip.id}/balances`) },
      ))}>
      <h2>Registra un rimborso</h2>
      <div className="field">
        <label htmlFor="fromParticipantId">Chi restituisce</label>
        <select id="fromParticipantId" {...register('fromParticipantId')}>
          {trip.participants.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="toParticipantId">Chi riceve</label>
        <select id="toParticipantId" {...register('toParticipantId')}>
          <option value="">Scegli…</option>
          {trip.participants.map((p) => <option key={p.id} value={p.id}>{p.displayName}</option>)}
        </select>
        {errors.toParticipantId && <p className="field-error">{errors.toParticipantId.message}</p>}
      </div>
      <AmountField label="Importo" className="amount-input" currency={trip.currency} error={errors.amount?.message} {...register('amount')} />
      <Field label="Data" type="date" error={errors.date?.message} {...register('date')} />
      <Field label="Nota (facoltativa)" error={errors.note?.message} {...register('note')} />
      <FormError error={create.error} />
      <Button type="submit" loading={create.isPending}>Conferma</Button>
    </form>
  )
}
