import type { Component } from 'vue'

export type TimelineStatus = 'queued' | 'running' | 'complete' | 'error'

export type TimelineItemKind = 'thinking' | 'tool' | 'text' | 'notice'

export type TimelineDetailStatus = 'loading' | 'ready' | 'error'

interface TimelineDetailBase {
  /** Host panel rendered when the state becomes `ready`. */
  component?: Component
  /** Props forwarded to the host panel. */
  props?: Record<string, unknown>
}

export interface TimelineDetailLoadingVM extends TimelineDetailBase {
  status: 'loading'
}

export interface TimelineDetailReadyVM extends TimelineDetailBase {
  status: 'ready'
  component: Component
}

export interface TimelineDetailErrorVM extends TimelineDetailBase {
  status: 'error'
  /** Required in the error state; already localized by the host. */
  errorText: string
  /** Shows the retry action only when provided; already localized by the host. */
  retryLabel?: string
}

/**
 * The expanded body of one item. The host owns the state transition; replace
 * the whole detail object when the state changes so the union stays valid.
 */
export type TimelineDetailVM =
  | TimelineDetailLoadingVM
  | TimelineDetailReadyVM
  | TimelineDetailErrorVM

export interface TimelineItemVM {
  /** Stable key for expansion state and events. */
  id: string
  kind: TimelineItemKind
  status: TimelineStatus
  /** Already localized by the host. */
  label: string
  /** Inline parameter summary, already formatted by the host. */
  primary?: string
  /**
   * Host icon component. Receives `status` so animated glyphs can follow the
   * row state. A neutral dot is used when omitted.
   */
  icon?: Component
  /** Makes a row without details a keyboard-focusable activation target. */
  activatable?: boolean
  detail?: TimelineDetailVM
}

export interface TimelineGroupVM {
  /** Collapsed/expanded summary line, already localized and joined by the host. */
  summary: string
  running?: boolean
  /** Optional leading status glyph. Receives `status: 'running' | 'complete'`. */
  icon?: Component
  items: TimelineItemVM[]
}


/**
 * Public props of `<TimelineGroup>`. Useful when wrapping or forwarding the
 * component from another component.
 */
export interface TimelineGroupProps {
  group: TimelineGroupVM
  expanded?: boolean
  expandedItemIds?: readonly string[]
  lazyDetails?: boolean
  keepDetailsMounted?: boolean
}

/** Public events emitted by `<TimelineGroup>`. */
export interface TimelineGroupEmits {
  (event: 'update:expanded', expanded: boolean): void
  (event: 'update:expandedItemIds', itemIds: string[]): void
  (event: 'detail-toggle', itemId: string, expanded: boolean): void
  (event: 'detail-retry', itemId: string): void
  (event: 'activate', itemId: string): void
}
