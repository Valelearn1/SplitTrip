import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { Participant } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { CountsFor } from '../expenses/CountsFor'
import { parseCents } from '../expenses/expenseSchema'
import { participantSchema, type ParticipantForm as Values } from './participantSchema'
import type { ParticipantPatch } from './tripsApi'
import { useUpdateParticipant } from './useTrips'

type Props = {
  tripId: string; participant: Participant; submitLabel: string; onSaved?: () => void
  /** etichetta del nome: «Il tuo nome in questo viaggio» per sé, «Nome della persona» quando chi organizza modifica qualcun altro */
  nameLabel?: string
  /** Benvenuto (D-50): senza il campo del nome, con «Salta» */
  compact?: boolean; skipLabel?: string; onSkip?: () => void
  /** date del viaggio: proposte se il partecipante non ne ha; se quelle scelte coincidono vale «tutto il viaggio» (date vuote) */
  tripStart?: string; tripEnd?: string
}

/** Nome nel viaggio, «conta per» e date di presenza: il viaggio li propone, ogni spesa può correggerli (D-33, D-44). */
export function ParticipantForm({ tripId, participant, submitLabel, onSaved, nameLabel = 'Nome della persona', compact = false, skipLabel, onSkip, tripStart, tripEnd }: Props) {
  const update = useUpdateParticipant(tripId, participant.id)
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      displayName: participant.displayName,
      defaultWeight: String(participant.defaultWeight).replace('.', ','),
      arrivalDate: participant.arrivalDate ?? tripStart ?? '',
      departureDate: participant.departureDate ?? tripEnd ?? '',
    },
  })

  const defaultWeight = useWatch({ control, name: 'defaultWeight' })

  const onSubmit = handleSubmit((v) => {
    const hadDates = participant.arrivalDate !== null || participant.departureDate !== null
    const wholeTrip = tripStart !== undefined && v.arrivalDate === tripStart && v.departureDate === tripEnd
    const body: ParticipantPatch = {
      ...(compact ? {} : { displayName: v.displayName.trim() }),
      defaultWeight: (parseCents(v.defaultWeight) ?? 100) / 100,
      arrivalDate: wholeTrip ? undefined : v.arrivalDate || undefined,
      departureDate: wholeTrip ? undefined : v.departureDate || undefined,
      // una data svuotata (o tornata a «tutto il viaggio») va azzerata esplicitamente: null nel PATCH significa «non toccare»
      ...(hadDates && (wholeTrip || !v.arrivalDate || !v.departureDate) ? { clearDates: true } : {}),
    }
    update.mutate(body, { onSuccess: () => onSaved?.() })
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      {!compact && <Field label={nameLabel} error={errors.displayName?.message} {...register('displayName')} />}
      <CountsFor legend="Conta per" showLegend value={defaultWeight} error={errors.defaultWeight?.message}
        onChange={(v) => setValue('defaultWeight', v, { shouldDirty: true, shouldValidate: true })} />
      <p className="muted hint">1 = una persona · 2 = una coppia con un solo account · ½ = un bambino · con «altro» si sommano: 2,5 = una coppia con un bambino. Vale per le spese in parti uguali; si può cambiare spesa per spesa.</p>
      <div className="grid-2">
        <Field label="Arrivo" type="date" error={errors.arrivalDate?.message} {...register('arrivalDate')} />
        <Field label="Partenza" type="date" error={errors.departureDate?.message} {...register('departureDate')} />
      </div>
      <p className="muted hint">Servono quando una spesa si divide per presenza: chi arriva dopo paga meno. Vuote = presente per tutto il viaggio.</p>
      <FormError error={update.error} />
      {update.isSuccess && <p role="status" className="money-positive">Salvato</p>}
      <div className="form-actions">
        <Button type="submit" loading={update.isPending}>{submitLabel}</Button>
        {onSkip && <Button type="button" variant="secondary" onClick={onSkip}>{skipLabel ?? 'Salta'}</Button>}
      </div>
    </form>
  )
}
