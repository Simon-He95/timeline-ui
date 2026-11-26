<template>
  <figure class="demo-image">
    <div class="demo-image__thumb" :class="{ 'is-failed': failed }">
      <img
        v-if="!failed"
        :src="src"
        :alt="alt"
        loading="eager"
        decoding="async"
        @error="failed = true"
      />
      <span v-else class="demo-image__error">Image unavailable</span>
    </div>
    <figcaption class="demo-image__body">
      <span class="demo-image__eyebrow">Image result</span>
      <span class="demo-image__prompt">{{ prompt }}</span>
      <span v-if="meta" class="demo-image__meta">{{ meta }}</span>
      <span v-if="credit" class="demo-image__credit">{{ credit }}</span>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'ImageDetail' })

defineProps<{
  src: string
  alt: string
  prompt: string
  meta?: string
  credit?: string
}>()

const failed = ref(false)
</script>
