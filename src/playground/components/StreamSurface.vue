<template>
  <div class="demo-code">
    <div class="demo-code__head">
      <span class="demo-code__path">{{ path }}</span>
      <span class="demo-code__meta">{{ mode === 'diff' ? 'diff' : language || 'file' }}</span>
    </div>
    <div class="demo-code__body">
      <div ref="host" class="demo-code__surface" />
      <pre v-if="!ready && fallback" class="demo-code__fallback"><code>{{ fallback }}</code></pre>
      <div v-if="!ready && !fallback" class="demo-code__loading">
        <span class="demo-code__skeleton" />
        <span class="demo-code__skeleton" />
        <span class="demo-code__skeleton" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createDiffSurface, type DiffSurfaceController } from 'stream-diffs'

defineOptions({ name: 'DemoStreamSurface' })

const props = defineProps<{
  path: string
  mode: 'file' | 'diff'
  code?: string
  oldCode?: string
  newCode?: string
  language?: string
}>()

const host = ref<HTMLElement | null>(null)
const ready = ref(false)
const failed = ref(false)

let controller: DiffSurfaceController | null = null
let generation = 0

const fallback = computed(() => {
  if (!failed.value) return ''
  if (props.mode === 'file') return props.code ?? ''
  return [props.oldCode ?? '', '---', props.newCode ?? ''].join('\n')
})

const THEME = {
  light: 'github-light',
  dark: 'github-dark',
} as const

async function mountSurface(): Promise<void> {
  const element = host.value
  if (!element) return

  const current = ++generation
  ready.value = false
  failed.value = false

  const next =
    props.mode === 'file'
      ? createDiffSurface({
          kind: 'file',
          file: { name: props.path, contents: props.code ?? '' },
          options: {
            theme: THEME,
            themeType: 'light',
            disableFileHeader: true,
            disableLineNumbers: false,
            overflow: 'scroll',
          },
        })
      : createDiffSurface({
          kind: 'diff',
          oldFile: { name: props.path, contents: props.oldCode ?? '' },
          newFile: { name: props.path, contents: props.newCode ?? '' },
          options: {
            theme: THEME,
            themeType: 'light',
            diffStyle: 'unified',
            diffIndicators: 'bars',
            lineDiffType: 'word-alt',
            disableFileHeader: true,
            overflow: 'scroll',
          },
        })

  try {
    await next.mount(element)
  } catch {
    next.dispose()
    if (current === generation) failed.value = true
    return
  }

  if (current !== generation) {
    next.dispose()
    return
  }

  controller?.dispose()
  controller = next
  ready.value = true
}

onMounted(() => {
  void mountSurface()
})

watch(
  () => [props.mode, props.path, props.code, props.oldCode, props.newCode] as const,
  () => {
    void mountSurface()
  },
)

onBeforeUnmount(() => {
  generation += 1
  controller?.dispose()
  controller = null
})
</script>
