import Vue from 'vue'
import { MutationTree } from 'vuex'
import { LoginState, OAuthToken, Completed } from './types'

export const mutations: MutationTree<LoginState> = {
  logout: (state) => {
    Vue.set(state, 'oauth', { kind: 'logged-out' })
  },
  initiate: (state, requestToken: OAuthToken) => {
    Vue.set(state, 'oauth', {
      kind: 'initiated',
      requestToken,
    })
  },
  complete: (state, accessToken: OAuthToken) => {
    Vue.set(state, 'oauth', {
      kind: 'completed',
      accessToken,
    })
  },
  identify: (state, username: string) => {
    const completed = state.oauth as Completed
    const accessToken = completed.accessToken

    Vue.set(state, 'oauth', {
      kind: 'identified',
      accessToken,
      username,
    })
  },
}
