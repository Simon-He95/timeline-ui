<template>
  <code class="code-text">
    <template v-for="(token, index) in tokens" :key="index">
      <button
        v-if="interactive && token.typeName"
        type="button"
        class="code-token code-token--type code-type-button"
        :aria-label="`${token.text} type. Activate to open the type reference.`"
        @mouseenter="emitType('type-enter', token, $event)"
        @mouseleave="emitType('type-leave', token, $event)"
        @focus="emitType('type-focus', token, $event)"
        @blur="emitType('type-blur', token, $event)"
        @click="emitType('type-click', token, $event)"
        @keydown.escape="emitType('type-escape', token, $event)"
      >{{ token.text }}</button>
      <span v-else class="code-token" :class="`code-token--${token.kind}`">{{ token.text }}</span>
    </template>
  </code>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { tokenizeCode, type CodeLanguage, type CodeToken } from './docs/highlight'

const props = withDefaults(
  defineProps<{
    code: string
    language?: CodeLanguage
    interactive?: boolean
  }>(),
  {
    language: 'ts',
    interactive: false,
  },
)

type TypeEvent =
  | 'type-enter'
  | 'type-leave'
  | 'type-focus'
  | 'type-blur'
  | 'type-click'
  | 'type-escape'

const emit = defineEmits<{
  (event: TypeEvent, name: string, target: HTMLElement): void
}>()

const tokens = computed(() => tokenizeCode(props.code, props.language))

function emitType(eventName: TypeEvent, token: CodeToken, event: Event): void {
  if (!token.typeName) return
  emit(eventName, token.typeName, event.currentTarget as HTMLElement)
}
</script>

<style scoped>
.code-text {
  color: var(--code-plain, #d9e2ec);
  font: inherit;
  white-space: inherit;
  tab-size: inherit;
}

.code-token {
  color: inherit;
}

.code-token--plain {
  color: var(--code-plain, #d9e2ec);
}

.code-token--keyword {
  color: var(--code-keyword, #c792ea);
}

.code-token--string {
  color: var(--code-string, #a8d8a0);
}

.code-token--comment {
  color: var(--code-comment, #6f7d8c);
  font-style: italic;
}

.code-token--number {
  color: var(--code-number, #e8b86d);
}

.code-token--type {
  color: var(--code-type, #7cc7ff);
}

.code-token--tag {
  color: var(--code-tag, #7cc7ff);
}

.code-token--attr {
  color: var(--code-attr, #d9b36c);
}

.code-token--builtin {
  color: var(--code-builtin, #8bb7d6);
}

.code-token--function {
  color: var(--code-function, #e2c08d);
}

.code-token--punct {
  color: var(--code-punct, #95a3b3);
}

.code-type-button {
  display: inline;
  margin: 0;
  padding: 0 1px;
  border: 0;
  border-bottom: 1px dotted var(--code-type, #7cc7ff);
  border-radius: 2px 2px 0 0;
  background: transparent;
  color: var(--code-type, #7cc7ff);
  font: inherit;
  line-height: inherit;
  cursor: help;
}

.code-type-button:hover,
.code-type-button:focus-visible {
  border-bottom-style: solid;
  background: var(--code-type-hover, rgb(124 199 255 / 14%));
  outline: none;
}
</style>
