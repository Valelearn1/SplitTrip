import { useState } from 'react'
import { useOutletContext } from 'react-router'
import type { TodoListType } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { EmptyState } from '../../shared/ui/EmptyState'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { Spinner } from '../../shared/ui/Spinner'
import type { TripContext } from '../trips/TripLayout'
import { TodoListCard } from './TodoListCard'
import { useCreateList, useTodoLists } from './useTodo'

/** Liste condivise del viaggio (D-34): valigia del gruppo e cose da fare, con chi se ne occupa. */
export function TodoListsPage() {
  const { trip, me, canWrite } = useOutletContext<TripContext>()
  const lists = useTodoLists(trip.id)
  const create = useCreateList(trip.id)
  const [onlyMine, setOnlyMine] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<TodoListType>('PACKING')

  return (
    <div className="stack">
      <div className="page-head">
        <h2>Liste</h2>
        <label className="check"><input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />Solo quelle per me</label>
      </div>
      <p className="muted hint">Le liste sono del gruppo: le vedono e le usano tutte le persone del viaggio.</p>
      {lists.isPending && <Spinner />}
      <FormError error={lists.error} />
      {lists.data?.length === 0 && <EmptyState title="Nessuna lista" icon="luggage" />}
      <div className="grid-2">
        {lists.data?.map((l) => (
          <TodoListCard key={l.id} tripId={trip.id} list={l} participants={trip.participants} canWrite={canWrite} onlyMineId={onlyMine ? me.id : null} />
        ))}
      </div>
      {canWrite && (
        <form className="card" onSubmit={(e) => { e.preventDefault(); if (title.trim()) create.mutate({ title: title.trim(), type }, { onSuccess: () => setTitle('') }) }}>
          <h3>Nuova lista</h3>
          <div className="field">
            <label htmlFor="new-list-title">Nome</label>
            <input id="new-list-title" placeholder="Es. Da portare, Prenotazioni" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <fieldset className="field">
            <legend>Tipo</legend>
            <div className="chips">
              <label className="chip"><input type="radio" name="list-type" checked={type === 'PACKING'} onChange={() => setType('PACKING')} /><Icon name="luggage" />Da portare (insieme)</label>
              <label className="chip"><input type="radio" name="list-type" checked={type === 'GENERAL'} onChange={() => setType('GENERAL')} /><Icon name="checklist" />Da fare</label>
            </div>
          </fieldset>
          <FormError error={create.error} />
          <Button type="submit" loading={create.isPending} disabled={!title.trim()}><Icon name="add" />Crea lista</Button>
        </form>
      )}
    </div>
  )
}
