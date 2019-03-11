import { Module } from 'vuex'
import { actions } from './actions'
import { mutations } from './mutations'
import { getters } from './getters'
import { LoginState } from './types'
import { RootState } from '../types'

export const state: LoginState = {
  oauth: { kind: 'logged-out' },
}

export const login: Module<LoginState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
