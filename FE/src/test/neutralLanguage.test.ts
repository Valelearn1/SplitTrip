import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { expect, it } from 'vitest'

// D-64: i testi dell'app non si accordano col genere di chi legge. Si guarda il codice senza commenti
// (stringhe e JSX); i nomi nel codice sono in inglese (isOrganizer) e non c'entrano.
const SRC = join(process.cwd(), 'src')
const FORBIDDEN: [string, RegExp][] = [
  ['Bentornata/o', /\bBentornat[oa]\b/],
  ['Benvenuta/o + luogo', /\bBenvenut[oa]\s+(su|in|a)\b/],
  ["l'organizzatore", /\b[lL]['’]organizzatore\b/],
  ['organizzatore', /\borganizzatore\b/i],
  ['gli altri', /\bgli altri\b/i],
  ['sicuro/a?', /\bsicur[oa]\?/i],
  ['sei stato/a', /\bsei stat[oa]\b/i],
  ['amici', /\bamici\b/i],
  ['tutti', /\btutti\b/i],
  ['sono nuovo/a', /\bsono nuov[oa]\b/i],
  ['te stesso/a', /\bte stess[oa]\b/i],
]
/** Eccezioni motivate: file (relativo a src), testo esatto, perché. */
const ALLOWED: { file: string; text: string; why: string }[] = []

const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name)
  if (statSync(path).isDirectory()) return name === 'test' ? [] : files(path)
  return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
})
// un commento tolto lascia i suoi a capo: il numero di riga nell'errore resta quello del file
export const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, '')).replace(/(^|[^:])\/\/.*$/gm, '$1')

it('nessun testo dell\'app si accorda col genere di chi legge', () => {
  const found: string[] = []
  for (const path of files(SRC)) {
    const file = relative(SRC, path)
    stripComments(readFileSync(path, 'utf8')).split('\n').forEach((line, i) => {
      for (const [name, re] of FORBIDDEN) {
        if (re.test(line) && !ALLOWED.some((a) => a.file === file && line.includes(a.text))) found.push(`${file}:${i + 1} «${name}»: ${line.trim()}`)
      }
    })
  }
  expect(found, `testi con genere:\n${found.join('\n')}`).toEqual([])
})

it('i commenti e gli URL non contano: solo il testo', () => {
  expect(stripComments("// l'organizzatore\nconst a = 'ok' /* tutti */")).not.toMatch(/organizzatore|tutti/)
  expect(stripComments("const u = 'https://tutti.example'")).toContain('tutti')
})

it('togliendo un commento su più righe i numeri di riga restano quelli veri', () => {
  const src = 'const a = 1\n/* riga uno\nriga due */\nconst t = "tutti"'
  expect(stripComments(src).split('\n').findIndex((l) => l.includes('tutti')) + 1).toBe(4)
})
