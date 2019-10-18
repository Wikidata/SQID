import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import HomeVue from '@/views/Home.vue'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Home.vue', () => {
  let store: any
  let actions: any

  beforeEach(() => {
    actions = {
      requestLabels: jest.fn(),
    }
    store = new Vuex.Store({
      actions,
    })
  }),

  it('renders SqidBars', () => {
    const wrapper = shallowMount(HomeVue, {
      store,
      localVue,
      stubs: ['sqid-bars', 'sqid-image'],
    })
    expect(wrapper.html()).toContain('<sqid-bars-stub>')
  })
})
