import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { FormError } from '../../shared/ui/FormError'
import { Modal } from '../../shared/ui/Modal'
import { todoApi } from '../todo/todoApi'
import { usePackingSuggestions } from './useAi'

type Props = { tripId: string; listId: string; open: boolean; onClose: () => void }

/** Le proposte non si salvano finché non le spunti (D-41): si aggiungono con l'endpoint delle voci, una per volta. */
export function PackingSuggestModal({ tripId, listId, open, onClose }: Props) {
  const qc = useQueryClient()
  const suggest = usePackingSuggestions(tripId)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const { mutate } = suggest

  useEffect(() => {
    if (open) mutate(listId, { onSuccess: (d) => setChecked(new Set(d.items)) })
  }, [open, listId, mutate])

  async function addAll() {
    setAdding(true)
    setError(null)
    try {
      for (const text of suggest.data?.items.filter((i) => checked.has(i)) ?? []) await todoApi.addItem(tripId, listId, { text })
      await qc.invalidateQueries({ queryKey: ['trips', tripId, 'todo'] })
      onClose()
    } catch (e) {
      setError(e)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Modal open={open} title="Suggerimenti per la valigia" onClose={onClose}>
      {suggest.isPending && <p role="status" className="muted">Sto pensando…</p>}
      <FormError error={suggest.error ?? error} />
      {suggest.data && (
        <>
          <ul className="list">
            {suggest.data.items.map((item) => (
              <li key={item} className="row">
                <label className="check">
                  <input type="checkbox" checked={checked.has(item)}
                    onChange={(e) => setChecked((prev) => { const next = new Set(prev); if (e.target.checked) next.add(item); else next.delete(item); return next })} />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <small className="muted">Generato con AI · può contenere errori</small>
        </>
      )}
      <div className="modal-actions">
        <Button variant="secondary" onClick={onClose}>Annulla</Button>
        <Button loading={adding} disabled={checked.size === 0} onClick={() => void addAll()}>{`Aggiungi ${checked.size} voci`}</Button>
      </div>
    </Modal>
  )
}
