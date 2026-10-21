import { describe, expect, it } from 'vitest'
import { countLabel, formatDate, formatDateRange, formatMoney, serverToday } from './format'

describe('format', () => {
  it('formatta i soldi in euro italiano', () => {
    // il locale it-IT raggruppa le migliaia solo da 5 cifre in su (12.345,50 ma 1234,50)
    expect(formatMoney(12345.5)).toMatch(/12\.345,50\s€/)
    expect(formatMoney(-15, 'EUR')).toMatch(/-15,00\s€/)
    expect(formatMoney(2000)).toMatch(/2\.000,00\s€/)          // D-70: il punto delle migliaia sempre, come nel server
    expect(formatMoney(2000, 'JPY')).toMatch(/2\.000\sJPY/)
    expect(formatMoney(2000, 'HUF')).toMatch(/2\.000\sHUF/)
    expect(formatMoney(999, 'EUR')).toMatch(/^999,00\s€$/)
  })
  it('formatta le date in italiano', () => {
    expect(formatDate('2026-11-01')).toBe('1 nov 2026')
    expect(formatDateRange('2026-11-01', '2026-11-05')).toBe('1 – 5 nov 2026')
    expect(formatDateRange('2026-10-30', '2026-11-02')).toBe('30 ott – 2 nov 2026')
  })
})

it('countLabel: singolare con 1, plurale altrimenti', () => {
  expect(countLabel(1, 'persona', 'persone')).toBe('1 persona')
  expect(countLabel(3, 'notte', 'notti')).toBe('3 notti')
  expect(countLabel(0, 'spesa', 'spese')).toBe('0 spese')
})

it('serverToday: la data del server (UTC), non quella locale, per non mostrare il riepilogo prima del server', () => {
  expect(serverToday(new Date('2026-10-20T23:30:00+02:00'))).toBe('2026-10-20')
  expect(serverToday(new Date('2026-10-21T01:30:00+02:00'))).toBe('2026-10-20')
})
