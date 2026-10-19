import { useState } from 'react'
import { Link, useOutletContext } from 'react-router'
import { CATEGORY_LABELS, type Expense, type ExpenseCategory } from '../../shared/api/types'
import { CATEGORY_ICONS } from '../../shared/ui/categoryIcons'
import { EmptyState } from '../../shared/ui/EmptyState'
import { useOnline } from '../pwa/useOnline'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Spinner } from '../../shared/ui/Spinner'
import { formatDate } from '../../shared/utils/format'
import { WhoPays } from '../games/WhoPays'
import type { TripContext } from '../trips/TripLayout'
import { ExpenseRow } from './ExpenseRow'
import { useExpenses } from './useExpenses'

export function ExpensesPage() {
  const { trip, me, isOrganizer, canWrite } = useOutletContext<TripContext>()
  const online = useOnline()
  const [category, setCategory] = useState<ExpenseCategory | undefined>()
  const [wheel, setWheel] = useState(false)
  const { data, isPending, error } = useExpenses(trip.id, category)

  const byDay = new Map<string, Expense[]>()
  for (const e of data ?? []) {
    byDay.set(e.date, [...(byDay.get(e.date) ?? []), e])
  }

  return (
    <div>
      {canWrite && (
        <div className="list-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWheel(true)}><Icon name="casino" />Chi offre?</button>
        </div>
      )}
      <div className="chips chips-scroll" role="group" aria-label="Filtra per categoria">
        <button type="button" className={`chip ${!category ? 'active' : ''}`} onClick={() => setCategory(undefined)}>Tutte</button>
        {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((c) => (
          <button key={c} type="button" className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            <Icon name={CATEGORY_ICONS[c]} />{CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      {isPending && <Spinner />}
      <FormError error={error} />
      {data?.length === 0 && (
        <EmptyState title="Nessuna spesa" icon="receipt_long">
          <p className="muted">{category ? 'Nessuna spesa in questa categoria.' : 'Qui compariranno le spese del viaggio.'}</p>
          {canWrite && !category && <Link to="new" className="btn btn-primary">Aggiungi la prima spesa</Link>}
        </EmptyState>
      )}
      {[...byDay.entries()].map(([day, items]) => (
        <section key={day} className="day-group">
          <h3>{formatDate(day)}</h3>
          <div className="card" style={{ padding: '4px 16px' }}>
            {items.map((e) => <ExpenseRow key={e.id} expense={e} currency={trip.currency} meId={me.id} />)}
          </div>
        </section>
      ))}
      {isOrganizer && <p style={{ marginTop: 16 }}><Link to="trash" className="btn btn-secondary btn-sm"><Icon name="delete" />Cestino</Link></p>}
      {canWrite && (online
        ? <Link to="new" className="fab" aria-label="Nuova spesa"><Icon name="add" /></Link>
        : <Link to="new" className="fab" aria-label="Nuova spesa (serve la rete)" aria-disabled="true" title="Serve la rete" onClick={(e) => e.preventDefault()}><Icon name="add" /></Link>)}
      {wheel && <WhoPays trip={trip} me={me} open onClose={() => setWheel(false)} />}
    </div>
  )
}
