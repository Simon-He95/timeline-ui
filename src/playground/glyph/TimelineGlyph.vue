<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { TIMELINE_GLYPH_SVG, type TimelineGlyphName } from './gentleface-icons'
import {
  canAnimateGentlefaceGlyph,
  isGentlefaceReducedMotion,
  subscribeGentlefaceMotion,
} from './gentleface-motion'

type GlyphStatus = 'queued' | 'running' | 'complete' | 'error'

const props = defineProps<{
  name: TimelineGlyphName
  status: GlyphStatus
  size?: number
}>()

const host = ref<HTMLElement | null>(null)
const glyphId = useId()
let svg: SVGSVGElement | null = null
let unsubscribe: (() => void) | undefined
let startTimer: ReturnType<typeof setTimeout> | undefined
let settleAnimation: SVGAnimationElement | null = null
let settleHandler: (() => void) | undefined
let animationStarted = false

// Keep very short running states static instead of flashing a frame or two of
// motion. Once motion has started, let the current SMIL iteration finish before
// parking on the rest pose, so completion never cuts the glyph mid-motion.
const ANIMATION_START_DELAY_MS = 150

interface SmilControls {
  pauseAnimations?: () => void
  unpauseAnimations?: () => void
  setCurrentTime?: (seconds: number) => void
}

function smilControls(element: SVGSVGElement): SmilControls {
  return element as unknown as SmilControls
}

function uniqueIds(text: string): string {
  const prefix = `tl-glyph-${glyphId}-`
  return text
    .replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${prefix}$1`)
}

function clearStartTimer(): void {
  if (startTimer !== undefined) clearTimeout(startTimer)
  startTimer = undefined
}

function clearSettle(): void {
  if (settleAnimation && settleHandler) {
    settleAnimation.removeEventListener('repeatEvent', settleHandler)
  }
  settleAnimation = null
  settleHandler = undefined
}

function parkAtRest(): void {
  clearStartTimer()
  clearSettle()
  animationStarted = false
  if (!svg) return
  const smil = smilControls(svg)
  smil.pauseAnimations?.()
  smil.setCurrentTime?.(0)
}

function beginMotion(): void {
  if (!svg || animationStarted) return
  animationStarted = true
  smilControls(svg).unpauseAnimations?.()
}

function scheduleMotion(): void {
  if (!svg || animationStarted || startTimer !== undefined) return
  startTimer = setTimeout(() => {
    startTimer = undefined
    if (props.status !== 'running' || !svg || !canAnimateGentlefaceGlyph()) return
    beginMotion()
  }, ANIMATION_START_DELAY_MS)
}

function finishCurrentIteration(): void {
  if (!svg) {
    parkAtRest()
    return
  }
  const smil = smilControls(svg)
  // Each Gentleface glyph has one animation duration, so the first SMIL
  // element's repeatEvent marks the shared cycle boundary.
  const animation = svg.querySelector('animate, animateTransform, animateMotion') as SVGAnimationElement | null
  const finish = () => {
    clearSettle()
    if (!svg) return
    const current = smilControls(svg)
    current.pauseAnimations?.()
    current.setCurrentTime?.(0)
    animationStarted = false
  }

  if (!animation) {
    finish()
    return
  }

  settleAnimation = animation
  settleHandler = finish
  animation.addEventListener('repeatEvent', finish)

  if (canAnimateGentlefaceGlyph()) {
    smil.unpauseAnimations?.()
  } else {
    smil.pauseAnimations?.()
  }
}

function applyState(): void {
  if (!svg) return
  const smil = smilControls(svg)

  if (props.status === 'running') {
    if (settleAnimation) {
      clearSettle()
      animationStarted = true
    }
    if (!canAnimateGentlefaceGlyph()) {
      clearStartTimer()
      smil.pauseAnimations?.()
      return
    }
    if (animationStarted) {
      smil.unpauseAnimations?.()
      return
    }
    scheduleMotion()
    return
  }

  if (settleAnimation && (props.status === 'complete' || props.status === 'error')) {
    if (isGentlefaceReducedMotion()) {
      parkAtRest()
    } else if (canAnimateGentlefaceGlyph()) {
      smil.unpauseAnimations?.()
    } else {
      smil.pauseAnimations?.()
    }
    return
  }

  if (settleAnimation) {
    parkAtRest()
    return
  }

  if ((props.status === 'complete' || props.status === 'error')
    && animationStarted
    && !isGentlefaceReducedMotion()) {
    finishCurrentIteration()
    return
  }

  parkAtRest()
}

function mountSvg(): void {
  const container = host.value
  if (!container) return
  clearStartTimer()
  clearSettle()
  animationStarted = false
  const markup = TIMELINE_GLYPH_SVG[props.name]
  const template = document.createElement('template')
  template.innerHTML = uniqueIds(markup).trim()
  const element = template.content.firstElementChild as SVGSVGElement | null
  if (!element) return
  element.setAttribute('aria-hidden', 'true')
  element.removeAttribute('width')
  element.removeAttribute('height')
  container.replaceChildren(element)
  svg = element
  const smil = smilControls(element)
  smil.pauseAnimations?.()
  smil.setCurrentTime?.(0)
  applyState()
}

onMounted(() => {
  mountSvg()
  unsubscribe = subscribeGentlefaceMotion(applyState)
})

onBeforeUnmount(() => {
  unsubscribe?.()
  unsubscribe = undefined
  clearStartTimer()
  clearSettle()
  svg = null
})

watch(() => props.name, mountSvg)
watch(() => props.status, applyState)
</script>

<template>
  <span
    ref="host"
    class="timeline-glyph"
    :style="size ? { width: `${size}px`, height: `${size}px` } : undefined"
    :data-glyph="name"
    :data-glyph-status="status"
    aria-hidden="true"
  />
</template>

<style scoped>
.timeline-glyph {
  display: inline-flex;
  width: 100%;
  height: 100%;
  flex: none;
}

.timeline-glyph :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
