import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

export function formatMoney(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(amount)
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy', { locale: it })
}

/** «3 nov»: per le date dentro il viaggio, dove l'anno si capisce già */
export function formatDayMonth(iso: string): string {
  return format(parseISO(iso), 'd MMM', { locale: it })
}

export function formatDateRange(startIso: string, endIso: string): string {
  const start = parseISO(startIso)
  const end = parseISO(endIso)
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const startPart = format(start, sameMonth ? 'd' : 'd MMM', { locale: it })
  return `${startPart} – ${format(end, 'd MMM yyyy', { locale: it })}`
}

/** Quante persone conta qualcuno: 0,5 → «½», 2 → «2» (D-44). */
export function formatCount(n: number): string {
  return n === 0.5 ? '½' : String(n).replace('.', ',')
}

/** Oggi in ISO, col fuso di chi guarda (toISOString darebbe ancora ieri fino alle 2 di notte in Italia). */
export function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** «1 persona», «3 notti»: il singolare con 1. */
export const countLabel = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** La data di oggi come la vede il server (UTC): il riepilogo si apre quando lo dice il server, non prima. */
export const serverToday = (now: Date = new Date()) => now.toISOString().slice(0, 10)
