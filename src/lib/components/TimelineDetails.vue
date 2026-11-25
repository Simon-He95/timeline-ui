<template>
  <div
    class="tl-details"
    :class="{ 'is-expanded': expanded }"
    :inert="expanded ? undefined : true"
    :aria-hidden="expanded ? undefined : 'true'"
  >
    <div class="tl-details__clipper">
      <div
        v-if="shouldMount"
        class="tl-details__shell"
        :aria-busy="detail.status === 'loading' ? 'true' : undefined"
      >
        <div v-if="detail.status === 'loading'" class="tl-details__loading">
          <span class="tl-skeleton" />
          <span class="tl-skeleton" />
          <span class="tl-skeleton" />
        </div>

        <component
          :is="detail.component"
          v-else-if="detail.status === 'ready'"
          v-bind="detail.props"
        />

        <div v-else-if="detail.status === 'error'" class="tl-details__error" role="alert">
          <span class="tl-details__error-text">{{ detail.errorText }}</span>
          <button
            v-if="detail.retryLabel"
            type="button"
            class="tl-details__retry"
            @click="emit('retry')"
          >
            {{ detail.retryLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TimelineDetailVM } from '../types'

defineOptions({ name: 'TimelineDetails' })

const props = defineProps<{
  detail: TimelineDetailVM
  expanded: boolean
  lazy: boolean
  keepMounted: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()

const openedOnce = ref(props.expanded)

watch(
  () => props.expanded,
  (expanded) => {
    if (expanded) openedOnce.value = true
  },
)

const shouldMount = computed(() => {
  if (props.expanded) return true
  if (!props.lazy && props.keepMounted) return true
  return props.keepMounted && openedOnce.value
})
</script>
