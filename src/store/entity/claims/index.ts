import { Module } from 'vuex'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { ClaimsState, ClaimsMap } from './types'
import { RootState } from '@/store/types'

export const state: ClaimsState = {
  claims: new Map<string, ClaimsMap>(),
}

export const claims: Module<ClaimsState, RootState> = {
  state,
  mutations,
  getters,
  actions,
}
