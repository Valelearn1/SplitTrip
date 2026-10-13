import { describe, expect, it } from 'vitest'
import { formatDate, formatDateRange, formatMoney } from './format'

describe('format', () => {
  it('formatta i soldi in euro italiano', () => {
    // il locale it-IT raggruppa le migliaia solo da 5 cifre in su (12.345,50 ma 1234,50)
    expect(formatMoney(12345.5)).toMatch(/12\.345,50\s€/)
    expect(formatMoney(-15, 'EUR')).toMatch(/-15,00\s€/)
  })
  it('formatta le date in italiano', () => {
    expect(formatDate('2026-11-01')).toBe('1 nov 2026')
    expect(formatDateRange('2026-11-01', '2026-11-05')).toBe('1 – 5 nov 2026')
    expect(formatDateRange('2026-10-30', '2026-11-02')).toBe('30 ott – 2 nov 2026')
  })
})
