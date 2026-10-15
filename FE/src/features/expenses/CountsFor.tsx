import { useId, useState } from 'react'
import { parseCents } from './expenseSchema'

const PRESETS = [{ value: '0,5', label: '½' }, { value: '1', label: '1' }, { value: '2', label: '2' }] as const

type Props = { legend: string; value: string; onChange: (value: string) => void; showLegend?: boolean; error?: string }

/**
 * «Conta per» (D-44): ½ un bambino, 1 una persona, 2 una coppia con un solo account; «altro» per un numero libero.
 * Sostituisce il vecchio «peso», che a parole non si capiva.
 */
export function CountsFor({ legend, value, onChange, showLegend = false, error }: Props) {
  const preset = PRESETS.find((p) => parseCents(p.value) === parseCents(value))
  const [other, setOther] = useState(!preset)
  const name = useId()
  return (
    <fieldset className="counts-for">
      <legend className={showLegend ? 'counts-legend' : 'sr-only'}>{legend}</legend>
      <div className="chips">
        {PRESETS.map((p) => (
          <label key={p.value} className="chip">
            <input type="radio" name={name} checked={!other && preset?.value === p.value} onChange={() => { setOther(false); onChange(p.value) }} />{p.label}
          </label>
        ))}
        <label className="chip"><input type="radio" name={name} checked={other} onChange={() => setOther(true)} />altro</label>
      </div>
      {other && <input aria-label={`${legend} (numero)`} placeholder="es. 2,5" inputMode="decimal" className="share-input weight-input" value={value} onChange={(e) => onChange(e.target.value)} />}
      {error && <p className="field-error"><span>{error}</span></p>}
    </fieldset>
  )
}
