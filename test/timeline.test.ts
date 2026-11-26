import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { TimelineGroup, type TimelineGroupVM } from '../src/lib'
import TimelineDetails from '../src/lib/components/TimelineDetails.vue'

afterEach(() => {
  vi.useRealTimers()
})

const DetailBody = defineComponent({
  name: 'DetailBody',
  setup() {
    return () => h('div', { class: 'detail-body' }, 'detail body')
  },
})

const StatusIcon = defineComponent({
  name: 'StatusIcon',
  props: {
    status: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h('i', { class: 'status-icon', 'data-status': props.status }, props.status)
  },
})

function makeGroup(overrides: Partial<TimelineGroupVM> = {}): TimelineGroupVM {
  return {
    summary: '1 thinking · 2 tools',
    items: [
      {
        id: 'read',
        kind: 'tool',
        status: 'complete',
        label: 'Read file',
        primary: 'a.ts',
        detail: { status: 'loading' },
      },
      {
        id: 'notice',
        kind: 'notice',
        status: 'complete',
        label: 'Finished',
        activatable: true,
      },
    ],
    ...overrides,
  }
}

describe('TimelineGroup', () => {
  it('renders the host summary and items and toggles uncontrolled expansion', async () => {
    const wrapper = mount(TimelineGroup, { props: { group: makeGroup() } })

    expect(wrapper.text()).toContain('1 thinking · 2 tools')
    expect(wrapper.text()).toContain('Read file')

    await wrapper.find('.tl-group__header').trigger('click')
    expect(wrapper.emitted('update:expanded')?.[0]).toEqual([true])
    expect(wrapper.find('.tl-reveal').classes()).toContain('is-expanded')

    expect(wrapper.find('.tl-details__shell').exists()).toBe(false)

    await wrapper.find('.tl-row__header').trigger('click')
    expect(wrapper.emitted('detail-toggle')?.[0]).toEqual(['read', true])
    expect(wrapper.find('.tl-details__shell').exists()).toBe(true)
    expect(wrapper.findAll('.tl-skeleton')).toHaveLength(3)

    await wrapper.find('.tl-row__header').trigger('click')
    expect(wrapper.emitted('detail-toggle')?.[1]).toEqual(['read', false])
    expect(wrapper.find('.tl-details__shell').exists()).toBe(true)
  })

  it('keeps controlled group expansion under the host', async () => {
    const wrapper = mount(TimelineGroup, {
      props: { group: makeGroup(), expanded: false },
    })

    await wrapper.find('.tl-group__header').trigger('click')
    expect(wrapper.emitted('update:expanded')?.[0]).toEqual([true])
    expect(wrapper.find('.tl-reveal').classes()).not.toContain('is-expanded')

    await wrapper.setProps({ expanded: true })
    expect(wrapper.find('.tl-reveal').classes()).toContain('is-expanded')
  })

  it('renders the optional summary slot inside the fixed group header', () => {
    const wrapper = mount(TimelineGroup, {
      props: { group: makeGroup() },
      slots: {
        summary: '<span class="host-summary">Custom summary</span>',
      },
    })

    expect(wrapper.find('.tl-group__summary .host-summary').text()).toBe('Custom summary')
    expect(wrapper.find('.tl-group__header .tl-chevron').exists()).toBe(true)
  })

  it('keeps controlled item expansion under the host', async () => {
    const wrapper = mount(TimelineGroup, {
      props: { group: makeGroup(), expandedItemIds: [] },
    })

    await wrapper.find('.tl-row__header').trigger('click')
    expect(wrapper.emitted('update:expandedItemIds')?.[0]).toEqual([['read']])
    expect(wrapper.emitted('detail-toggle')?.[0]).toEqual(['read', true])
    expect(wrapper.find('.tl-details__shell').exists()).toBe(false)

    await wrapper.setProps({ expandedItemIds: ['read'] })
    expect(wrapper.find('.tl-details__shell').exists()).toBe(true)
  })

  it('keeps the expand chevron after the header content', () => {
    const wrapper = mount(TimelineGroup, { props: { group: makeGroup() } })

    const groupHeader = wrapper.find('.tl-group__header').element
    const rowHeader = wrapper.find('.tl-row__header').element
    expect(groupHeader.lastElementChild?.classList.contains('tl-chevron')).toBe(true)
    expect(rowHeader.lastElementChild?.classList.contains('tl-chevron')).toBe(true)
    expect(rowHeader.firstElementChild?.classList.contains('tl-row__icon')).toBe(true)
  })

  it('passes the current status to group and item icons', () => {
    const wrapper = mount(TimelineGroup, {
      props: {
        group: makeGroup({
          running: true,
          icon: StatusIcon,
          items: [
            {
              id: 'run',
              kind: 'tool',
              status: 'running',
              label: 'Running',
              icon: StatusIcon,
            },
          ],
        }),
      },
    })

    expect(wrapper.find('.tl-group__icon .status-icon').attributes('data-status')).toBe(
      'running',
    )
    expect(wrapper.find('.tl-row__icon .status-icon').attributes('data-status')).toBe(
      'running',
    )
  })

  it('activates a row without details only when the host marks it activatable', async () => {
    const wrapper = mount(TimelineGroup, { props: { group: makeGroup() } })

    const headers = wrapper.findAll('.tl-row__header')
    await headers[1]!.trigger('click')
    expect(wrapper.emitted('activate')?.[0]).toEqual(['notice'])

    const readOnly = makeGroup({
      items: [{ id: 'plain', kind: 'notice', status: 'complete', label: 'Plain' }],
    })
    const plain = mount(TimelineGroup, { props: { group: readOnly } })
    await plain.find('.tl-row__header').trigger('click')
    expect(plain.emitted('activate')).toBeUndefined()
  })

  it('replaces the default row through the row slot and keeps expansion bookkeeping', async () => {
    const wrapper = mount(TimelineGroup, {
      props: {
        group: makeGroup({
          items: [
            {
              id: 'rich',
              kind: 'tool',
              status: 'running',
              label: 'ignored',
              data: { command: 'pnpm test' },
            },
          ],
        }),
      },
      slots: {
        row: `<template #row="{ item, expanded, toggle, index }">
          <button class="host-row" :data-index="index" :data-expanded="expanded" @click="toggle">
            {{ item.data.command }}
          </button>
        </template>`,
      },
    })

    const row = wrapper.find('.host-row')
    expect(row.text()).toBe('pnpm test')
    expect(row.attributes('data-index')).toBe('0')
    expect(row.attributes('data-expanded')).toBe('false')
    expect(wrapper.find('.tl-row').exists()).toBe(false)

    await row.trigger('click')
    expect(wrapper.emitted('update:expandedItemIds')?.[0]).toEqual([['rich']])
    expect(wrapper.emitted('detail-toggle')?.[0]).toEqual(['rich', true])
    expect(wrapper.find('.host-row').attributes('data-expanded')).toBe('true')
  })

  it('renders group-extra outside the header button and before the reveal', () => {
    const wrapper = mount(TimelineGroup, {
      props: { group: makeGroup() },
      slots: {
        'group-extra': '<div class="host-extra">thinking tail</div>',
      },
    })

    expect(wrapper.find('.host-extra').text()).toBe('thinking tail')
    const children = [...wrapper.element.children]
    const extraIndex = children.findIndex(child => child.classList.contains('host-extra'))
    const revealIndex = children.findIndex(child => child.classList.contains('tl-reveal'))
    const headerIndex = children.findIndex(child => child.classList.contains('tl-group__header'))
    expect(extraIndex).toBeGreaterThan(headerIndex)
    expect(extraIndex).toBeLessThan(revealIndex)
  })

  it('lets the host render label and primary text through slots', () => {
    const wrapper = mount(TimelineGroup, {
      props: { group: makeGroup() },
      slots: {
        label: '<template #label="{ item }"><mark class="host-label">{{ item.label }}</mark></template>',
        primary: '<template #primary="{ item }"><mark class="host-primary">{{ item.primary }}</mark></template>',
      },
    })

    expect(wrapper.find('.tl-row__label .host-label').text()).toBe('Read file')
    expect(wrapper.find('.tl-row__primary .host-primary').text()).toBe('a.ts')
  })

  it('renders custom rows inside the staggered rail', () => {
    const wrapper = mount(TimelineGroup, {
      props: {
        group: makeGroup({
          items: [
            { id: 'one', kind: 'tool', status: 'complete', label: 'One' },
            { id: 'two', kind: 'tool', status: 'complete', label: 'Two' },
          ],
        }),
        staggerEnter: true,
      },
      slots: {
        row: '<template #row="{ item }"><div class="host-row">{{ item.label }}</div></template>',
      },
    })

    const rows = wrapper.findAll('.tl-group__rail .tl-row-slot')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.attributes('data-enter-index')).toBe('0')
    expect(rows[1]!.attributes('data-enter-index')).toBe('1')
  })

  it('keeps a custom row element when the host replaces the item payload', async () => {
    const group = ref<TimelineGroupVM>(makeGroup({
      items: [
        {
          id: 'rich',
          kind: 'tool',
          status: 'running',
          label: 'ignored',
          data: { step: 1 },
        },
      ],
    }))
    const wrapper = mount(TimelineGroup, {
      props: { group: group.value },
      slots: {
        row: '<template #row="{ item }"><div class="host-row">{{ item.data.step }}</div></template>',
      },
    })

    const before = wrapper.find('.host-row').element
    group.value = {
      ...group.value,
      items: [{ ...group.value.items[0]!, data: { step: 2 } }],
    }
    await wrapper.setProps({ group: group.value })

    expect(wrapper.find('.host-row').text()).toBe('2')
    expect(wrapper.find('.host-row').element).toBe(before)
  })

  it('unmounts a large collapsed rail only after the close transition', async () => {
    vi.useFakeTimers()
    const items = Array.from({ length: 33 }, (_, index) => ({
      id: `tool-${index}`,
      kind: 'tool' as const,
      status: 'complete' as const,
      label: `Tool ${index}`,
    }))
    const wrapper = mount(TimelineGroup, {
      props: {
        group: { summary: '33 tools', items },
        expanded: true,
        unmountCollapsed: true,
      },
    })

    expect(wrapper.find('.tl-group__rail').exists()).toBe(true)
    await wrapper.setProps({ expanded: false })
    expect(wrapper.find('.tl-group__rail').exists()).toBe(true)

    vi.advanceTimersByTime(260)
    await nextTick()
    expect(wrapper.find('.tl-group__rail').exists()).toBe(false)

    await wrapper.setProps({ expanded: true })
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.find('.tl-group__rail').exists()).toBe(true)
    expect(wrapper.find('.tl-reveal').classes()).toContain('is-expanded')
  })
})

describe('TimelineDetails', () => {
  it('paints the shell and skeleton before content is ready', () => {
    const wrapper = mount(TimelineDetails, {
      props: {
        detail: { status: 'loading' },
        expanded: true,
        lazy: true,
        keepMounted: true,
      },
    })

    expect(wrapper.find('.tl-details__shell').attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('.tl-skeleton')).toHaveLength(3)
  })

  it('swaps to the host component and then to the error state', async () => {
    const wrapper = mount(TimelineDetails, {
      props: {
        detail: { status: 'loading' },
        expanded: true,
        lazy: true,
        keepMounted: true,
      },
    })

    await wrapper.setProps({
      detail: { status: 'ready', component: DetailBody },
    })
    expect(wrapper.find('.detail-body').text()).toBe('detail body')

    await wrapper.setProps({
      detail: {
        status: 'error',
        errorText: 'Preview failed',
        retryLabel: 'Retry',
      },
    })
    expect(wrapper.text()).toContain('Preview failed')
    await wrapper.find('.tl-details__retry').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('mounts a non-lazy detail before the first expand', () => {
    const wrapper = mount(TimelineDetails, {
      props: {
        detail: { status: 'ready', component: DetailBody },
        expanded: false,
        lazy: false,
        keepMounted: true,
      },
    })

    expect(wrapper.find('.tl-details__shell').exists()).toBe(true)
    expect(wrapper.find('.tl-details').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.tl-details').attributes('inert')).toBeDefined()
  })

  it('stays mounted after the first expand when keepMounted is on', async () => {
    const wrapper = mount(TimelineDetails, {
      props: {
        detail: { status: 'ready', component: DetailBody },
        expanded: false,
        lazy: true,
        keepMounted: true,
      },
    })

    expect(wrapper.find('.tl-details__shell').exists()).toBe(false)
    await wrapper.setProps({ expanded: true })
    expect(wrapper.find('.tl-details__shell').exists()).toBe(true)
    await wrapper.setProps({ expanded: false })
    expect(wrapper.find('.tl-details__shell').exists()).toBe(true)
    expect(wrapper.find('.tl-details').attributes('aria-hidden')).toBe('true')
  })
})
