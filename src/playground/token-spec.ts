export type TokenGroup = 'Group' | 'Row' | 'Details' | 'Color' | 'Motion'

export type TokenKind = 'length' | 'duration' | 'color' | 'percent'

export interface TokenSpec {
  key: string
  label: string
  group: TokenGroup
  kind: TokenKind
  min?: number
  max?: number
  step?: number
  unit?: string
}

export const TOKEN_SPECS: TokenSpec[] = [
  { key: '--timeline-ui-group-padding-x', label: 'Padding X', group: 'Group', kind: 'length', min: 0, max: 32, step: 1, unit: 'px' },
  { key: '--timeline-ui-group-padding-y', label: 'Padding Y', group: 'Group', kind: 'length', min: 0, max: 32, step: 1, unit: 'px' },
  { key: '--timeline-ui-group-gap', label: 'Header / body gap', group: 'Group', kind: 'length', min: 0, max: 24, step: 1, unit: 'px' },
  { key: '--timeline-ui-indent', label: 'Child indent', group: 'Group', kind: 'length', min: 0, max: 40, step: 1, unit: 'px' },
  { key: '--timeline-ui-rail-width', label: 'Rail width', group: 'Group', kind: 'length', min: 0, max: 4, step: 1, unit: 'px' },
  { key: '--timeline-ui-rail-offset', label: 'Rail offset', group: 'Group', kind: 'length', min: 0, max: 48, step: 1, unit: 'px' },

  { key: '--timeline-ui-row-padding-x', label: 'Padding X', group: 'Row', kind: 'length', min: 0, max: 32, step: 1, unit: 'px' },
  { key: '--timeline-ui-row-padding-y', label: 'Padding Y', group: 'Row', kind: 'length', min: 0, max: 24, step: 1, unit: 'px' },
  { key: '--timeline-ui-row-gap', label: 'Column gap', group: 'Row', kind: 'length', min: 0, max: 24, step: 1, unit: 'px' },
  { key: '--timeline-ui-chevron-size', label: 'Trailing chevron', group: 'Row', kind: 'length', min: 8, max: 28, step: 1, unit: 'px' },
  { key: '--timeline-ui-icon-size', label: 'Icon box', group: 'Row', kind: 'length', min: 8, max: 32, step: 1, unit: 'px' },
  { key: '--timeline-ui-radius', label: 'Radius', group: 'Row', kind: 'length', min: 0, max: 24, step: 1, unit: 'px' },
  { key: '--timeline-ui-font-size', label: 'Font size', group: 'Row', kind: 'length', min: 10, max: 20, step: 1, unit: 'px' },

  { key: '--timeline-ui-details-indent', label: 'Left indent', group: 'Details', kind: 'length', min: 0, max: 80, step: 1, unit: 'px' },
  { key: '--timeline-ui-details-margin-right', label: 'Right inset', group: 'Details', kind: 'length', min: 0, max: 32, step: 1, unit: 'px' },
  { key: '--timeline-ui-details-min-height', label: 'Loading min height', group: 'Details', kind: 'length', min: 24, max: 240, step: 2, unit: 'px' },
  { key: '--timeline-ui-details-max-height', label: 'Max height', group: 'Details', kind: 'length', min: 80, max: 640, step: 4, unit: 'px' },

  { key: '--timeline-ui-text', label: 'Text', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-muted', label: 'Muted text', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-faint', label: 'Faint text', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-accent', label: 'Accent / focus', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-group-bg', label: 'Group background', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-rail-color', label: 'Rail', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-skeleton-base', label: 'Skeleton base', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-skeleton-highlight', label: 'Skeleton highlight', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-error', label: 'Error', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-shimmer', label: 'Running shimmer', group: 'Color', kind: 'color' },
  { key: '--timeline-ui-hover-tint', label: 'Hover tint', group: 'Color', kind: 'percent', min: 0, max: 24, step: 1, unit: '%' },

  { key: '--timeline-ui-motion-duration', label: 'Reveal duration', group: 'Motion', kind: 'duration', min: 0, max: 800, step: 10, unit: 'ms' },
  { key: '--timeline-ui-shimmer-duration', label: 'Shimmer duration', group: 'Motion', kind: 'duration', min: 400, max: 4000, step: 100, unit: 'ms' },
]

export const TOKEN_GROUPS: TokenGroup[] = ['Group', 'Row', 'Details', 'Color', 'Motion']

export const DEFAULT_TOKENS: Record<string, string> = {
  '--timeline-ui-group-padding-x': '0px',
  '--timeline-ui-group-padding-y': '4px',
  '--timeline-ui-group-gap': '6px',
  '--timeline-ui-indent': '12px',
  '--timeline-ui-rail-width': '1px',
  '--timeline-ui-rail-offset': '8px',

  '--timeline-ui-row-padding-x': '8px',
  '--timeline-ui-row-padding-y': '5px',
  '--timeline-ui-row-gap': '7px',
  '--timeline-ui-chevron-size': '14px',
  '--timeline-ui-icon-size': '16px',
  '--timeline-ui-radius': '8px',
  '--timeline-ui-font-size': '14px',

  '--timeline-ui-details-indent': '0px',
  '--timeline-ui-details-margin-right': '8px',
  '--timeline-ui-details-min-height': '64px',
  '--timeline-ui-details-max-height': '240px',

  '--timeline-ui-text': '#1f2328',
  '--timeline-ui-muted': '#59636e',
  '--timeline-ui-faint': '#818b98',
  '--timeline-ui-accent': '#0969da',
  '--timeline-ui-group-bg': '#ffffff',
  '--timeline-ui-rail-color': '#d8dee4',
  '--timeline-ui-skeleton-base': '#e6eaef',
  '--timeline-ui-skeleton-highlight': '#f1f3f5',
  '--timeline-ui-error': '#cf222e',
  '--timeline-ui-shimmer': '#a9b3be',
  '--timeline-ui-hover-tint': '5%',

  '--timeline-ui-motion-duration': '260ms',
  '--timeline-ui-shimmer-duration': '1600ms',
}

export const PRESETS: Record<string, Partial<Record<string, string>>> = {
  Light: {},
  Dark: {
    '--timeline-ui-text': '#e6edf3',
    '--timeline-ui-muted': '#9198a1',
    '--timeline-ui-faint': '#6e7681',
    '--timeline-ui-accent': '#4493f8',
    '--timeline-ui-group-bg': '#0d1117',
    '--timeline-ui-rail-color': '#30363d',
    '--timeline-ui-skeleton-base': '#21262d',
    '--timeline-ui-skeleton-highlight': '#30363d',
    '--timeline-ui-error': '#f85149',
    '--timeline-ui-shimmer': '#c9d1d9',
    '--timeline-ui-hover-tint': '8%',
  },
  Paper: {
    '--timeline-ui-text': '#2b2622',
    '--timeline-ui-muted': '#6b6158',
    '--timeline-ui-faint': '#8f8377',
    '--timeline-ui-accent': '#a4552a',
    '--timeline-ui-group-bg': '#fffdf8',
    '--timeline-ui-rail-color': '#e4d9cc',
    '--timeline-ui-skeleton-base': '#ece2d5',
    '--timeline-ui-skeleton-highlight': '#f7f1e7',
    '--timeline-ui-error': '#b42318',
    '--timeline-ui-shimmer': '#b3a495',
    '--timeline-ui-hover-tint': '6%',
  },
}
