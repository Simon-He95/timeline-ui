<template>
  <div
    class="workbench"
    :class="{ 'is-inspector-collapsed': !inspectorOpen, 'is-drawer-open': drawerOpen }"
  >
    <header class="topbar">
      <div class="brand">
        <img class="brand__mark" :src="logoMark" alt="" aria-hidden="true" />
        <div class="brand__text">
          <strong>Timeline UI</strong>
          <span>fixed skeleton / variable skin</span>
        </div>
      </div>

      <nav class="topbar__nav" aria-label="Mode">
        <button
          type="button"
          :class="{ 'is-active': view === 'lab' }"
          :aria-current="view === 'lab' ? 'page' : undefined"
          @click="setView('lab')"
        >
          Lab
        </button>
        <button
          type="button"
          :class="{ 'is-active': view === 'docs' }"
          :aria-current="view === 'docs' ? 'page' : undefined"
          @click="setView('docs')"
        >
          Docs
        </button>
      </nav>

      <a
        class="topbar__github"
        href="https://github.com/Simon-He95/timeline-ui"
        target="_blank"
        rel="noreferrer"
      >
        GitHub
        <span aria-hidden="true">↗</span>
      </a>
    </header>

    <template v-if="view === 'lab'">
    <aside class="sidebar">
      <div class="sidebar__overline">Components</div>
      <nav class="nav">
        <button
          v-for="(tab, index) in TABS"
          :key="tab.key"
          type="button"
          class="nav__item"
          :class="{ 'is-active': activeTab === tab.key }"
          :aria-label="`${tab.label}: ${tab.hint}`"
          :title="`${tab.label}: ${tab.hint}`"
          @click="selectTab(tab.key)"
        >
          <span class="nav__icon" aria-hidden="true">
            <component :is="NAV_ICONS[tab.key]" :size="16" />
          </span>
          <span class="nav__index">0{{ index + 1 }}</span>
          <span class="nav__label">{{ tab.label }}</span>
          <span class="nav__hint">{{ tab.hint }}</span>
        </button>
      </nav>

      <p class="sidebar__note">
        Layout is fixed. Text, icons and detail panels come from the host. The library owns the
        shell, motion and tokens.
      </p>
    </aside>

    <main class="canvas">
      <header class="canvas__head">
        <div>
          <span class="eyebrow">Live preview</span>
          <h1>Agent transcript group</h1>
        </div>
        <div class="canvas__head-actions">
          <span class="state-chip">{{ group.items.length }} items</span>
          <button
            type="button"
            class="btn btn--inspector"
            :aria-pressed="anatomy"
            @click="anatomy = !anatomy"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 2" />
            </svg>
            Anatomy
          </button>
          <button
            type="button"
            class="btn btn--inspector"
            :aria-expanded="inspectorVisible"
            aria-controls="inspector"
            @click="toggleInspector"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2.25" stroke="currentColor" stroke-width="1.3" />
              <path d="M9.75 3.25v9.5" stroke="currentColor" stroke-width="1.3" />
            </svg>
            Inspector
          </button>
        </div>
      </header>

      <div class="canvas__toolbar">
        <div class="playback">
          <button type="button" class="btn btn--primary" @click="togglePlay">
            {{ playLabel }}
          </button>
          <button type="button" class="btn" @click="replay">Restart</button>

          <label class="playback__speed">
            <span>Speed</span>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              :value="speed"
              aria-label="Playback speed"
              @input="onSpeedInput"
            />
            <code>{{ speed.toFixed(1) }}×</code>
          </label>

          <div class="playback__track" aria-hidden="true">
            <span :style="{ width: `${progress}%` }" />
          </div>
          <span class="playback__state">{{ playbackState }}</span>
        </div>
      </div>

      <div class="canvas__scroll">
        <div class="stage" :class="{ 'stage--anatomy': anatomy }">
          <div class="stage__grid">
          <MockChatPreview
            :group="group"
            :tokens="tokenStyle"
            :group-expanded="groupExpanded"
            :expanded-item-ids="expandedItemIds"
            :lazy-details="lazyDetails"
            :keep-details-mounted="keepDetailsMounted"
            :render-group="renderGroup"
            :assistant-text="assistantText"
            :assistant-loading="assistantLoading"
            :user-prompt="userPrompt"
            @update:group-expanded="setGroupExpanded"
            @update:expanded-item-ids="setExpandedItemIds"
            @update:render-group="setRenderGroup"
            @detail-toggle="onDetailToggle"
            @detail-retry="onDetailRetry"
            @activate="onActivate"
            @send="onSendPrompt"
          />
          </div>

          <div v-if="anatomy" class="anatomy">
            <span><i class="swatch swatch--group" />Group shell</span>
            <span><i class="swatch swatch--row" />Row header</span>
            <span><i class="swatch swatch--details" />Details shell</span>
            <span class="anatomy__hint">Dashed outlines are preview-only.</span>
          </div>
        </div>
      </div>
    </main>

    <aside
      id="inspector"
      ref="inspectorEl"
      class="inspector"
      tabindex="-1"
      :role="isNarrow ? 'dialog' : undefined"
      :aria-modal="isNarrow ? 'true' : undefined"
      aria-label="Inspector"
      @keydown="onInspectorKeydown"
    >
      <header class="inspector__head">
        <div>
          <span class="eyebrow">Inspector</span>
          <h2>{{ activeTabMeta.label }}</h2>
        </div>
        <div class="inspector__head-actions">
          <code>{{ activeTabMeta.hint }}</code>
          <button type="button" class="inspector__close" aria-label="Close inspector" @click="closeInspector">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <div class="inspector__tabs">
        <button
          v-for="(tab, index) in TABS"
          :key="tab.key"
          type="button"
          class="inspector__tab"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="selectTab(tab.key)"
        >
          <span class="inspector__tab-index">0{{ index + 1 }}</span>
          {{ tab.label }}
        </button>
      </div>

      <div class="inspector__body">
        <template v-if="activeTab === 'group'">
          <section class="panel">
            <h3>Group data</h3>
            <p class="hint">
              Summary is a single host-provided string. The library never joins categories or
              looks up translations.
            </p>
            <label class="field">
              <span>Summary</span>
              <input v-model="group.summary" type="text" />
            </label>
            <label class="field">
              <span>Leading icon</span>
              <select v-model="groupIconKey">
                <option v-for="key in GROUP_ICON_KEYS" :key="key" :value="key">{{ key }}</option>
              </select>
            </label>
            <div class="switch-stack">
              <label class="switch switch--row">
                <span>Running (icon + shimmer)</span>
                <input v-model="group.running" type="checkbox" />
                <span class="switch__track" />
              </label>
              <label class="switch switch--row">
                <span>Expanded</span>
                <input v-model="groupExpanded" type="checkbox" :disabled="!renderGroup" />
                <span class="switch__track" />
              </label>
              <label class="switch switch--row">
                <span>Render group</span>
                <input v-model="renderGroup" type="checkbox" />
                <span class="switch__track" />
              </label>
            </div>
          </section>

          <section class="panel">
            <h3>Detail mounting</h3>
            <p class="hint">Global defaults for every item in this group.</p>
            <div class="switch-stack">
              <label class="switch switch--row">
                <span>Lazy details</span>
                <input v-model="lazyDetails" type="checkbox" />
                <span class="switch__track" />
              </label>
              <label class="switch switch--row">
                <span>Keep mounted after collapse</span>
                <input v-model="keepDetailsMounted" type="checkbox" />
                <span class="switch__track" />
              </label>
            </div>
          </section>

          <section class="panel">
            <h3>Items</h3>
            <div class="list">
              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                class="list__row"
                :class="{ 'is-selected': item.id === selectedItem.id }"
                @click="selectedItemId = item.id; activeTab = 'items'"
              >
                <span class="list__icon">
                  <component :is="item.icon ?? TimelineFallbackIcon" :status="item.status" />
                </span>
                <span class="list__text">
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.primary || item.kind }}</small>
                </span>
                <span class="list__status" :data-status="item.status">{{ item.status }}</span>
              </button>
            </div>
          </section>
        </template>

        <template v-else-if="activeTab === 'items'">
          <section class="panel">
            <h3>Selected item</h3>
            <label class="field">
              <span>Item</span>
              <select v-model="selectedItemId">
                <option v-for="item in group.items" :key="item.id" :value="item.id">
                  {{ item.label }} ({{ item.id }})
                </option>
              </select>
            </label>
            <label class="field">
              <span>Label</span>
              <input v-model="selectedItem.label" type="text" />
            </label>
            <label class="field">
              <span>Primary parameter</span>
              <input v-model="selectedItem.primary" type="text" />
            </label>
            <div class="field-grid">
              <label class="field">
                <span>Status</span>
                <select v-model="selectedItem.status">
                  <option v-for="status in ITEM_STATUSES" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </label>
              <label class="field">
                <span>Kind</span>
                <select v-model="selectedItem.kind">
                  <option v-for="kind in ITEM_KINDS" :key="kind" :value="kind">{{ kind }}</option>
                </select>
              </label>
            </div>
            <label class="field">
              <span>Icon component</span>
              <select v-model="selectedIconKey">
                <option v-for="key in ICON_KEYS" :key="key" :value="key">{{ key }}</option>
              </select>
            </label>
            <p class="hint hint--tight">
              The icon receives this row's status. Set status to running to unpause the
              Gentleface SMIL glyph.
            </p>
            <label class="field">
              <span>Detail component</span>
              <select v-model="selectedRenderer">
                <option v-for="renderer in DETAIL_RENDERERS" :key="renderer.key" :value="renderer.key">
                  {{ renderer.label }}
                </option>
              </select>
            </label>
            <div class="switch-stack">
              <label class="switch switch--row">
                <span>Activatable without details</span>
                <input v-model="selectedItem.activatable" type="checkbox" />
                <span class="switch__track" />
              </label>
            </div>
            <div class="button-row">
              <button type="button" class="btn" @click="toggleSelectedItem">
                {{ selectedItemExpanded ? 'Collapse item' : 'Expand item' }}
              </button>
            </div>
          </section>

          <section class="panel panel--muted">
            <h3>How this maps</h3>
            <p class="hint">
              Every row uses the same grid: icon, label, primary parameter, trailing chevron.
              Only the icon component and detail component are swapped by data.
            </p>
            <pre class="snippet"><CodeText :code="ITEM_MAPPING_SNIPPET" language="ts" /></pre>
          </section>
        </template>

        <template v-else-if="activeTab === 'details'">
          <section v-if="selectedItem.detail" class="panel">
            <h3>Details shell</h3>
            <p class="hint">
              The shell always exists when expanded. A loading state never waits for the panel
              before painting.
            </p>
            <div class="field">
              <span>State</span>
              <div class="segmented">
                <button
                  v-for="status in DETAIL_STATUSES"
                  :key="status"
                  type="button"
                  :class="{ 'is-active': selectedItem.detail.status === status }"
                  @click="setDetailStatus(status)"
                >
                  {{ status }}
                </button>
              </div>
            </div>
            <template v-if="selectedItem.detail.status === 'error'">
              <label class="field">
                <span>Error text</span>
                <input v-model="detailErrorText" type="text" placeholder="Host-owned copy" />
              </label>
              <label class="field">
                <span>Retry label</span>
                <input v-model="detailRetryLabel" type="text" placeholder="Empty hides retry" />
              </label>
            </template>
            <div class="button-row">
              <button type="button" class="btn" @click="finishLoading">Finish loading</button>
              <button type="button" class="btn" @click="onDetailRetry(selectedItem.id)">Retry</button>
            </div>
            <button type="button" class="btn btn--danger btn--block" @click="setDetailRenderer('none')">
              Remove detail
            </button>
          </section>

          <section v-else class="panel">
            <h3>No detail attached</h3>
            <p class="hint">
              This row is not expandable. Attach a host component to turn it into an expandable
              row with the shared loading shell.
            </p>
            <button type="button" class="btn btn--block" @click="setDetailRenderer('read')">
              Attach read detail
            </button>
          </section>

          <section class="panel panel--muted">
            <h3>State contract</h3>
            <pre class="snippet"><CodeText :code="DETAIL_STATE_SNIPPET" language="ts" /></pre>
            <p class="hint">The library never fetches. The host flips the state on toggle or retry.</p>
          </section>
        </template>

        <template v-else>
          <section class="panel">
            <h3>Presets</h3>
            <div class="button-row button-row--wrap">
              <button
                v-for="(_, name) in PRESETS"
                :key="name"
                type="button"
                class="btn"
                @click="applyPreset(name)"
              >
                {{ name }}
              </button>
              <button type="button" class="btn" @click="resetTokens">Reset tokens</button>
              <button type="button" class="btn btn--primary" @click="copyTokens">
                {{ copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy JSON' }}
              </button>
            </div>
          </section>

          <section v-for="groupName in TOKEN_GROUPS" :key="groupName" class="panel">
            <h3>{{ groupName }}</h3>
            <TokenControl
              v-for="spec in tokenSpecs(groupName)"
              :key="spec.key"
              v-model="tokens[spec.key]"
              :spec="spec"
            />
          </section>
        </template>
      </div>
    </aside>

    <button
      v-if="isNarrow"
      type="button"
      class="inspector-backdrop"
      aria-label="Close inspector"
      @click="drawerOpen = false"
    />

    <footer class="statusbar" aria-label="Live state">
      <span class="statusbar__state">
        <i class="statusbar__dot" :class="{ 'is-live': playbackState === 'playing' }" />
        {{ playbackState }}
      </span>
      <span class="statusbar__metric">{{ group.items.length }} items</span>
      <span class="statusbar__metric">{{ expandedItemIds.length }} expanded</span>
      <span class="statusbar__metric">{{ detailCounts }}</span>
      <button
        type="button"
        class="statusbar__event"
        :aria-expanded="eventLogOpen"
        aria-controls="event-log"
        @click="eventLogOpen = !eventLogOpen"
      >
        <span>last: {{ lastEvent }}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="m2.5 4 2.5 2.5L7.5 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <span class="statusbar__spacer" />
      <button
        type="button"
        class="statusbar__inspect"
        :aria-expanded="inspectorVisible"
        @click="toggleInspector"
      >
        {{ activeTabMeta.label }}
        <span>Inspector</span>
      </button>
    </footer>

    <section v-if="eventLogOpen" id="event-log" class="event-log" aria-label="Event log">
      <header class="event-log__head">
        <span>Event log <b>{{ events.length }}</b></span>
        <div class="event-log__actions">
          <button type="button" @click="clearEvents">Clear</button>
          <button type="button" aria-label="Close event log" @click="eventLogOpen = false">×</button>
        </div>
      </header>
      <ol v-if="events.length" class="event-log__list">
        <li v-for="event in events" :key="event.id">
          <time>{{ event.at }}</time>
          <span>{{ event.text }}</span>
        </li>
      </ol>
      <p v-else class="event-log__empty">Interact with the group; emitted events land here.</p>
    </section>
    </template>

    <UsageDocs v-else @open-lab="setView('lab')" />
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import logoMark from '../../assets/logo-mark.svg?url'
import type {
  TimelineDetailStatus,
  TimelineDetailVM,
  TimelineItemKind,
  TimelineItemVM,
  TimelineStatus,
} from '../lib'
import TimelineFallbackIcon from '../lib/components/TimelineFallbackIcon.vue'
import CodeText from './CodeText.vue'
import CommandDetail from './components/CommandDetail.vue'
import ImageDetail from './components/ImageDetail.vue'
import MarkdownDetail from './components/MarkdownDetail.vue'
import SearchDetail from './components/SearchDetail.vue'
import StreamSurface from './components/StreamSurface.vue'
import ThinkingDetail from './components/ThinkingDetail.vue'
import { ICONS, ICON_KEYS, type IconKey } from './icons'
import MockChatPreview from './mock-chat/MockChatPreview.vue'
import {
  COMMAND_LINES,
  EDIT_DIFF,
  GENERATED_IMAGE,
  READ_FILE,
  SEARCH_RESULTS,
  THINKING_TEXT,
} from './mock-chat/mockData'
import { useMockChat } from './mock-chat/useMockChat'
import TokenControl from './TokenControl.vue'
import UsageDocs from './docs/UsageDocs.vue'
import {
  DEFAULT_TOKENS,
  PRESETS,
  TOKEN_GROUPS,
  TOKEN_SPECS,
  type TokenGroup,
} from './token-spec'

const TABS = [
  { key: 'group', label: 'Group', hint: 'summary + state' },
  { key: 'items', label: 'Item row', hint: 'text + icon' },
  { key: 'details', label: 'Details shell', hint: 'loading + error' },
  { key: 'tokens', label: 'Tokens', hint: 'css variables' },
] as const

type Tab = (typeof TABS)[number]['key']
type DetailRendererKey = 'none' | 'thinking' | 'read' | 'diff' | 'command' | 'search' | 'image' | 'markdown'

const ITEM_STATUSES: TimelineStatus[] = ['queued', 'running', 'complete', 'error']
const ITEM_KINDS: TimelineItemKind[] = ['thinking', 'tool', 'text', 'notice']
const DETAIL_STATUSES: TimelineDetailStatus[] = ['loading', 'ready', 'error']

const DETAIL_COMPONENTS = {
  thinking: markRaw(ThinkingDetail),
  read: markRaw(StreamSurface),
  diff: markRaw(StreamSurface),
  command: markRaw(CommandDetail),
  search: markRaw(SearchDetail),
  image: markRaw(ImageDetail),
  markdown: markRaw(MarkdownDetail),
} as const

const DETAIL_RENDERERS: Array<{ key: DetailRendererKey; label: string }> = [
  { key: 'none', label: 'None (row is not expandable)' },
  { key: 'thinking', label: 'Thinking (plain text)' },
  { key: 'read', label: 'Read file content' },
  { key: 'diff', label: 'Edit diff (stream-diffs)' },
  { key: 'command', label: 'Command output' },
  { key: 'search', label: 'Search results' },
  { key: 'image', label: 'Generated image' },
  { key: 'markdown', label: 'Markdown' },
]

const ITEM_MAPPING_SNIPPET = `{
  id, kind, status,
  label: 'Read file',
  primary: 'TimelineGroup.vue',
  icon: BookIcon,
  detail: { status, component: StreamSurface }
}`

const DETAIL_STATE_SNIPPET = `type Detail = {
  status: 'loading' | 'ready' | 'error'
  component?: Component
  props?: Record<string, unknown>
  errorText?: string
  retryLabel?: string
}`

const NAV_ICONS = {
  group: markRaw(ICONS.group),
  items: markRaw(ICONS.book),
  details: markRaw(ICONS.toolbox),
  tokens: markRaw(ICONS.terminal),
} as const

const {
  group,
  expandedItemIds,
  assistantText,
  assistantLoading,
  playbackState,
  speed,
  progress,
  replay,
  togglePlay,
} = useMockChat()

const initialView: 'lab' | 'docs' =
  new URLSearchParams(window.location.search).get('view') === 'docs' ? 'docs' : 'lab'
const view = ref<'lab' | 'docs'>(initialView)

const VIEW_META = {
  lab: {
    title: 'Timeline UI Lab | Vue 3 timeline for AI agent transcripts',
    description:
      'Live lab for the Timeline UI Vue 3 component. Inspect group, row, detail and CSS token states for AI agent transcripts.',
    url: 'https://timeline-ui.pages.dev/',
  },
  docs: {
    title: 'Timeline UI Docs | TimelineGroup API and theming',
    description:
      'TimelineGroup documentation: concepts, props and events, TypeScript types, slots, examples and CSS variable theming for AI agent timelines.',
    url: 'https://timeline-ui.pages.dev/?view=docs',
  },
} as const

function syncViewMeta(next: 'lab' | 'docs'): void {
  const meta = VIEW_META[next]
  document.title = meta.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.url)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', meta.url)
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', meta.title)
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', meta.description)
}
const activeTab = ref<Tab>('group')
const narrowQuery = window.matchMedia('(max-width: 1100px)')
const isNarrow = ref(narrowQuery.matches)
const inspectorOpen = ref(true)
const drawerOpen = ref(false)
const inspectorVisible = computed(() => (isNarrow.value ? drawerOpen.value : inspectorOpen.value))

function syncNarrow(): void {
  isNarrow.value = narrowQuery.matches
  if (!isNarrow.value) drawerOpen.value = false
}

onMounted(() => {
  narrowQuery.addEventListener('change', syncNarrow)
  window.addEventListener('keydown', onWindowKeydown)
  syncViewMeta(initialView)
  if (initialView === 'docs' && window.location.hash) {
    nextTick(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    })
  }
})

function setView(next: 'lab' | 'docs'): void {
  view.value = next
  const url = new URL(window.location.href)
  if (next === 'docs') url.searchParams.set('view', 'docs')
  else {
    url.searchParams.delete('view')
    url.hash = ''
  }
  window.history.replaceState(null, '', url)
  syncViewMeta(next)
}

function selectTab(tab: Tab): void {
  activeTab.value = tab
  if (isNarrow.value) drawerOpen.value = true
  else inspectorOpen.value = true
}

function toggleInspector(): void {
  if (isNarrow.value) drawerOpen.value = !drawerOpen.value
  else inspectorOpen.value = !inspectorOpen.value
}

function closeInspector(): void {
  if (isNarrow.value) drawerOpen.value = false
  else inspectorOpen.value = false
}
const userPrompt = ref(
  'Extract the timeline group into a reusable library. Keep the current icon language and fix the read/edit detail split.',
)
const renderGroup = ref(true)
const groupExpanded = ref(true)

// The group is the work block. Once the assistant answer starts streaming,
// the work is over: close the group and leave only its summary above the text.
watch(
  () => assistantLoading.value,
  (loading) => {
    if (loading) groupExpanded.value = false
  },
)

// A replay resets the group to a single item. Reopen it so the next work pass
// is visible before it closes again at the answer.
watch(
  () => group.items.length,
  (count, previous) => {
    if (count < previous) groupExpanded.value = true
  },
)
const selectedItemId = ref('stream-thinking')
const lazyDetails = ref(true)
const keepDetailsMounted = ref(true)
const anatomy = ref(false)
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
const lastEvent = ref('streaming')
const eventLogOpen = ref(false)
const events = ref<TimelineEvent[]>([])
const inspectorEl = ref<HTMLElement | null>(null)
let nextEventId = 0
let focusBeforeDrawer: HTMLElement | null = null

interface TimelineEvent {
  id: number
  at: string
  text: string
}

function logEvent(text: string): void {
  lastEvent.value = text
  events.value.unshift({
    id: ++nextEventId,
    at: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    text,
  })
  if (events.value.length > 12) events.value.length = 12
}

function clearEvents(): void {
  events.value = []
}

function onWindowKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (eventLogOpen.value) {
    eventLogOpen.value = false
    return
  }
  if (isNarrow.value && drawerOpen.value) closeInspector()
}

function onInspectorKeydown(event: KeyboardEvent): void {
  if (!isNarrow.value || !drawerOpen.value || event.key !== 'Tab') return
  const root = inspectorEl.value
  if (!root) return
  const focusables = [
    ...root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => el.offsetParent !== null)
  if (focusables.length === 0) return
  const first = focusables[0]!
  const last = focusables[focusables.length - 1]!
  if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(drawerOpen, async (open) => {
  if (open) {
    focusBeforeDrawer = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    inspectorEl.value?.focus()
  } else {
    focusBeforeDrawer?.focus()
    focusBeforeDrawer = null
  }
})

const tokens = reactive<Record<string, string>>({ ...DEFAULT_TOKENS })
const tokenStyle = computed<Record<string, string>>(() => ({ ...tokens }))
const playLabel = computed(() => {
  if (playbackState.value === 'playing') return 'Pause'
  if (playbackState.value === 'done') return 'Replay'
  return 'Play'
})

const activeTabMeta = computed(() => TABS.find((tab) => tab.key === activeTab.value) ?? TABS[0])
const selectedItem = computed<TimelineItemVM>(
  () => group.items.find((item) => item.id === selectedItemId.value) ?? group.items[0]!,
)
const selectedItemExpanded = computed(() =>
  expandedItemIds.value.includes(selectedItem.value.id),
)
const detailErrorText = computed({
  get: () => {
    const detail = selectedItem.value.detail
    return detail?.status === 'error' ? detail.errorText : ''
  },
  set: (value: string) => {
    const detail = selectedItem.value.detail
    if (detail?.status === 'error') detail.errorText = value
  },
})
const detailRetryLabel = computed({
  get: () => {
    const detail = selectedItem.value.detail
    return detail?.status === 'error' ? detail.retryLabel ?? '' : ''
  },
  set: (value: string) => {
    const detail = selectedItem.value.detail
    if (detail?.status === 'error') detail.retryLabel = value
  },
})
const detailCounts = computed(() => {
  let ready = 0
  let loading = 0
  let error = 0
  for (const item of group.items) {
    if (item.detail?.status === 'ready') ready += 1
    else if (item.detail?.status === 'loading') loading += 1
    else if (item.detail?.status === 'error') error += 1
  }
  return `${ready} ready, ${loading} loading${error ? `, ${error} error` : ''}`
})

const GROUP_ICON_KEYS = ['none', ...ICON_KEYS] as const

const selectedIconKey = computed<IconKey>({
  get: () => {
    const icon = selectedItem.value.icon
    return (Object.keys(ICONS) as IconKey[]).find((key) => ICONS[key] === icon) ?? 'book'
  },
  set: (key) => {
    selectedItem.value.icon = markRaw(ICONS[key])
  },
})

const groupIconKey = computed<IconKey | 'none'>({
  get: () => {
    const icon = group.icon
    if (!icon) return 'none'
    return (Object.keys(ICONS) as IconKey[]).find((key) => ICONS[key] === icon) ?? 'group'
  },
  set: (key) => {
    group.icon = key === 'none' ? undefined : markRaw(ICONS[key])
  },
})

const selectedRenderer = computed<DetailRendererKey>({
  get: () => {
    const detail = selectedItem.value.detail
    const component = detail?.component
    if (!component) return 'none'
    if (component === DETAIL_COMPONENTS.thinking) return 'thinking'
    if (component === DETAIL_COMPONENTS.read || component === DETAIL_COMPONENTS.diff) {
      return detail?.props?.mode === 'diff' ? 'diff' : 'read'
    }
    if (component === DETAIL_COMPONENTS.command) return 'command'
    if (component === DETAIL_COMPONENTS.search) return 'search'
    if (component === DETAIL_COMPONENTS.image) return 'image'
    if (component === DETAIL_COMPONENTS.markdown) return 'markdown'
    return 'none'
  },
  set: (key) => setDetailRenderer(key),
})

const retryTimers = new Map<string, ReturnType<typeof setTimeout>>()

onBeforeUnmount(() => {
  narrowQuery.removeEventListener('change', syncNarrow)
  window.removeEventListener('keydown', onWindowKeydown)
  for (const timer of retryTimers.values()) clearTimeout(timer)
  retryTimers.clear()
})

function findItem(itemId: string): TimelineItemVM | undefined {
  return group.items.find((item) => item.id === itemId)
}

function tokenSpecs(groupName: TokenGroup) {
  return TOKEN_SPECS.filter((spec) => spec.group === groupName)
}

function thinkingDetail(): TimelineDetailVM {
  return {
    status: 'ready',
    component: DETAIL_COMPONENTS.thinking,
    props: { content: THINKING_TEXT, loading: false },
  }
}

function readDetail(item: TimelineItemVM): TimelineDetailVM {
  return {
    status: 'ready',
    component: DETAIL_COMPONENTS.read,
    props: {
      mode: 'file',
      path: item.primary || READ_FILE.path,
      code: READ_FILE.code,
      language: READ_FILE.language,
    },
  }
}

function diffDetail(): TimelineDetailVM {
  return {
    status: 'ready',
    component: DETAIL_COMPONENTS.diff,
    props: {
      mode: 'diff',
      path: EDIT_DIFF.path,
      oldCode: EDIT_DIFF.oldCode,
      newCode: EDIT_DIFF.newCode,
    },
  }
}

function commandDetail(item: TimelineItemVM): TimelineDetailVM {
  return {
    status: 'ready',
    component: DETAIL_COMPONENTS.command,
    props: { command: item.primary || 'pnpm test', lines: COMMAND_LINES },
  }
}

function searchDetail(item: TimelineItemVM): TimelineDetailVM {
  return {
    status: 'ready',
    component: DETAIL_COMPONENTS.search,
    props: { query: item.primary || 'timeline', results: SEARCH_RESULTS },
  }
}

function imageDetail(): TimelineDetailVM {
  return {
    status: 'ready',
    component: DETAIL_COMPONENTS.image,
    props: { ...GENERATED_IMAGE },
  }
}

function markdownDetail(): TimelineDetailVM {
  return {
    status: 'ready',
    component: DETAIL_COMPONENTS.markdown,
    props: { content: THINKING_TEXT, loading: false },
  }
}

function setDetailRenderer(key: DetailRendererKey): void {
  const item = selectedItem.value
  if (key === 'none') {
    delete item.detail
    expandedItemIds.value = expandedItemIds.value.filter((id) => id !== item.id)
    return
  }

  if (key === 'thinking') item.detail = thinkingDetail()
  else if (key === 'read') item.detail = readDetail(item)
  else if (key === 'diff') item.detail = diffDetail()
  else if (key === 'command') item.detail = commandDetail(item)
  else if (key === 'search') item.detail = searchDetail(item)
  else if (key === 'image') item.detail = imageDetail()
  else item.detail = markdownDetail()
}

function setDetailStatus(status: TimelineDetailStatus): void {
  const detail = selectedItem.value.detail
  if (!detail || detail.status === status) return

  if (status === 'error') {
    selectedItem.value.detail = {
      status: 'error',
      errorText: 'Preview could not be loaded.',
      retryLabel: 'Retry',
      component: detail.component,
      props: detail.props,
    }
    return
  }

  if (status === 'ready') {
    if (!detail.component) return
    selectedItem.value.detail = {
      status: 'ready',
      component: detail.component,
      props: detail.props,
    }
    return
  }

  selectedItem.value.detail = {
    status: 'loading',
    component: detail.component,
    props: detail.props,
  }
}

function finishLoading(): void {
  const detail = selectedItem.value.detail
  if (detail?.status !== 'loading' || !detail.component) return
  selectedItem.value.detail = {
    status: 'ready',
    component: detail.component,
    props: detail.props,
  }
}

function onDetailToggle(itemId: string, expanded: boolean): void {
  logEvent(`${expanded ? 'expand' : 'collapse'}: ${itemId}`)
}

function onActivate(itemId: string): void {
  logEvent(`activate: ${itemId}`)
}

function onDetailRetry(itemId: string): void {
  logEvent(`retry: ${itemId}`)
  const item = findItem(itemId)
  const detail = item?.detail
  if (!item || !detail) return

  item.detail = {
    status: 'loading',
    component: detail.component,
    props: detail.props,
  }

  const existing = retryTimers.get(itemId)
  if (existing) clearTimeout(existing)
  retryTimers.set(
    itemId,
    setTimeout(() => {
      const currentItem = findItem(itemId)
      const current = currentItem?.detail
      if (currentItem && current?.status === 'loading' && current.component) {
        currentItem.detail = {
          status: 'ready',
          component: current.component,
          props: current.props,
        }
      }
      retryTimers.delete(itemId)
    }, 900),
  )
}

function toggleSelectedItem(): void {
  const item = selectedItem.value
  const next = !selectedItemExpanded.value
  expandedItemIds.value = next
    ? [...expandedItemIds.value, item.id]
    : expandedItemIds.value.filter((id) => id !== item.id)
  onDetailToggle(item.id, next)
}

function onSpeedInput(event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) speed.value = value
}

function setGroupExpanded(value: boolean): void {
  groupExpanded.value = value
  logEvent(`${value ? 'expand' : 'collapse'} group`)
}

function setExpandedItemIds(itemIds: string[]): void {
  expandedItemIds.value = itemIds
}

function setRenderGroup(value: boolean): void {
  renderGroup.value = value
}

function onSendPrompt(prompt: string): void {
  userPrompt.value = prompt
  replay()
}

function applyPreset(name: string): void {
  Object.assign(tokens, DEFAULT_TOKENS)
  Object.assign(tokens, PRESETS[name] ?? {})
}

function resetTokens(): void {
  applyPreset('Light')
}

async function copyTokens(): Promise<void> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(tokens, null, 2))
    copyState.value = 'copied'
  } catch {
    copyState.value = 'failed'
  }
  setTimeout(() => {
    copyState.value = 'idle'
  }, 1600)
}
</script>
