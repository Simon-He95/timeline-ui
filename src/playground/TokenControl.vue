<template>
  <div class="token-control">
    <div class="token-control__head">
      <span class="token-control__label">{{ spec.label }}</span>
      <code class="token-control__key">{{ shortKey }}</code>
    </div>

    <div v-if="spec.kind === 'color'" class="token-control__color">
      <input
        class="token-control__swatch"
        type="color"
        :value="modelValue"
        :aria-label="`${spec.label} color`"
        @input="onTextInput"
      />
      <input
        class="token-control__text"
        type="text"
        :value="modelValue"
        spellcheck="false"
        :aria-label="`${spec.label} value`"
        @input="onTextInput"
      />
    </div>

    <div v-else class="token-control__numeric">
      <input
        class="token-control__range"
        type="range"
        :min="spec.min"
        :max="spec.max"
        :step="spec.step"
        :value="numericValue"
        :aria-label="`${spec.label} slider`"
        @input="onNumberInput"
      />
      <label class="token-control__value">
        <input
          class="token-control__number"
          type="number"
          :min="spec.min"
          :max="spec.max"
          :step="spec.step"
          :value="numericValue"
          :aria-label="`${spec.label} number`"
          @input="onNumberInput"
        />
        <span class="token-control__unit">{{ spec.unit }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TokenSpec } from './token-spec'

defineOptions({ name: 'TokenControl' })

const props = defineProps<{
  spec: TokenSpec
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const shortKey = computed(() => props.spec.key.replace('--timeline-ui-', ''))

const numericValue = computed(() => {
  const match = /^-?\d+(?:\.\d+)?/.exec(props.modelValue)
  return match ? Number(match[0]) : 0
})

function onTextInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onNumberInput(event: Event): void {
  const target = event.target as HTMLInputElement
  if (!Number.isFinite(target.valueAsNumber)) return
  emit('update:modelValue', `${target.valueAsNumber}${props.spec.unit ?? ''}`)
}
</script>
