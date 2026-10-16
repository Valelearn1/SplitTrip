import { useEffect, useState } from 'react'
import { apiBlob } from '../../shared/api/client'
import { Button } from '../../shared/ui/Button'
import { Icon } from '../../shared/ui/Icon'
import { drawStory, STORY_H, STORY_W, type StoryData } from './storyCanvas'

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'viaggio'

type Made = { url: string; file: File }

/** Crea nel browser il PNG 1080×1920 per le storie (D-56) e lo condivide o lo scarica. Nessun dato inviato al server. */
export function StoryImage({ data, coverPath }: { data: StoryData; coverPath: string | null }) {
  const [made, setMade] = useState<Made | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => () => { if (made) URL.revokeObjectURL(made.url) }, [made])

  async function create() {
    setBusy(true)
    setFailed(false)
    try {
      await document.fonts?.ready                 // DM Sans caricato, o il canvas userebbe il font di sistema
      let cover: ImageBitmap | undefined
      if (coverPath) {
        try { cover = await createImageBitmap(await apiBlob(coverPath)) } catch { /* senza foto: il gradiente */ }
      }
      const canvas = document.createElement('canvas')
      canvas.width = STORY_W
      canvas.height = STORY_H
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas non disponibile')
      drawStory(ctx, data, cover)
      cover?.close()
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('immagine non creata')
      setMade({ url: URL.createObjectURL(blob), file: new File([blob], `splittrip-${slug(data.name)}.png`, { type: 'image/png' }) })
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  const canShare = made !== null && navigator.canShare?.({ files: [made.file] }) === true
  return (
    <div className="story-image">
      {made ? (
        <>
          <img src={made.url} alt="Anteprima dell'immagine per le storie" className="story-preview" />
          <div className="actions">
            {canShare
              ? <Button onClick={() => navigator.share({ files: [made.file], title: data.name }).catch(() => { /* condivisione annullata */ })}><Icon name="ios_share" />Condividi</Button>
              : <a className="btn btn-primary" href={made.url} download={made.file.name}><Icon name="download" />Scarica</a>}
          </div>
        </>
      ) : (
        <Button onClick={create} loading={busy}><Icon name="ios_share" />Crea l'immagine per le storie</Button>
      )}
      {failed && <p role="alert" className="field-error"><Icon name="error" />Non è stato possibile creare l'immagine. Riprova.</p>}
      <small className="muted">Contiene solo il totale del gruppo e i badge: nessun saldo personale.</small>
    </div>
  )
}
