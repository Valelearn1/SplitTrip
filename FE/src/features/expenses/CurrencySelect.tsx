import { currencyLabel, TRAVEL_CURRENCIES } from '../../shared/utils/currencies'

type Props = { id: string; value: string; onChange: (code: string) => void; tripCurrency: string }

/** D-69: le 15 valute dell'app più quella del viaggio (sempre prima). */
export function CurrencySelect({ id, value, onChange, tripCurrency }: Props) {
  const codes = [tripCurrency, ...TRAVEL_CURRENCIES.filter((c) => c !== tripCurrency)]
  return (
    <div className="field currency-select">
      <label htmlFor={id}>Valuta</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {codes.map((c) => <option key={c} value={c}>{currencyLabel(c)}</option>)}
      </select>
    </div>
  )
}
