import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

export function formatMoney(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(amount)
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy', { locale: it })
}

export function formatDateRange(startIso: string, endIso: string): string {
  const start = parseISO(startIso)
  const end = parseISO(endIso)
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const startPart = format(start, sameMonth ? 'd' : 'd MMM', { locale: it })
  return `${startPart} – ${format(end, 'd MMM yyyy', { locale: it })}`
}
