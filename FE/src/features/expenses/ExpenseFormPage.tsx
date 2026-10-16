import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useOutletContext, useParams } from 'react-router'
import { useGoBack } from '../../shared/navigation/useGoBack'
import { CATEGORY_LABELS, type Expense, type ExpenseCategory, type SplitType } from '../../shared/api/types'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'
import { CATEGORY_ICONS } from '../../shared/ui/categoryIcons'
import { AmountField } from '../../shared/ui/AmountField'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { Spinner } from '../../shared/ui/Spinner'
import { withAmountSanitizer } from '../../shared/utils/amount'
import { formatCount, formatMoney, localToday } from '../../shared/utils/format'
import { defaultBasis, presence, splitByWeight } from '../../shared/utils/split'
import type { TripContext } from '../trips/TripLayout'
import { CountsFor } from './CountsFor'
import { expenseSchema, parseCents, toExpenseInput, type ExpenseForm } from './expenseSchema'
import { ReceiptSection } from './ReceiptSection'
import { useCreateExpense, useDeleteExpense, useExpense, useUpdateExpense } from './useExpenses'

function toInputAmount(n: number) {
  return n.toFixed(2).replace('.', ',')
}

/** 2 → "2", 0.5 → "0,5": come lo scriverebbe una persona. */
function toInputNumber(n: number) {
  return String(n).replace('.', ',')
}

const DAYS_LABEL = { NIGHTS: 'Notti', DAYS: 'Giorni' } as const

/** Una spesa nuova già impostata da chi apre il modulo (es. «Chi offre?»): arriva in `location.state.prefill`. */
export type ExpensePrefill = { payerId: string; participantIds: string[]; category: ExpenseCategory; date: string; description?: string }

/** Stessa pagina per /expenses/new e /expenses/:expenseId/edit. */
export function ExpenseFormPage() {
  const { expenseId } = useParams<{ expenseId?: string }>()
  const ctx = useOutletContext<TripContext>()
  const existing = useExpense(ctx.trip.id, expenseId ?? '')
  const prefill = (useLocation().state as { prefill?: ExpensePrefill } | null)?.prefill
  if (expenseId && existing.isPending) return <Spinner />
  if (expenseId && !existing.data) return <FormError error={existing.error ?? new Error('Spesa non trovata')} />
  return <ExpenseFormInner ctx={ctx} expense={existing.data} prefill={expenseId ? undefined : prefill} />
}

function ExpenseFormInner({ ctx, expense, prefill }: { ctx: TripContext; expense?: Expense; prefill?: ExpensePrefill }) {
  const { trip, me, isOrganizer, canWrite } = ctx
  // dopo il salvataggio si torna da dove si era partiti, senza lasciare il modulo nella cronologia
  const goBack = useGoBack()
  const create = useCreateExpense(trip.id)
  const update = useUpdateExpense(trip.id, expense?.id ?? '')
  const remove = useDeleteExpense(trip.id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canEdit = canWrite && (!expense || expense.createdBy === me.userId || isOrganizer)

  // D-44: «Pesi» non è più un modo a sé; una spesa per peso si apre come Parti uguali con i suoi «conta per»
  const initialMode: SplitType = expense?.splitType === 'WEIGHT' ? 'EQUAL' : expense?.splitType ?? 'EQUAL'
  const keepsNumbers = !!expense && expense.splitType !== 'CUSTOM'
  // Numeri scritti a mano (o salvati sulla spesa) non vengono ricalcolati, ma solo nella modalità in cui sono nati:
  // un «conta per» non deve diventare «notti» passando a Presenza
  const [touched, setTouched] = useState<{ mode: SplitType; rows: Set<number> }>(() => ({
    mode: initialMode,
    rows: new Set(keepsNumbers ? trip.participants.flatMap((p, i) => (expense.shares.some((s) => s.participantId === p.id) ? [i] : [])) : []),
  }))
  // La scelta «conta per» si vede da sola se qualcuno conta già per più o meno di uno
  const [showCounts, setShowCounts] = useState(() =>
    expense ? expense.splitType === 'WEIGHT' : trip.participants.some((p) => p.defaultWeight !== 1))
  const [basisTouched, setBasisTouched] = useState(expense?.splitType === 'DAYS')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          description: expense.description, amount: toInputAmount(expense.amount), date: expense.date,
          category: expense.category, payerId: expense.payerId, splitType: initialMode,
          dayBasis: expense.dayBasis ?? defaultBasis(expense.category),
          shares: trip.participants.map((p) => {
            const s = expense.shares.find((x) => x.participantId === p.id)
            // una spesa in parti uguali già salvata è stata divisa contando tutti per 1
            const saved = expense.splitType === 'EQUAL' ? 1 : s?.weight
            return { participantId: p.id, included: !!s, amount: s ? toInputAmount(s.amount) : '',
              weight: toInputNumber(saved ?? p.defaultWeight) }
          }),
        }
      : {
          description: prefill?.description ?? '', amount: '', date: prefill?.date ?? localToday(), category: prefill?.category ?? 'FOOD',
          payerId: prefill?.payerId ?? me.id, splitType: 'EQUAL', dayBasis: 'DAYS',
          shares: trip.participants.map((p) => ({ participantId: p.id, included: prefill ? prefill.participantIds.includes(p.id) : true,
            amount: '', weight: toInputNumber(p.defaultWeight) })),
        },
  })

  const splitType = watch('splitType')
  const shares = watch('shares')
  const amount = watch('amount')
  const category = watch('category')
  const dayBasis = watch('dayBasis')
  const isDays = splitType === 'DAYS'
  const markTouched = (i: number) =>
    setTouched((prev) => ({ mode: splitType, rows: new Set(prev.mode === splitType ? prev.rows : []).add(i) }))

  // Presenza: notti per l'alloggio, giorni per il resto, finché l'utente non sceglie (D-31)
  useEffect(() => {
    if (splitType === 'DAYS' && !basisTouched) setValue('dayBasis', defaultBasis(category))
  }, [splitType, category, basisTouched, setValue])

  // Precompila «conta per» o notti/giorni dal viaggio; il form propone, la spesa decide (D-33)
  useEffect(() => {
    if (splitType !== 'EQUAL' && splitType !== 'DAYS') return
    const manual = touched.mode === splitType ? touched.rows : new Set<number>()
    trip.participants.forEach((p, i) => {
      if (manual.has(i)) return
      setValue(`shares.${i}.weight`, toInputNumber(splitType === 'DAYS' ? presence(trip, p, dayBasis) : p.defaultWeight))
    })
  }, [splitType, dayBasis, touched, trip, setValue])
  const includedCount = shares.filter((s) => s.included).length
  const totalCents = parseCents(amount) ?? 0
  const perHead = includedCount > 0 ? Math.floor(totalCents / includedCount) / 100 : 0
  const assigned = shares.filter((s) => s.included).reduce((sum, s) => sum + (parseCents(s.amount) ?? 0), 0)
  const remaining = (totalCents - assigned) / 100
  const preview = splitByWeight(totalCents, shares.flatMap((s) => (s.included ? [{ id: s.participantId, weight: (parseCents(s.weight) ?? 0) / 100 }] : [])))
  const daysLabel = DAYS_LABEL[dayBasis]
  const countsDiffer = splitType === 'EQUAL' && shares.some((s) => s.included && parseCents(s.weight) !== 100)
  const countsShown = splitType === 'EQUAL' && (showCounts || countsDiffer)
  const setCount = (i: number, value: string) => {
    setValue(`shares.${i}.weight`, value, { shouldValidate: true })
    markTouched(i)
  }

  const mutation = expense ? update : create
  const onSubmit = handleSubmit((values) =>
    mutation.mutate(toExpenseInput(values), { onSuccess: () => goBack(`/trips/${trip.id}/expenses`) }),
  )

  return (
    <form noValidate onSubmit={onSubmit} className="expense-form stack" style={{ gap: 12 }}>
      <h2>{expense ? 'Modifica spesa' : 'Nuova spesa'}</h2>

      <div className="card">
        <AmountField label="Importo" className="amount-input" currency={trip.currency} error={errors.amount?.message} {...register('amount')} />
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
        {splitType === 'EQUAL' && !countsDiffer && includedCount > 0 && totalCents > 0 && (
          <div className="info" style={{ marginBottom: 8 }}>
            <Icon name="groups" />
            <span>Quota a testa: <strong>{formatMoney(perHead, trip.currency)}</strong> a persona</span>
          </div>
        )}
        {splitType === 'EQUAL' && !countsShown && (
          <button type="button" className="link-button" onClick={() => setShowCounts(true)}>Qualcuno conta per più di una persona?</button>
        )}
        {countsDiffer && totalCents > 0 && (
          <div className="info counts-note" style={{ marginBottom: 8 }}>
            <Icon name="groups" />
            <span>
              {shares.flatMap((s, i) => (s.included && parseCents(s.weight) !== 100 ? [
                <span key={s.participantId} style={{ display: 'block' }}>
                  {`${trip.participants[i].displayName} conta per ${formatCount((parseCents(s.weight) ?? 0) / 100)}: ${formatMoney((preview.get(s.participantId) ?? 0) / 100, trip.currency)} invece di ${formatMoney(perHead, trip.currency)}`}
                </span>,
              ] : []))}
            </span>
          </div>
        )}
        {trip.participants.map((p, i) => (
          <div key={p.id} className={`row ${countsShown ? 'row-wrap' : ''}`}>
            <label className="check">
              <input type="checkbox" {...register(`shares.${i}.included`)} />
              <Avatar name={p.displayName} size="sm" />
              <span>{p.id === me.id ? 'Tu (io)' : p.displayName}</span>
            </label>
            {countsShown && shares[i]?.included && (
              <span className="row-side counts-side">
                <CountsFor legend={`${p.displayName} conta per`} value={shares[i].weight ?? '1'} onChange={(v) => setCount(i, v)}
                  error={errors.shares?.[i]?.weight?.message} />
                <small className="muted">{formatMoney((preview.get(p.id) ?? 0) / 100, trip.currency)}</small>
              </span>
            )}
            {isDays && shares[i]?.included && (
              <span className="row-side">
                <input aria-label={`${daysLabel} di ${p.displayName}`} inputMode="decimal" className="share-input weight-input"
                  {...register(`shares.${i}.weight`, { onChange: () => markTouched(i) })} />
                <small className="muted" style={{ display: 'block' }}>{formatMoney((preview.get(p.id) ?? 0) / 100, trip.currency)}</small>
              </span>
            )}
            {splitType === 'CUSTOM' && shares[i]?.included && (
              <input aria-label={`Quota di ${p.displayName}`} inputMode="decimal" placeholder="0,00" autoComplete="off" className="share-input" {...withAmountSanitizer(register(`shares.${i}.amount`))} />
            )}
          </div>
        ))}
        {splitType === 'CUSTOM' && (
          <p className={remaining === 0 ? 'muted' : 'field-error'} style={{ marginTop: 8 }}>
            {remaining !== 0 && <Icon name="error" />}
            <span>Resta da assegnare: {formatMoney(remaining, trip.currency)}</span>
          </p>
        )}
        {errors.shares?.message && <p className="field-error"><Icon name="error" /><span>{errors.shares.message}</span></p>}
        {errors.shares?.root?.message && <p className="field-error"><Icon name="error" /><span>{errors.shares.root.message}</span></p>}
      </fieldset>

      <ReceiptSection tripId={trip.id} expense={expense} canEdit={canEdit} />

      <FormError error={mutation.error} />
      {canEdit ? (
        <div className="actions">
          {expense && <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}><Icon name="delete" />Elimina</Button>}
          <Button type="submit" loading={mutation.isPending}><Icon name="save" />Salva{totalCents > 0 && <span className="echo" aria-hidden="true">· {formatMoney(totalCents / 100, trip.currency)}</span>}</Button>
        </div>
      ) : (
        <p className="muted">Puoi solo consultare questa spesa.</p>
      )}

      <Modal open={confirmDelete} title="Eliminare la spesa?" onClose={() => setConfirmDelete(false)}>
        <p className="muted">L'organizzatore potrà ripristinarla dal cestino.</p>
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)}>Annulla</Button>
          <Button type="button" variant="danger" loading={remove.isPending}
            onClick={() => expense && remove.mutate(expense.id, { onSuccess: () => goBack(`/trips/${trip.id}/expenses`) })}>
            Elimina
          </Button>
        </div>
      </Modal>
    </form>
  )
}
