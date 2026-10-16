import { useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Field } from '../../shared/ui/Field'
import { Icon } from '../../shared/ui/Icon'
import { parseCents } from '../expenses/expenseSchema'

type Props = { currency: string; pending: boolean; onGuess: (amount: number) => void; onSkip: () => void }

/** «Indovina il totale» (D-54): un'ipotesi a testa prima di vedere i numeri; si può saltare. */
export function GuessGate({ currency, pending, onGuess, onSkip }: Props) {
  const [raw, setRaw] = useState('')
  const cents = parseCents(raw)
  const valid = cents !== null && cents >= 0
  return (
    <section className="card wrapped-gate">
      <Icon name="casino" />
      <h1>Indovina il totale</h1>
      <p className="muted">Prima di vedere i numeri: quanto avete speso? Chi ci va più vicino vince la gloria.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (valid) onGuess(cents / 100) }}>
        <Field label="Quanto pensate di aver speso in tutto?" inputMode="decimal" placeholder="0,00" autoComplete="off" className="amount-input"
          suffix={currency === 'EUR' ? '€' : currency} value={raw} onChange={(e) => setRaw(e.target.value)} />
        <div className="actions">
          <Button type="submit" disabled={!valid} loading={pending}>Scommetto!</Button>
          <Button type="button" variant="secondary" onClick={onSkip}>Salta e guarda i numeri</Button>
        </div>
      </form>
    </section>
  )
}
