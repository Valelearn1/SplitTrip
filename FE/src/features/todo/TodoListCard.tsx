import { useState } from 'react'
import type { Participant, TodoList } from '../../shared/api/types'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { Modal } from '../../shared/ui/Modal'
import { TodoItemRow } from './TodoItemRow'
import { useAddItem, useDeleteItem, useDeleteList, usePatchItem, useRenameList } from './useTodo'

type Props = { tripId: string; list: TodoList; participants: Participant[]; canWrite: boolean; onlyMineId: string | null }

export function TodoListCard({ tripId, list, participants, canWrite, onlyMineId }: Props) {
  const [text, setText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const add = useAddItem(tripId)
  const patch = usePatchItem(tripId)
  const removeItem = useDeleteItem(tripId)
  const removeList = useDeleteList(tripId)
  const rename = useRenameList(tripId)
  const items = onlyMineId ? list.items.filter((i) => i.assigneeParticipantId === onlyMineId) : list.items
  const doneCount = list.items.filter((i) => i.done).length

  function addItem() {
    const t = text.trim()
    if (!t) return
    add.mutate({ listId: list.id, text: t }, { onSuccess: () => setText('') })
  }

  return (
    <section className="card todo-card">
      <div className="page-head" style={{ marginBottom: 8 }}>
        <h3 className="todo-title"><Icon name={list.type === 'PACKING' ? 'luggage' : 'checklist'} />{list.title}</h3>
        <span className="row-actions">
          <span className="badge badge-plain">{doneCount}/{list.items.length} fatte</span>
          {canWrite && (
            <>
              <button type="button" className="btn btn-secondary btn-sm icon-btn" aria-label={`Rinomina ${list.title}`}
                onClick={() => setRenaming(list.title)}>
                <Icon name="edit" />
              </button>
              <button type="button" className="btn btn-secondary btn-sm icon-btn" aria-label={`Elimina la lista ${list.title}`} onClick={() => setConfirmDelete(true)}>
                <Icon name="delete" />
              </button>
            </>
          )}
        </span>
      </div>
      {items.length === 0 && <p className="muted">{onlyMineId ? 'Niente assegnato a te qui.' : 'Ancora nessuna voce.'}</p>}
      <ul className="list">
        {items.map((item) => (
          <TodoItemRow
            key={item.id}
            item={item}
            participants={participants}
            canEdit={canWrite}
            onToggle={() => patch.mutate({ listId: list.id, itemId: item.id, patch: { done: !item.done } })}
            onAssign={(pid) => patch.mutate({ listId: list.id, itemId: item.id, patch: pid ? { assigneeParticipantId: pid } : { clearAssignee: true } })}
            onDelete={() => removeItem.mutate({ listId: list.id, itemId: item.id })}
          />
        ))}
      </ul>
      {canWrite && (
        <form className="add-item" onSubmit={(e) => { e.preventDefault(); addItem() }}>
          <input aria-label={`Aggiungi una voce a ${list.title}`} placeholder="Aggiungi voce…" value={text} maxLength={120} onChange={(e) => setText(e.target.value)} />
          <Button type="submit" variant="secondary" className="btn-sm" loading={add.isPending} disabled={!text.trim()}><Icon name="add" />Aggiungi</Button>
        </form>
      )}
      {renaming !== null && (
        <Modal open title="Rinomina la lista" onClose={() => setRenaming(null)}>
          <form onSubmit={(e) => { e.preventDefault(); const t = renaming.trim(); if (t) rename.mutate({ listId: list.id, title: t }, { onSuccess: () => setRenaming(null) }) }}>
            <div className="field">
              <label htmlFor={`rename-${list.id}`}>Nome</label>
              <input id={`rename-${list.id}`} value={renaming} maxLength={60} onChange={(e) => setRenaming(e.target.value)} />
            </div>
            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setRenaming(null)}>Annulla</Button>
              <Button type="submit" loading={rename.isPending} disabled={!renaming.trim()}>Salva</Button>
            </div>
          </form>
        </Modal>
      )}
      <Modal open={confirmDelete} title={`Eliminare «${list.title}»?`} onClose={() => setConfirmDelete(false)}>
        <p className="muted">Verranno eliminate anche tutte le voci della lista.</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Annulla</Button>
          <Button variant="danger" loading={removeList.isPending} onClick={() => removeList.mutate(list.id, { onSuccess: () => setConfirmDelete(false) })}>Elimina</Button>
        </div>
      </Modal>
    </section>
  )
}
