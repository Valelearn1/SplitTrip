import { formatMoney } from '../utils/format'

type Props = { amount: number; currency?: string; signed?: boolean; className?: string }

/** Importo formattato; con `signed` aggiunge il segno e colora verde (positivo) o corallo (negativo). */
export function MoneyText({ amount, currency = 'EUR', signed = false, className = '' }: Props) {
  const tone = !signed || amount === 0 ? '' : amount > 0 ? 'money-positive' : 'money-negative'
  const text = signed && amount > 0 ? `+${formatMoney(amount, currency)}` : formatMoney(amount, currency)
  return <span className={`money ${tone} ${className}`}>{text}</span>
}
