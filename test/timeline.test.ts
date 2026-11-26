import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { TimelineGroup, type TimelineGroupVM } from '../src/lib'
import TimelineDetails from '../src/lib/components/TimelineDetails.vue'

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
