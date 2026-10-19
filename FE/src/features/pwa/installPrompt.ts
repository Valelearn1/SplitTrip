type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
export type InstallMode = 'installed' | 'prompt' | 'ios' | 'menu'

/** L'evento di installazione arriva una volta, presto: lo si tiene finché il Profilo lo usa (D-63). */
export function createInstallStore() {
  let deferred: InstallEvent | null = null
  let installed = false
  let version = 0
  const listeners = new Set<() => void>()
  const emit = () => { version++; listeners.forEach((l) => l()) }
  return {
    listen(target: EventTarget) {
      target.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as InstallEvent; emit() })
      target.addEventListener('appinstalled', () => { deferred = null; installed = true; emit() })
    },
    subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l) } },
    version: () => version,
    hasPrompt: () => deferred !== null,
    installed: () => installed,
    async prompt() {
      const e = deferred
      if (!e) return
      await e.prompt()
      const { outcome } = await e.userChoice
      deferred = null
      if (outcome === 'accepted') installed = true
      emit()
    },
  }
}
export type InstallStore = ReturnType<typeof createInstallStore>
export const installStore = createInstallStore()

export function isIos(ua: string = navigator.userAgent, maxTouchPoints: number = navigator.maxTouchPoints): boolean {
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)   // l'iPad si presenta come Mac
}

export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function installMode(s: { installed: boolean; standalone: boolean; hasPrompt: boolean; ios: boolean }): InstallMode {
  if (s.installed || s.standalone) return 'installed'
  if (s.hasPrompt) return 'prompt'
  return s.ios ? 'ios' : 'menu'
}
