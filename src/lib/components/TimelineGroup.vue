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

    <slot name="group-extra" :group="group" />

    <div
      class="tl-reveal"
      :class="{ 'is-expanded': revealExpanded }"
      :inert="revealExpanded ? undefined : true"
      :aria-hidden="revealExpanded ? undefined : 'true'"
    >
      <div class="tl-reveal__clipper">
        <component
          :is="railComponent"
          v-if="contentMounted"
          v-bind="railTransitionProps"
          class="tl-group__rail"
        >
          <template v-for="(item, index) in group.items" :key="item.id">
            <div v-if="$slots.row" :key="item.id" class="tl-row-slot" :data-enter-index="index">
              <slot
                name="row"
                :item="item"
                :expanded="isItemExpanded(item.id)"
                :toggle="() => toggleItem(item.id)"
                :index="index"
              />
            </div>
            <TimelineRow
              v-else
              :key="item.id"
              :item="item"
              :expanded="isItemExpanded(item.id)"
              :lazy-details="lazy"
              :keep-details-mounted="keepMounted"
              :data-enter-index="index"
              @toggle="toggleItem(item.id)"
              @retry="emit('detail-retry', item.id)"
              @activate="emit('activate', item.id)"
            >
              <template v-if="$slots.label" #label="slotProps">
                <slot name="label" v-bind="slotProps" />
              </template>
              <template v-if="$slots.primary" #primary="slotProps">
                <slot name="primary" v-bind="slotProps" />
              </template>
            </TimelineRow>
          </template>
        </component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, TransitionGroup, type Component } from 'vue'
import type { TimelineGroupEmits, TimelineGroupProps } from '../types'
import { useTimelineGroupTransition } from '../group-transition'
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
  unmountCollapsed: false,
  lazyUnmountThreshold: undefined,
  staggerEnter: false,
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

const { contentMounted, contentOpen } = useTimelineGroupTransition({
  expanded: () => isExpanded.value,
  enabled: () => props.unmountCollapsed === true,
  itemCount: () => props.group.items.length,
  lazyThreshold: props.lazyUnmountThreshold,
})
const revealExpanded = computed(() =>
  props.unmountCollapsed === true ? contentOpen.value : isExpanded.value,
)

const STAGGER_STEP_MS = 40

function setStaggerDelay(element: Element) {
  const index = Number((element as HTMLElement).dataset.enterIndex ?? 0)
  ;(element as HTMLElement).style.transitionDelay = `${index * STAGGER_STEP_MS}ms`
}

const railComponent = computed<Component | string>(() =>
  props.staggerEnter ? TransitionGroup : 'div',
)
const railTransitionProps = computed(() => props.staggerEnter
  ? {
      tag: 'div',
      name: 'group-item',
      appear: false,
      onBeforeEnter: setStaggerDelay,
    }
  : {})

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
