<template>
  <div
    class="tl-row"
    :data-kind="item.kind"
    :class="{
      'is-expanded': expanded,
      'is-expandable': hasDetails,
      'is-interactive': isInteractive,
      'is-running': item.status === 'running',
    }"
  >
    <component
      :is="isInteractive ? 'button' : 'div'"
      class="tl-row__header"
      :type="isInteractive ? 'button' : undefined"
      :aria-expanded="hasDetails ? expanded : undefined"
      @click="onHeaderClick"
    >
      <span class="tl-row__icon">
        <component :is="iconComponent" :status="item.status" />
      </span>
      <span class="tl-row__label">{{ item.label }}</span>
      <span class="tl-row__primary">{{ item.primary ?? '' }}</span>
      <TimelineChevron v-if="hasDetails" />
    </component>

    <TimelineDetails
      v-if="item.detail"
      :detail="item.detail"
      :expanded="expanded"
      :lazy="lazyDetails"
      :keep-mounted="keepDetailsMounted"
      @retry="emit('retry')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import type { TimelineItemVM } from '../types'
import TimelineChevron from './TimelineChevron.vue'
import TimelineDetails from './TimelineDetails.vue'
import TimelineFallbackIcon from './TimelineFallbackIcon.vue'

defineOptions({ name: 'TimelineRow' })

const props = defineProps<{
  item: TimelineItemVM
  expanded: boolean
  lazyDetails: boolean
  keepDetailsMounted: boolean
}>()

const emit = defineEmits<{
  toggle: []
  retry: []
  activate: []
}>()

const hasDetails = computed(() => props.item.detail !== undefined)
const isInteractive = computed(() => hasDetails.value || props.item.activatable === true)
const iconComponent = computed<Component>(() => props.item.icon ?? TimelineFallbackIcon)

function onHeaderClick(): void {
  if (hasDetails.value) emit('toggle')
  else if (props.item.activatable) emit('activate')
}
</script>
