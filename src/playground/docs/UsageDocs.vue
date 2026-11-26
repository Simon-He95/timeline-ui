<template>
  <section class="docs">
    <div class="docs__layout">
      <aside class="docs__toc">
        <span class="docs__toc-label">On this page</span>
        <nav>
          <a href="#concepts">Concepts</a>
          <a href="#install">Install</a>
          <a href="#quick-start">Quick start</a>
          <a href="#api">Props &amp; events</a>
          <a href="#types">Types</a>
          <a href="#slots">Slots</a>
          <a href="#examples">Examples</a>
          <a href="#theming">Theming</a>
        </nav>
        <div class="docs__toc-foot">
          <a href="https://www.npmjs.com/package/@simon_he/timeline-ui" target="_blank" rel="noreferrer">
            @simon_he/timeline-ui
          </a>
          <span>v0.1.3</span>
        </div>
      </aside>

      <main class="docs__body">
        <header class="docs__hero">
          <div class="docs__hero-copy">
            <h1>TimelineGroup</h1>
            <p class="docs__lede">
              A fixed-layout timeline group for agent transcripts. The host owns copy, icons and
              detail panels; the component owns the rail, rows and disclosure.
            </p>
            <div class="docs__actions">
              <button
                type="button"
                class="docs__button docs__button--primary"
                @click="emit('open-lab')"
              >
                Open the lab
              </button>
              <a class="docs__button" href="#quick-start">Quick start</a>
            </div>
            <p class="docs__facts">Vue 3. No runtime dependencies. CSS variables.</p>
          </div>

          <div class="docs__live-card">
            <div class="docs__live-head">
              <span class="docs__live-label"><i class="docs__live-dot" /> Live</span>
              <code>TimelineGroup</code>
            </div>
            <div class="docs__live-body">
              <TimelineGroup :group="exampleGroup" :expanded="true" />
            </div>
            <p class="docs__live-note">
              The shell is fixed. Copy, icons and detail panels are data supplied by the host.
            </p>
          </div>
        </header>

        <section id="concepts" class="docs__section">
          <h2>Concepts</h2>
          <p>
            Timeline UI is a fixed structural primitive. The host decides what the transcript
            means; the component owns the skeleton and the disclosure mechanics.
          </p>

          <div class="docs__principles">
            <article>
              <strong>Fixed skeleton</strong>
              <p>The group header, row header, rail and chevrons stay in place. Tokens change the skin, not the structure.</p>
            </article>
            <article>
              <strong>No product coupling</strong>
              <p>No i18n, stores, data fetching, markdown or icon set. Vue is the only peer dependency.</p>
            </article>
            <article>
              <strong>Data in, events out</strong>
              <p>The host builds the view model, owns detail loading and controls expansion when needed.</p>
            </article>
            <article>
              <strong>One public component</strong>
              <p>Rows, details and chevrons are internal. Deep imports are blocked by the package exports map.</p>
            </article>
          </div>

          <div class="docs__split">
            <div>
              <h3>Library owns</h3>
              <ul class="docs__list">
                <li>Group and row skeleton</li>
                <li>Rail, disclosure and chevron motion</li>
                <li>Loading, ready and error detail shells</li>
                <li>Focus, inert and reduced-motion behavior</li>
              </ul>
            </div>
            <div>
              <h3>Host owns</h3>
              <ul class="docs__list">
                <li>All copy and translations</li>
                <li>Icons and detail panel components</li>
                <li>Data fetching and retry transitions</li>
                <li>Message layout, scrolling and virtualization</li>
              </ul>
            </div>
          </div>

          <h3>Layout contract</h3>
          <ul class="docs__list">
            <li>The group header reads icon, summary, chevron. The chevron follows the summary instead of being pushed to the edge.</li>
            <li>Rows read icon, label, optional primary parameter and an expandable chevron that follows the row content.</li>
            <li>The rail starts below the group header, aligns with the group icon center by default and is clipped by the reveal.</li>
            <li>Details align with the row icon edge. The shell is transparent; the host panel owns its surface.</li>
            <li>The summary and group-extra slots change header-adjacent content; the row slot can replace a whole row while the group header, rail and reveal stay fixed.</li>
          </ul>

          <h3>Assistant turn integration</h3>
          <p>
            The group is a block inside the host's assistant turn, not a message by itself. Compose
            one assistant header, the group, then the final assistant text. When the answer starts,
            the host may collapse the group and leave only its summary. The library does not infer
            this from message text.
          </p>

          <h3>Accessibility and support</h3>
          <ul class="docs__list">
            <li>Group and row headers are native buttons with <code>aria-expanded</code>.</li>
            <li>Collapsed bodies and detail shells are <code>inert</code> and <code>aria-hidden</code>.</li>
            <li>The error state uses <code>role="alert"</code>; the retry control is a normal button.</li>
            <li>Focus rings use the accent token. Reduced motion disables reveal, skeleton and shimmer animations.</li>
            <li>The components use no browser APIs during setup and can render on the server. Import the stylesheet in the host entry.</li>
            <li>CSS baseline: Chrome/Edge 111+, Safari 16.4+, Firefox 113+. No CSS polyfills are included.</li>
          </ul>

          <div class="docs__callout">
            The detail lifecycle, controlled expansion and a full type reference are in
            <a href="#examples">Examples</a> and <a href="#types">Types</a>.
          </div>
        </section>

        <section id="install" class="docs__section">
          <h2>Install</h2>
          <p>
            Install the package alongside Vue. <code>vue</code> is the only peer dependency;
            the library ships no icons, strings or data-fetching layer.
          </p>
          <DocsCodeBlock label="shell" language="shell" :code="installCode" />
          <p>The stylesheet is extracted and must be imported once. The JavaScript bundle has no CSS side effect.</p>
          <DocsCodeBlock label="main.ts" language="ts" :code="styleCode" />
          <div class="docs__callout">
            The package is ESM-only. Deep imports are blocked by the <code>exports</code> map;
            <code>TimelineGroup</code> and the public types are the complete surface.
          </div>
        </section>

        <section id="quick-start" class="docs__section">
          <h2>Quick start</h2>
          <p>
            Build one <code>TimelineGroupVM</code> and pass it in. Expansion is uncontrolled by
            default; use <code>v-model</code> when the host owns the state.
          </p>
          <DocsCodeBlock label="App.vue" language="vue" :code="quickStartCode" />
          <div class="docs__callout">
            A detail starts in <code>loading</code>. When the host panel is ready, replace the whole
            detail object with a <code>ready</code> one. The shell never waits to paint.
          </div>
        </section>

        <section id="api" class="docs__section">
          <h2>Props &amp; events</h2>

          <h3>Props</h3>
          <div class="docs__table-wrap">
            <table class="docs__table">
              <thead>
                <tr><th>Prop</th><th>Type</th><th>Default</th><th>What it does</th></tr>
              </thead>
              <tbody>
                <tr><td><code>group</code></td><td><code>TimelineGroupVM</code></td><td>required</td><td>The complete group view model.</td></tr>
                <tr><td><code>expanded</code></td><td><code>boolean | undefined</code></td><td><code>undefined</code></td><td>Controlled group state; omit for internal state.</td></tr>
                <tr><td><code>expandedItemIds</code></td><td><code>readonly string[] | undefined</code></td><td><code>undefined</code></td><td>Controlled open row ids; omit for internal state.</td></tr>
                <tr><td><code>lazyDetails</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Do not mount a detail before its first open.</td></tr>
                <tr><td><code>keepDetailsMounted</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Keep a detail shell mounted after its first open.</td></tr>
                <tr><td><code>unmountCollapsed</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Unmount a large collapsed group rail after the close transition.</td></tr>
                <tr><td><code>lazyUnmountThreshold</code></td><td><code>number</code></td><td><code>32</code></td><td>Item count at which <code>unmountCollapsed</code> starts applying.</td></tr>
                <tr><td><code>staggerEnter</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Stagger newly added rail items with a per-index enter delay, capped at index 8.</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Events</h3>
          <div class="docs__table-wrap">
            <table class="docs__table">
              <thead>
                <tr><th>Event</th><th>Payload</th><th>When it fires</th></tr>
              </thead>
              <tbody>
                <tr><td><code>update:expanded</code></td><td><code>(expanded: boolean)</code></td><td>The group header was toggled.</td></tr>
                <tr><td><code>update:expandedItemIds</code></td><td><code>(itemIds: string[])</code></td><td>A row was toggled.</td></tr>
                <tr><td><code>detail-toggle</code></td><td><code>(itemId: string, expanded: boolean)</code></td><td>A row toggled; start loading here.</td></tr>
                <tr><td><code>detail-retry</code></td><td><code>(itemId: string)</code></td><td>The detail shell retry button was pressed.</td></tr>
                <tr><td><code>activate</code></td><td><code>(itemId: string)</code></td><td>A row without details and with <code>activatable: true</code> was pressed.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="docs__callout">
            Type names in the samples are interactive. Hover one for its shape, or select it to
            open the full <a href="#types">type reference</a>.
          </div>
        </section>

        <section id="types" class="docs__section">
          <h2>Types</h2>
          <p>
            The public view models are the contract between the host and the library. Hover a type
            name in any sample for a quick shape, then select it to open the declaration here.
          </p>
          <DocsCodeBlock label="types.ts" language="ts" :code="TYPES_OVERVIEW" />
          <DocsTypeExplorer />
        </section>

        <section id="slots" class="docs__section">
          <h2>Slots</h2>
          <p>
            The group header, rail and reveal stay fixed. The default row is text/icon based;
            <code>row</code> replaces the whole row when a host card needs richer content.
            Icons, details and all copy still arrive as data.
          </p>
          <div class="docs__table-wrap">
            <table class="docs__table">
              <thead>
                <tr><th>Slot</th><th>Props</th><th>What it renders</th></tr>
              </thead>
              <tbody>
                <tr><td><code>summary</code></td><td><code>{ group: TimelineGroupVM }</code></td><td>Rich content inside the group header button. The rail, rows and chevron stay fixed. Use phrasing content only.</td></tr>
                <tr><td><code>group-extra</code></td><td><code>{ group: TimelineGroupVM }</code></td><td>Content below the header and above the rail, such as a collapsed thinking excerpt.</td></tr>
                <tr><td><code>row</code></td><td><code>{ item, expanded, toggle, index }</code></td><td>Replaces the whole default row, including its header and detail. The host owns the row content and interactions; call <code>toggle</code> for expansion.</td></tr>
                <tr><td><code>label</code></td><td><code>{ item: TimelineItemVM }</code></td><td>Replaces the default row label text, for example to add search highlighting.</td></tr>
                <tr><td><code>primary</code></td><td><code>{ item: TimelineItemVM }</code></td><td>Replaces the default primary parameter text.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="docs__example">
            <div class="docs__example-head">
              <span class="docs__example-label">Live: summary slot</span>
              <span class="docs__example-hint">phrasing content only</span>
            </div>
            <div class="docs__example-body">
              <TimelineGroup :group="exampleGroup" :expanded="true">
                <template #summary="{ group }">
                  <span class="docs__slot-summary">
                    {{ group.summary }}
                    <em class="docs__slot-note">host slot</em>
                  </span>
                </template>
              </TimelineGroup>
            </div>
          </div>
          <DocsCodeBlock label="Usage.vue" language="vue" :code="slotCode" />
          <DocsCodeBlock label="RowSlot.vue" language="vue" :code="rowSlotCode" />
          <div class="docs__callout">
            Row icons and group icons are components on the view model. Group icons receive
            <code>running | complete</code>; row icons receive the row status. The library bundles no icon set.
          </div>
        </section>

        <section id="examples" class="docs__section">
          <h2>Examples</h2>
          <p>
            The live example above is already a real <code>&lt;TimelineGroup&gt;</code>. These are
            the two patterns most hosts need first.
          </p>

          <h3>Controlled group and rows</h3>
          <DocsCodeBlock label="Controlled.vue" language="vue" :code="controlledCode" />

          <h3>Detail loading lifecycle</h3>
          <p>
            Start a detail on <code>detail-toggle</code>; replace the union rather than mutating its
            status. The library never fetches data.
          </p>
          <DocsCodeBlock label="loadDetail.ts" language="ts" :code="detailCode" />

          <div class="docs__callout">
            Defaults are opinionated: <code>lazyDetails</code> and <code>keepDetailsMounted</code> are
            both <code>true</code>. Set them on the group when the host needs different mount timing.
          </div>
        </section>

        <section id="theming" class="docs__section">
          <h2>Theming</h2>
          <p>
            Reskin with CSS variables or use the <code>data-tone="dark"</code> preset. The layout and
            markup stay fixed; tokens are the supported styling API.
          </p>
          <DocsCodeBlock label="Usage.vue" language="vue" :code="themeCode" />
          <div class="docs__tokens">
            <span>--timeline-ui-indent</span>
            <span>--timeline-ui-rail-color</span>
            <span>--timeline-ui-accent</span>
            <span>--timeline-ui-font</span>
            <span>all tokens</span>
          </div>

          <details class="docs__token-details">
            <summary>All tokens and defaults</summary>
            <div class="docs__table-wrap">
              <table class="docs__table">
                <thead>
                  <tr><th>Group</th><th>Token</th><th>Default</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  <tr v-for="row in tokenRows" :key="row.key">
                    <td>{{ row.group }}</td>
                    <td><code>{{ row.key }}</code></td>
                    <td><code>{{ row.value }}</code></td>
                    <td>{{ row.label }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="docs__token-note">The dark tone overrides these color tokens:</p>
            <div class="docs__table-wrap">
              <table class="docs__table">
                <thead>
                  <tr><th>Token</th><th>Dark value</th></tr>
                </thead>
                <tbody>
                  <tr v-for="row in darkTokenRows" :key="row.key">
                    <td><code>{{ row.key }}</code></td>
                    <td><code>{{ row.value }}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>

          <div class="docs__callout">
            The lab's <strong>Tokens</strong> tab edits every public token live, including the
            default <code>--timeline-ui-indent</code> of <code>4px</code>.
          </div>
        </section>

        <footer class="docs__footer">
          <div>
            <strong>Timeline UI</strong>
            <p>This Docs view is the live reference. The Lab has live states, detail shells and every token.</p>
          </div>
        </footer>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
import { TimelineGroup, type TimelineGroupVM } from '../../lib'
import { ICONS } from '../icons'
import DocsCodeBlock from './DocsCodeBlock.vue'
import DocsTypeExplorer from './DocsTypeExplorer.vue'
import { TYPES_OVERVIEW } from './type-docs'
import { DEFAULT_TOKENS, PRESETS, TOKEN_SPECS } from '../token-spec'

const emit = defineEmits<{
  (event: 'open-lab'): void
}>()

const exampleGroup: TimelineGroupVM = {
  summary: '2 tools, 1 file',
  icon: markRaw(ICONS.group),
  items: [
    {
      id: 'read',
      kind: 'tool',
      status: 'complete',
      label: 'Read file',
      primary: 'src/TimelineGroup.vue',
      icon: markRaw(ICONS.book),
    },
    {
      id: 'test',
      kind: 'tool',
      status: 'running',
      label: 'Run tests',
      primary: 'pnpm test',
      icon: markRaw(ICONS.terminal),
    },
  ],
}

type DocTokenRow = { group: string; key: string; label: string; value: string }

const tokenRows: DocTokenRow[] = [
  { group: 'Font', key: '--timeline-ui-font', label: 'Text font', value: 'system UI stack' },
  { group: 'Font', key: '--timeline-ui-font-mono', label: 'Primary/meta font', value: 'system mono stack' },
  { group: 'Font', key: '--timeline-ui-line-height', label: 'Line box', value: '20px' },
  ...TOKEN_SPECS.map((spec) => ({
    group: spec.group,
    key: spec.key,
    label: spec.label,
    value: DEFAULT_TOKENS[spec.key] ?? '',
  })),
  {
    group: 'Motion',
    key: '--timeline-ui-motion-ease',
    label: 'Reveal easing',
    value: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  },
]

const darkTokenRows = Object.entries(PRESETS.Dark)
  .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  .map(([key, value]) => ({ key, value }))

const installCode = `pnpm add @simon_he/timeline-ui vue

# or
npm install @simon_he/timeline-ui vue`

const styleCode = `import '@simon_he/timeline-ui/style.css'`

const quickStartCode = `<script setup lang="ts">
import { markRaw, reactive, ref } from 'vue'
import { TimelineGroup, type TimelineGroupVM } from '@simon_he/timeline-ui'
import '@simon_he/timeline-ui/style.css'
import ReadIcon from './ReadIcon.vue'

const open = ref(true)
const group = reactive<TimelineGroupVM>({
  summary: '1 tool',
  items: [
    {
      id: 'read-1',
      kind: 'tool',
      status: 'complete',
      label: 'Read file',
      primary: 'src/App.vue',
      icon: markRaw(ReadIcon),
    },
  ],
})
<\/script>

<template>
  <TimelineGroup v-model:expanded="open" :group="group" />
</template>`

const slotCode = `<TimelineGroup :group="group" :expanded="true">
  <template #summary="{ group }">
    <span class="my-summary">{{ group.summary }}</span>
  </template>
</TimelineGroup>`

const rowSlotCode = `<TimelineGroup :group="group" :expanded="true">
  <template #row="{ item, expanded, toggle }">
    <HostToolRow
      v-if="item.kind === 'tool'"
      :data="item.data"
      :expanded="expanded"
      @toggle="toggle"
    />
    <button v-else type="button" @click="toggle">
      {{ item.label }}
    </button>
  </template>
</TimelineGroup>`

const controlledCode = `<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const openItemIds = ref<string[]>([])
<\/script>

<template>
  <TimelineGroup
    v-model:expanded="open"
    v-model:expanded-item-ids="openItemIds"
    :group="group"
    @detail-toggle="startLoading"
    @detail-retry="retryDetail"
    @activate="activateItem"
  />
</template>`

const detailCode = `function onDetailToggle(itemId: string, expanded: boolean): void {
  if (!expanded) return
  const item = group.items.find((entry) => entry.id === itemId)
  if (!item || item.detail?.status === 'ready') return

  item.detail = { status: 'loading' }
  loadPanel(item.id).then(({ component, props }) => {
    item.detail = { status: 'ready', component, props }
  })
}`

const themeCode = `<TimelineGroup
  :group="group"
  data-tone="dark"
  style="--timeline-ui-indent: 12px; --timeline-ui-accent: #5aa2ff"
/>`
</script>

<style scoped>
.docs {
  grid-column: 1 / -1;
  grid-row: 2 / -1;
  min-height: 0;
  overflow: auto;
  background:
    radial-gradient(circle at 86% 2%, rgb(47 129 247 / 7%), transparent 26%),
    var(--wb-bg);
}

.docs__layout {
  display: grid;
  grid-template-columns: 188px minmax(0, 900px);
  gap: 64px;
  align-items: start;
  max-width: 1240px;
  margin: 0 auto;
  padding: 44px 36px 96px;
}

.docs__toc {
  position: sticky;
  top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.docs__toc-label {
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.docs__toc nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.docs__toc a {
  padding: 4px 0;
  color: var(--wb-muted);
  font-size: 12px;
  text-decoration: none;
}

.docs__toc a:hover {
  color: var(--wb-ink);
}

.docs__toc-foot {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--wb-line);
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 9.5px;
}

.docs__toc-foot a {
  color: inherit;
  text-decoration: none;
}

.docs__toc-foot a:hover {
  color: var(--wb-ink);
}

.docs__body {
  min-width: 0;
}

.docs__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  gap: 48px;
  align-items: center;
  padding: 18px 0 52px;
  border-bottom: 1px solid var(--wb-line);
}

.docs__hero h1 {
  margin: 0 0 16px;
  color: var(--wb-ink);
  font-size: clamp(34px, 3.6vw, 42px);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1.05;
}

.docs__lede {
  max-width: 48ch;
  margin: 0;
  color: var(--wb-muted);
  font-size: 14px;
  line-height: 1.65;
}

.docs__actions {
  display: flex;
  gap: 8px;
  margin-top: 24px;
}

.docs__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid var(--wb-line-strong);
  border-radius: 7px;
  background: #fff;
  color: var(--wb-ink);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.docs__button:hover {
  border-color: var(--wb-ink);
}

.docs__button--primary {
  border-color: var(--wb-accent);
  background: var(--wb-accent);
  color: #fff;
}

.docs__button--primary:hover {
  border-color: #0b5db8;
  background: #0b5db8;
}

.docs__facts {
  margin: 22px 0 0;
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 9.5px;
  letter-spacing: 0.02em;
}

.docs__live-card {
  padding: 14px;
  border: 1px solid var(--wb-line);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 40px rgb(16 20 26 / 7%);
}

.docs__live-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 2px 12px;
}

.docs__live-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--wb-muted);
  font-family: var(--wb-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.docs__live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #1a9a54;
  box-shadow: 0 0 0 3px rgb(26 154 84 / 12%);
}

.docs__live-head code {
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 9.5px;
}

.docs__live-body {
  padding: 16px 12px;
  border: 1px solid var(--wb-line);
  border-radius: 10px;
  background: #fbfcfd;
}

.docs__live-note {
  margin: 12px 2px 0;
  color: var(--wb-faint);
  font-size: 10px;
  line-height: 1.5;
}

.docs__section {
  padding: 42px 0;
  border-bottom: 1px solid var(--wb-line);
  scroll-margin-top: 24px;
}

.docs__section h2 {
  margin: 0 0 12px;
  color: var(--wb-ink);
  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.035em;
}

.docs__section h3 {
  margin: 28px 0 8px;
  color: var(--wb-ink);
  font-size: 14px;
  font-weight: 650;
}

.docs__section p {
  max-width: 70ch;
  margin: 0 0 12px;
  color: var(--wb-muted);
  font-size: 13px;
  line-height: 1.65;
}

.docs__section code,
.docs__callout code {
  padding: 1px 4px;
  border-radius: 4px;
  background: #eef1f4;
  color: #38414b;
  font-family: var(--wb-mono);
  font-size: 0.9em;
}

.docs__callout {
  margin-top: 14px;
  padding: 12px 14px;
  border-left: 2px solid var(--wb-accent);
  background: var(--wb-accent-soft);
  color: #315982;
  font-size: 12px;
  line-height: 1.6;
}

.docs__callout code {
  background: rgb(255 255 255 / 65%);
  color: inherit;
}

.docs__callout a {
  color: #175ca4;
  font-weight: 600;
  text-underline-offset: 2px;
}

.docs__principles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.docs__principles article {
  padding: 13px 14px;
  border: 1px solid var(--wb-line);
  border-radius: 9px;
  background: #fff;
}

.docs__principles strong {
  color: var(--wb-ink);
  font-size: 12px;
}

.docs__principles p {
  margin: 5px 0 0;
  color: var(--wb-muted);
  font-size: 11.5px;
  line-height: 1.55;
}

.docs__split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 26px;
}

.docs__split h3 {
  margin-top: 0;
}

.docs__list {
  margin: 0 0 16px;
  padding-left: 18px;
  color: var(--wb-muted);
  font-size: 12px;
  line-height: 1.65;
}

.docs__list li + li {
  margin-top: 4px;
}

.docs__token-details {
  margin-top: 14px;
  border: 1px solid var(--wb-line);
  border-radius: 9px;
  background: #fff;
}

.docs__token-details summary {
  padding: 9px 12px;
  color: var(--wb-ink);
  font-family: var(--wb-mono);
  font-size: 10px;
  cursor: pointer;
}

.docs__token-details[open] summary {
  border-bottom: 1px solid var(--wb-line);
}

.docs__token-details .docs__table-wrap {
  margin: 0;
  border: 0;
  border-radius: 0;
}

.docs__token-details .docs__table td:first-child {
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 9px;
  white-space: nowrap;
}

.docs__token-note {
  margin: 14px 12px 2px;
  color: var(--wb-faint);
  font-size: 10.5px;
}

.docs__table-wrap {
  overflow-x: auto;
  margin-top: 12px;
  border: 1px solid var(--wb-line);
  border-radius: 10px;
  background: #fff;
}

.docs__table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.docs__table th {
  padding: 9px 12px;
  border-bottom: 1px solid var(--wb-line);
  background: #f7f8fa;
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.docs__table td {
  padding: 10px 12px;
  border-bottom: 1px solid #edf0f3;
  color: var(--wb-muted);
  font-size: 12px;
  line-height: 1.5;
  vertical-align: top;
}

.docs__table tr:last-child td {
  border-bottom: 0;
}

.docs__table td:first-child code {
  color: var(--wb-ink);
}

.docs__example {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid var(--wb-line);
  border-radius: 12px;
  background: #fff;
}

.docs__example-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--wb-line);
  background: #f7f8fa;
}

.docs__example-label {
  color: var(--wb-muted);
  font-family: var(--wb-mono);
  font-size: 9.5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.docs__example-hint {
  color: var(--wb-faint);
  font-size: 10px;
}

.docs__example-body {
  padding: 18px 16px;
}

.docs__slot-summary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.docs__slot-note {
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 9px;
  font-style: normal;
}

.docs__tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.docs__tokens span {
  padding: 4px 7px;
  border: 1px solid var(--wb-line);
  border-radius: 5px;
  background: #fff;
  color: var(--wb-muted);
  font-family: var(--wb-mono);
  font-size: 9.5px;
}

.docs__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 38px 0 20px;
}

.docs__footer strong {
  color: var(--wb-ink);
  font-size: 14px;
}

.docs__footer p {
  max-width: 52ch;
  margin: 6px 0 0;
  color: var(--wb-faint);
  font-size: 11.5px;
  line-height: 1.6;
}

@media (max-width: 1080px) {
  .docs__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    padding: 26px 24px 72px;
  }

  .docs__toc {
    position: sticky;
    top: 0;
    z-index: 2;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    overflow-x: auto;
    margin: 0 -24px 4px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--wb-line);
    background: var(--wb-bg);
  }

  .docs__section {
    scroll-margin-top: 52px;
  }

  .docs__toc-label,
  .docs__toc-foot {
    display: none;
  }

  .docs__toc nav {
    flex-direction: row;
    gap: 14px;
    white-space: nowrap;
  }

  .docs__toc a {
    font-size: 11px;
  }
}

@media (max-width: 860px) {
  .docs__hero {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding-top: 6px;
  }

  .docs__hero h1 {
    font-size: 34px;
  }

  .docs__live-card {
    max-width: 560px;
  }
}

@media (max-width: 600px) {
  .docs__layout {
    padding: 20px 16px 56px;
  }

  .docs__principles,
  .docs__split {
    grid-template-columns: minmax(0, 1fr);
  }

  .docs__hero h1 {
    font-size: 30px;
  }

  .docs__actions {
    flex-wrap: wrap;
  }

  .docs__footer {
    flex-direction: column;
  }
}
</style>
