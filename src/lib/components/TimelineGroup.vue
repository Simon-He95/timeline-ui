<template>
  <div
    class="timeline-ui tl-group"
    :class="{ 'is-expanded': isExpanded, 'is-running': group.running }"
  >
    <button
      type="button"
      class="tl-group__header"
      :aria-expanded="isExpanded"
      @click="toggleGroup"
    >
      <span v-if="group.icon" class="tl-group__icon">
        <component :is="group.icon" :status="group.running ? 'running' : 'complete'" />
      </span>
      <span class="tl-group__summary">
        <slot name="summary" :group="group">{{ group.summary }}</slot>
      </span>
      <TimelineChevron />
    </button>

    <div
      class="tl-reveal"
      :class="{ 'is-expanded': isExpanded }"
      :inert="isExpanded ? undefined : true"
      :aria-hidden="isExpanded ? undefined : 'true'"
    >
      <div class="tl-reveal__clipper">
        <div class="tl-group__rail">
          <TimelineRow
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :expanded="isItemExpanded(item.id)"
            :lazy-details="lazy"
            :keep-details-mounted="keepMounted"
            @toggle="toggleItem(item.id)"
            @retry="emit('detail-retry', item.id)"
            @activate="emit('activate', item.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TimelineGroupEmits, TimelineGroupProps } from '../types'
import TimelineChevron from './TimelineChevron.vue'
import TimelineRow from './TimelineRow.vue'

defineOptions({ name: 'TimelineGroup' })

const props = withDefaults(defineProps<TimelineGroupProps>(), {
  // Vue casts an absent Boolean prop to false. The explicit undefined default
  // keeps `undefined` meaning "uncontrolled" for the expansion props.
  expanded: undefined,
  expandedItemIds: undefined,
  lazyDetails: true,
  keepDetailsMounted: true,
})

const emit = defineEmits<TimelineGroupEmits>()

const internalExpanded = ref(false)
const internalItemIds = ref<ReadonlySet<string>>(new Set())

// Keep the uncontrolled fallback aligned with a controlled prop so switching
// between the two modes never resurrects stale expansion state.
watch(
  () => props.expanded,
  (expanded) => {
    if (expanded !== undefined) internalExpanded.value = expanded
  },
  { immediate: true },
)
watch(
  () => props.expandedItemIds,
  (itemIds) => {
    if (itemIds !== undefined) internalItemIds.value = new Set(itemIds)
  },
  { immediate: true },
)

const lazy = computed(() => props.lazyDetails ?? true)
const keepMounted = computed(() => props.keepDetailsMounted ?? true)
const isExpanded = computed(() => props.expanded ?? internalExpanded.value)
const currentItemIds = computed<readonly string[]>(
  () => props.expandedItemIds ?? [...internalItemIds.value],
)

function isItemExpanded(itemId: string): boolean {
  return currentItemIds.value.includes(itemId)
}

function toggleGroup(): void {
  const next = !isExpanded.value
  if (props.expanded === undefined) internalExpanded.value = next
  emit('update:expanded', next)
}

function toggleItem(itemId: string): void {
  const next = !isItemExpanded(itemId)
  const nextIds = new Set(currentItemIds.value)
  if (next) nextIds.add(itemId)
  else nextIds.delete(itemId)

  if (props.expandedItemIds === undefined) internalItemIds.value = nextIds
  emit('update:expandedItemIds', [...nextIds])
  emit('detail-toggle', itemId, next)
}
</script>
