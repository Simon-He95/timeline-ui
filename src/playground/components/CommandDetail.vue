<template>
  <div class="demo-terminal">
    <div class="demo-terminal__bar">
      <code><span class="demo-terminal__prompt">$</span>{{ command }}</code>
      <span class="demo-terminal__meta">stdout</span>
    </div>
    <div class="demo-terminal__body">
      <div
        v-for="(line, index) in lines"
        :key="index"
        class="demo-terminal__line"
        :class="{ 'is-success': line.startsWith('✓') }"
      >
        {{ line }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DemoCommandDetail' })

defineProps<{
  command: string
  lines: string[]
}>()
</script>
