import { Link, useOutletContext } from 'react-router'
import { Button } from '../../shared/ui/Button'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { MoneyText } from '../../shared/ui/MoneyText'
import { Spinner } from '../../shared/ui/Spinner'
import { formatDate } from '../../shared/utils/format'
import type { TripContext } from '../trips/TripLayout'
import { useRestoreExpense, useTrash } from './useExpenses'

export function TrashPage() {
  const { trip, isOrganizer, canWrite } = useOutletContext<TripContext>()
  const { data, isPending, error } = useTrash(trip.id)
  const restore = useRestoreExpense(trip.id)
  if (!isOrganizer) return <p role="alert">Solo l'organizzatore vede il cestino.</p>

  return (
    <div>
      <h2>Cestino</h2>
      <p><Link to=".."><Icon name="arrow_back" className="inline-icon" /> Torna alle spese</Link></p>
      {isPending && <Spinner />}
      <FormError error={error ?? restore.error} />
      {data?.length === 0 && <EmptyState title="Il cestino è vuoto" />}
      {data?.map((e) => (
        <div key={e.id} className="row">
          <span>
            <strong>{e.description}</strong><br />
            <small className="muted">{formatDate(e.date)} · eliminata il {formatDate(e.deletedAt.slice(0, 10))}</small>
          </span>
          <span>
            <MoneyText amount={e.amount} currency={trip.currency} />{' '}
            {canWrite && <Button variant="secondary" loading={restore.isPending} onClick={() => restore.mutate(e.id)}>Ripristina</Button>}
          </span>
        </div>
      ))}
    </div>
  )
}
