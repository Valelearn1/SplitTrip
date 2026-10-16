export type ThemePref = 'SYSTEM' | 'LIGHT' | 'DARK'
export type Resolved = 'light' | 'dark'
export const THEME_COLOR: Record<Resolved, string> = { light: '#00685c', dark: '#0f1620' }

export function resolveTheme(pref: ThemePref | undefined, systemDark: boolean): Resolved {
  if (pref === 'DARK') return 'dark'
  if (pref === 'LIGHT') return 'light'
  return systemDark ? 'dark' : 'light'
}

/** Imposta il tema sulla pagina: i token CSS leggono data-theme, il browser il colore della barra. */
export function applyTheme(resolved: Resolved) {
  document.documentElement.dataset.theme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved])
}
