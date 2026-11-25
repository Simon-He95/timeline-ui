// Shared environment for Gentleface's native SMIL glyphs. One media-query and
// one visibility listener serve every glyph instance; the component only
// pauses/resumes its own SVG.
const listeners = new Set<() => void>()
let initialized = false
let reducedMotion = false
let documentVisible = true

function notify(): void {
  for (const listener of listeners) listener()
}

function ensureInitialized(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  if (typeof window.matchMedia === 'function') {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion = query.matches
    const onChange = (event: MediaQueryListEvent): void => {
      reducedMotion = event.matches
      notify()
    }
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onChange)
    } else {
      query.addListener(onChange)
    }
  }

  if (typeof document !== 'undefined') {
    documentVisible = !document.hidden
    document.addEventListener('visibilitychange', () => {
      documentVisible = !document.hidden
      notify()
    })
  }
}

export function canAnimateGentlefaceGlyph(): boolean {
  ensureInitialized()
  return !reducedMotion && documentVisible
}

export function isGentlefaceReducedMotion(): boolean {
  ensureInitialized()
  return reducedMotion
}

export function subscribeGentlefaceMotion(listener: () => void): () => void {
  ensureInitialized()
  listeners.add(listener)
  return () => listeners.delete(listener)
}
