import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { placesApi } from '../api/placesApi'
import type { Place, PlaceValue } from '../api/types'

export type { PlaceValue }

type Props = {
  id: string; label: string; value: PlaceValue; onChange: (v: PlaceValue) => void
  near?: { latitude: number; longitude: number }; error?: string; placeholder?: string; hint?: string
}

/**
 * Combobox dei luoghi (D-46): dalla 3ª lettera, dopo 150 ms, propone fino a 6 luoghi; scelto uno, tiene le coordinate.
 * Mentre cerca dice «Cerco luoghi…», così l'attesa della rete si vede.
 * Per la destinazione del viaggio la scelta è obbligatoria (D-60, lo controlla lo schema del modulo); se la ricerca
 * non risponde lo dice, invece di sembrare «nessun risultato».
 */
export const SEARCH_DELAY_MS = 150   // abbastanza per non cercare a ogni lettera, poco da non sentirlo

export function PlaceInput({ id, label, value, onChange, near, error, placeholder, hint }: Props) {
  const [options, setOptions] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [unavailable, setUnavailable] = useState(false)
  const [searching, setSearching] = useState(false)
  const listId = useId()
  const timer = useRef<number | null>(null)
  const lastQuery = useRef('')

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  function type(text: string) {
    onChange({ name: text }) // scrivere ancora azzera le coordinate di una scelta precedente
    if (timer.current) window.clearTimeout(timer.current)
    const q = text.trim()
    lastQuery.current = q
    if (q.length < 3) { setOptions([]); setOpen(false); setSearching(false); return }
    setSearching(true)
    timer.current = window.setTimeout(async () => {
      try {
        const found = await placesApi.search(q, near)
        if (lastQuery.current !== q) return // nel frattempo si è scritto ancora
        setOptions(found); setOpen(found.length > 0); setActive(-1); setUnavailable(false); setSearching(false)
      } catch {
        if (lastQuery.current !== q) return
        setOptions([]); setOpen(false); setUnavailable(true); setSearching(false)
      }
    }, SEARCH_DELAY_MS)
  }

  function choose(p: Place) {
    lastQuery.current = ''
    setSearching(false)
    onChange({ name: p.name, latitude: p.latitude, longitude: p.longitude })
    setOpen(false); setOptions([]); setActive(-1)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { setOpen(false); return }
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(options[active]) }
  }

  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="place-wrap">
        <input id={id} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined} aria-describedby={describedBy}
          autoComplete="off" placeholder={placeholder} value={value.name}
          onChange={(e) => type(e.target.value)} onKeyDown={onKeyDown} onBlur={() => window.setTimeout(() => setOpen(false), 150)} />
        {open && (
          <ul id={listId} role="listbox" aria-label={label} className="place-options">
            {options.map((p, i) => (
              <li key={`${p.name}-${p.latitude}-${p.longitude}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                className={i === active ? 'active' : undefined} onMouseDown={(e) => { e.preventDefault(); choose(p) }}>
                <strong>{p.name}</strong>{p.detail && <small className="muted">{p.detail}</small>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <span className={searching ? 'place-searching' : 'sr-only'} aria-live="polite">
        {searching ? 'Cerco luoghi…' : open ? `${options.length} ${options.length === 1 ? 'proposta' : 'proposte'}` : ''}
      </span>
      {hint && !error && <small id={`${id}-hint`} className="muted">{hint}</small>}
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
      {unavailable && !error && <p role="alert" className="field-error">Ricerca dei luoghi non disponibile, riprova tra poco</p>}
    </div>
  )
}
