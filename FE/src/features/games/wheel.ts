import type { Season } from '../../shared/season/season'

/** Numero in [0, 1) davvero casuale: la ruota non deve essere prevedibile. */
export function cryptoRandom(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / 2 ** 32
}

export function pickIndex(count: number, random: () => number = cryptoRandom): number {
  return Math.min(count - 1, Math.floor(random() * count))
}

/** Gradi di rotazione (in senso orario) perché la freccia in alto punti al centro dello spicchio scelto, dopo `turns` giri. */
export function wheelRotation(index: number, count: number, turns = 5): number {
  const slice = 360 / count
  const center = index * slice + slice / 2
  return turns * 360 + (360 - center)
}

// Pastelli della stagione del viaggio (come lo sfondo, D-58): vicini sempre diversi, nomi in inchiostro scuro in entrambi i temi
const PALETTES: Record<Season, readonly string[]> = {
  spring: ['#ffc8d8', '#c9c2ec', '#bfe6cf', '#ffdcb5', '#c6dcff', '#f2c6ea'],   // sakura, lavanda, menta, pesca, cielo, orchidea
  summer: ['#9fdcf5', '#ffe08a', '#ffc2cf', '#a9e5c8', '#ffcf9e', '#c3d0ff'],   // mare, sole, ombrellone, menta, albicocca, pervinca
  autumn: ['#ffcf9f', '#d7c9e8', '#f2b8a0', '#cfe0b4', '#f6dc9c', '#e8c0c8'],   // pesca, prugna, terracotta, salvia, grano, rosa antico
  winter: ['#cfe4f7', '#e2d6f5', '#bfe3df', '#ffe7a8', '#c9cff0', '#f3dbe4'],   // ghiaccio, lilla, brina, finestra accesa, ardesia, rosa
}
export const WHEEL_INK = '#141c26'

export function wheelColors(season: Season): readonly string[] {
  return PALETTES[season]
}
