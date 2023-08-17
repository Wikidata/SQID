import { describe, it, expect } from 'vitest'

import { mount } from './testing'
import HomeView from '@/views/HomeView.vue'

describe('HomeView', () => {
  it('renders SqidBars', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.html()).toContain('mainbar')
    expect(wrapper.html()).toContain('sidebar')
  })

  it('renders an image', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.html()).toContain('<img ')
  })
})
