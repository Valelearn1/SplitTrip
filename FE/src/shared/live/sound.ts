const KEY = 'splittrip.sound'

/** Suono dei messaggi (v3.1): attivo di default, la scelta resta nel browser. */
export function isSoundOn(): boolean {
  try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
}

export function setSoundOn(on: boolean) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* storage non disponibile: resta per questa visita */ }
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
