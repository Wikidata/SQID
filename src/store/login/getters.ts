import { GetterTree } from 'vuex'
import { LoginState, Identified } from './types'
import { RootState } from '../types'

export const getters: GetterTree<LoginState, RootState> = {
  oauthState: (state) => {
    return state.oauth.kind
  },
  isLoggedIn: (_state, getters) => { // tslint:disable-line:no-shadowed-variable
    return getters.oauthState === 'identified'
  },
  username: (state, getters) => { // tslint:disable-line:no-shadowed-variable
    if (getters.isLoggedIn) {
      const oauth = state.oauth as Identified
      return oauth.username
    }
    return undefined
  },
}
