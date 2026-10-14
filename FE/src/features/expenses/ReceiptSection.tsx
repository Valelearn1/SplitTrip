import { useState } from 'react'
import { ApiError } from '../../shared/api/client'
import type { Expense } from '../../shared/api/types'
import { AuthImage } from '../../shared/ui/AuthImage'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { downscale } from '../../shared/utils/image'
import { photoPath } from '../photos/photosApi'
import { useDeletePhoto, useUploadPhoto } from '../photos/usePhotos'

type Props = { tripId: string; expense?: Expense; canEdit: boolean }

/** Scontrino della spesa (D-37): si allega dopo il salvataggio, perché serve l'id della spesa. */
export function ReceiptSection({ tripId, expense, canEdit }: Props) {
  const upload = useUploadPhoto(tripId)
  const remove = useDeletePhoto(tripId)
  const [error, setError] = useState<string | null>(null)

  async function pick(file: File | undefined, replace: boolean) {
    if (!file || !expense) return
    setError(null)
    try {
      if (replace && expense.receiptPhotoId) await remove.mutateAsync(expense.receiptPhotoId)
      await upload.mutateAsync({ file: await downscale(file), expenseId: expense.id })
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : 'Caricamento non riuscito')
    }
  }

  return (
    <section className="card" aria-labelledby="receipt-title">
      <h2 id="receipt-title">Scontrino</h2>
      {!expense && <p className="muted">Salva la spesa per allegare lo scontrino.</p>}
      {expense?.receiptPhotoId && (
        <AuthImage path={photoPath(tripId, expense.receiptPhotoId, 'thumbnail')} alt={`Scontrino di ${expense.description}`} className="receipt-thumb" />
      )}
      {expense && canEdit && (
        <div className="actions" style={{ marginTop: 8 }}>
          <label className="btn btn-secondary btn-sm file-pick">
            <Icon name="receipt_long" />{expense.receiptPhotoId ? 'Sostituisci' : 'Carica scontrino'}
            <input type="file" accept="image/*" aria-label={expense.receiptPhotoId ? 'Sostituisci lo scontrino' : 'Carica lo scontrino'}
              onChange={(e) => { void pick(e.target.files?.[0], !!expense.receiptPhotoId); e.target.value = '' }} />
          </label>
          {expense.receiptPhotoId && (
            <Button variant="secondary" className="btn-sm" loading={remove.isPending} onClick={() => remove.mutate(expense.receiptPhotoId!)}>
              <Icon name="delete" />Rimuovi
            </Button>
          )}
        </div>
      )}
      {(upload.isPending) && <p role="status" className="muted">Caricamento dello scontrino…</p>}
      {error && <p className="field-error"><Icon name="error" /><span>{error}</span></p>}
    </section>
  )
}
