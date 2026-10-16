import type { ComponentProps } from 'react'
import { withAmountSanitizer } from '../utils/amount'
import { Field } from './Field'

type Props = Omit<ComponentProps<typeof Field>, 'suffix' | 'inputMode' | 'type'> & { currency: string }

/** Campo importo: solo cifre e una virgola, 2 decimali, fino a 999.999,99; la valuta come suffisso. */
export function AmountField({ currency, ...props }: Props) {
  return <Field placeholder="0,00" autoComplete="off" {...withAmountSanitizer(props)} inputMode="decimal" suffix={currency === 'EUR' ? '€' : currency} />
}
