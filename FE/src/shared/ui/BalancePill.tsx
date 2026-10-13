import { Icon } from './Icon'

type Props = { net: number; person?: 'second' | 'third' }

/** Stato del saldo con freccia e testo: mai solo il colore (D-24). */
export function BalancePill({ net, person = 'second' }: Props) {
  const third = person === 'third'
  if (net > 0) {
    return (
      <span className="pill pill-positive"><Icon name="arrow_upward" /><span>{third ? 'Deve ricevere' : 'Devi ricevere'}</span></span>
    )
  }
  if (net < 0) {
    return (
      <span className="pill pill-negative"><Icon name="arrow_downward" /><span>{third ? 'Deve dare' : 'Devi dare'}</span></span>
    )
  }
  return (
    <span className="pill pill-neutral"><Icon name="check" /><span>{third ? 'In pari' : 'Sei in pari'}</span></span>
  )
}
