import {
  computed,
  markRaw,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'
import type {
  TimelineGroupVM,
  TimelineItemVM,
} from '../../lib/types'
import CommandDetail from '../components/CommandDetail.vue'
import ImageDetail from '../components/ImageDetail.vue'
import ThinkingDetail from '../components/ThinkingDetail.vue'
import StreamSurface from '../components/StreamSurface.vue'
import { ICONS } from '../icons'
import {
  ASSISTANT_MARKDOWN,
  COMMAND_LINES,
  EDIT_DIFF,
  GENERATED_IMAGE,
  READ_FILE,
  THINKING_TEXT,
} from './mockData'

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'done'

interface StreamEvent {
  at: number
  run: () => void
}

const THINKING_ID = 'stream-thinking'
const READ_ID = 'stream-read'
const EDIT_ID = 'stream-edit'
const COMMAND_ID = 'stream-command'
const IMAGE_ID = 'stream-image'
const NOTICE_ID = 'stream-notice'

const CHUNK_SIZE = 7
const CHUNK_INTERVAL_MS = 24

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = []
  for (let index = 0; index < text.length; index += size) {
    chunks.push(text.slice(index, index + size))
  }
  return chunks
}

function createThinkingItem(): TimelineItemVM {
  return {
    id: THINKING_ID,
    kind: 'thinking',
    status: 'running',
    label: 'Thinking',
    primary: 'checking the row skeleton',
    icon: markRaw(ICONS.sparkle),
    detail: {
      status: 'ready',
      component: markRaw(ThinkingDetail),
      props: { content: '', loading: true },
    },
  }
}

function createReadItem(): TimelineItemVM {
  return {
    id: READ_ID,
    kind: 'tool',
    status: 'running',
    label: 'Read file',
    primary: 'TimelineGroup.vue',
    icon: markRaw(ICONS.book),
    detail: {
      status: 'loading',
      component: markRaw(StreamSurface),
      props: {
        mode: 'file',
        path: READ_FILE.path,
        code: READ_FILE.code,
        language: READ_FILE.language,
      },
    },
  }
}

function createEditItem(): TimelineItemVM {
  return {
    id: EDIT_ID,
    kind: 'tool',
    status: 'running',
    label: 'Edit file',
    primary: 'TimelineRow.vue',
    icon: markRaw(ICONS.pen),
    detail: {
      status: 'loading',
      component: markRaw(StreamSurface),
      props: {
        mode: 'diff',
        path: EDIT_DIFF.path,
        oldCode: EDIT_DIFF.oldCode,
        newCode: EDIT_DIFF.newCode,
      },
    },
  }
}

function createCommandItem(): TimelineItemVM {
  return {
    id: COMMAND_ID,
    kind: 'tool',
    status: 'running',
    label: 'Run command',
    primary: 'pnpm test',
    icon: markRaw(ICONS.terminal),
    detail: {
      status: 'loading',
      component: markRaw(CommandDetail),
      props: { command: 'pnpm test', lines: COMMAND_LINES },
    },
  }
}

function createImageItem(): TimelineItemVM {
  return {
    id: IMAGE_ID,
    kind: 'tool',
    status: 'running',
    label: 'Generate image',
    primary: 'DSH big fat fish girl',
    icon: markRaw(ICONS.image),
    detail: {
      status: 'loading',
      component: markRaw(ImageDetail),
      props: { ...GENERATED_IMAGE },
    },
  }
}

function createNoticeItem(): TimelineItemVM {
  return {
    id: NOTICE_ID,
    kind: 'notice',
    status: 'complete',
    label: 'Tests passed, 18 checks',
    icon: markRaw(ICONS.clock),
    activatable: true,
  }
}

export function useMockChat() {
  const group = reactive<TimelineGroupVM>({
    summary: '1 thinking',
    running: true,
    icon: markRaw(ICONS.group),
    items: [],
  })

  const expandedItemIds = ref<string[]>([])
  const assistantText = ref('')
  const assistantLoading = ref(false)
  const playbackState = ref<PlaybackState>('idle')
  const speed = ref(1)
  const virtualTime = ref(0)

  let events: StreamEvent[] = []
  let workActive = true
  let cursor = 0
  let totalDuration = 0
  let rafId = 0
  let lastTs = 0
  let autoStartTimer: ReturnType<typeof setTimeout> | undefined

  const progress = computed(() =>
    totalDuration === 0
      ? 0
      : Math.min(100, (virtualTime.value / totalDuration) * 100),
  )

  function findItem(itemId: string): TimelineItemVM | undefined {
    return group.items.find((item) => item.id === itemId)
  }

  function syncSummary(): void {
    const thinking = group.items.filter((item) => item.kind === 'thinking').length
    const tools = group.items.filter((item) => item.kind === 'tool').length
    const notices = group.items.filter((item) => item.kind === 'notice').length
    const parts: string[] = []
    if (thinking) parts.push(`${thinking} thinking`)
    if (tools) parts.push(`${tools} ${tools === 1 ? 'tool' : 'tools'}`)
    if (notices) parts.push(`${notices} ${notices === 1 ? 'notice' : 'notices'}`)
    group.summary = parts.join(', ') || '0 items'
    group.running = workActive
  }

  function addItem(item: TimelineItemVM): void {
    group.items.push(item)
  }

  function reset(): void {
    stopClock()
    events = []
    cursor = 0
    totalDuration = 0
    virtualTime.value = 0
    playbackState.value = 'idle'
    assistantText.value = ''
    assistantLoading.value = false

    workActive = true
    group.items.splice(0, group.items.length, createThinkingItem())
    group.summary = '1 thinking'
    group.running = true
    expandedItemIds.value = []
  }

  function buildEvents(): StreamEvent[] {
    const next: StreamEvent[] = []
    const add = (at: number, run: () => void): void => {
      next.push({ at, run })
    }

    const thinking = group.items[0]!
    add(0, () => {
      thinking.status = 'running'
      thinking.label = 'Thinking'
      thinking.primary = 'comparing the current row skeleton…'
      syncSummary()
    })

    let at = 70
    const thinkingChunks = chunkText(THINKING_TEXT, CHUNK_SIZE)
    for (const [index, chunk] of thinkingChunks.entries()) {
      add(at, () => {
        const detail = thinking.detail
        if (!detail) return
        const props = (detail.props ??= {})
        props.content = String(props.content ?? '') + chunk
        props.loading = true

        if (index === Math.floor(thinkingChunks.length * 0.35)) {
          thinking.primary = 'checking chevron and icon alignment…'
        } else if (index === Math.floor(thinkingChunks.length * 0.7)) {
          thinking.primary = 'drafting the inline-chevron change…'
        }
      })
      at += CHUNK_INTERVAL_MS
    }

    at += 220
    add(at, () => {
      thinking.status = 'complete'
      thinking.label = 'Thought for 2s'
      thinking.primary = 'settled on a content-following chevron'
      const detail = thinking.detail
      if (detail?.props) detail.props.loading = false
      syncSummary()
    })

    const readAt = at + 280
    add(readAt, () => {
      addItem(createReadItem())
      syncSummary()
    })
    add(readAt + 560, () => {
      const item = findItem(READ_ID)
      const detail = item?.detail
      if (!item || detail?.status !== 'loading' || !detail.component) return
      item.detail = { status: 'ready', component: detail.component, props: detail.props }
      item.status = 'complete'
      syncSummary()
    })

    const editAt = readAt + 1_020
    add(editAt, () => {
      addItem(createEditItem())
      syncSummary()
    })
    add(editAt + 680, () => {
      const item = findItem(EDIT_ID)
      const detail = item?.detail
      if (!item || detail?.status !== 'loading' || !detail.component) return
      item.detail = { status: 'ready', component: detail.component, props: detail.props }
      item.status = 'complete'
      syncSummary()
    })

    const commandAt = editAt + 1_100
    add(commandAt, () => {
      addItem(createCommandItem())
      syncSummary()
    })
    add(commandAt + 780, () => {
      const item = findItem(COMMAND_ID)
      const detail = item?.detail
      if (!item || detail?.status !== 'loading' || !detail.component) return
      item.detail = { status: 'ready', component: detail.component, props: detail.props }
      item.status = 'complete'
      syncSummary()
    })

    const imageAt = commandAt + 1_020
    add(imageAt, () => {
      addItem(createImageItem())
      syncSummary()
    })
    add(imageAt + 900, () => {
      const item = findItem(IMAGE_ID)
      const detail = item?.detail
      if (!item || detail?.status !== 'loading' || !detail.component) return
      item.detail = { status: 'ready', component: detail.component, props: detail.props }
      item.status = 'complete'
      syncSummary()
    })

    const noticeAt = imageAt + 1_080
    add(noticeAt, () => {
      addItem(createNoticeItem())
      syncSummary()
    })

    let assistantAt = noticeAt + 280
    add(assistantAt, () => {
      workActive = false
      group.running = false
      assistantLoading.value = true
    })
    assistantAt += 20
    for (const chunk of chunkText(ASSISTANT_MARKDOWN, 6)) {
      add(assistantAt, () => {
        assistantText.value += chunk
      })
      assistantAt += 22
    }
    assistantAt += 120
    add(assistantAt, () => {
      assistantLoading.value = false
    })

    return next
  }

  function tick(ts: number): void {
    if (playbackState.value !== 'playing') return
    if (!lastTs) lastTs = ts
    const delta = Math.min(ts - lastTs, 120)
    lastTs = ts
    virtualTime.value += delta * speed.value

    while (cursor < events.length && events[cursor]!.at <= virtualTime.value) {
      events[cursor]!.run()
      cursor += 1
    }

    if (cursor >= events.length) {
      playbackState.value = 'done'
      assistantLoading.value = false
      rafId = 0
      return
    }

    rafId = requestAnimationFrame(tick)
  }

  function stopClock(): void {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    lastTs = 0
  }

  function play(): void {
    if (playbackState.value === 'playing') return
    if (playbackState.value === 'done' || cursor >= events.length) {
      replay()
      return
    }
    playbackState.value = 'playing'
    lastTs = 0
    rafId = requestAnimationFrame(tick)
  }

  function pause(): void {
    if (playbackState.value !== 'playing') return
    stopClock()
    playbackState.value = 'paused'
  }

  function togglePlay(): void {
    if (playbackState.value === 'playing') pause()
    else play()
  }

  function replay(): void {
    stopClock()
    reset()
    events = buildEvents()
    cursor = 0
    virtualTime.value = 0
    totalDuration = events[events.length - 1]?.at ?? 0
    playbackState.value = 'playing'
    lastTs = 0
    rafId = requestAnimationFrame(tick)
  }

  reset()

  onMounted(() => {
    autoStartTimer = setTimeout(() => {
      if (playbackState.value === 'idle') replay()
    }, 650)
  })

  onBeforeUnmount(() => {
    if (autoStartTimer) clearTimeout(autoStartTimer)
    stopClock()
  })

  return {
    group,
    expandedItemIds,
    assistantText,
    assistantLoading,
    playbackState,
    speed,
    progress,
    replay,
    togglePlay,
  }
}
