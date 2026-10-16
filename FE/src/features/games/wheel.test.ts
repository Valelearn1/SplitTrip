import { expect, it } from 'vitest'
import { contrastRatio } from '../../shared/utils/contrast'
import { pickIndex, WHEEL_INK, wheelColors, wheelRotation } from './wheel'

it('sceglie l’indice dal numero casuale e la rotazione porta la freccia su quello spicchio', () => {
  expect(pickIndex(4, () => 0)).toBe(0)
  expect(pickIndex(4, () => 0.99)).toBe(3)
  expect(pickIndex(4, () => 0.5)).toBe(2)
  // 4 spicchi da 90°: lo spicchio 2 è centrato a 225°; 5 giri + l'angolo che lo porta in alto (freccia a 0°)
  expect(wheelRotation(2, 4)).toBe(5 * 360 + (360 - 225))
  expect(wheelRotation(0, 3)).toBe(5 * 360 + (360 - 60))
})

it.each(['spring', 'summer', 'autumn', 'winter'] as const)('la ruota di %s ha 6 pastelli diversi, e i nomi in inchiostro si leggono (AA)', (season) => {
  const colors = wheelColors(season)
  expect(new Set(colors).size).toBe(6)
  for (const c of colors) expect(contrastRatio(WHEEL_INK, c), c).toBeGreaterThanOrEqual(4.5)
})
