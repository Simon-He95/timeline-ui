import { nextTick, ref } from 'vue'

export type DocTypeKind = 'interface' | 'union' | 'events'

export interface DocTypeMember {
  name: string
  type: string
  description: string
}

export interface DocType {
  name: string
  kind: DocTypeKind
  summary: string
  declaration: string
  members?: DocTypeMember[]
  related?: string[]
}

export const DOC_TYPE_LIST: DocType[] = [
  {
    name: 'TimelineGroupVM',
    kind: 'interface',
    summary: 'The complete group view model. The host owns the copy, icons and panel components.',
    declaration: `interface TimelineGroupVM {
  summary: string
  running?: boolean
  icon?: Component
  items: TimelineItemVM[]
}`,
    members: [
      {
        name: 'summary',
        type: 'string',
        description: 'Collapsed and expanded summary line, already localized and joined by the host.',
      },
      {
        name: 'running?',
        type: 'boolean',
        description: 'Shows the running state on the group icon.',
      },
      {
        name: 'icon?',
        type: 'Component',
        description: "Leading glyph. Receives status: 'running' | 'complete'.",
      },
      {
        name: 'items',
        type: 'TimelineItemVM[]',
        description: 'Rows in display order.',
      },
    ],
    related: ['TimelineItemVM', 'TimelineGroupProps'],
  },
  {
    name: 'TimelineItemVM',
    kind: 'interface',
    summary:
      'One row in the timeline. A single shape covers thinking, tools, text and notices.',
    declaration: `interface TimelineItemVM {
  id: string
  kind: TimelineItemKind
  status: TimelineStatus
  label: string
  primary?: string
  icon?: Component
  activatable?: boolean
  detail?: TimelineDetailVM
}`,
    members: [
      {
        name: 'id',
        type: 'string',
        description: 'Stable key for expansion state and events.',
      },
      {
        name: 'kind',
        type: 'TimelineItemKind',
        description: 'Row semantics for host rendering.',
      },
      {
        name: 'status',
        type: 'TimelineStatus',
        description: 'Drives the icon status and any host styling.',
      },
      {
        name: 'label',
        type: 'string',
        description: 'Primary row label, already localized by the host.',
      },
      {
        name: 'primary?',
        type: 'string',
        description: 'Inline parameter summary, already formatted by the host.',
      },
      {
        name: 'icon?',
        type: 'Component',
        description: 'Host icon. Receives the row status. A neutral dot is used when omitted.',
      },
      {
        name: 'activatable?',
        type: 'boolean',
        description: 'Makes a row without a detail a keyboard-focusable activation target.',
      },
      {
        name: 'detail?',
        type: 'TimelineDetailVM',
        description: 'Optional expanded panel state. A detail turns the row into a disclosure.',
      },
    ],
    related: ['TimelineDetailVM', 'TimelineStatus', 'TimelineItemKind'],
  },
  {
    name: 'TimelineDetailVM',
    kind: 'union',
    summary:
      'The expanded body of one row. Replace the whole object when the state changes so the union stays valid.',
    declaration: `type TimelineDetailVM =
  | TimelineDetailLoadingVM
  | TimelineDetailReadyVM
  | TimelineDetailErrorVM`,
    related: [
      'TimelineDetailLoadingVM',
      'TimelineDetailReadyVM',
      'TimelineDetailErrorVM',
    ],
  },
  {
    name: 'TimelineDetailLoadingVM',
    kind: 'interface',
    summary: 'The shell paints immediately while the host resolves the panel.',
    declaration: `interface TimelineDetailLoadingVM {
  status: 'loading'
  component?: Component
  props?: Record<string, unknown>
}`,
    members: [
      {
        name: 'status',
        type: "'loading'",
        description: 'Marks the detail as loading.',
      },
      {
        name: 'component?',
        type: 'Component',
        description: 'Optional host panel to mount when the data arrives.',
      },
      {
        name: 'props?',
        type: 'Record<string, unknown>',
        description: 'Props forwarded to the host panel.',
      },
    ],
    related: ['TimelineDetailVM'],
  },
  {
    name: 'TimelineDetailReadyVM',
    kind: 'interface',
    summary: 'The host panel is ready to mount.',
    declaration: `interface TimelineDetailReadyVM {
  status: 'ready'
  component: Component
  props?: Record<string, unknown>
}`,
    members: [
      {
        name: 'status',
        type: "'ready'",
        description: 'Marks the detail as ready.',
      },
      {
        name: 'component',
        type: 'Component',
        description: 'Required host panel.',
      },
      {
        name: 'props?',
        type: 'Record<string, unknown>',
        description: 'Props forwarded to the host panel.',
      },
    ],
    related: ['TimelineDetailVM'],
  },
  {
    name: 'TimelineDetailErrorVM',
    kind: 'interface',
    summary: 'The shell shows host-owned error copy and an optional retry action.',
    declaration: `interface TimelineDetailErrorVM {
  status: 'error'
  errorText: string
  retryLabel?: string
  component?: Component
  props?: Record<string, unknown>
}`,
    members: [
      {
        name: 'status',
        type: "'error'",
        description: 'Marks the detail as failed.',
      },
      {
        name: 'errorText',
        type: 'string',
        description: 'Required error copy, already localized by the host.',
      },
      {
        name: 'retryLabel?',
        type: 'string',
        description: 'Shows the retry action only when provided.',
      },
      {
        name: 'component?',
        type: 'Component',
        description: 'Optional host panel to render behind the error state.',
      },
      {
        name: 'props?',
        type: 'Record<string, unknown>',
        description: 'Props forwarded to the host panel.',
      },
    ],
    related: ['TimelineDetailVM'],
  },
  {
    name: 'TimelineStatus',
    kind: 'union',
    summary: 'Lifecycle state of one row.',
    declaration: `type TimelineStatus = 'queued' | 'running' | 'complete' | 'error'`,
    related: ['TimelineItemVM'],
  },
  {
    name: 'TimelineItemKind',
    kind: 'union',
    summary: 'The semantic kind of a row. The component uses it for styling context.',
    declaration: `type TimelineItemKind = 'thinking' | 'tool' | 'text' | 'notice'`,
    related: ['TimelineItemVM'],
  },
  {
    name: 'TimelineDetailStatus',
    kind: 'union',
    summary: 'The three states of the detail shell.',
    declaration: `type TimelineDetailStatus = 'loading' | 'ready' | 'error'`,
    related: ['TimelineDetailVM'],
  },
  {
    name: 'TimelineGroupProps',
    kind: 'interface',
    summary: 'Public props of TimelineGroup. Useful when wrapping or forwarding the component.',
    declaration: `interface TimelineGroupProps {
  group: TimelineGroupVM
  expanded?: boolean
  expandedItemIds?: readonly string[]
  lazyDetails?: boolean
  keepDetailsMounted?: boolean
}`,
    members: [
      {
        name: 'group',
        type: 'TimelineGroupVM',
        description: 'The complete group view model.',
      },
      {
        name: 'expanded?',
        type: 'boolean',
        description: 'Controlled group state. Omit for internal state.',
      },
      {
        name: 'expandedItemIds?',
        type: 'readonly string[]',
        description: 'Controlled open row ids. Omit for internal state.',
      },
      {
        name: 'lazyDetails?',
        type: 'boolean',
        description: 'Do not mount a detail before its first open.',
      },
      {
        name: 'keepDetailsMounted?',
        type: 'boolean',
        description: 'Keep a detail shell mounted after its first open.',
      },
    ],
    related: ['TimelineGroupVM', 'TimelineGroupEmits'],
  },
  {
    name: 'TimelineGroupEmits',
    kind: 'events',
    summary: 'Public events emitted by TimelineGroup.',
    declaration: `interface TimelineGroupEmits {
  (event: 'update:expanded', expanded: boolean): void
  (event: 'update:expandedItemIds', itemIds: string[]): void
  (event: 'detail-toggle', itemId: string, expanded: boolean): void
  (event: 'detail-retry', itemId: string): void
  (event: 'activate', itemId: string): void
}`,
    members: [
      {
        name: 'update:expanded',
        type: '(expanded: boolean) => void',
        description: 'The group header was toggled.',
      },
      {
        name: 'update:expandedItemIds',
        type: '(itemIds: string[]) => void',
        description: 'A row was toggled.',
      },
      {
        name: 'detail-toggle',
        type: '(itemId: string, expanded: boolean) => void',
        description: 'A row toggled. Start loading here.',
      },
      {
        name: 'detail-retry',
        type: '(itemId: string) => void',
        description: 'The detail shell retry button was pressed.',
      },
      {
        name: 'activate',
        type: '(itemId: string) => void',
        description: 'An activatable row without details was pressed.',
      },
    ],
    related: ['TimelineGroupProps'],
  },
]

export const DOC_TYPES: Record<string, DocType> = Object.fromEntries(
  DOC_TYPE_LIST.map((type) => [type.name, type]),
)

export const DOC_TYPE_GROUPS: Array<{ label: string; names: string[] }> = [
  {
    label: 'View models',
    names: [
      'TimelineGroupVM',
      'TimelineItemVM',
      'TimelineDetailVM',
      'TimelineDetailLoadingVM',
      'TimelineDetailReadyVM',
      'TimelineDetailErrorVM',
    ],
  },
  {
    label: 'Literals',
    names: ['TimelineStatus', 'TimelineItemKind', 'TimelineDetailStatus'],
  },
  {
    label: 'Component API',
    names: ['TimelineGroupProps', 'TimelineGroupEmits'],
  },
]

export const TYPES_OVERVIEW = `import type { Component } from 'vue'

export interface TimelineGroupVM {
  summary: string
  running?: boolean
  icon?: Component
  items: TimelineItemVM[]
}

export interface TimelineItemVM {
  id: string
  kind: TimelineItemKind
  status: TimelineStatus
  label: string
  primary?: string
  icon?: Component
  activatable?: boolean
  detail?: TimelineDetailVM
}

export type TimelineDetailVM =
  | TimelineDetailLoadingVM
  | TimelineDetailReadyVM
  | TimelineDetailErrorVM

export interface TimelineDetailLoadingVM {
  status: 'loading'
  component?: Component
  props?: Record<string, unknown>
}

export interface TimelineDetailReadyVM {
  status: 'ready'
  component: Component
  props?: Record<string, unknown>
}

export interface TimelineDetailErrorVM {
  status: 'error'
  errorText: string
  retryLabel?: string
  component?: Component
  props?: Record<string, unknown>
}

export type TimelineStatus = 'queued' | 'running' | 'complete' | 'error'
export type TimelineItemKind = 'thinking' | 'tool' | 'text' | 'notice'
export type TimelineDetailStatus = 'loading' | 'ready' | 'error'`

export const activeDocTypeName = ref('TimelineGroupVM')
export const typeRevealTick = ref(0)

export function selectDocType(name: string): void {
  if (DOC_TYPES[name]) activeDocTypeName.value = name
}

export async function revealDocType(name: string): Promise<void> {
  if (!DOC_TYPES[name]) return
  activeDocTypeName.value = name
  typeRevealTick.value += 1
  await nextTick()
  const target =
    document.getElementById('type-explorer') ?? document.getElementById(`type-${name}`)
  if (!target) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}
