<template>
  <figure class="doc-code">
    <figcaption class="doc-code__bar">
      <span class="doc-code__label">{{ label }}</span>
      <button type="button" class="doc-code__copy" @click="copy">
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
    </figcaption>
    <pre class="doc-code__pre"><CodeText
      :code="code"
      :language="language"
      interactive
      @type-enter="onTypeEnter"
      @type-focus="onTypeEnter"
      @type-leave="scheduleHide"
      @type-blur="scheduleHide"
      @type-escape="hideNow"
      @type-click="onTypeClick"
    /></pre>
  </figure>

  <Teleport to="body">
    <Transition name="doc-type-pop">
      <aside
        v-if="hovered"
        ref="popover"
        class="doc-type-pop"
        :style="popoverStyle"
        role="tooltip"
        @mouseenter="cancelHide"
        @mouseleave="scheduleHide"
      >
        <header class="doc-type-pop__head">
          <code class="doc-type-pop__name">{{ hovered.name }}</code>
          <span class="doc-type-pop__kind">{{ hovered.kind }}</span>
        </header>
        <p class="doc-type-pop__summary">{{ hovered.summary }}</p>
        <pre class="doc-type-pop__code"><CodeText :code="hovered.declaration" language="ts" /></pre>
        <footer class="doc-type-pop__foot">
          Click the type name to open the full reference
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import CodeText from '../CodeText.vue'
import { DOC_TYPES, revealDocType } from './type-docs'
import type { CodeLanguage } from './highlight'

const props = withDefaults(
  defineProps<{
    code: string
    label?: string
    language?: CodeLanguage
  }>(),
  {
    label: 'vue',
    language: 'ts',
  },
)

const copied = ref(false)
const hoveredName = ref<string | null>(null)
const popover = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({
  left: '0px',
  top: '0px',
  visibility: 'hidden',
})
let copyTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined
let listening = false
let anchor: HTMLElement | null = null

const hovered = computed(() =>
  hoveredName.value ? DOC_TYPES[hoveredName.value] : undefined,
)

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}

function onTypeEnter(name: string, target: HTMLElement): void {
  if (!DOC_TYPES[name]) return
  cancelHide()
  const changed = hoveredName.value !== name
  hoveredName.value = name
  anchor = target
  if (changed) {
    popoverStyle.value = {
      left: '0px',
      top: '0px',
      visibility: 'hidden',
    }
  }
  addListeners()
  void nextTick(positionPopover)
}

function onTypeClick(name: string): void {
  hideNow()
  void revealDocType(name)
}

function scheduleHide(): void {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(hideNow, 140)
}

function cancelHide(): void {
  clearTimeout(hideTimer)
}

function hideNow(): void {
  clearTimeout(hideTimer)
  hoveredName.value = null
  anchor = null
  removeListeners()
}

function addListeners(): void {
  if (listening) return
  window.addEventListener('scroll', positionPopover, true)
  window.addEventListener('resize', positionPopover)
  window.addEventListener('keydown', onGlobalKeydown)
  listening = true
}

function removeListeners(): void {
  if (!listening) return
  window.removeEventListener('scroll', positionPopover, true)
  window.removeEventListener('resize', positionPopover)
  window.removeEventListener('keydown', onGlobalKeydown)
  listening = false
}

function onGlobalKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') hideNow()
}

function positionPopover(): void {
  if (!anchor || !popover.value) return

  const anchorRect = anchor.getBoundingClientRect()
  if (anchorRect.bottom < 0 || anchorRect.top > window.innerHeight) {
    hideNow()
    return
  }

  const card = popover.value
  const width = card.offsetWidth
  const height = card.offsetHeight
  const gap = 10
  const padding = 12
  let top = anchorRect.bottom + gap
  let left = anchorRect.left - 2

  if (top + height > window.innerHeight - padding) {
    top = anchorRect.top - gap - height
  }
  top = Math.min(Math.max(padding, top), window.innerHeight - height - padding)
  left = Math.min(Math.max(padding, left), window.innerWidth - width - padding)

  popoverStyle.value = {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
    visibility: 'visible',
  }
}

onBeforeUnmount(() => {
  clearTimeout(copyTimer)
  clearTimeout(hideTimer)
  removeListeners()
})
</script>

<style scoped>
.doc-code {
  --code-plain: #d9e2ec;
  --code-keyword: #c792ea;
  --code-string: #a8d8a0;
  --code-comment: #6f7d8c;
  --code-number: #e8b86d;
  --code-type: #7cc7ff;
  --code-tag: #7cc7ff;
  --code-attr: #d9b36c;
  --code-builtin: #8bb7d6;
  --code-function: #e2c08d;
  --code-punct: #95a3b3;
  --code-type-hover: rgb(124 199 255 / 14%);

  margin: 16px 0 0;
  overflow: hidden;
  border: 1px solid #20262e;
  border-radius: 12px;
  background: #12171d;
  color: #d9e2ec;
}

.doc-code__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px 8px 14px;
  border-bottom: 1px solid #252c35;
  background: #171d24;
}

.doc-code__label {
  color: #8896a6;
  font-family: var(--wb-mono);
  font-size: 9.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.doc-code__copy {
  padding: 3px 8px;
  border: 1px solid #2d3640;
  border-radius: 5px;
  background: transparent;
  color: #aebdcd;
  font-family: var(--wb-mono);
  font-size: 9.5px;
  cursor: pointer;
}

.doc-code__copy:hover {
  border-color: #43505f;
  color: #e8f0f7;
}

.doc-code__pre {
  margin: 0;
  overflow-x: auto;
  padding: 16px 18px 18px;
  font-family: var(--wb-mono);
  font-size: 12px;
  line-height: 1.7;
  tab-size: 2;
}

.doc-code__pre code {
  font: inherit;
}

.doc-type-pop {
  --code-plain: #d9e2ec;
  --code-keyword: #c792ea;
  --code-string: #a8d8a0;
  --code-comment: #6f7d8c;
  --code-number: #e8b86d;
  --code-type: #7cc7ff;
  --code-tag: #7cc7ff;
  --code-attr: #d9b36c;
  --code-builtin: #8bb7d6;
  --code-function: #e2c08d;
  --code-punct: #95a3b3;
  --code-type-hover: rgb(124 199 255 / 14%);

  position: fixed;
  z-index: 80;
  width: min(380px, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  overflow: auto;
  padding: 14px;
  border: 1px solid #2c3845;
  border-radius: 10px;
  background: #141b22;
  color: #d9e2ec;
  box-shadow: 0 18px 44px rgb(3 8 14 / 32%);
}

.doc-type-pop__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 9px;
  border-bottom: 1px solid #26323d;
}

.doc-type-pop__name {
  color: #f4f8fc;
  font-family: var(--wb-mono);
  font-size: 12px;
  font-weight: 600;
}

.doc-type-pop__kind {
  padding: 2px 6px;
  border: 1px solid #344351;
  border-radius: 999px;
  color: #96a7b7;
  font-family: var(--wb-mono);
  font-size: 8.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.doc-type-pop__summary {
  margin: 10px 0 12px;
  color: #aebdcc;
  font-size: 11.5px;
  line-height: 1.55;
}

.doc-type-pop__code {
  max-height: 230px;
  margin: 0;
  overflow: auto;
  padding: 10px 11px;
  border: 1px solid #26323d;
  border-radius: 7px;
  background: #0e141a;
  font-family: var(--wb-mono);
  font-size: 10.5px;
  line-height: 1.65;
  tab-size: 2;
}

.doc-type-pop__code code {
  font: inherit;
}

.doc-type-pop__foot {
  margin-top: 10px;
  color: #7f8f9e;
  font-family: var(--wb-mono);
  font-size: 9px;
}

.doc-type-pop-enter-active,
.doc-type-pop-leave-active {
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}

.doc-type-pop-enter-from,
.doc-type-pop-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .doc-type-pop-enter-active,
  .doc-type-pop-leave-active {
    transition: none;
  }
}
</style>
