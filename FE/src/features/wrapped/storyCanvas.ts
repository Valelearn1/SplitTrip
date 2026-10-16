import { drawLogo } from '../../shared/ui/globe'
import { formatMoney } from '../../shared/utils/format'

export type StoryData = { name: string; dates: string; total: number; perPerson: number; photos: number; messages: number; currency: string; badges: { title: string }[] }
export const STORY_W = 1080
export const STORY_H = 1920
const FONT = 'DM Sans, system-ui, sans-serif'
const MAX_W = 960
const BLEED = 40
const WHITE = '#ffffff'
const SOFT = '#c9d5ff'   // cobalto chiaro (D-58) per le etichette sul fondo scuro

/** Accorcia con «…» finché il testo sta nella larghezza (nomi di viaggio lunghissimi). */
function fit(ctx: CanvasRenderingContext2D, text: string, max = MAX_W) {
  if (ctx.measureText(text).width <= max) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > max) t = t.slice(0, -1)
  return t.trimEnd() + '…'
}

/** L'immagine per le storie (D-56): sfondo (foto sfocata o gradiente), titolo, totale, numeri, badge, firma. Solo dati del gruppo, nessun saldo personale. */
export function drawStory(ctx: CanvasRenderingContext2D, d: StoryData, cover?: CanvasImageSource & { width: number; height: number }) {
  if (cover) {
    // ritaglio 9:16 centrato, poi sfocatura e velo scuro per leggere il testo
    const ratio = STORY_W / STORY_H
    let sw = cover.width, sh = cover.height, sx = 0, sy = 0
    if (sw / sh > ratio) { sw = Math.round(sh * ratio); sx = Math.round((cover.width - sw) / 2) } else { sh = Math.round(sw / ratio); sy = Math.round((cover.height - sh) / 2) }
    // fondo pieno sotto e foto che sborda di 40 px per lato: la sfocatura ai margini non lascia trasparenze nel PNG
    ctx.fillStyle = '#0f1620'
    ctx.fillRect(0, 0, STORY_W, STORY_H)
    ctx.filter = 'blur(18px)'
    ctx.drawImage(cover, sx, sy, sw, sh, -BLEED, -BLEED, STORY_W + 2 * BLEED, STORY_H + 2 * BLEED)
    ctx.filter = 'none'
    ctx.fillStyle = 'rgba(15, 22, 32, 0.62)'
    ctx.fillRect(0, 0, STORY_W, STORY_H)
  } else {
    // cobalto → blu notte → viola notte: niente lampone, che nell'app vuol dire debito
    const g = ctx.createLinearGradient(0, 0, STORY_W, STORY_H)
    g.addColorStop(0, '#2347b8'); g.addColorStop(0.6, '#0f1620'); g.addColorStop(1, '#2a1f4d')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, STORY_W, STORY_H)
  }
  ctx.textAlign = 'center'
  const cx = STORY_W / 2
  const text = (s: string, y: number, font: string, color: string) => { ctx.font = `${font} ${FONT}`; ctx.fillStyle = color; ctx.fillText(fit(ctx, s), cx, y) }
  text(d.name, 360, '800 88px', WHITE)
  text(d.dates, 430, '500 40px', SOFT)
  text(formatMoney(d.total, d.currency), 760, '800 150px', WHITE)
  text('in tutto', 830, '500 44px', SOFT)
  // le colonne a zero non raccontano niente: restano quelle con un numero, centrate
  const cols: [string, string][] = [[formatMoney(d.perPerson, d.currency), 'a persona'],
    ...(d.photos > 0 ? [[String(d.photos), 'foto'] as [string, string]] : []), ...(d.messages > 0 ? [[String(d.messages), 'messaggi'] as [string, string]] : [])]
  cols.forEach(([value, label], i) => {
    const x = cx + (i - (cols.length - 1) / 2) * 320
    ctx.fillStyle = WHITE; ctx.font = `800 64px ${FONT}`; ctx.fillText(fit(ctx, value, 300), x, 1010)
    ctx.fillStyle = SOFT; ctx.font = `500 36px ${FONT}`; ctx.fillText(label, x, 1060)
  })
  d.badges.slice(0, 4).forEach((b, i) => text(b.title, 1240 + i * 90, '700 48px', WHITE))
  drawLogo(ctx, cx - 30, 1700, 60)
  text('SplitTrip · Dividete le spese, non gli amici.', 1830, '600 36px', WHITE)
}
