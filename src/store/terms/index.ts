import { Module } from 'vuex'
import { mutations } from './mutations'
import { actions } from './actions'
import { getters } from './getters'
import { TermsState } from './types'
import { RootState } from '../types'

export const state: TermsState = {
  labels: new Map<string, Map<string, string>>(),
}

export const terms: Module<TermsState, RootState> = {
  state,
  mutations,
  actions,
  getters,
}
