import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext, useParams } from 'react-router'
import { CATEGORY_LABELS, type Expense, type ExpenseCategory } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'
import { CATEGORY_ICONS } from '../../shared/ui/categoryIcons'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { Spinner } from '../../shared/ui/Spinner'
import { formatMoney } from '../../shared/utils/format'
import { defaultBasis, presence, splitByWeight } from '../../shared/utils/split'
import type { TripContext } from '../trips/TripLayout'
import { expenseSchema, parseCents, toExpenseInput, type ExpenseForm } from './expenseSchema'
import { useCreateExpense, useDeleteExpense, useExpense, useUpdateExpense } from './useExpenses'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function toInputAmount(n: number) {
  return n.toFixed(2).replace('.', ',')
}

/** 2 → "2", 0.5 → "0,5": come lo scriverebbe una persona. */
function toInputNumber(n: number) {
  return String(n).replace('.', ',')
}

const WEIGHT_LABEL = { WEIGHT: 'Peso', NIGHTS: 'Notti', DAYS: 'Giorni' } as const

/** Stessa pagina per /expenses/new e /expenses/:expenseId/edit. */
export function ExpenseFormPage() {
  const { expenseId } = useParams<{ expenseId?: string }>()
  const ctx = useOutletContext<TripContext>()
  const existing = useExpense(ctx.trip.id, expenseId ?? '')
  if (expenseId && existing.isPending) return <Spinner />
  if (expenseId && !existing.data) return <FormError error={existing.error ?? new Error('Spesa non trovata')} />
  return <ExpenseFormInner ctx={ctx} expense={existing.data} />
}

function ExpenseFormInner({ ctx, expense }: { ctx: TripContext; expense?: Expense }) {
  const { trip, me, isOrganizer, canWrite } = ctx
  const navigate = useNavigate()
  const create = useCreateExpense(trip.id)
  const update = useUpdateExpense(trip.id, expense?.id ?? '')
  const remove = useDeleteExpense(trip.id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canEdit = canWrite && (!expense || expense.createdBy === me.userId || isOrganizer)

  const weighted = expense?.splitType === 'WEIGHT' || expense?.splitType === 'DAYS'
  // I numeri scritti a mano non vengono ricalcolati; in modifica valgono quelli salvati sulla spesa
  const [touched, setTouched] = useState<Set<number>>(() => new Set(weighted ? trip.participants.map((_, i) => i) : []))
  const [basisTouched, setBasisTouched] = useState(expense?.splitType === 'DAYS')
  const markTouched = (i: number) => setTouched((prev) => new Set(prev).add(i))

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          description: expense.description, amount: toInputAmount(expense.amount), date: expense.date,
          category: expense.category, payerId: expense.payerId, splitType: expense.splitType,
          dayBasis: expense.dayBasis ?? defaultBasis(expense.category),
          shares: trip.participants.map((p) => {
            const s = expense.shares.find((x) => x.participantId === p.id)
            return { participantId: p.id, included: !!s, amount: s ? toInputAmount(s.amount) : '',
              weight: toInputNumber(s?.weight ?? p.defaultWeight) }
          }),
        }
      : {
          description: '', amount: '', date: today(), category: 'FOOD', payerId: me.id, splitType: 'EQUAL', dayBasis: 'DAYS',
          shares: trip.participants.map((p) => ({ participantId: p.id, included: true, amount: '', weight: toInputNumber(p.defaultWeight) })),
        },
  })

  const splitType = watch('splitType')
  const shares = watch('shares')
  const amount = watch('amount')
  const category = watch('category')
  const dayBasis = watch('dayBasis')
  const isWeighted = splitType === 'WEIGHT' || splitType === 'DAYS'

  // Presenza: notti per l'alloggio, giorni per il resto, finché l'utente non sceglie (D-31)
  useEffect(() => {
    if (splitType === 'DAYS' && !basisTouched) setValue('dayBasis', defaultBasis(category))
  }, [splitType, category, basisTouched, setValue])

  // Precompila pesi o notti/giorni dal viaggio; il form propone, la spesa decide (D-33)
  useEffect(() => {
    if (splitType !== 'WEIGHT' && splitType !== 'DAYS') return
    trip.participants.forEach((p, i) => {
      if (touched.has(i)) return
      setValue(`shares.${i}.weight`, toInputNumber(splitType === 'DAYS' ? presence(trip, p, dayBasis) : p.defaultWeight))
    })
  }, [splitType, dayBasis, touched, trip, setValue])
  const includedCount = shares.filter((s) => s.included).length
  const totalCents = parseCents(amount) ?? 0
  const perHead = includedCount > 0 ? Math.floor(totalCents / includedCount) / 100 : 0
  const assigned = shares.filter((s) => s.included).reduce((sum, s) => sum + (parseCents(s.amount) ?? 0), 0)
  const remaining = (totalCents - assigned) / 100
  const preview = splitByWeight(totalCents, shares.flatMap((s) => (s.included ? [{ id: s.participantId, weight: (parseCents(s.weight) ?? 0) / 100 }] : [])))
  const weightLabel = splitType === 'DAYS' ? WEIGHT_LABEL[dayBasis] : WEIGHT_LABEL.WEIGHT

  const mutation = expense ? update : create
  const onSubmit = handleSubmit((values) =>
    mutation.mutate(toExpenseInput(values), { onSuccess: () => navigate(`/trips/${trip.id}/expenses`) }),
  )

  return (
    <form noValidate onSubmit={onSubmit} className="expense-form stack" style={{ gap: 12 }}>
      <h2>{expense ? 'Modifica spesa' : 'Nuova spesa'}</h2>

      <div className="card">
        <Field label="Importo" inputMode="decimal" placeholder="0,00" className="amount-input" suffix={trip.currency === 'EUR' ? '€' : trip.currency} error={errors.amount?.message} {...register('amount')} />
        <Field label="Descrizione" placeholder="Es. Cena in trattoria" error={errors.description?.message} {...register('description')} />
        <fieldset className="field" style={{ marginBottom: 0 }}>
          <legend>Categoria</legend>
          <div className="chips chips-scroll" style={{ marginBottom: 0 }}>
            {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
              <label key={c} className="chip"><input type="radio" value={c} {...register('category')} /><Icon name={CATEGORY_ICONS[c]} />{CATEGORY_LABELS[c]}</label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="card">
        <Field label="Data" type="date" error={errors.date?.message} {...register('date')} />
        <fieldset className="field" style={{ marginBottom: 0 }}>
          <legend>Chi ha pagato?</legend>
          <div className="people" style={{ marginBottom: 0 }}>
            {trip.participants.map((p) => (
              <label key={p.id} className="person person-pick">
                <input type="radio" value={p.id} {...register('payerId')} />
                <Avatar name={p.displayName} size="lg" />
                <span>{p.id === me.id ? 'Tu' : p.displayName.trim().split(/\s+/)[0]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="field card" style={{ marginBottom: 0 }} aria-labelledby="split-title">
        <div className="page-head" style={{ marginBottom: 8 }}>
          <h2 id="split-title">Diviso tra</h2>
          <span className="badge badge-plain">{includedCount === trip.participants.length ? `Tutti inclusi (${includedCount})` : `${includedCount} su ${trip.participants.length}`}</span>
        </div>
        <div className="chips">
          <label className="chip"><input type="radio" value="EQUAL" {...register('splitType')} /><Icon name="pie_chart" />Parti uguali</label>
          <label className="chip"><input type="radio" value="CUSTOM" {...register('splitType')} /><Icon name="tune" />Importi personalizzati</label>
          <label className="chip"><input type="radio" value="WEIGHT" {...register('splitType')} /><Icon name="scale" />Pesi</label>
          <label className="chip"><input type="radio" value="DAYS" {...register('splitType')} /><Icon name="date_range" />Presenza</label>
        </div>
        {splitType === 'DAYS' && (
          <fieldset className="field" style={{ marginBottom: 8 }}>
            <legend>Conta</legend>
            <div className="chips" style={{ marginBottom: 4 }}>
              <label className="chip"><input type="radio" value="NIGHTS" {...register('dayBasis', { onChange: () => setBasisTouched(true) })} />Notti</label>
              <label className="chip"><input type="radio" value="DAYS" {...register('dayBasis', { onChange: () => setBasisTouched(true) })} />Giorni</label>
            </div>
            <p className="muted">Le date di ognuno si impostano in Impostazioni → La mia partecipazione.</p>
          </fieldset>
        )}
        {splitType === 'EQUAL' && includedCount > 0 && totalCents > 0 && (
          <div className="info" style={{ marginBottom: 8 }}>
            <Icon name="groups" />
            <span>Quota a testa: <strong>{toInputAmount(perHead)} €</strong> a persona</span>
          </div>
        )}
        {trip.participants.map((p, i) => (
          <div key={p.id} className="row">
            <label className="check">
              <input type="checkbox" {...register(`shares.${i}.included`)} />
              <Avatar name={p.displayName} size="sm" />
              <span>{p.id === me.id ? 'Tu (io)' : p.displayName}</span>
            </label>
            {isWeighted && shares[i]?.included && (
              <span className="row-side">
                <input aria-label={`${weightLabel} di ${p.displayName}`} inputMode="decimal" className="share-input weight-input"
                  {...register(`shares.${i}.weight`, { onChange: () => markTouched(i) })} />
                <small className="muted" style={{ display: 'block' }}>{formatMoney((preview.get(p.id) ?? 0) / 100, trip.currency)}</small>
              </span>
            )}
            {splitType === 'CUSTOM' && shares[i]?.included && (
              <input aria-label={`Quota di ${p.displayName}`} inputMode="decimal" placeholder="0,00" className="share-input" {...register(`shares.${i}.amount`)} />
            )}
          </div>
        ))}
        {splitType === 'CUSTOM' && (
          <p className={remaining === 0 ? 'muted' : 'field-error'} style={{ marginTop: 8 }}>
            {remaining !== 0 && <Icon name="error" />}
            <span>Resta da assegnare: {toInputAmount(remaining)} €</span>
          </p>
        )}
        {errors.shares?.message && <p className="field-error"><Icon name="error" /><span>{errors.shares.message}</span></p>}
        {errors.shares?.root?.message && <p className="field-error"><Icon name="error" /><span>{errors.shares.root.message}</span></p>}
      </fieldset>

      <FormError error={mutation.error} />
      {canEdit ? (
        <div className="actions">
          {expense && <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}><Icon name="delete" />Elimina</Button>}
          <Button type="submit" loading={mutation.isPending}><Icon name="save" />Salva{totalCents > 0 && <span className="echo" aria-hidden="true">· {toInputAmount(totalCents / 100)} €</span>}</Button>
        </div>
      ) : (
        <p className="muted">Puoi solo consultare questa spesa.</p>
      )}

      <Modal open={confirmDelete} title="Eliminare la spesa?" onClose={() => setConfirmDelete(false)}>
        <p className="muted">L'organizzatore potrà ripristinarla dal cestino.</p>
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)}>Annulla</Button>
          <Button type="button" variant="danger" loading={remove.isPending}
            onClick={() => expense && remove.mutate(expense.id, { onSuccess: () => navigate(`/trips/${trip.id}/expenses`) })}>
            Elimina
          </Button>
        </div>
      </Modal>
    </form>
  )
}
