<template>
  <div class="demo-markdown">
    <div class="demo-markdown__head">
      <span>Markdown</span>
      <span v-if="loading" class="demo-markdown__live">streaming</span>
    </div>
    <MarkdownRender
      :content="content"
      :streaming="loading"
      :final="!loading"
      :fade="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { MarkdownRender } from 'markstream-vue'

defineOptions({ name: 'DemoMarkdownDetail' })

defineProps<{
  content: string
  loading?: boolean
}>()
</script>
