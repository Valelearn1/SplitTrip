import { useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { CATEGORY_LABELS, type Expense, type ExpenseCategory } from '../../shared/api/types'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { Spinner } from '../../shared/ui/Spinner'
import { formatDate } from '../../shared/utils/format'
import type { TripContext } from '../trips/TripLayout'
import { ExpenseRow } from './ExpenseRow'
import { useExpenses } from './useExpenses'

export function ExpensesPage() {
  const { trip, isOrganizer, canWrite } = useOutletContext<TripContext>()
  const [category, setCategory] = useState<ExpenseCategory | undefined>()
  const { data, isPending, error } = useExpenses(trip.id, category)

  const byDay = new Map<string, Expense[]>()
  for (const e of data ?? []) {
    byDay.set(e.date, [...(byDay.get(e.date) ?? []), e])
  }

  return (
    <div>
      <div className="chips" role="group" aria-label="Filtra per categoria">
        <button type="button" className={`chip ${!category ? 'active' : ''}`} onClick={() => setCategory(undefined)}>Tutte</button>
        {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
          <button key={c} type="button" className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{CATEGORY_LABELS[c]}</button>
        ))}
      </div>
      {isPending && <Spinner />}
      <FormError error={error} />
      {data?.length === 0 && (
        <EmptyState title="Nessuna spesa">
          {canWrite && <Link to="new" className="btn btn-primary">Aggiungi la prima spesa</Link>}
        </EmptyState>
      )}
      {[...byDay.entries()].map(([day, items]) => (
        <section key={day} className="day-group">
          <h3 className="muted">{formatDate(day)}</h3>
          {items.map((e) => <ExpenseRow key={e.id} expense={e} currency={trip.currency} />)}
        </section>
      ))}
      {isOrganizer && <p><Link to="trash" className="muted">Cestino</Link></p>}
      {canWrite && <Link to="new" className="fab" aria-label="Nuova spesa">+</Link>}
    </div>
  )
}
