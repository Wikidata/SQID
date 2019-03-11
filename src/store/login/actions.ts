import { ActionTree } from 'vuex'
import { LoginState, Initiated, Completed } from './types'
import { RootState } from '../types'
import { http } from '@/http'

const endpoint = 'https://tools.wmflabs.org/sqid/oauth/oauth.php'

export const actions: ActionTree<LoginState, RootState> = {
  async initiate({ commit, getters }) {
    if (getters.oauthState !== 'logged-out') {
      commit('logout')
    }

    const response = await http.get(endpoint, {
      params: {
        action: 'initiate',
      }})

    commit('initiate', response.data)
  },
  async complete(context, { verifier, key }) {
    const state = context.getters.oauthState

    if (state !== 'initiated') {
      context.commit('logout')
    }

    const oauth = context.state.oauth as Initiated
    const token = oauth.requestToken

    if (token.key !== key) {
      context.commit('logout')
    }

    const response = await http.get(endpoint, {
      params: {
        action: 'complete',
        verifier,
      },
      headers: {
        'X-SQID-Key': token.key,
        'X-SQID-Secret': token.secret,
      },
    })

    context.commit('complete', response.data)
    context.dispatch('identify')
  },
  async identify({ commit, getters, state }) {
    if (getters.oauthState !== 'completed') {
      throw new Error('OAuth handshake not yet completed')
    }

    const oauth = state.oauth as Completed
    const token = oauth.accessToken

    const response = await http.get(endpoint, {
      params: {
        action: 'intentify',
      },
      headers: {
        'X-SQID-Key': token.key,
        'X-SQID-Secret': token.secret,
      },
    })

    commit('identify', response.data.username)
  },
}
