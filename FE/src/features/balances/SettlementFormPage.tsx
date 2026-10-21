import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useOutletContext, useSearchParams } from 'react-router'
import { useGoBack } from '../../shared/navigation/useGoBack'
import { Button } from '../../shared/ui/Button'
import { AmountField } from '../../shared/ui/AmountField'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { fractionDigits } from '../../shared/utils/currencies'
import { formatMoney, localToday } from '../../shared/utils/format'
import { CurrencySelect } from '../expenses/CurrencySelect'
import { parseCents } from '../expenses/expenseSchema'
import { RateLine } from '../expenses/RateLine'
import { toFxRate } from '../expenses/useRate'
import type { TripContext } from '../trips/TripLayout'
import { settlementSchema, type SettlementForm } from './settlementSchema'
import { useCreateSettlement } from './useBalances'

/** Un importo come lo scriverebbe una persona nella sua valuta: «30,00», in yen «5335» (D-70). */
function toInput(n: number, currency: string) {
  return fractionDigits(currency) === 0 ? String(Math.round(n)) : n.toFixed(2).replace('.', ',')
}

/**
 * Precompilato dal bottone «Salda» tramite query string (from, to, amount nella valuta del viaggio). D-69: si può
 * pagare in un'altra valuta; finché l'importo è quello proposto, al cambio si converte da solo.
 */
export function SettlementFormPage() {
  const { trip, me } = useOutletContext<TripContext>()
  const [params] = useSearchParams()
  const goBack = useGoBack()
  const create = useCreateSettlement(trip.id)
  const proposed = Number(params.get('amount') ?? '')
  const [amountTouched, setAmountTouched] = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SettlementForm>({
    resolver: zodResolver(settlementSchema(trip.currency)),
    defaultValues: {
      fromParticipantId: params.get('from') ?? me.id,
      toParticipantId: params.get('to') ?? '',
      amount: (params.get('amount') ?? '').replace('.', ','),
      currency: trip.currency,
      perUnit: '',
      date: localToday(),
      note: '',
    },
  })
  const currency = watch('currency') ?? trip.currency
  const perUnit = watch('perUnit') ?? ''
  const date = watch('date')
  const amount = watch('amount')
  const foreign = currency !== trip.currency
  const setPerUnit = useCallback((v: string) => setValue('perUnit', v), [setValue])

  // l'importo proposto (nella valuta del viaggio) diventa quello nella valuta scelta, finché non lo si cambia a mano
  useEffect(() => {
    if (amountTouched || !(proposed > 0)) return
    if (!foreign) setValue('amount', toInput(proposed, currency))
    else if (toFxRate(perUnit) > 0) setValue('amount', toInput(proposed / toFxRate(perUnit), currency))
  }, [amountTouched, proposed, foreign, perUnit, currency, setValue])

  const totalCents = parseCents(amount, currency) ?? 0
  const baseCents = foreign ? Math.round(totalCents * toFxRate(perUnit)) : totalCents

  return (
    <form noValidate className="card" onSubmit={handleSubmit((v) => {
      const cur = v.currency ?? trip.currency
      create.mutate(
        { fromParticipantId: v.fromParticipantId, toParticipantId: v.toParticipantId, amount: (parseCents(v.amount, cur) ?? 0) / 100,
          currency: cur, fxRate: cur === trip.currency ? 1 : toFxRate(v.perUnit ?? ''), date: v.date, note: v.note || undefined },
        { onSuccess: () => goBack(`/trips/${trip.id}/balances`) },
      )
    })}>
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
      <AmountField label="Importo" className="amount-input" currency={currency} error={errors.amount?.message}
        {...register('amount', { onChange: () => setAmountTouched(true) })} />
      <CurrencySelect id="settlement-currency" value={currency} tripCurrency={trip.currency}
        onChange={(c) => { setValue('currency', c); setValue('perUnit', '') }} />
      {foreign && (
        <>
          <RateLine from={currency} to={trip.currency} date={date} value={perUnit} onChange={setPerUnit} error={errors.perUnit?.message} />
          {totalCents > 0 && toFxRate(perUnit) > 0 && <p className="muted amount-preview">≈ {formatMoney(baseCents / 100, trip.currency)}</p>}
        </>
      )}
      <Field label="Data" type="date" error={errors.date?.message} {...register('date')} />
      <Field label="Nota (facoltativa)" error={errors.note?.message} {...register('note')} />
      <FormError error={create.error} />
      <Button type="submit" loading={create.isPending}>Conferma</Button>
    </form>
  )
}
