<template>
  <div class="mock-chat">
    <article class="chat">
      <div ref="chatBodyRef" class="chat__body">
        <div class="chat-message chat-message--user">
          <div class="chat-message__body">
            <div class="chat-message__meta">
              <strong>You</strong>
              <time>14:02</time>
            </div>
            <p class="chat-message__bubble">{{ userPrompt }}</p>
          </div>
          <span class="avatar">S</span>
        </div>

        <section class="assistant-message">
          <header class="assistant-message__head">
            <span class="avatar avatar--assistant">D</span>
            <div class="assistant-message__who">
              <strong>Assistant</strong>
              <span>Timeline extraction</span>
            </div>
            <span v-if="assistantLoading" class="assistant-message__live">streaming</span>
          </header>

          <div v-if="renderGroup" class="assistant-message__timeline">
            <TimelineGroup
              :group="group"
              :expanded="groupExpanded"
              :expanded-item-ids="expandedItemIds"
              :lazy-details="lazyDetails"
              :keep-details-mounted="keepDetailsMounted"
              :style="tokens"
              @update:expanded="emit('update:group-expanded', $event)"
              @update:expandedItemIds="emit('update:expanded-item-ids', $event)"
              @detail-toggle="onDetailToggle"
              @detail-retry="onDetailRetry"
              @activate="onActivate"
            />
          </div>

          <div v-else class="stage__empty">
            <span class="stage__empty-mark" aria-hidden="true">∅</span>
            <strong>Group is unmounted</strong>
            <p>Turn the group switch back on to watch the transcript stream.</p>
            <button type="button" class="btn" @click="emit('update:render-group', true)">
              Mount group
            </button>
          </div>

          <div v-if="assistantText || assistantLoading" class="assistant-message__text">
            <MarkdownRender
              :content="assistantText"
              :streaming="assistantLoading"
              :final="!assistantLoading"
              :fade="assistantLoading"
              :render-code-blocks-as-pre="false"
              :theme="{ dark: 'github-dark', light: 'github-light' }"
            />
          </div>
        </section>
      </div>

      <form class="chat__composer" @submit.prevent="sendPrompt">
        <div class="chat__composer-box">
          <input
            v-model="draft"
            class="chat__input"
            type="text"
            placeholder="Ask about this transcript…"
            aria-label="Mock chat prompt"
            autocomplete="off"
            @keydown.enter="onComposerEnter"
          />
          <button
            type="submit"
            class="chat__send"
            :disabled="!draft.trim()"
            aria-label="Send and replay the mock stream"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 13V3M4 7l4-4 4 4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <p class="chat__composer-hint">Mock reply. Enter replays the stream</p>
      </form>
    </article>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { MarkdownRender } from 'markstream-vue'
import { TimelineGroup, type TimelineGroupVM } from '../../lib'

defineOptions({ name: 'MockChatPreview' })

const props = defineProps<{
  group: TimelineGroupVM
  tokens: Record<string, string>
  groupExpanded: boolean
  expandedItemIds: string[]
  lazyDetails: boolean
  keepDetailsMounted: boolean
  renderGroup: boolean
  assistantText: string
  assistantLoading: boolean
  userPrompt: string
}>()

const emit = defineEmits<{
  'update:group-expanded': [expanded: boolean]
  'update:expanded-item-ids': [itemIds: string[]]
  'update:render-group': [render: boolean]
  'detail-toggle': [itemId: string, expanded: boolean]
  'detail-retry': [itemId: string]
  activate: [itemId: string]
  send: [prompt: string]
}>()

const chatBodyRef = ref<HTMLElement | null>(null)
const draft = ref('')
let lastItemCount = props.group.items.length

function followStream(): void {
  const body = chatBodyRef.value
  if (!body) return
  const distance = body.scrollHeight - body.scrollTop - body.clientHeight
  if (distance > 96) return
  body.scrollTop = body.scrollHeight
}

watch(
  () => [props.group.items.length, props.assistantText, props.assistantLoading] as const,
  ([count]) => {
    const reset = count < lastItemCount
    lastItemCount = count
    nextTick(() => {
      if (reset) {
        if (chatBodyRef.value) chatBodyRef.value.scrollTop = 0
        return
      }
      followStream()
    })
  },
)

function onComposerEnter(event: KeyboardEvent): void {
  if (event.isComposing) return
  event.preventDefault()
  sendPrompt()
}

function sendPrompt(): void {
  const prompt = draft.value.trim()
  if (!prompt) return
  emit('send', prompt)
  draft.value = ''
}

function onDetailToggle(itemId: string, expanded: boolean): void {
  emit('detail-toggle', itemId, expanded)
}

function onDetailRetry(itemId: string): void {
  emit('detail-retry', itemId)
}

function onActivate(itemId: string): void {
  emit('activate', itemId)
}
</script>
