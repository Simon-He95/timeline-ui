// Gentleface animated icons, MIT License.
// Copyright (c) 2026 Alexander Kiselev. Original designer: eric8810.
// See assets/LICENSE.txt.
import atomOrbit from './assets/atom-orbit.svg?raw'
import bellRing from './assets/bell-ring.svg?raw'
import bookOpenTurn from './assets/book-open-turn.svg?raw'
import botSignal from './assets/bot-signal.svg?raw'
import checkCircleDraw from './assets/check-circle-draw.svg?raw'
import clockSpin from './assets/clock-spin.svg?raw'
import downloadAbsorb from './assets/download-absorb.svg?raw'
import filesFan from './assets/files-fan.svg?raw'
import globeSpin from './assets/globe-spin.svg?raw'
import hierarchySignal from './assets/hierarchy-signal.svg?raw'
import hourglassFlip from './assets/hourglass-flip.svg?raw'
import loaderStep from './assets/loader-step.svg?raw'
import messageTyping from './assets/message-typing.svg?raw'
import monitorCursorSelect from './assets/monitor-cursor-select.svg?raw'
import monitorWindow from './assets/monitor-window.svg?raw'
import notepadWrite from './assets/notepad-write.svg?raw'
import pencilWrite from './assets/pencil-write.svg?raw'
import plugIn from './assets/plug-in.svg?raw'
import radioButtonSelect from './assets/radio-button-select.svg?raw'
import searchScan from './assets/search-scan.svg?raw'
import searchStarDip from './assets/search-star-dip.svg?raw'
import serverActivity from './assets/server-activity.svg?raw'
import stepperAdvance from './assets/stepper-advance.svg?raw'
import stopBrake from './assets/stop-brake.svg?raw'
import targetHit from './assets/target-hit.svg?raw'
import terminalType from './assets/terminal-type.svg?raw'
import toolboxOpen from './assets/toolbox-open.svg?raw'
import workflowNext from './assets/workflow-next.svg?raw'
import wandSparkleSwish from './assets/wand-sparkle-swish.svg?raw'
import xCircleShake from './assets/x-circle-shake.svg?raw'

export const TIMELINE_GLYPH_SVG = {
  'atom-orbit': atomOrbit,
  'bell-ring': bellRing,
  'book-open-turn': bookOpenTurn,
  'bot-signal': botSignal,
  'check-circle-draw': checkCircleDraw,
  'clock-spin': clockSpin,
  'download-absorb': downloadAbsorb,
  'files-fan': filesFan,
  'globe-spin': globeSpin,
  'hierarchy-signal': hierarchySignal,
  'hourglass-flip': hourglassFlip,
  'loader-step': loaderStep,
  'message-typing': messageTyping,
  'monitor-cursor-select': monitorCursorSelect,
  'monitor-window': monitorWindow,
  'notepad-write': notepadWrite,
  'pencil-write': pencilWrite,
  'plug-in': plugIn,
  'radio-button-select': radioButtonSelect,
  'search-scan': searchScan,
  'search-star-dip': searchStarDip,
  'server-activity': serverActivity,
  'stepper-advance': stepperAdvance,
  'stop-brake': stopBrake,
  'target-hit': targetHit,
  'terminal-type': terminalType,
  'toolbox-open': toolboxOpen,
  'wand-sparkle-swish': wandSparkleSwish,
  'workflow-next': workflowNext,
  'x-circle-shake': xCircleShake,
} as const

export type TimelineGlyphName = keyof typeof TIMELINE_GLYPH_SVG
