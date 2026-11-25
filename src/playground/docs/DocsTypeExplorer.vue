<template>
  <div id="type-explorer" class="type-explorer">
    <nav ref="nav" class="type-explorer__nav" aria-label="Type reference">
      <div v-for="group in DOC_TYPE_GROUPS" :key="group.label" class="type-explorer__group">
        <span class="type-explorer__group-label">{{ group.label }}</span>
        <button
          v-for="name in group.names"
          :key="name"
          type="button"
          class="type-explorer__tab"
          :class="{ 'is-active': activeDocTypeName === name }"
          :aria-pressed="activeDocTypeName === name"
          @click="selectDocType(name)"
        >
          <code>{{ name }}</code>
          <span>{{ DOC_TYPES[name].kind }}</span>
        </button>
      </div>
    </nav>

    <article
      ref="detail"
      class="type-explorer__detail"
      :id="`type-${activeType.name}`"
      :aria-labelledby="`type-title-${activeType.name}`"
      :class="{ 'is-flashing': flashing }"
      tabindex="-1"
      role="region"
    >
      <header class="type-explorer__head">
        <div class="type-explorer__title">
          <code :id="`type-title-${activeType.name}`">{{ activeType.name }}</code>
          <span class="type-explorer__kind">{{ activeType.kind }}</span>
        </div>
        <span v-if="activeType.members?.length" class="type-explorer__count">
          {{ activeType.members.length }} members
        </span>
      </header>

      <p class="type-explorer__summary">{{ activeType.summary }}</p>

      <pre class="type-explorer__code"><CodeText :code="activeType.declaration" language="ts" /></pre>

      <div v-if="activeType.members?.length" class="type-explorer__members">
        <div
          v-for="member in activeType.members"
          :key="member.name"
          class="type-explorer__member"
        >
          <div class="type-explorer__member-head">
            <code>{{ member.name }}</code>
            <span>{{ member.type }}</span>
          </div>
          <p>{{ member.description }}</p>
        </div>
      </div>

      <div v-if="activeType.related?.length" class="type-explorer__related">
        <span>Related</span>
        <button
          v-for="name in activeType.related"
          :key="name"
          type="button"
          @click="selectDocType(name)"
        >
          {{ name }}
        </button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import CodeText from '../CodeText.vue'
import {
  activeDocTypeName,
  DOC_TYPES,
  DOC_TYPE_GROUPS,
  DOC_TYPE_LIST,
  selectDocType,
  typeRevealTick,
} from './type-docs'

const nav = ref<HTMLElement | null>(null)
const detail = ref<HTMLElement | null>(null)
const flashing = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | undefined

const activeType = computed(
  () => DOC_TYPES[activeDocTypeName.value] ?? DOC_TYPE_LIST[0],
)

watch(typeRevealTick, async () => {
  await nextTick()
  const activeTab = nav.value?.querySelector<HTMLElement>('[aria-pressed="true"]')
  const navRect = nav.value?.getBoundingClientRect()
  const tabRect = activeTab?.getBoundingClientRect()
  if (activeTab && navRect && tabRect && nav.value) {
    if (tabRect.left < navRect.left) {
      nav.value.scrollLeft += tabRect.left - navRect.left - 8
    } else if (tabRect.right > navRect.right) {
      nav.value.scrollLeft += tabRect.right - navRect.right + 8
    }
  }
  detail.value?.focus({ preventScroll: true })
  flashing.value = false
  await nextTick()
  flashing.value = true
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    flashing.value = false
  }, 1100)
})

onBeforeUnmount(() => clearTimeout(flashTimer))
</script>

<style scoped>
.type-explorer {
  display: grid;
  scroll-margin-top: 26px;
  grid-template-columns: 204px minmax(0, 1fr);
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid var(--wb-line);
  border-radius: 14px;
  background: #fff;
}

.type-explorer__nav {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 13px 10px;
  border-right: 1px solid var(--wb-line);
  background: #fbfcfd;
}

.type-explorer__group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.type-explorer__group-label {
  padding: 0 8px 5px;
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.type-explorer__tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--wb-muted);
  text-align: left;
  cursor: pointer;
}

.type-explorer__tab code {
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-family: var(--wb-mono);
  font-size: 9.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-explorer__tab span {
  flex: 0 0 auto;
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 7.5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.type-explorer__tab:hover {
  background: #f1f4f7;
  color: var(--wb-ink);
}

.type-explorer__tab.is-active {
  background: var(--wb-accent-soft);
  box-shadow: inset 2px 0 0 var(--wb-accent);
  color: #175ca4;
}

.type-explorer__tab.is-active span {
  color: #4d7ba7;
}

.type-explorer__detail {
  min-width: 0;
  padding: 18px 20px 20px;
  outline: none;
  scroll-margin-top: 26px;
}

.type-explorer__detail:focus-visible {
  box-shadow: inset 0 0 0 2px var(--wb-accent-soft);
}

.type-explorer__detail.is-flashing {
  animation: type-flash 1.1s ease;
}

.type-explorer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.type-explorer__title {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.type-explorer__title code {
  overflow: hidden;
  color: var(--wb-ink);
  font-family: var(--wb-mono);
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-explorer__kind {
  flex: 0 0 auto;
  padding: 2px 6px;
  border: 1px solid var(--wb-line);
  border-radius: 999px;
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.type-explorer__count {
  flex: 0 0 auto;
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 8.5px;
}

.type-explorer__summary {
  max-width: 64ch;
  margin: 9px 0 13px;
  color: var(--wb-muted);
  font-size: 12px;
  line-height: 1.55;
}

.type-explorer__code {
  --code-plain: #d9e2ec;
  --code-keyword: #c792ea;
  --code-string: #a8d8a0;
  --code-comment: #6f7d8c;
  --code-number: #e8b86d;
  --code-type: #7cc7ff;
  --code-tag: #7cc7ff;
  --code-attr: #d9b36c;
  --code-builtin: #8bb7d6;
  --code-function: #e2c08d;
  --code-punct: #95a3b3;

  margin: 0;
  overflow-x: auto;
  padding: 12px 13px;
  border: 1px solid #20262e;
  border-radius: 8px;
  background: #12171d;
  font-family: var(--wb-mono);
  font-size: 10.5px;
  line-height: 1.65;
  tab-size: 2;
}

.type-explorer__code code {
  font: inherit;
}

.type-explorer__members {
  margin-top: 14px;
  border-top: 1px solid var(--wb-line);
}

.type-explorer__member {
  display: grid;
  grid-template-columns: minmax(120px, 0.4fr) minmax(0, 1fr);
  gap: 4px 18px;
  padding: 10px 0;
  border-bottom: 1px solid #edf0f3;
}

.type-explorer__member-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.type-explorer__member-head code {
  color: var(--wb-ink);
  font-family: var(--wb-mono);
  font-size: 10px;
}

.type-explorer__member-head span {
  overflow-wrap: anywhere;
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 9px;
  line-height: 1.4;
}

.type-explorer__member p {
  margin: 1px 0 0;
  color: var(--wb-muted);
  font-size: 10.5px;
  line-height: 1.5;
}

.type-explorer__related {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-top: 14px;
}

.type-explorer__related > span {
  margin-right: 3px;
  color: var(--wb-faint);
  font-family: var(--wb-mono);
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.type-explorer__related button {
  padding: 3px 7px;
  border: 1px solid var(--wb-line);
  border-radius: 5px;
  background: #f7f9fb;
  color: var(--wb-muted);
  font-family: var(--wb-mono);
  font-size: 9px;
  cursor: pointer;
}

.type-explorer__related button:hover {
  border-color: #b8c6d4;
  color: var(--wb-ink);
}

@keyframes type-flash {
  0% {
    background: rgb(47 129 247 / 10%);
  }
  100% {
    background: transparent;
  }
}

@media (max-width: 1080px) {
  .type-explorer {
    scroll-margin-top: 54px;
  }
}

@media (max-width: 780px) {
  .type-explorer {
    grid-template-columns: minmax(0, 1fr);
  }

  .type-explorer__nav {
    flex-direction: row;
    gap: 14px;
    overflow-x: auto;
    padding: 9px 10px;
    border-right: 0;
    border-bottom: 1px solid var(--wb-line);
    scrollbar-width: none;
    -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
    mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
  }

  .type-explorer__nav::-webkit-scrollbar {
    display: none;
  }

  .type-explorer__group {
    flex: 0 0 auto;
    flex-direction: row;
    align-items: center;
    gap: 2px;
  }

  .type-explorer__group-label {
    display: none;
  }

  .type-explorer__tab {
    width: auto;
    padding: 5px 7px;
    white-space: nowrap;
  }

  .type-explorer__tab code {
    overflow: visible;
    text-overflow: clip;
  }

  .type-explorer__tab span {
    display: none;
  }

  .type-explorer__detail {
    padding: 16px;
    scroll-margin-top: 54px;
  }

  .type-explorer__member {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }
}

@media (max-width: 600px) {
  .type-explorer__head {
    align-items: flex-start;
  }

  .type-explorer__count {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .type-explorer__detail.is-flashing {
    animation: none;
  }
}
</style>
