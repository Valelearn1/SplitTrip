import { useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { AmountField } from '../../shared/ui/AmountField'
import { FormError } from '../../shared/ui/FormError'
import { Icon } from '../../shared/ui/Icon'
import { isOverMax, maxMessage, parseCents } from '../expenses/expenseSchema'

type Props = { currency: string; pending: boolean; error: unknown; onGuess: (amount: number) => void; onSkip: () => void }

/** «Indovina il totale» (D-54): un'ipotesi a testa prima di vedere i numeri; si può saltare. */
export function GuessGate({ currency, pending, error, onGuess, onSkip }: Props) {
  const [raw, setRaw] = useState('')
  const cents = parseCents(raw, currency)
  const valid = cents !== null && cents >= 0
  return (
    <section className="card wrapped-gate">
      <Icon name="casino" />
      <h1>Indovina il totale</h1>
      <p className="muted">Prima di vedere i numeri: quanto avete speso? Chi ci va più vicino vince la gloria.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (valid) onGuess(cents / 100) }}>
        <AmountField label="Quanto pensate di aver speso in tutto?" className="amount-input" currency={currency} value={raw} onChange={(e) => setRaw(e.target.value)}
          error={isOverMax(raw, currency) ? maxMessage(currency) : undefined} />
        <FormError error={error} />
        <div className="actions">
          <Button type="submit" disabled={!valid} loading={pending}>Scommetto!</Button>
          <Button type="button" variant="secondary" onClick={onSkip}>Salta e guarda i numeri</Button>
        </div>
      </form>
    </section>
  )
}
