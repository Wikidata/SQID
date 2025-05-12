import { vi } from 'vitest'
import { mount as _mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

import { i18n } from '@/i18n'
import router from '@/router'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mount(component: any, options: any) {
  return _mount(component, {
    global: { plugins: [createTestingPinia({ createSpy: vi.fn }), i18n, router] },
    ...options,
  })
}
