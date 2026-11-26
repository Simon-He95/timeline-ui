<template>
  <div class="demo-thinking">
    <template v-for="(block, index) in blocks" :key="index">
      <ol v-if="block.kind === 'steps'" class="demo-thinking__steps">
        <li v-for="(step, stepIndex) in block.items" :key="stepIndex">{{ step }}</li>
      </ol>
      <p v-else class="demo-thinking__paragraph">{{ block.text }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'DemoThinkingDetail' })

const props = defineProps<{
  content: string
  loading?: boolean
}>()

type ThinkingBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'steps'; items: string[] }

const blocks = computed<ThinkingBlock[]>(() => {
  return props.content
    .split(/\n{2,}/)
    .map((raw) => {
      const lines = raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      if (lines.length === 0) return null

      const numbered = lines.every((line) => /^\d+\.\s+/.test(line))
      if (numbered) {
        return {
          kind: 'steps' as const,
          items: lines.map((line) => line.replace(/^\d+\.\s+/, '')),
        }
      }

      return { kind: 'paragraph' as const, text: lines.join(' ') }
    })
    .filter((block): block is ThinkingBlock => block !== null)
})
</script>
