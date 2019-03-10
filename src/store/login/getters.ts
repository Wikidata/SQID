import { GetterTree } from 'vuex'
import { LoginState, SessionData } from './types'
import { RootState } from '../types'

export const getters: GetterTree<LoginState, RootState> = {
  isLoggedIn: (state) => {
    return state.loggedIn
  },
  username: (state, getters) => { // tslint:disable-line:no-shadowed-variable
    if (getters.isLoggedIn) {
      return state.session!.username
    }
    return undefined
  },
}
