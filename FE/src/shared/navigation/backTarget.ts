// Sotto-pagine dei moduli che tornano alla loro lista, non alla panoramica
const FORM_PARENT: [RegExp, string][] = [
  [/^\/trips\/([^/]+)\/expenses\/.+$/, '/trips/$1/expenses'],       // nuova, modifica, cestino
  [/^\/trips\/([^/]+)\/settlements\/.+$/, '/trips/$1/balances'],    // nuovo rimborso
]

/** La pagina «madre» logica: dove porta «Indietro» quando la pagina è stata aperta da un link diretto o ricaricata. */
export function parentOf(pathname: string): string {
  const path = pathname.replace(/\/+$/, '') || '/'
  for (const [re, to] of FORM_PARENT) if (re.test(path)) return path.replace(re, to)
  const section = path.match(/^\/trips\/([^/]+)\/[^/]+$/)
  if (section && section[1] !== 'new') return `/trips/${section[1]}`
  return '/trips'
}
