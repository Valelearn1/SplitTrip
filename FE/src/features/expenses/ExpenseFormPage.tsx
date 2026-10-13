import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext, useParams } from 'react-router'
import { CATEGORY_LABELS, type Expense, type ExpenseCategory } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { Modal } from '../../shared/ui/Modal'
import { Spinner } from '../../shared/ui/Spinner'
import type { TripContext } from '../trips/TripLayout'
import { expenseSchema, parseCents, toExpenseInput, type ExpenseForm } from './expenseSchema'
import { useCreateExpense, useDeleteExpense, useExpense, useUpdateExpense } from './useExpenses'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function toInputAmount(n: number) {
  return n.toFixed(2).replace('.', ',')
}

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

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          description: expense.description, amount: toInputAmount(expense.amount), date: expense.date,
          category: expense.category, payerId: expense.payerId, splitType: expense.splitType,
          shares: trip.members.map((m) => {
            const s = expense.shares.find((x) => x.userId === m.userId)
            return { userId: m.userId, included: !!s, amount: s ? toInputAmount(s.amount) : '' }
          }),
        }
      : {
          description: '', amount: '', date: today(), category: 'FOOD', payerId: me.userId, splitType: 'EQUAL',
          shares: trip.members.map((m) => ({ userId: m.userId, included: true, amount: '' })),
        },
  })

  const splitType = watch('splitType')
  const shares = watch('shares')
  const amount = watch('amount')
  const assigned = shares.filter((s) => s.included).reduce((sum, s) => sum + (parseCents(s.amount) ?? 0), 0)
  const remaining = ((parseCents(amount) ?? 0) - assigned) / 100

  const mutation = expense ? update : create
  const onSubmit = handleSubmit((values) =>
    mutation.mutate(toExpenseInput(values), { onSuccess: () => navigate(`/trips/${trip.id}/expenses`) }),
  )

  return (
    <form noValidate onSubmit={onSubmit} className="expense-form">
      <h2>{expense ? 'Modifica spesa' : 'Nuova spesa'}</h2>
      <Field label="Importo" inputMode="decimal" placeholder="0,00" className="amount-input" error={errors.amount?.message} {...register('amount')} />
      <Field label="Descrizione" placeholder="Es. Cena in trattoria" error={errors.description?.message} {...register('description')} />
      <div className="field">
        <label htmlFor="category">Categoria</label>
        <select id="category" {...register('category')}>
          {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>
      <Field label="Data" type="date" error={errors.date?.message} {...register('date')} />
      <div className="field">
        <label htmlFor="payerId">Chi ha pagato</label>
        <select id="payerId" {...register('payerId')}>
          {trip.members.map((m) => <option key={m.userId} value={m.userId}>{m.displayName}{m.userId === me.userId ? ' (io)' : ''}</option>)}
        </select>
      </div>

      <fieldset className="field">
        <legend>Diviso tra</legend>
        <div className="chips">
          <label className="chip"><input type="radio" value="EQUAL" {...register('splitType')} /> Parti uguali</label>
          <label className="chip"><input type="radio" value="CUSTOM" {...register('splitType')} /> Importi personalizzati</label>
        </div>
        {trip.members.map((m, i) => (
          <div key={m.userId} className="row">
            <label>
              <input type="checkbox" {...register(`shares.${i}.included`)} /> {m.displayName}
            </label>
            {splitType === 'CUSTOM' && shares[i]?.included && (
              <input aria-label={`Quota di ${m.displayName}`} inputMode="decimal" placeholder="0,00" className="share-input" {...register(`shares.${i}.amount`)} />
            )}
          </div>
        ))}
        {splitType === 'CUSTOM' && <p className={remaining === 0 ? 'muted' : 'field-error'}>Resta da assegnare: {toInputAmount(remaining)} €</p>}
        {errors.shares?.message && <p className="field-error">{errors.shares.message}</p>}
        {errors.shares?.root?.message && <p className="field-error">{errors.shares.root.message}</p>}
      </fieldset>

      <FormError error={mutation.error} />
      {canEdit ? (
        <div className="modal-actions">
          {expense && <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>Elimina</Button>}
          <Button type="submit" loading={mutation.isPending}>Salva</Button>
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
