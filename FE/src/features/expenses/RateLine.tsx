import { useEffect, useId, useState } from 'react'
import { ApiError } from '../../shared/api/client'
import { Icon } from '../../shared/ui/Icon'
import { formatDayMonth } from '../../shared/utils/format'
import { useOnline } from '../pwa/useOnline'
import { fromFxRate, useRate } from './useRate'

type Props = { from: string; to: string; date: string; value: string; onChange: (perUnit: string) => void; error?: string; saved?: number }

/**
 * D-69: «Cambio del 16 ott (BCE): 1 € = 177,82 JPY» con «Modifica»; se il cambio manca o si è offline, il campo a mano.
 * `value` è quanti `from` vale 1 unità di `to` (il numero che si conosce); `saved` è un cambio già sulla spesa (modifica).
 */
export function RateLine({ from, to, date, value, onChange, error, saved }: Props) {
  const online = useOnline()
  const errorId = useId()
  const [manual, setManual] = useState(saved !== undefined)
  const rate = useRate(from, to, date, online && saved === undefined)
  const symbol = to === 'EUR' ? '€' : to
  useEffect(() => { if (rate.data) onChange(fromFxRate(rate.data.rate)) }, [rate.data, onChange])
  useEffect(() => { if (saved !== undefined) onChange(fromFxRate(saved)) }, [saved, onChange])
  const problem = rate.error instanceof ApiError ? rate.error.detail : rate.error ? 'Cambio non disponibile: scrivilo a mano' : !online && saved === undefined ? 'Senza rete il cambio si scrive a mano' : null
  const showField = manual || !!problem
  return (
    <div className="rate-line">
      {rate.isFetching && <span className="muted" aria-live="polite">Cerco il cambio…</span>}
      {!showField && rate.data && (
        <span className="muted">
          Cambio del {formatDayMonth(rate.data.date)} (BCE): 1 {symbol} = {value} {from}
          <button type="button" className="btn-link" onClick={() => setManual(true)}>Modifica</button>
        </span>
      )}
      {problem && <p className="field-error" role="status"><Icon name="info" /><span>{problem}</span></p>}
      {showField && (
        <label className="rate-field">
          <span>1 {symbol} = </span>
          <input aria-label={`1 ${symbol} = … ${from}`} inputMode="decimal" className="share-input" value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))} aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined} />
          <span>{from}</span>
        </label>
      )}
      {error && <p id={errorId} className="field-error"><Icon name="error" /><span>{error}</span></p>}
    </div>
  )
}
