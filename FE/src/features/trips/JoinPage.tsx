import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { FormError } from '../../shared/ui/FormError'
import { formatDateRange } from '../../shared/utils/format'
import { tripsApi } from './tripsApi'
import { useJoinTrip } from './useTrips'

/** Gestisce sia /join (campo codice) sia /join/:code (da link condiviso). */
export function JoinPage() {
  const params = useParams<{ code?: string }>()
  const navigate = useNavigate()
  const [code, setCode] = useState(params.code ?? '')
  // '' = sono nuovo; altrimenti l'id del posto senza account che rivendico (D-32)
  const [claim, setClaim] = useState('')
  const normalized = code.trim().toUpperCase()
  const preview = useQuery({
    queryKey: ['join-preview', normalized],
    queryFn: () => tripsApi.joinPreview(normalized),
    enabled: normalized.length === 9,
    retry: false,
  })
  const join = useJoinTrip()

  return (
    <section>
      <h1>Entra in un viaggio</h1>
      <Field label="Codice invito" placeholder="ROMA-7K2P" value={code} onChange={(e) => { setCode(e.target.value); setClaim('') }} autoCapitalize="characters" />
      {preview.isPending && normalized.length === 9 && <p>Cerco il viaggio…</p>}
      <FormError error={preview.error} />
      {preview.data && (
        <div className="card">
          <h2>{preview.data.name}</h2>
          <p className="muted">{preview.data.destination}</p>
          <p>{formatDateRange(preview.data.startDate, preview.data.endDate)}</p>
          <p className="muted">{preview.data.memberCount} partecipanti</p>
          {preview.data.unclaimed.length > 0 && (
            <fieldset className="field">
              <legend>Qualcuno ti ha già aggiunto?</legend>
              <label className="check"><input type="radio" name="claim" value="" checked={claim === ''} onChange={() => setClaim('')} />No, sono nuovo</label>
              {preview.data.unclaimed.map((u) => (
                <label key={u.id} className="check">
                  <input type="radio" name="claim" value={u.id} checked={claim === u.id} onChange={() => setClaim(u.id)} />
                  <Avatar name={u.displayName} size="sm" />{u.displayName}
                </label>
              ))}
              <p className="muted">Scegliendo un nome ritrovi le spese già registrate a tuo nome.</p>
            </fieldset>
          )}
          <FormError error={join.error} />
          <Button loading={join.isPending} onClick={() => join.mutate({ code: normalized, participantId: claim || undefined }, { onSuccess: (trip) => navigate(`/trips/${trip.id}`) })}>
            Entra
          </Button>
        </div>
      )}
    </section>
  )
}
