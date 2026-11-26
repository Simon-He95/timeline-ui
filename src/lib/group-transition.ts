import { computed, onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

export const DEFAULT_TIMELINE_GROUP_ANIMATION_MS = 260
export const DEFAULT_TIMELINE_GROUP_LAZY_THRESHOLD = 32
export const DEFAULT_TIMELINE_GROUP_STAGGER_STEP_MS = 40
export const DEFAULT_TIMELINE_GROUP_STAGGER_MAX_INDEX = 8

/**
 * Delay for a newly entered rail item. The index is capped so a long group
 * cannot leave a newly appended row waiting for seconds.
 */
export function timelineGroupStaggerDelayMs(index: number): number {
  const normalizedIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0
  return Math.min(normalizedIndex, DEFAULT_TIMELINE_GROUP_STAGGER_MAX_INDEX)
    * DEFAULT_TIMELINE_GROUP_STAGGER_STEP_MS
}

export interface TimelineGroupTransitionOptions {
  expanded: MaybeRefOrGetter<boolean>
  itemCount: MaybeRefOrGetter<number>
  /** When false, the rail always stays mounted. Defaults to true. */
  enabled?: MaybeRefOrGetter<boolean>
  groupAnimationMs?: number
  lazyThreshold?: number
  scheduleFrame?: (callback: FrameRequestCallback) => number
  cancelFrame?: (handle: number) => void
}

function defaultScheduleFrame(callback: FrameRequestCallback): number {
  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame(callback)
  }
  return setTimeout(() => callback(Date.now()), 16) as unknown as number
}

function defaultCancelFrame(handle: number): void {
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(handle)
  } else {
    clearTimeout(handle)
  }
}

/**
 * Mount/unmount state for a large group's collapsed rail.
 *
 * A collapsed group is only a header row. Content above the threshold stays
 * mounted for the close animation and is then unmounted; a group opened while
 * unmounted mounts first with `contentOpen = false`, then opens over two frames
 * so the reveal transition can run. Small groups stay mounted because their DOM
 * is negligible and remounting them adds churn.
 */
export function useTimelineGroupTransition(options: TimelineGroupTransitionOptions) {
  const groupAnimationMs = options.groupAnimationMs ?? DEFAULT_TIMELINE_GROUP_ANIMATION_MS
  const lazyThreshold = options.lazyThreshold ?? DEFAULT_TIMELINE_GROUP_LAZY_THRESHOLD
  const scheduleFrame = options.scheduleFrame ?? defaultScheduleFrame
  const cancelFrame = options.cancelFrame ?? defaultCancelFrame

  const enabled = computed(() => toValue(options.enabled ?? true))
  const lazyUnmountContent = computed(() => enabled.value && toValue(options.itemCount) >= lazyThreshold)
  const contentMounted = ref(toValue(options.expanded) || !lazyUnmountContent.value)
  const contentOpen = ref(toValue(options.expanded))

  let collapseTimer: ReturnType<typeof setTimeout> | undefined
  let openFrame: number | undefined

  function cancelTransition(): void {
    if (collapseTimer !== undefined) {
      clearTimeout(collapseTimer)
      collapseTimer = undefined
    }
    if (openFrame !== undefined) {
      cancelFrame(openFrame)
      openFrame = undefined
    }
  }

  watch(
    () => [toValue(options.expanded), lazyUnmountContent.value] as const,
    ([expanded, lazy]) => {
      cancelTransition()
      if (!lazy) {
        contentMounted.value = true
        contentOpen.value = expanded
        return
      }
      if (expanded) {
        if (contentMounted.value) {
          contentOpen.value = true
          return
        }
        contentMounted.value = true
        contentOpen.value = false
        openFrame = scheduleFrame(() => {
          openFrame = scheduleFrame(() => {
            openFrame = undefined
            contentOpen.value = true
          })
        })
        return
      }
      contentOpen.value = false
      if (!contentMounted.value) return
      collapseTimer = setTimeout(() => {
        collapseTimer = undefined
        contentMounted.value = false
      }, groupAnimationMs)
    },
  )

  onScopeDispose(cancelTransition)

  return {
    contentMounted,
    contentOpen,
    lazyUnmountContent,
  }
}
