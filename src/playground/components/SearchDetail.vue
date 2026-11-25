<template>
  <div class="demo-detail">
    <div class="demo-detail__path">
      <span>grep “{{ query }}”</span>
      <span class="demo-detail__stat">{{ results.length }} matches</span>
    </div>
    <div class="demo-search">
      <div v-for="result in results" :key="`${result.path}:${result.line}`" class="demo-search__row">
        <span class="demo-search__path">{{ result.path }}</span>
        <span class="demo-search__line">{{ result.line }}</span>
        <code class="demo-search__text">{{ result.text }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DemoSearchDetail' })

defineProps<{
  query: string
  results: Array<{ path: string; line: number; text: string }>
}>()
</script>
