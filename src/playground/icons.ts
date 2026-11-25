import { defineComponent, h, type Component, type PropType } from 'vue'
import type { TimelineStatus } from '../lib/types'
import TimelineGlyph from './glyph/TimelineGlyph.vue'
import type { TimelineGlyphName } from './glyph/gentleface-icons'

/**
 * The library only promises to pass `status` to the icon component. This demo
 * resolver uses the real Gentleface SMIL glyphs from the desktop timeline, so
 * running/complete states animate exactly like the current product.
 */
function glyph(name: TimelineGlyphName): Component {
  return defineComponent({
    name: `DemoGlyph_${name}`,
    props: {
      status: {
        type: String as PropType<TimelineStatus>,
        default: 'complete',
      },
      size: {
        type: Number,
        default: undefined,
      },
    },
    setup(props) {
      return () => h(TimelineGlyph, { name, status: props.status, size: props.size })
    },
  })
}

export const ICONS = {
  book: glyph('book-open-turn'),
  pen: glyph('pencil-write'),
  terminal: glyph('terminal-type'),
  search: glyph('search-scan'),
  sparkle: glyph('atom-orbit'),
  globe: glyph('globe-spin'),
  clock: glyph('clock-spin'),
  file: glyph('files-fan'),
  wait: glyph('hourglass-flip'),
  agent: glyph('bot-signal'),
  group: glyph('hierarchy-signal'),
  toolbox: glyph('toolbox-open'),
  image: glyph('wand-sparkle-swish'),
} as const

export type IconKey = keyof typeof ICONS

export const ICON_KEYS = Object.keys(ICONS) as IconKey[]
