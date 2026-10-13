import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { parseCents } from '../expenses/expenseSchema'
import type { TripContext } from '../trips/TripLayout'
import { settlementSchema, type SettlementForm } from './settlementSchema'
import { useCreateSettlement } from './useBalances'

/** Precompilato dal bottone «Salda» tramite query string (from, to, amount). */
export function SettlementFormPage() {
  const { trip, me } = useOutletContext<TripContext>()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const create = useCreateSettlement(trip.id)
  const { register, handleSubmit, formState: { errors } } = useForm<SettlementForm>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      fromUserId: params.get('from') ?? me.userId,
      toUserId: params.get('to') ?? '',
      amount: (params.get('amount') ?? '').replace('.', ','),
      date: new Date().toISOString().slice(0, 10),
      note: '',
    },
  })

  return (
    <form noValidate className="card" onSubmit={handleSubmit((v) =>
      create.mutate(
        { fromUserId: v.fromUserId, toUserId: v.toUserId, amount: (parseCents(v.amount) ?? 0) / 100, date: v.date, note: v.note || undefined },
        { onSuccess: () => navigate(`/trips/${trip.id}/balances`) },
      ))}>
      <h2>Registra un rimborso</h2>
      <div className="field">
        <label htmlFor="fromUserId">Chi restituisce</label>
        <select id="fromUserId" {...register('fromUserId')}>
          {trip.members.map((m) => <option key={m.userId} value={m.userId}>{m.displayName}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="toUserId">Chi riceve</label>
        <select id="toUserId" {...register('toUserId')}>
          <option value="">Scegli…</option>
          {trip.members.map((m) => <option key={m.userId} value={m.userId}>{m.displayName}</option>)}
        </select>
        {errors.toUserId && <p className="field-error">{errors.toUserId.message}</p>}
      </div>
      <Field label="Importo" inputMode="decimal" error={errors.amount?.message} {...register('amount')} />
      <Field label="Data" type="date" error={errors.date?.message} {...register('date')} />
      <Field label="Nota (facoltativa)" error={errors.note?.message} {...register('note')} />
      <FormError error={create.error} />
      <Button type="submit" loading={create.isPending}>Conferma</Button>
    </form>
  )
}
