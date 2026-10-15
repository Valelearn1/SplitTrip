import { AUTH_STORAGE_KEY } from '../../features/auth/authContext'

const OLD_KEY = 'splittrip.sound' // scelta nel browser prima della v3.1: vale solo se l'account non dice niente

/** Suono dei messaggi: è una preferenza dell'account (D-48), letta dalla sessione salvata; attivo di default. */
export function isSoundOn(): boolean {
  try {
    const user = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? 'null')?.user as { chatSound?: boolean } | undefined
    if (typeof user?.chatSound === 'boolean') return user.chatSound
    return localStorage.getItem(OLD_KEY) !== 'off'
  } catch {
    return true
  }
}

let ctx: AudioContext | null = null

/**
 * Due note brevi generate dal browser (niente file da scaricare). Accompagna sempre un segnale visivo, mai da solo (spec §12.6).
 * Se il browser non permette ancora l'audio (nessun tocco sulla pagina) si resta in silenzio.
 */
export function playChime() {
  if (!isSoundOn() || typeof AudioContext === 'undefined') return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const start = ctx.currentTime
    for (const [i, freq] of [660, 880].entries()) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = start + i * 0.12
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.2)
    }
  } catch { /* audio non disponibile: resta l'avviso visivo */ }
}
