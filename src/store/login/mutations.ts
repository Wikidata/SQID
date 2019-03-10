import { MutationTree } from 'vuex'
import { LoginState, SessionData } from './types'

export const mutations: MutationTree<LoginState> = {
  login: (state, session: SessionData) => {
    state.loggedIn = true
    state.session = session
  },
  logout: (state) => {
    state.loggedIn = false
    state.session = undefined
  },
}
