import animeGirl from './assets/anime-girl.png'

export const THINKING_TEXT = `I’m checking the extracted row against the current desktop timeline.

1. The leading chevron consumes a column and breaks icon alignment.
2. The group already has a leading status glyph; rows should start with the tool icon.
3. Move the chevron after the row content and pass status into the icon component.`

export const ASSISTANT_MARKDOWN = `The extraction now streams as a real transcript.

- **Group** keeps the fixed skeleton, leading glyph and chevron after the summary.
- **Read file** renders the file with \`stream-diffs\` instead of a fake diff.
- **Edit file** renders a real unified diff.
- **Generate image** paints the image result in a host card.
- **Details** paint a skeleton shell before the host panel is ready.
- **Markdown** streams through \`markstream-vue\`.

\`\`\`ts
type TimelineItemVM = {
  id: string
  label: string
  icon?: Component
  detail?: TimelineDetailVM
}
\`\`\`

Use **Restart** at 0.5× to inspect the loading shell, or 4× for the full pass.`

export const READ_FILE = {
  path: 'src/lib/components/TimelineGroup.vue',
  language: 'vue',
  code: `<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TimelineGroupVM } from '../types'
import TimelineChevron from './TimelineChevron.vue'
import TimelineRow from './TimelineRow.vue'

const props = withDefaults(defineProps<{
  group: TimelineGroupVM
  expanded?: boolean
  expandedItemIds?: readonly string[]
}>(), {
  expanded: undefined,
  expandedItemIds: undefined,
})

const emit = defineEmits<{
  'update:expanded': [expanded: boolean]
  'update:expandedItemIds': [itemIds: string[]]
}>()

const internalExpanded = ref(false)
const internalItemIds = ref<ReadonlySet<string>>(new Set())

watch(
  () => props.expanded,
  (expanded) => {
    if (expanded !== undefined) internalExpanded.value = expanded
  },
  { immediate: true },
)

const isExpanded = computed(() => props.expanded ?? internalExpanded.value)

function toggleGroup(): void {
  const next = !isExpanded.value
  if (props.expanded === undefined) internalExpanded.value = next
  emit('update:expanded', next)
}
</script>

<template>
  <div class="timeline-ui tl-group" :class="{ 'is-expanded': isExpanded }">
    <button type="button" class="tl-group__header" @click="toggleGroup">
      <span v-if="group.icon" class="tl-group__icon">
        <component :is="group.icon" :status="group.running ? 'running' : 'complete'" />
      </span>
      <span class="tl-group__summary">{{ group.summary }}</span>
      <TimelineChevron />
    </button>

    <div class="tl-reveal" :class="{ 'is-expanded': isExpanded }">
      <div class="tl-reveal__clipper">
        <div class="tl-group__rail">
          <TimelineRow
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :expanded="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>`,
}

export const EDIT_DIFF = {
  path: 'src/lib/components/TimelineRow.vue',
  oldCode: `<template>
  <div class="tl-row">
    <component :is="isInteractive ? 'button' : 'div'" class="tl-row__header">
      <TimelineChevron />
      <span class="tl-row__icon">
        <component :is="iconComponent" />
      </span>
      <span class="tl-row__label">{{ item.label }}</span>
      <span class="tl-row__primary">{{ item.primary }}</span>
    </component>
    <TimelineDetails v-if="item.detail" :detail="item.detail" />
  </div>
</template>`,
  newCode: `<template>
  <div class="tl-row">
    <component :is="isInteractive ? 'button' : 'div'" class="tl-row__header">
      <span class="tl-row__icon">
        <component :is="iconComponent" :status="item.status" />
      </span>
      <span class="tl-row__label">{{ item.label }}</span>
      <span class="tl-row__primary">{{ item.primary }}</span>
      <TimelineChevron v-if="hasDetails" />
    </component>
    <TimelineDetails v-if="item.detail" :detail="item.detail" />
  </div>
</template>`,
}

export const COMMAND_LINES = [
  '✓ 8 tests passed',
  '  ✓ keeps the expand chevron after content',
  '  ✓ passes status to group and item icons',
  '  ✓ paints the loading shell before content',
  '✓ built in 1.42s',
]

export const SEARCH_RESULTS = [
  { path: 'src/lib/components/TimelineRow.vue', line: 14, text: 'class="tl-row__icon"' },
  { path: 'src/lib/styles/timeline.css', line: 126, text: 'grid-template-columns: var(--timeline-ui-icon-size)' },
  { path: 'src/lib/components/TimelineGroup.vue', line: 24, text: 'class="tl-group__icon"' },
]


export const GENERATED_IMAGE = {
  src: animeGirl,
  alt: 'Cute blue-haired anime girl smiling',
  prompt: 'Cute blue-haired anime girl, soft daylight, mint and navy palette',
  meta: '900 × 900, mock render',
  credit: 'Wikipe-tan by Kasuga, CC BY-SA 2.5',
}
