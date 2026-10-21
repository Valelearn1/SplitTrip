import type { ComponentProps } from 'react'
import { withAmountSanitizer } from '../utils/amount'
import { fractionDigits } from '../utils/currencies'
import { Field } from './Field'

type Props = Omit<ComponentProps<typeof Field>, 'suffix' | 'inputMode' | 'type'> & { currency: string }

/** Campo importo: solo cifre e una virgola (nessuna virgola per le valute senza centesimi, D-70); la valuta come suffisso. */
export function AmountField({ currency, ...props }: Props) {
  const digits = fractionDigits(currency)
  return <Field placeholder={digits === 0 ? '0' : '0,00'} autoComplete="off" {...withAmountSanitizer(props, digits)} inputMode={digits === 0 ? 'numeric' : 'decimal'} suffix={currency === 'EUR' ? '€' : currency} />
}
